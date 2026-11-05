"use client";

import {
  useEffect,
  useRef,
  useContext,
  useState,
  useCallback,
} from "react";
import { useParams, useRouter } from "next/navigation";
import SocketContext from "@/app/context/socketContext";
import Image from "next/image";
import { useDispatch } from "react-redux";
import { removeActiveRequest } from "@/app/redux/reducer/chat/sendRequestSlice";
import { useMutation } from "@apollo/client/react";
import { gql } from "@apollo/client";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

// Configure these in the frontend environment and rebuild.
// Example:
// NEXT_PUBLIC_TURN_URLS=turn:your-turn-host:3478?transport=udp,turns:your-turn-host:5349?transport=tcp
// NEXT_PUBLIC_TURN_USERNAME=your-username
// NEXT_PUBLIC_TURN_CREDENTIAL=your-credential
const TURN_URLS = (process.env.NEXT_PUBLIC_TURN_URLS || "")
  .split(",")
  .map((url) => url.trim())
  .filter(Boolean);

const TURN_USERNAME = process.env.NEXT_PUBLIC_TURN_USERNAME || "";
const TURN_CREDENTIAL = process.env.NEXT_PUBLIC_TURN_CREDENTIAL || "";

const UPLOAD_CALL_RECORDING = gql`
  mutation UploadCallRecording(
    $recording: Upload!
    $roomId: String!
    $astroId: String!
    $astroName: String!
    $userId: String!
    $duration: Int!
    $callType: String!
  ) {
    uploadCallRecording(
      recording: $recording
      roomId: $roomId
      astroId: $astroId
      astroName: $astroName
      userId: $userId
      duration: $duration
      callType: $callType
    ) {
      success
      message
      fileUrl
      recording {
        id
        roomId
        astroId
        astroName
        userId
        duration
        callType
        recordingUrl
        createdAt
        updatedAt
      }
    }
  }
`;

const getCandidateType = (candidate) => {
  const value =
    typeof candidate === "string"
      ? candidate
      : candidate?.candidate || "";

  return value.match(/\btyp\s+(\w+)/)?.[1] || "unknown";
};

const getCandidateProtocol = (candidate) => {
  const value =
    typeof candidate === "string"
      ? candidate
      : candidate?.candidate || "";

  return value.match(/\b(udp|tcp)\b/i)?.[1]?.toLowerCase() || "unknown";
};

const getIceConfig = () => {
  const iceServers = [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ];

  if (TURN_URLS.length && TURN_USERNAME && TURN_CREDENTIAL) {
    iceServers.push({
      urls: TURN_URLS,
      username: TURN_USERNAME,
      credential: TURN_CREDENTIAL,
    });
  } else {
    console.warn(
      "[USER][ICE] TURN is not configured. Only STUN servers will be used. " +
        "Configure NEXT_PUBLIC_TURN_URLS, NEXT_PUBLIC_TURN_USERNAME and NEXT_PUBLIC_TURN_CREDENTIAL."
    );
  }

  return {
    iceServers,
    iceCandidatePoolSize: 10,
    bundlePolicy: "max-bundle",
    rtcpMuxPolicy: "require",

    // Normal production mode. Do not force relay unless you are testing TURN.
    iceTransportPolicy: "all",
  };
};

