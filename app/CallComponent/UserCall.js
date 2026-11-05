"use client";

import { useEffect, useRef, useContext, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import SocketContext from "@/app/context/socketContext";
import Image from "next/image";
import { useDispatch } from "react-redux";
import { removeActiveRequest } from "@/app/redux/reducer/chat/sendRequestSlice";
import { useMutation } from "@apollo/client/react";
import { gql } from "@apollo/client";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

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
  const candidateString =
    typeof candidate === "string"
      ? candidate
      : candidate?.candidate || "";

  return candidateString.match(/\btyp\s+(\w+)/)?.[1] || "unknown";
};

export default function CallPage(
  room_Id,
  astro_Name,
  astroImage,
  chattime,
  user_Id,
  astroid,
  astro_price,
  userIntakeId
) {
  const dispatch = useDispatch();
  const { roomId } = useParams();
  const router = useRouter();

  const { socket, connectSocket } = useContext(SocketContext);

  const [remainingTime, setRemainingTime] = useState(0);
  const [callStatus, setCallStatus] = useState("Connecting...");
  const [isMuted, setIsMuted] = useState(false);
  const [waveHeights, setWaveHeights] = useState(Array(20).fill(10));
  const [isRecording, setIsRecording] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");

  const [uploadRecording] = useMutation(UPLOAD_CALL_RECORDING);

  const pc = useRef(null);
  const socketRef = useRef(null);
  const remoteAudio = useRef(null);
  const localStream = useRef(null);
  const remoteStreamRef = useRef(null);

  const pendingIceCandidatesRef = useRef([]);
  const statsIntervalRef = useRef(null);
  const timerRef = useRef(null);
  const recordingRetryTimerRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Recording refs
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const isRecordingRef = useRef(false);
  const callStartTimeRef = useRef(null);
  const combinedStreamRef = useRef(null);
  const recordingInitializedRef = useRef(false);
  const callFullyConnectedRef = useRef(false);
  const callEndedRef = useRef(false);

  const callInfoRef = useRef({
    astroId: "",
    astroName: "",
    userId: "",
  });

  // --------------------------------------------------
  // ICE CONFIGURATION
  // Keep this configuration consistent on BOTH sides.
  // --------------------------------------------------

  const getIceConfig = () => ({
    iceServers: [
      // Google STUN
      {
        urls: "stun:stun.l.google.com:19302",
      },
      {
        urls: "stun:stun1.l.google.com:19302",
      },
      {
        urls: "stun:stun2.l.google.com:19302",
      },

      // Metered OpenRelay TURN - UDP
      {
        urls: "turn:openrelay.metered.ca:80?transport=udp",
        username: "openrelayproject",
        credential: "openrelayproject",
      },
      {
        urls: "turn:openrelay.metered.ca:443?transport=udp",
        username: "openrelayproject",
        credential: "openrelayproject",
      },

      // Metered OpenRelay TURN - TCP
      {
        urls: "turn:openrelay.metered.ca:443?transport=tcp",
        username: "openrelayproject",
        credential: "openrelayproject",
      },
    ],

    iceCandidatePoolSize: 10,
    bundlePolicy: "max-bundle",
    rtcpMuxPolicy: "require",
  });

  // --------------------------------------------------
  // RECORDING
  // --------------------------------------------------

  const startRecording = () => {
    try {
      console.log("[USER][RECORDING] Starting recording...");

      if (recordingInitializedRef.current) {
        console.log("[USER][RECORDING] Already initialized");
        return;
      }

      if (!window.MediaRecorder) {
        console.warn("[USER][RECORDING] MediaRecorder not supported");
        return;
      }

      if (!callFullyConnectedRef.current) {
        console.log("[USER][RECORDING] Waiting for connection");
        clearTimeout(recordingRetryTimerRef.current);

        recordingRetryTimerRef.current = setTimeout(
          startRecording,
          1000
        );
        return;
      }

      const remoteStream = remoteAudio.current?.srcObject;

      if (!localStream.current || !remoteStream) {
        console.warn("[USER][RECORDING] Local or remote stream missing");
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

      if (combinedStream.getAudioTracks().length === 0) {
        console.warn("[USER][RECORDING] No audio tracks available");
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

      const mediaRecorder = new MediaRecorder(combinedStream, {
        mimeType: mimeType || undefined,
        audioBitsPerSecond: 128000,
      });

      combinedStreamRef.current = combinedStream;
      mediaRecorderRef.current = mediaRecorder;
      recordedChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data?.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        console.log("[USER][RECORDING] Recording stopped");

        setIsRecording(false);
        isRecordingRef.current = false;
        recordingInitializedRef.current = false;

        await sendRecordingToServer();
      };

      mediaRecorder.onerror = (event) => {
        console.error("[USER][RECORDING] Recorder error:", event);

        setIsRecording(false);
        isRecordingRef.current = false;
        recordingInitializedRef.current = false;
        setUploadStatus("Recording error occurred");
      };

      mediaRecorder.start(1000);

      isRecordingRef.current = true;
      recordingInitializedRef.current = true;
      callStartTimeRef.current = Date.now();

      setIsRecording(true);

      console.log("[USER][RECORDING] Recording started", {
        mimeType: mediaRecorder.mimeType,
        audioTracks: combinedStream.getAudioTracks().length,
      });
    } catch (error) {
      console.error("[USER][RECORDING] Start error:", error);
      recordingInitializedRef.current = false;
      setUploadStatus("Failed to start recording");
    }
  };

  const stopRecording = () => {
    try {
      console.log("[USER][RECORDING] Stop requested");

      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== "inactive"
      ) {
        mediaRecorderRef.current.stop();
      }

      isRecordingRef.current = false;
      setIsRecording(false);

      if (combinedStreamRef.current) {
        combinedStreamRef.current.getTracks().forEach((track) => {
          track.stop();
        });

        combinedStreamRef.current = null;
      }
    } catch (error) {
      console.error("[USER][RECORDING] Stop error:", error);
    }
  };

  const sendRecordingToServer = async () => {
    try {
      if (recordedChunksRef.current.length === 0) {
        console.warn("[USER][RECORDING] No recording chunks");
        setUploadStatus("No recording data to upload");
        return;
      }

      const blob = new Blob(recordedChunksRef.current, {
        type: mediaRecorderRef.current?.mimeType || "audio/webm",
      });

      let userId = "";
      let astroId = "";
      let astroName = "";

      try {
        const user = JSON.parse(localStorage.getItem("user") || "{}");

        userId = user?.id || "";
        astroId = callInfoRef.current.astroId || "";
        astroName = callInfoRef.current.astroName || "";
      } catch (error) {
        console.warn("[USER][RECORDING] Local storage parse error:", error);
      }

      const timestamp = new Date()
        .toISOString()
        .replace(/[:.]/g, "-");

      const filename = `call-${roomId}-${timestamp}.webm`;

      const file = new File([blob], filename, {
        type: mediaRecorderRef.current?.mimeType || "audio/webm",
      });

      const duration = callStartTimeRef.current
        ? Math.floor((Date.now() - callStartTimeRef.current) / 1000)
        : 0;

      console.log("[USER][RECORDING] Uploading recording:", {
        filename,
        size: file.size,
        duration,
        astroId,
        astroName,
        userId,
      });

      const { data, errors } = await uploadRecording({
        variables: {
          recording: file,
          roomId,
          astroId,
          astroName,
          userId,
          duration,
          callType: "audio",
        },
      });

      if (errors?.length) {
        throw new Error(errors[0]?.message || "Recording upload failed");
      }

      if (data?.uploadCallRecording?.success) {
        console.log("[USER][RECORDING] Upload successful");
        setUploadStatus("Recording uploaded successfully");
      } else {
        throw new Error(
          data?.uploadCallRecording?.message ||
            "Recording upload failed"
        );
      }

      recordedChunksRef.current = [];
    } catch (error) {
      console.error("[USER][RECORDING] Upload error:", error);
      setUploadStatus(`Upload error: ${error.message}`);
      recordedChunksRef.current = [];
    }
  };

  // --------------------------------------------------
  // REMOTE AUDIO
  // --------------------------------------------------

  const attachRemoteAudio = async (stream) => {
    if (!remoteAudio.current || !stream) {
      console.warn("[USER][AUDIO] Audio element or stream missing");
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
      console.error("[USER][AUDIO] Playback failed:", error);
      setCallStatus("Tap to enable audio");
    }
  };

  // --------------------------------------------------
  // ICE CANDIDATE QUEUE
  // --------------------------------------------------

  const addPendingIceCandidates = async () => {
    if (!pc.current?.remoteDescription) {
      console.warn(
        "[USER][ICE] Cannot drain queue: remote description missing"
      );
      return;
    }

    const queuedCandidates =
      pendingIceCandidatesRef.current.splice(0);

    console.log("[USER][ICE] Processing queued candidates:", {
      count: queuedCandidates.length,
    });

    for (const candidate of queuedCandidates) {
      try {
        await pc.current.addIceCandidate(
          new RTCIceCandidate(candidate)
        );

        console.log("[USER][ICE] Queued candidate added:", {
          type: getCandidateType(candidate),
        });
      } catch (error) {
        console.error(
          "[USER][ICE] Queued candidate failed:",
          error,
          candidate
        );
      }
    }
  };

  // --------------------------------------------------
  // WEBRTC STATISTICS
  // --------------------------------------------------

  const startStats = () => {
    if (statsIntervalRef.current) {
      clearInterval(statsIntervalRef.current);
    }

    statsIntervalRef.current = setInterval(async () => {
      if (!pc.current) return;

      try {
        const stats = await pc.current.getStats();

        let inboundAudio = null;
        let outboundAudio = null;
        let selectedPair = null;

        const candidateMap = new Map();

        stats.forEach((report) => {
          if (
            report.type === "local-candidate" ||
            report.type === "remote-candidate"
          ) {
            candidateMap.set(report.id, report);
          }

          if (
            report.type === "inbound-rtp" &&
            report.kind === "audio" &&
            !report.isRemote
          ) {
            inboundAudio = report;
          }

          if (
            report.type === "outbound-rtp" &&
            report.kind === "audio" &&
            !report.isRemote
          ) {
            outboundAudio = report;
          }

          if (
            report.type === "candidate-pair" &&
            (report.selected || report.nominated)
          ) {
            selectedPair = report;
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
          const localCandidate = candidateMap.get(
            selectedPair.localCandidateId
          );

          const remoteCandidate = candidateMap.get(
            selectedPair.remoteCandidateId
          );

          console.log("[USER][ICE] Selected candidate pair:", {
            state: selectedPair.state,
            nominated: selectedPair.nominated,
            currentRoundTripTime:
              selectedPair.currentRoundTripTime,
            availableOutgoingBitrate:
              selectedPair.availableOutgoingBitrate,
            localCandidateType: localCandidate?.candidateType,
            remoteCandidateType: remoteCandidate?.candidateType,
            localProtocol: localCandidate?.protocol,
            remoteProtocol: remoteCandidate?.protocol,
          });
        }
      } catch (error) {
        console.error("[USER][STATS] Error:", error);
      }
    }, 3000);
  };

  // --------------------------------------------------
  // CREATE PEER CONNECTION
  // --------------------------------------------------

  const createPeer = async (activeSocket) => {
    if (pc.current) {
      console.log("[USER][RTC] Reusing existing PeerConnection");
      return pc.current;
    }

    pendingIceCandidatesRef.current = [];
    callFullyConnectedRef.current = false;

    const iceConfig = getIceConfig();

    pc.current = new RTCPeerConnection(iceConfig);

    const peer = pc.current;

    console.log("[USER][RTC] PeerConnection created:", {
      roomId,
      iceServers: iceConfig.iceServers.map((server) => server.urls),
    });

    peer.onconnectionstatechange = () => {
      if (!pc.current) return;

      console.log(
        "[USER][RTC] connectionState:",
        peer.connectionState
      );

      if (peer.connectionState === "connected") {
        callFullyConnectedRef.current = true;
        setCallStatus("Connected");

        if (!recordingInitializedRef.current) {
          startRecording();
        }
      }

      if (
        peer.connectionState === "failed" ||
        peer.connectionState === "disconnected"
      ) {
        console.warn(
          "[USER][RTC] Peer connection problem:",
          peer.connectionState
        );
      }
    };

    peer.oniceconnectionstatechange = () => {
      if (!pc.current) return;

      console.log(
        "[USER][RTC] iceConnectionState:",
        peer.iceConnectionState
      );

      if (peer.iceConnectionState === "connected" ||
          peer.iceConnectionState === "completed") {
        callFullyConnectedRef.current = true;
        setCallStatus("Connected");

        if (!recordingInitializedRef.current) {
          startRecording();
        }
      }

      if (peer.iceConnectionState === "failed") {
        console.error(
          "[USER][RTC] ICE FAILED. Check TURN connectivity and relay candidates."
        );
      }

      if (peer.iceConnectionState === "disconnected") {
        console.warn(
          "[USER][RTC] ICE disconnected. Waiting for recovery..."
        );
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
        console.log("[USER][ICE] Candidate gathering completed");
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

    // Add local microphone before creating the offer.
    try {
      localStream.current =
        await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });

      const audioTracks = localStream.current.getAudioTracks();

      audioTracks.forEach((track) => {
        peer.addTrack(track, localStream.current);

        console.log("[USER][RTC] Local audio track added:", {
          label: track.label,
          enabled: track.enabled,
          muted: track.muted,
          readyState: track.readyState,
        });
      });

      if (audioTracks.length === 0) {
        throw new Error("No microphone audio track found");
      }
    } catch (error) {
      console.error("[USER][MIC] Microphone access error:", error);
      setCallStatus("Mic Error");
      throw error;
    }

    peer.ontrack = async (event) => {
      console.log("[USER][RTC] Remote track received:", {
        kind: event.track?.kind,
        readyState: event.track?.readyState,
        muted: event.track?.muted,
        streamsCount: event.streams?.length,
      });

      const remoteStream =
        event.streams?.[0] || new MediaStream([event.track]);

      remoteStreamRef.current = remoteStream;

      await attachRemoteAudio(remoteStream);

      setCallStatus("Connected");

      if (callFullyConnectedRef.current &&
          !recordingInitializedRef.current) {
        startRecording();
      }
    };

    peer.onicecandidate = (event) => {
      if (!event.candidate) {
        console.log("[USER][ICE] ICE candidate gathering completed");
        return;
      }

      // IMPORTANT: Serialize candidate before sending through Socket.IO.
      const candidateData = event.candidate.toJSON();

      console.log("[USER][ICE] Sending candidate:", {
        type: getCandidateType(candidateData),
        protocol: candidateData.protocol,
        candidate: candidateData.candidate,
      });

      activeSocket.emit("ice-candidate", {
        room_id: roomId,
        candidate: candidateData,
      });
    };

    startStats();

    return peer;
  };

  // --------------------------------------------------
  // SOCKET EVENTS AND CALL SETUP
  // --------------------------------------------------

  useEffect(() => {
    let activeSocket = socket;

    if (!activeSocket?.connected) {
      activeSocket = connectSocket();
    }

    if (!activeSocket) {
      console.error("[USER][SOCKET] Socket unavailable");
      return;
    }

    socketRef.current = activeSocket;

    const handlePeerJoined = async (data) => {
      try {
        console.log("[USER][SOCKET] peer_joined received:", data);

        if (callEndedRef.current) return;

        setCallStatus("Ringing...");

        const peer = await createPeer(activeSocket);

        if (!peer || peer.signalingState !== "stable") {
          console.warn(
            "[USER][SDP] Cannot create offer. Current signaling state:",
            peer?.signalingState
          );
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
      }
    };

    const handleAnswer = async (data) => {
      try {
        const answer = data?.answer;

        if (!pc.current) {
          console.warn("[USER][SDP] Answer received but PeerConnection is missing");
          return;
        }

        if (!answer) {
          console.error("[USER][SDP] Empty answer received:", data);
          return;
        }

        console.log("[USER][SDP] Answer received:", {
          roomId,
          answerType: answer.type,
          signalingStateBefore: pc.current.signalingState,
        });

        await pc.current.setRemoteDescription(
          new RTCSessionDescription(answer)
        );

        console.log("[USER][SDP] Remote answer applied:", {
          signalingState: pc.current.signalingState,
          remoteDescriptionType: pc.current.remoteDescription?.type,
          queuedCandidates:
            pendingIceCandidatesRef.current.length,
        });

        await addPendingIceCandidates();

        setCallStatus("Connecting...");

        const stored = localStorage.getItem(
          `call_request_${roomId}`
        );

        const activeRequest = JSON.parse(
          localStorage.getItem("activeRequest") || "{}"
        );

        if (stored) {
          const requestData = JSON.parse(stored);

          const totalSeconds =
            Number(requestData.maximum_time || 0) * 60;

          setRemainingTime(totalSeconds);

          callInfoRef.current = {
            astroId: requestData.astro_id || "",
            astroName:
              activeRequest?.astrologer?.name || "",
            userId: requestData.user_id || "",
          };
        }
      } catch (error) {
        console.error("[USER][SDP] Error handling answer:", error);
      }
    };

    const handleIceCandidate = async (data) => {
      try {
        const { candidate, room_id } = data || {};

        if (room_id !== roomId) {
          console.warn("[USER][ICE] Ignoring candidate for another room:", {
            receivedRoomId: room_id,
            currentRoomId: roomId,
          });
          return;
        }

        if (!candidate?.candidate) {
          console.warn("[USER][ICE] Invalid candidate received:", data);
          return;
        }

        if (!pc.current || !pc.current.remoteDescription) {
          pendingIceCandidatesRef.current.push(candidate);

          console.log(
            "[USER][ICE] Candidate queued until remote answer is applied:",
            {
              queueLength: pendingIceCandidatesRef.current.length,
              candidateType: getCandidateType(candidate),
            }
          );

          return;
        }

        await pc.current.addIceCandidate(
          new RTCIceCandidate(candidate)
        );

        console.log("[USER][ICE] Remote candidate added successfully:", {
          candidateType: getCandidateType(candidate),
        });
      } catch (error) {
        console.error(
          "[USER][ICE] Failed to add remote candidate:",
          error,
          data
        );
      }
    };

    const handleCallEndedByAstrologer = () => {
      console.log("[USER][SOCKET] Call ended by astrologer");

      callEndedRef.current = true;

      if (isRecordingRef.current) {
        stopRecording();
      }

      cleanup();
      dispatch(removeActiveRequest(roomId));
      router.push("/astrologer/call");
    };

    const handleCallEndedByAdmin = () => {
      console.log("[USER][SOCKET] Call ended by admin");

      callEndedRef.current = true;

      if (isRecordingRef.current) {
        stopRecording();
      }

      cleanup();
      dispatch(removeActiveRequest(roomId));
      router.push("/astrologer/call");
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --------------------------------------------------
  // AUDIO WAVEFORM
  // --------------------------------------------------

  useEffect(() => {
    const stream = remoteAudio.current?.srcObject;

    if (!stream) return;

    let audioContext;
    let analyser;
    let source;
    let animationId;

    const animate = () => {
      if (!analyser) return;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      analyser.getByteFrequencyData(dataArray);

      const normalized = Array.from(dataArray)
        .slice(0, 20)
        .map((value) => Math.max(10, value / 2));

      setWaveHeights(normalized);

      animationId = requestAnimationFrame(animate);
    };

    try {
      audioContext = new AudioContext();
      analyser = audioContext.createAnalyser();
      analyser.fftSize = 64;

      source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      animate();
    } catch (error) {
      console.error("[USER][AUDIO] Waveform error:", error);
    }

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }

      if (source) {
        source.disconnect();
      }

      if (audioContext && audioContext.state !== "closed") {
        audioContext.close();
      }
    };
  }, [remoteStreamRef.current]);

  // --------------------------------------------------
  // CALL TIMER
  // --------------------------------------------------

  useEffect(() => {
    if (callStatus !== "Connected" || remainingTime <= 0) {
      return;
    }

    timerRef.current = setInterval(() => {
      setRemainingTime((previous) => {
        if (previous <= 1) {
          clearInterval(timerRef.current);

          if (isRecordingRef.current) {
            stopRecording();
          }

          handleEndCall();

          return 0;
        }

        return previous - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callStatus]);

  // --------------------------------------------------
  // END CALL
  // --------------------------------------------------

  const handleEndCall = () => {
    if (callEndedRef.current) return;

    callEndedRef.current = true;

    console.log("[USER][CALL] Ending call:", roomId);

    try {
      const stored = localStorage.getItem(
        `call_request_${roomId}`
      );

      const data = stored ? JSON.parse(stored) : {};

      if (isRecordingRef.current) {
        stopRecording();
      }

      socketRef.current?.emit("call_ended_by_user", {
        room_id: roomId,
        astro_id: data?.astro_id,
      });
    } catch (error) {
      console.error("[USER][CALL] Error ending call:", error);
    }

    cleanup();

    dispatch(removeActiveRequest(roomId));
    router.push("/astrologer/call");
  };

  // --------------------------------------------------
  // MUTE
  // --------------------------------------------------

  const toggleMute = () => {
    if (!localStream.current) return;

    const nextMuted = !isMuted;

    localStream.current.getAudioTracks().forEach((track) => {
      track.enabled = !nextMuted;
    });

    setIsMuted(nextMuted);

    console.log("[USER][AUDIO] Microphone mute changed:", nextMuted);
  };

  // --------------------------------------------------
  // CLEANUP
  // --------------------------------------------------

  const cleanup = () => {
    console.log("[USER][CLEANUP] Cleaning up WebRTC resources");

    callFullyConnectedRef.current = false;
    pendingIceCandidatesRef.current = [];

    clearTimeout(recordingRetryTimerRef.current);

    if (statsIntervalRef.current) {
      clearInterval(statsIntervalRef.current);
      statsIntervalRef.current = null;
    }

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (pc.current) {
      pc.current.ontrack = null;
      pc.current.onicecandidate = null;
      pc.current.onicecandidateerror = null;
      pc.current.onconnectionstatechange = null;
      pc.current.oniceconnectionstatechange = null;

      pc.current.close();
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

    console.log("[USER][CLEANUP] Cleanup completed");

    [
      `call_request_${roomId}`,
      `activeCallRoom_${roomId}`,
      "activeRequests",
      `queue_${roomId}`,
      `timer_${roomId}`,
    ].forEach((key) => localStorage.removeItem(key));
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
  // ASTROLOGER DISPLAY DATA
  // --------------------------------------------------

  let astroData = {};

  if (typeof window !== "undefined") {
    try {
      astroData = JSON.parse(
        localStorage.getItem("activeRequest") || "{}"
      );
    } catch (error) {
      console.warn("[USER] Invalid activeRequest localStorage data");
    }
  }

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <div className="flex items-center justify-center h-screen overflow-hidden bg-[#120a18e7] relative">
      <div className="absolute w-[400px] h-[400px] bg-purple-600 opacity-20 blur-3xl rounded-full top-[-100px] left-[-100px]" />

      <div className="absolute w-[500px] h-[500px] bg-violet-500 opacity-20 blur-3xl rounded-full bottom-[-100px] right-[-100px]" />

      <div className="md:w-3/5 overflow-hidden w-full shadow-lg rounded-3xl flex flex-col md:h-[95vh] h-[100vh]">
        <div className="flex flex-col w-full rounded-3xl shadow-xl items-center justify-between py-10 h-full bg-gray-900 text-white">
          <div className="flex flex-col items-center gap-3">
            <Image
              width={100}
              height={100}
              src={
                astroImage
                  ? `${BASE_URL}${astroImage}`
                  : "/man.png"
              }
              alt={astroData?.astrologer?.name || "Astrologer"}
              className="rounded-full object-cover"
            />

            <h2 className="text-xl">
              {astroData?.astrologer?.name}
            </h2>

            <div className="flex items-center gap-2 mt-2 text-green-400">
              <span className="w-2 h-2 bg-green-400 rounded-full text-xs animate-pulse" />
              {callStatus}
            </div>

            {uploadStatus && (
              <p className="text-xs text-gray-300">
                {uploadStatus}
              </p>
            )}
          </div>

          <div className="flex flex-col items-center">
            {callStatus === "Connected" && (
              <p className="mb-2 text-lg">
                Time Left: {formatTime(remainingTime)}
              </p>
            )}

            <div className="flex items-end justify-center gap-1 h-20 mt-4">
              {waveHeights.map((height, index) => (
                <div
                  key={index}
                  className="w-2 bg-green-400 rounded-full transition-all duration-75"
                  style={{ height: `${height}px` }}
                />
              ))}
            </div>
          </div>

          {/* Remote audio */}
          <audio
            ref={remoteAudio}
            autoPlay
            playsInline
          />

          <div className="flex gap-6 w-full items-center justify-center">
            <button
              onClick={toggleMute}
              type="button"
              aria-label={isMuted ? "Unmute microphone" : "Mute microphone"}
              className="w-18 h-18 bg-gray-200 rounded-full flex items-center justify-center shadow-2xl"
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
              className="w-18 h-18 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center shadow-2xl"
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