export default function CallPage(props = {}) {
  const dispatch = useDispatch();
  const params = useParams();
  const router = useRouter();

  const { socket, connectSocket } = useContext(SocketContext);

  // Supports a component receiving normal React props.
  const roomId = params?.roomId || props?.room_Id || props?.roomId;

  const astroImage = props?.astroImage || props?.astro_image || "";
  const passedAstroName =
    props?.astro_Name || props?.astroName || "";

  const [remainingTime, setRemainingTime] = useState(0);
  const [callStatus, setCallStatus] = useState("Connecting...");
  const [isMuted, setIsMuted] = useState(false);
  const [waveHeights, setWaveHeights] = useState(
    Array(20).fill(10)
  );
  const [isRecording, setIsRecording] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [remoteAudioStream, setRemoteAudioStream] = useState(null);
  const [astroData, setAstroData] = useState({});

  const [uploadRecording] = useMutation(UPLOAD_CALL_RECORDING);

  // WebRTC refs
  const pc = useRef(null);
  const peerCreationPromiseRef = useRef(null);
  const socketRef = useRef(null);
  const remoteAudio = useRef(null);
  const localStream = useRef(null);
  const remoteStreamRef = useRef(null);

  // ICE refs
  const pendingIceCandidatesRef = useRef([]);
  const isDrainingIceRef = useRef(false);
  const offerInProgressRef = useRef(false);

  // Timer/stats refs
  const statsIntervalRef = useRef(null);
  const timerRef = useRef(null);
  const recordingRetryTimerRef = useRef(null);

  // Recording refs
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const isRecordingRef = useRef(false);
  const callStartTimeRef = useRef(null);
  const combinedStreamRef = useRef(null);
  const recordingInitializedRef = useRef(false);

  // Call lifecycle refs
  const callFullyConnectedRef = useRef(false);
  const callEndedRef = useRef(false);
  const cleanupDoneRef = useRef(false);

  const callInfoRef = useRef({
    astroId: "",
    astroName: "",
    userId: "",
  });

  // --------------------------------------------------
  // LOAD ASTROLOGER / CALL INFORMATION
  // --------------------------------------------------

  useEffect(() => {
    try {
      const activeRequest = JSON.parse(
        localStorage.getItem("activeRequest") || "{}"
      );

      setAstroData(activeRequest);

      const stored = localStorage.getItem(
        `call_request_${roomId}`
      );

      const requestData = stored ? JSON.parse(stored) : {};

      callInfoRef.current = {
        astroId: requestData?.astro_id || "",
        astroName:
          activeRequest?.astrologer?.name ||
          passedAstroName ||
          "",
        userId: requestData?.user_id || "",
      };

      const totalSeconds =
        Number(requestData?.maximum_time || 0) * 60;

      if (totalSeconds > 0) {
        setRemainingTime(totalSeconds);
      }
    } catch (error) {
      console.error("[USER] Error loading call information:", error);
    }
  }, [roomId, passedAstroName]);

  // --------------------------------------------------
  // RECORDING UPLOAD
  // --------------------------------------------------

  const sendRecordingToServer = useCallback(async () => {
    try {
      if (!recordedChunksRef.current.length) {
        console.warn("[USER][RECORDING] No recording chunks to upload");
        setUploadStatus("No recording data to upload");
        return;
      }

      const mimeType =
        mediaRecorderRef.current?.mimeType || "audio/webm";

      const blob = new Blob(recordedChunksRef.current, {
        type: mimeType,
      });

      if (!blob.size) {
        console.warn("[USER][RECORDING] Recording blob is empty");
        setUploadStatus("Recording file is empty");
        recordedChunksRef.current = [];
        return;
      }

      let userId = callInfoRef.current.userId || "";

      try {
        const user = JSON.parse(
          localStorage.getItem("user") || "{}"
        );

        userId = user?.id || userId;
      } catch (error) {
        console.warn("[USER][RECORDING] User storage parse error", error);
      }

      const astroId = callInfoRef.current.astroId || "";
      const astroName = callInfoRef.current.astroName || "";

      const timestamp = new Date()
        .toISOString()
        .replace(/[:.]/g, "-");

      const filename = `call-${roomId}-${timestamp}.webm`;

      const file = new File([blob], filename, {
        type: mimeType,
      });

      const duration = callStartTimeRef.current
        ? Math.max(
            0,
            Math.floor(
              (Date.now() - callStartTimeRef.current) / 1000
            )
          )
        : 0;

      console.log("[USER][RECORDING] Uploading recording:", {
        filename,
        size: file.size,
        duration,
        astroId,
        astroName,
        userId,
      });

      const result = await uploadRecording({
        variables: {
          recording: file,
          roomId: String(roomId),
          astroId,
          astroName,
          userId,
          duration,
          callType: "audio",
        },
      });

      if (result?.errors?.length) {
        throw new Error(result.errors[0]?.message);
      }

      if (result?.data?.uploadCallRecording?.success) {
        console.log("[USER][RECORDING] Upload successful");
        setUploadStatus("Recording uploaded successfully");
      } else {
        throw new Error(
          result?.data?.uploadCallRecording?.message ||
            "Recording upload failed"
        );
      }

      recordedChunksRef.current = [];
    } catch (error) {
      console.error("[USER][RECORDING] Upload error:", error);
      setUploadStatus(
        `Upload error: ${error?.message || "Unknown error"}`
      );
      recordedChunksRef.current = [];
    }
  }, [roomId, uploadRecording]);

  // --------------------------------------------------
  // START RECORDING
  // --------------------------------------------------

  const startRecording = useCallback(() => {
    try {
      if (recordingInitializedRef.current) return;

      if (typeof window === "undefined" || !window.MediaRecorder) {
        console.warn("[USER][RECORDING] MediaRecorder is not supported");
        return;
      }

      if (!callFullyConnectedRef.current) {
        clearTimeout(recordingRetryTimerRef.current);

        recordingRetryTimerRef.current = setTimeout(() => {
          if (!callEndedRef.current) startRecording();
        }, 1000);

        return;
      }

      const remoteStream = remoteStreamRef.current;

      if (!localStream.current || !remoteStream) {
        clearTimeout(recordingRetryTimerRef.current);

        recordingRetryTimerRef.current = setTimeout(() => {
          if (!callEndedRef.current) startRecording();
        }, 1000);

        return;
      }

      const combinedStream = new MediaStream();

      localStream.current.getAudioTracks().forEach((track) => {
        if (track.readyState === "live") {
          combinedStream.addTrack(track);
        }
      });

      remoteStream.getAudioTracks().forEach((track) => {
        if (track.readyState === "live") {
          combinedStream.addTrack(track);
        }
      });

      if (!combinedStream.getAudioTracks().length) {
        console.warn("[USER][RECORDING] No live audio tracks available");
        return;
      }

      const mimeTypes = [
        "audio/webm;codecs=opus",
        "audio/webm",
        "audio/ogg;codecs=opus",
        "audio/mp4",
      ];

      const mimeType = mimeTypes.find((type) =>
        MediaRecorder.isTypeSupported(type)
      );

      const options = {
        audioBitsPerSecond: 128000,
      };

      if (mimeType) options.mimeType = mimeType;

      const recorder = new MediaRecorder(combinedStream, options);

      combinedStreamRef.current = combinedStream;
      mediaRecorderRef.current = recorder;
      recordedChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data?.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      recorder.onerror = (event) => {
        console.error("[USER][RECORDING] Recorder error:", event);
        setUploadStatus("Recording error occurred");
        isRecordingRef.current = false;
        setIsRecording(false);
        recordingInitializedRef.current = false;
      };

      recorder.onstop = async () => {
        console.log("[USER][RECORDING] Recording stopped");

        isRecordingRef.current = false;
        setIsRecording(false);
        recordingInitializedRef.current = false;

        // Upload before clearing the recorded chunks.
        await sendRecordingToServer();

        if (combinedStreamRef.current) {
          combinedStreamRef.current.getTracks().forEach((track) => {
            track.stop();
          });

          combinedStreamRef.current = null;
        }
      };

      recorder.start(1000);

      isRecordingRef.current = true;
      recordingInitializedRef.current = true;
      callStartTimeRef.current = Date.now();

      setIsRecording(true);

      console.log("[USER][RECORDING] Recording started:", {
        mimeType: recorder.mimeType,
        audioTracks: combinedStream.getAudioTracks().length,
      });
    } catch (error) {
      console.error("[USER][RECORDING] Start error:", error);
      recordingInitializedRef.current = false;
      setUploadStatus("Failed to start recording");
    }
  }, [sendRecordingToServer]);

  // --------------------------------------------------
  // STOP RECORDING
  // --------------------------------------------------

  const stopRecording = useCallback(() => {
    try {
      console.log("[USER][RECORDING] Stop requested");

      clearTimeout(recordingRetryTimerRef.current);

      const recorder = mediaRecorderRef.current;

      if (recorder && recorder.state !== "inactive") {
        // onstop handles upload and then releases combined tracks.
        recorder.stop();
      } else {
        isRecordingRef.current = false;
        recordingInitializedRef.current = false;
        setIsRecording(false);

        if (combinedStreamRef.current) {
          combinedStreamRef.current.getTracks().forEach((track) => {
            track.stop();
          });

          combinedStreamRef.current = null;
        }
      }
    } catch (error) {
      console.error("[USER][RECORDING] Stop error:", error);
    }
  }, []);

  // --------------------------------------------------
  // REMOTE AUDIO
  // --------------------------------------------------

  const attachRemoteAudio = useCallback(async (stream) => {
    if (!stream) {
      console.warn("[USER][AUDIO] Remote stream is missing");
      return;
    }

    remoteStreamRef.current = stream;
    setRemoteAudioStream(stream);

    if (!remoteAudio.current) {
      console.warn("[USER][AUDIO] Audio element is not mounted yet");
      return;
    }

    remoteAudio.current.srcObject = stream;
    remoteAudio.current.volume = 1;
    remoteAudio.current.muted = false;

    console.log("[USER][AUDIO] Remote stream attached:", {
      streamId: stream.id,
      audioTracks: stream.getAudioTracks().map((track) => ({
        enabled: track.enabled,
        muted: track.muted,
        readyState: track.readyState,
      })),
    });

    try {
      await remoteAudio.current.play();
      console.log("[USER][AUDIO] Remote audio playback started");
    } catch (error) {
      console.warn(
        "[USER][AUDIO] Autoplay was blocked. User interaction may be required:",
        error
      );

      if (!callFullyConnectedRef.current) {
        setCallStatus("Tap to enable audio");
      }
    }
  }, []);

  const enableRemoteAudio = useCallback(async () => {
    try {
      if (!remoteAudio.current) return;

      remoteAudio.current.muted = false;
      remoteAudio.current.volume = 1;

      await remoteAudio.current.play();

      if (pc.current?.iceConnectionState === "connected" ||
          pc.current?.iceConnectionState === "completed") {
        setCallStatus("Connected");
      }

      console.log("[USER][AUDIO] Playback enabled by user");
    } catch (error) {
      console.error("[USER][AUDIO] Could not enable playback:", error);
    }
  }, []);

  // --------------------------------------------------
  // ICE CANDIDATE QUEUE
  // --------------------------------------------------

  const addPendingIceCandidates = useCallback(async () => {
    if (!pc.current?.remoteDescription) {
      console.warn(
        "[USER][ICE] Cannot process candidate queue: remote description missing"
      );
      return;
    }

    if (isDrainingIceRef.current) return;

    isDrainingIceRef.current = true;

    try {
      while (
        pendingIceCandidatesRef.current.length > 0 &&
        pc.current?.remoteDescription
      ) {
        const candidate =
          pendingIceCandidatesRef.current.shift();

        try {
          await pc.current.addIceCandidate(
            new RTCIceCandidate(candidate)
          );

          console.log("[USER][ICE] Queued candidate added:", {
            type: getCandidateType(candidate),
            protocol: getCandidateProtocol(candidate),
          });
        } catch (error) {
          console.error(
            "[USER][ICE] Queued candidate failed:",
            error,
            candidate
          );
        }
      }
    } finally {
      isDrainingIceRef.current = false;
    }
  }, []);

  // --------------------------------------------------
  // WEBRTC STATISTICS
  // --------------------------------------------------

  const startStats = useCallback(() => {
    if (statsIntervalRef.current) {
      clearInterval(statsIntervalRef.current);
    }

    statsIntervalRef.current = setInterval(async () => {
      const peer = pc.current;

      if (!peer) return;

      try {
        const stats = await peer.getStats();

        let inboundAudio = null;
        let outboundAudio = null;
        let selectedPair = null;

        const reports = new Map();

        stats.forEach((report) => {
          reports.set(report.id, report);

          const isAudio =
            report.kind === "audio" ||
            report.mediaType === "audio";

          if (
            report.type === "inbound-rtp" &&
            isAudio &&
            !report.isRemote
          ) {
            inboundAudio = report;
          }

          if (
            report.type === "outbound-rtp" &&
            isAudio &&
            !report.isRemote
          ) {
            outboundAudio = report;
          }

          if (
            report.type === "candidate-pair" &&
            report.state === "succeeded" &&
            (report.selected || report.nominated)
          ) {
            selectedPair = report;
          }

          // Newer browser implementations expose selected pair here.
          if (
            report.type === "transport" &&
            report.selectedCandidatePairId
          ) {
            const pair = reports.get(
              report.selectedCandidatePairId
            );

            if (pair) selectedPair = pair;
          }
        });

        // Second pass: resolve selected pair after all reports are indexed.
        stats.forEach((report) => {
          if (
            report.type === "transport" &&
            report.selectedCandidatePairId
          ) {
            const pair = reports.get(
              report.selectedCandidatePairId
            );

            if (pair) selectedPair = pair;
          }
        });

        if (inboundAudio) {
          console.log("[USER][AUDIO] Incoming audio stats:", {
            packetsReceived: inboundAudio.packetsReceived,
            bytesReceived: inboundAudio.bytesReceived,
            packetsLost: inboundAudio.packetsLost,
            jitter: inboundAudio.jitter,
          });
        }

        if (outboundAudio) {
          console.log("[USER][AUDIO] Outgoing audio stats:", {
            packetsSent: outboundAudio.packetsSent,
            bytesSent: outboundAudio.bytesSent,
          });
        }

        if (selectedPair) {
          const localCandidate = reports.get(
            selectedPair.localCandidateId
          );

          const remoteCandidate = reports.get(
            selectedPair.remoteCandidateId
          );

          console.log("[USER][ICE] Selected candidate pair:", {
            state: selectedPair.state,
            nominated: selectedPair.nominated,
            currentRoundTripTime:
              selectedPair.currentRoundTripTime,
            localCandidateType: localCandidate?.candidateType,
            remoteCandidateType: remoteCandidate?.candidateType,
            localProtocol: localCandidate?.protocol,
            remoteProtocol: remoteCandidate?.protocol,
            localAddress: localCandidate?.address,
            remoteAddress: remoteCandidate?.address,
          });
        } else {
          console.log(
            "[USER][ICE] No selected candidate pair yet. ICE state:",
            peer.iceConnectionState
          );
        }
      } catch (error) {
        console.error("[USER][STATS] Error:", error);
      }
    }, 3000);
  }, []);

  // --------------------------------------------------
  // CONNECTION STATUS HANDLER
  // --------------------------------------------------

  const markCallConnected = useCallback(() => {
    if (callEndedRef.current) return;

    callFullyConnectedRef.current = true;
    setCallStatus("Connected");

    console.log("[USER][RTC] Media connection established");

    if (!recordingInitializedRef.current) {
      startRecording();
    }
  }, [startRecording]);

  // --------------------------------------------------
  // CREATE PEER CONNECTION
  // --------------------------------------------------

  const createPeer = useCallback(
    async (activeSocket) => {
      if (pc.current) {
        console.log("[USER][RTC] Reusing existing PeerConnection");
        return pc.current;
      }

      if (peerCreationPromiseRef.current) {
        return peerCreationPromiseRef.current;
      }

      peerCreationPromiseRef.current = (async () => {
        pendingIceCandidatesRef.current = [];
        isDrainingIceRef.current = false;
        callFullyConnectedRef.current = false;

        const iceConfig = getIceConfig();

        const peer = new RTCPeerConnection(iceConfig);
        pc.current = peer;

        console.log("[USER][RTC] PeerConnection created:", {
          roomId,
          iceServers: iceConfig.iceServers.map((server) => server.urls),
          iceTransportPolicy: iceConfig.iceTransportPolicy,
        });

        peer.onconnectionstatechange = () => {
          console.log(
            "[USER][RTC] connectionState:",
            peer.connectionState
          );

          if (peer.connectionState === "connected") {
            markCallConnected();
          }

          if (peer.connectionState === "failed") {
            callFullyConnectedRef.current = false;
            setCallStatus("Connection failed");
            console.error(
              "[USER][RTC] Peer connection failed. Check TURN server connectivity."
            );
          }

          if (peer.connectionState === "disconnected") {
            callFullyConnectedRef.current = false;
            setCallStatus("Reconnecting...");
            console.warn(
              "[USER][RTC] Peer disconnected. Waiting for ICE recovery."
            );
          }
        };

        peer.oniceconnectionstatechange = () => {
          console.log(
            "[USER][RTC] iceConnectionState:",
            peer.iceConnectionState
          );

          if (
            peer.iceConnectionState === "connected" ||
            peer.iceConnectionState === "completed"
          ) {
            markCallConnected();
          }

          if (peer.iceConnectionState === "checking") {
            setCallStatus("Connecting...");
          }

          if (peer.iceConnectionState === "failed") {
            callFullyConnectedRef.current = false;
            setCallStatus("Connection failed");

            console.error(
              "[USER][RTC] ICE FAILED. No working network candidate pair was found."
            );
          }

          if (peer.iceConnectionState === "disconnected") {
            callFullyConnectedRef.current = false;
            setCallStatus("Reconnecting...");
          }
        };

        peer.onsignalingstatechange = () => {
          console.log(
            "[USER][RTC] signalingState:",
            peer.signalingState
          );
        };

        peer.onicegatheringstatechange = () => {
          console.log(
            "[USER][RTC] iceGatheringState:",
            peer.iceGatheringState
          );

          if (peer.iceGatheringState === "complete") {
            console.log(
              "[USER][ICE] Candidate gathering completed"
            );
          }
        };

        peer.onicecandidateerror = (event) => {
          console.error("[USER][RTC] ICE candidate error:", {
            url: event.url,
            errorCode: event.errorCode,
            errorText: event.errorText,
            address: event.address,
            port: event.port,
          });
        };

        // Local microphone.
        try {
          localStream.current =
            await navigator.mediaDevices.getUserMedia({
              audio: {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true,
              },
              video: false,
            });

          const audioTracks =
            localStream.current.getAudioTracks();

          if (!audioTracks.length) {
            throw new Error("No microphone audio track found");
          }

          audioTracks.forEach((track) => {
            peer.addTrack(track, localStream.current);

            console.log("[USER][RTC] Local audio track added:", {
              label: track.label,
              enabled: track.enabled,
              muted: track.muted,
              readyState: track.readyState,
            });
          });
        } catch (error) {
          console.error("[USER][MIC] Microphone access error:", error);
          setCallStatus("Mic Error");
          throw error;
        }

        // Remote audio track.
        peer.ontrack = async (event) => {
          console.log("[USER][RTC] Remote track received:", {
            kind: event.track?.kind,
            readyState: event.track?.readyState,
            muted: event.track?.muted,
            streamsCount: event.streams?.length,
          });

          const remoteStream =
            event.streams?.[0] ||
            new MediaStream([event.track]);

          remoteStreamRef.current = remoteStream;

          await attachRemoteAudio(remoteStream);

          // Do not mark the call Connected here.
          // ontrack only confirms track negotiation, not media connectivity.

          event.track.onunmute = () => {
            console.log(
              "[USER][AUDIO] Remote audio track is now unmuted"
            );
          };

          event.track.onmute = () => {
            console.warn(
              "[USER][AUDIO] Remote audio track became muted"
            );
          };

          event.track.onended = () => {
            console.warn(
              "[USER][AUDIO] Remote audio track ended"
            );
          };

          if (
            callFullyConnectedRef.current &&
            !recordingInitializedRef.current
          ) {
            startRecording();
          }
        };

        // Send serialized ICE candidates through Socket.IO.
        peer.onicecandidate = (event) => {
          if (!event.candidate) {
            console.log(
              "[USER][ICE] ICE candidate gathering completed"
            );
            return;
          }

          const candidateData = event.candidate.toJSON();

          console.log("[USER][ICE] Sending candidate:", {
            type: getCandidateType(candidateData),
            protocol: getCandidateProtocol(candidateData),
            candidate: candidateData.candidate,
          });

          activeSocket.emit("ice-candidate", {
            room_id: roomId,
            candidate: candidateData,
          });
        };

        startStats();

        return peer;
      })();

      try {
        return await peerCreationPromiseRef.current;
      } finally {
        peerCreationPromiseRef.current = null;
      }
    },
    [
      roomId,
      attachRemoteAudio,
      markCallConnected,
      startRecording,
      startStats,
    ]
  );

  // --------------------------------------------------
  // CLEANUP
  // --------------------------------------------------

  const cleanup = useCallback(() => {
    if (cleanupDoneRef.current) return;

    cleanupDoneRef.current = true;

    console.log("[USER][CLEANUP] Cleaning up WebRTC resources");

    callFullyConnectedRef.current = false;
    pendingIceCandidatesRef.current = [];
    isDrainingIceRef.current = false;

    clearTimeout(recordingRetryTimerRef.current);

    if (statsIntervalRef.current) {
      clearInterval(statsIntervalRef.current);
      statsIntervalRef.current = null;
    }

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    const peer = pc.current;

    if (peer) {
      peer.ontrack = null;
      peer.onicecandidate = null;
      peer.onicecandidateerror = null;
      peer.onconnectionstatechange = null;
      peer.oniceconnectionstatechange = null;
      peer.onsignalingstatechange = null;
      peer.onicegatheringstatechange = null;

      try {
        peer.close();
      } catch (error) {
        console.warn("[USER][CLEANUP] Peer close error:", error);
      }

      pc.current = null;
    }

    if (localStream.current) {
      localStream.current.getTracks().forEach((track) => {
        track.stop();
      });

      localStream.current = null;
    }

    if (remoteAudio.current) {
      remoteAudio.current.pause();
      remoteAudio.current.srcObject = null;
    }

    if (combinedStreamRef.current) {
      combinedStreamRef.current.getTracks().forEach((track) => {
        track.stop();
      });

      combinedStreamRef.current = null;
    }

    remoteStreamRef.current = null;
    setRemoteAudioStream(null);

    if (typeof window !== "undefined") {
      [
        `call_request_${roomId}`,
        `activeCallRoom_${roomId}`,
        "activeRequests",
        `queue_${roomId}`,
        `timer_${roomId}`,
      ].forEach((key) => localStorage.removeItem(key));
    }

    console.log("[USER][CLEANUP] Cleanup completed");
  }, [roomId]);

  // --------------------------------------------------
  // SOCKET EVENTS AND CALL SETUP
  // --------------------------------------------------

  useEffect(() => {
    if (!roomId) {
      console.error("[USER][CALL] Room ID is missing");
      setCallStatus("Invalid call room");
      return;
    }

    let activeSocket = socket;

    if (!activeSocket?.connected) {
      activeSocket = connectSocket?.() || activeSocket;
    }

    if (!activeSocket) {
      console.error("[USER][SOCKET] Socket unavailable");
      setCallStatus("Socket unavailable");
      return;
    }

    socketRef.current = activeSocket;
    cleanupDoneRef.current = false;
    callEndedRef.current = false;

    const handlePeerJoined = async (data) => {
      try {
        console.log(
          "[USER][SOCKET] peer_joined received:",
          data
        );

        if (callEndedRef.current) return;

        // Avoid creating multiple offers for duplicate peer_joined events.
        if (offerInProgressRef.current) {
          console.warn(
            "[USER][SDP] Offer creation is already in progress"
          );
          return;
        }

        if (
          pc.current &&
          pc.current.signalingState !== "stable"
        ) {
          console.warn(
            "[USER][SDP] Peer is not stable; skipping duplicate offer:",
            pc.current.signalingState
          );
          return;
        }

        offerInProgressRef.current = true;
        setCallStatus("Ringing...");

        const peer = await createPeer(activeSocket);

        if (
          callEndedRef.current ||
          !peer ||
          peer.signalingState !== "stable"
        ) {
          return;
        }

        const offer = await peer.createOffer({
          offerToReceiveAudio: true,
        });

        await peer.setLocalDescription(offer);

        console.log("[USER][SDP] Local offer set; sending offer:", {
          roomId,
          signalingState: peer.signalingState,
          sdpType: peer.localDescription?.type,
        });

        activeSocket.emit("offer", {
          room_id: roomId,
          offer: peer.localDescription,
        });
      } catch (error) {
        console.error("[USER][SDP] Error creating offer:", error);
        setCallStatus("Error creating offer");
      } finally {
        offerInProgressRef.current = false;
      }
    };

    const handleAnswer = async (data) => {
      try {
        const answer = data?.answer || data;

        if (!pc.current) {
          console.warn(
            "[USER][SDP] Answer received but PeerConnection is missing"
          );
          return;
        }

        if (!answer?.type || !answer?.sdp) {
          console.error(
            "[USER][SDP] Invalid answer received:",
            data
          );
          return;
        }

        if (pc.current.remoteDescription) {
          console.warn(
            "[USER][SDP] Remote answer is already applied"
          );
          return;
        }

        console.log("[USER][SDP] Answer received:", {
          roomId,
          answerType: answer.type,
          signalingStateBefore: pc.current.signalingState,
        });

        // Ensure call details are available before recording begins.
        try {
          const stored = localStorage.getItem(
            `call_request_${roomId}`
          );

          const requestData = stored
            ? JSON.parse(stored)
            : {};

          const activeRequest = JSON.parse(
            localStorage.getItem("activeRequest") || "{}"
          );

          callInfoRef.current = {
            astroId: requestData?.astro_id || "",
            astroName:
              activeRequest?.astrologer?.name ||
              passedAstroName ||
              "",
            userId: requestData?.user_id || "",
          };

          const totalSeconds =
            Number(requestData?.maximum_time || 0) * 60;

          if (totalSeconds > 0) {
            setRemainingTime(totalSeconds);
          }
        } catch (error) {
          console.warn(
            "[USER][CALL] Could not load call details:",
            error
          );
        }

        await pc.current.setRemoteDescription(
          new RTCSessionDescription(answer)
        );

        console.log("[USER][SDP] Remote answer applied:", {
          signalingState: pc.current.signalingState,
          remoteDescriptionType:
            pc.current.remoteDescription?.type,
          queuedCandidates:
            pendingIceCandidatesRef.current.length,
        });

        await addPendingIceCandidates();

        setCallStatus("Connecting...");
      } catch (error) {
        console.error(
          "[USER][SDP] Error handling answer:",
          error
        );
        setCallStatus("Connection error");
      }
    };

    const handleIceCandidate = async (data) => {
      try {
        const { candidate, room_id } = data || {};

        if (room_id && room_id !== roomId) {
          console.warn(
            "[USER][ICE] Ignoring candidate for another room:",
            {
              receivedRoomId: room_id,
              currentRoomId: roomId,
            }
          );
          return;
        }

        if (!candidate?.candidate) {
          console.warn(
            "[USER][ICE] Invalid candidate received:",
            data
          );
          return;
        }

        // Candidate can arrive before the peer or remote answer exists.
        if (!pc.current || !pc.current.remoteDescription) {
          pendingIceCandidatesRef.current.push(candidate);

          console.log(
            "[USER][ICE] Candidate queued until remote answer is applied:",
            {
              queueLength:
                pendingIceCandidatesRef.current.length,
              candidateType: getCandidateType(candidate),
              protocol: getCandidateProtocol(candidate),
            }
          );

          return;
        }

        await pc.current.addIceCandidate(
          new RTCIceCandidate(candidate)
        );

        console.log(
          "[USER][ICE] Remote candidate added successfully:",
          {
            candidateType: getCandidateType(candidate),
            protocol: getCandidateProtocol(candidate),
          }
        );
      } catch (error) {
        console.error(
          "[USER][ICE] Failed to add remote candidate:",
          error,
          data
        );
      }
    };

    const finishCallByRemote = (source) => {
      if (callEndedRef.current) return;

      console.log(`[USER][SOCKET] Call ended by ${source}`);

      callEndedRef.current = true;

      if (isRecordingRef.current) {
        stopRecording();
      }

      cleanup();

      dispatch(removeActiveRequest(roomId));
      router.push("/astrologer/call");
    };

    const handleCallEndedByAstrologer = () => {
      finishCallByRemote("astrologer");
    };

    const handleCallEndedByAdmin = () => {
      finishCallByRemote("admin");
    };

    activeSocket.on("peer_joined", handlePeerJoined);
    activeSocket.on("answer", handleAnswer);
    activeSocket.on("ice-candidate", handleIceCandidate);

    activeSocket.on(
      "call_ended_by_astrologer",
      handleCallEndedByAstrologer
    );

    activeSocket.on(
      "call_ended_by_admin",
      handleCallEndedByAdmin
    );

    console.log("[USER][SOCKET] Joining call:", roomId);

    activeSocket.emit("join_call", {
      roomId,
    });

    return () => {
      console.log("[USER][CLEANUP] Removing socket listeners");

      activeSocket.off("peer_joined", handlePeerJoined);
      activeSocket.off("answer", handleAnswer);
      activeSocket.off("ice-candidate", handleIceCandidate);

      activeSocket.off(
        "call_ended_by_astrologer",
        handleCallEndedByAstrologer
      );

      activeSocket.off(
        "call_ended_by_admin",
        handleCallEndedByAdmin
      );

      if (isRecordingRef.current) {
        stopRecording();
      }

      cleanup();
    };
  }, [
    roomId,
    socket,
    connectSocket,
    createPeer,
    addPendingIceCandidates,
    cleanup,
    dispatch,
    router,
    stopRecording,
    passedAstroName,
  ]);

  // --------------------------------------------------
  // REMOTE AUDIO WAVEFORM
  // --------------------------------------------------

  useEffect(() => {
    const stream = remoteAudioStream;

    if (!stream || typeof window === "undefined") return;

    const AudioContextClass =
      window.AudioContext || window.webkitAudioContext;

    if (!AudioContextClass) return;

    let audioContext;
    let analyser;
    let source;
    let animationId;
    let stopped = false;

    const animate = () => {
      if (stopped || !analyser) return;

      const dataArray = new Uint8Array(
        analyser.frequencyBinCount
      );

      analyser.getByteFrequencyData(dataArray);

      const normalized = Array.from(dataArray)
        .slice(0, 20)
        .map((value) => Math.max(10, value / 2));

      while (normalized.length < 20) {
        normalized.push(10);
      }

      setWaveHeights(normalized);

      animationId = requestAnimationFrame(animate);
    };

    try {
      audioContext = new AudioContextClass();
      analyser = audioContext.createAnalyser();
      analyser.fftSize = 64;
      analyser.smoothingTimeConstant = 0.8;

      source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      if (audioContext.state === "suspended") {
        audioContext.resume().catch((error) => {
          console.warn(
            "[USER][AUDIO] Could not resume AudioContext:",
            error
          );
        });
      }

      animate();
    } catch (error) {
      console.error("[USER][AUDIO] Waveform error:", error);
    }

    return () => {
      stopped = true;

      if (animationId) {
        cancelAnimationFrame(animationId);
      }

      if (source) {
        source.disconnect();
      }

      if (audioContext && audioContext.state !== "closed") {
        audioContext.close().catch(() => {});
      }
    };
  }, [remoteAudioStream]);

  // --------------------------------------------------
  // CALL TIMER
  // --------------------------------------------------

  const handleEndCall = useCallback(() => {
    if (callEndedRef.current) return;

    callEndedRef.current = true;

    console.log("[USER][CALL] Ending call:", roomId);

    try {
      const stored = localStorage.getItem(
        `call_request_${roomId}`
      );

      const data = stored ? JSON.parse(stored) : {};

      socketRef.current?.emit("call_ended_by_user", {
        room_id: roomId,
        astro_id:
          data?.astro_id || callInfoRef.current.astroId,
      });
    } catch (error) {
      console.error("[USER][CALL] Error ending call:", error);
    }

    if (isRecordingRef.current) {
      stopRecording();
    }

    cleanup();

    dispatch(removeActiveRequest(roomId));
    router.push("/astrologer/call");
  }, [roomId, stopRecording, cleanup, dispatch, router]);

  useEffect(() => {
    if (callStatus !== "Connected" || remainingTime <= 0) {
      return;
    }

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(() => {
      setRemainingTime((previous) => {
        if (previous <= 1) {
          clearInterval(timerRef.current);
          timerRef.current = null;

          // Defer ending the call until after the state update.
          setTimeout(() => {
            handleEndCall();
          }, 0);

          return 0;
        }

        return previous - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [callStatus, remainingTime > 0, handleEndCall]);

  // --------------------------------------------------
  // MUTE
  // --------------------------------------------------

  const toggleMute = () => {
    if (!localStream.current) {
      console.warn("[USER][AUDIO] Local microphone stream is missing");
      return;
    }

    const nextMuted = !isMuted;

    localStream.current.getAudioTracks().forEach((track) => {
      track.enabled = !nextMuted;
    });

    setIsMuted(nextMuted);

    console.log(
      "[USER][AUDIO] Microphone mute changed:",
      nextMuted
    );
  };

  // --------------------------------------------------
  // FORMAT TIMER
  // --------------------------------------------------

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // --------------------------------------------------
  // ASTROLOGER DISPLAY
  // --------------------------------------------------

  const displayAstroName =
    astroData?.astrologer?.name ||
    passedAstroName ||
    "Astrologer";

  const displayImage = astroImage
    ? astroImage.startsWith("http")
      ? astroImage
      : `${BASE_URL || ""}${astroImage}`
    : "/man.png";

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <div className="relative flex h-screen items-center justify-center overflow-hidden bg-[#120a18e7]">
      <div className="absolute left-[-100px] top-[-100px] h-[400px] w-[400px] rounded-full bg-purple-600 opacity-20 blur-3xl" />

      <div className="absolute bottom-[-100px] right-[-100px] h-[500px] w-[500px] rounded-full bg-violet-500 opacity-20 blur-3xl" />

      <div className="flex h-[100vh] w-full flex-col overflow-hidden rounded-3xl shadow-lg md:h-[95vh] md:w-3/5">
        <div className="flex h-full w-full flex-col items-center justify-between rounded-3xl bg-gray-900 py-10 text-white shadow-xl">
          <div className="flex flex-col items-center gap-3">
            <Image
              width={100}
              height={100}
              src={displayImage}
              alt={displayAstroName}
              className="rounded-full object-cover"
              unoptimized={displayImage.startsWith("http")}
            />

            <h2 className="text-xl">{displayAstroName}</h2>

            <div className="mt-2 flex items-center gap-2 text-green-400">
              <span className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
              {callStatus}
            </div>

            {uploadStatus && (
              <p className="text-xs text-gray-300">
                {uploadStatus}
              </p>
            )}

            {isRecording && (
              <p className="text-xs text-red-400">
                Recording in progress
              </p>
            )}
          </div>

          <div className="flex flex-col items-center">
            {callStatus === "Connected" && (
              <p className="mb-2 text-lg">
                Time Left: {formatTime(remainingTime)}
              </p>
            )}

            <div className="mt-4 flex h-20 items-end justify-center gap-1">
              {waveHeights.map((height, index) => (
                <div
                  key={index}
                  className="w-2 rounded-full bg-green-400 transition-all duration-75"
                  style={{ height: `${height}px` }}
                />
              ))}
            </div>
          </div>

          <audio
            ref={remoteAudio}
            autoPlay
            playsInline
          />

          {callStatus === "Tap to enable audio" && (
            <button
              type="button"
              onClick={enableRemoteAudio}
              className="rounded-lg bg-green-600 px-4 py-2 text-white"
            >
              Tap to enable audio
            </button>
          )}

          <div className="flex w-full items-center justify-center gap-6">
            <button
              onClick={toggleMute}
              type="button"
              aria-label={
                isMuted ? "Unmute microphone" : "Mute microphone"
              }
              className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-gray-200 shadow-2xl"
            >
              {isMuted ? (
                <svg width={25} height={25} viewBox="0 0 640 640">
                  <path
                    fill="rgb(230, 54, 18)"
                    d="M73 39.1C63.6 29.7 48.4 29.7 39.1 39.1C29.8 48.5 29.7 63.7 39 73.1L567 601.1C576.4 610.5 591.6 610.5 600.9 601.1C610.2 591.7 610.3 576.5 600.9 567.2L456.7 422.8C490.9 388.2 512 340.6 512 288L512 248C512 234.7 501.3 224 488 224C474.7 224 464 234.7 464 248L464 288C464 327.3 448.3 362.9 422.7 388.9L388.8 355C405.6 337.7 416 314 416 288L416 160C416 107 373 64 320 64C267 64 224 107 224 160L224 190.2L73 39.2zM371.3 473.1L329.9 431.7C326.6 431.9 323.4 432 320.1 432C240.6 432 176.1 367.5 176.1 288L176.1 277.8L132.5 234.2C129.7 238.1 128.1 242.9 128.1 248L128.1 288C128.1 385.9 201.4 466.7 296.1 478.5L296.1 528L248.1 528C234.8 528 224.1 538.7 224.1 552C224.1 565.3 234.8 576 248.1 576L392.1 576C405.4 576 416.1 565.3 416.1 552C416.1 538.7 405.4 528 392.1 528L344.1 528L344.1 478.5C353.4 477.3 362.5 475.5 371.4 473.1z"
                  />
                </svg>
              ) : (
                <svg width={25} height={25} viewBox="0 0 640 640">
                  <path
                    fill="rgb(12, 208, 22)"
                    d="M320 64C267 64 224 107 224 160L224 288C224 341 267 384 320 384C373 384 416 341 416 288L416 160C416 107 373 64 320 64zM176 248C176 234.7 165.3 224 152 224C138.7 224 128 234.7 128 248L128 288C128 385.9 201.3 466.7 296 478.5L296 528L248 528C234.7 528 224 538.7 224 552C224 565.3 234.7 576 248 576L392 576C405.3 576 416 565.3 416 552C416 538.7 405.3 528 392 528L344 528L344 478.5C438.7 466.7 512 385.9 512 288L512 248C512 234.7 501.3 224 488 224C474.7 224 464 234.7 464 248L464 288C464 367.5 399.5 432 320 432C240.5 432 176 367.5 176 288L176 248z"
                  />
                </svg>
              )}
            </button>

            <button
              onClick={handleEndCall}
              type="button"
              aria-label="End call"
              className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-red-600 shadow-2xl hover:bg-red-700"
            >
              <svg width={25} height={25} viewBox="0 0 640 640">
                <path
                  fill="rgb(255, 255, 255)"
                  d="M567 39.1C576.4 29.7 576.5 44.4 600.9 73L73 601.1C63.6 610.5 48.4 610.5 39.1 601.1C29.8 591.7 29.7 576.5 39.1 567.2L173.5 432.6C121.2 374.5 83.6 302.8 66.8 223.4C50.7 147.1 105.9 84.6 170.5 66.9L176 65.4C195.7 60 216.3 70.1 224.1 88.9L264.6 186.2C271.5 202.7 266.7 221.8 252.8 233.2L208.7 269.3C221.6 297.7 238.3 324.1 258.2 347.8L567 39.1zM416.6 573.1C353.6 559.7 295.3 533.3 244.9 496.8L329.8 412C342 420.2 354.8 427.6 368.1 434.2L406.7 387C418 373.1 437.1 368.4 453.7 375.2L551 415.8C569.8 423.6 579.9 444.2 574.5 463.9L573 469.4C555.4 534 492.8 589.2 416.6 573.1z"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}