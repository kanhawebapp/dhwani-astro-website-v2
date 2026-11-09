
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

// IMPORTANT:
// Rotate your exposed Coturn password.
// This is only a temporary testing configuration.
// For production, fetch short-lived TURN credentials from your backend.

const TURN_USERNAME = "turnuser";
const TURN_CREDENTIAL = "Shiva@2025#";

const ICE_SERVERS = [
  {
    urls: "stun:162.214.102.56:3478",
  },
  {
    urls: "turn:162.214.102.56:3478?transport=udp",
    username: TURN_USERNAME,
    credential: TURN_CREDENTIAL,
  },
];

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

  // ========================================
  // STATE
  // ========================================

  const [remainingTime, setRemainingTime] = useState(0);
  const [callStatus, setCallStatus] = useState("Connecting...");
  const [isMuted, setIsMuted] = useState(false);
  const [waveHeights, setWaveHeights] = useState(
    Array(20).fill(10)
  );
  const [isRecording, setIsRecording] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [astroData, setAstroData] = useState(null);

  // ========================================
  // REFS
  // ========================================

  const pc = useRef(null);
  const remoteAudio = useRef(null);
  const localStream = useRef(null);

  const pendingIceCandidatesRef = useRef([]);

  const timerRef = useRef(null);
  const statsIntervalRef = useRef(null);

  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const isRecordingRef = useRef(false);
  const callStartTimeRef = useRef(null);
  const combinedStreamRef = useRef(null);
  const recordingInitializedRef = useRef(false);

  const remoteStreamRef = useRef(null);
  const callFullyConnectedRef = useRef(false);

  const callInfoRef = useRef({
    astroId: "",
    astroName: "",
    userId: "",
  });

  // ========================================
  // GRAPHQL
  // ========================================

  const [
    uploadRecording,
    { loading: uploadLoading, error: uploadError },
  ] = useMutation(UPLOAD_CALL_RECORDING);

  // ========================================
  // LOAD ASTROLOGER DATA SAFELY
  // ========================================

  useEffect(() => {
    try {
      const stored = localStorage.getItem("activeRequest");

      setAstroData(stored ? JSON.parse(stored) : null);
    } catch (error) {
      console.error("Unable to read activeRequest:", error);
      setAstroData(null);
    }
  }, []);

  // ========================================
  // ICE CANDIDATE QUEUE
  // ========================================

  const addRemoteIceCandidate = async (candidate) => {
    if (!candidate) return;

    const peer = pc.current;

    if (!peer || !peer.remoteDescription) {
      pendingIceCandidatesRef.current.push(candidate);

      console.log("⏳ User ICE candidate queued");

      return;
    }

    try {
      if (peer.signalingState === "closed") return;

      await peer.addIceCandidate(
        new RTCIceCandidate(candidate)
      );

      console.log("✅ User remote ICE candidate added");
    } catch (error) {
      console.error("❌ User ICE candidate error:", error);
    }
  };

  const flushPendingIceCandidates = async (peer) => {
    if (!peer?.remoteDescription) return;

    const candidates = [
      ...pendingIceCandidatesRef.current,
    ];

    pendingIceCandidatesRef.current = [];

    console.log(
      "📦 Flushing user ICE candidates:",
      candidates.length
    );

    for (const candidate of candidates) {
      try {
        if (peer.signalingState === "closed") break;

        await peer.addIceCandidate(
          new RTCIceCandidate(candidate)
        );

        console.log("✅ Queued user ICE candidate added");
      } catch (error) {
        console.error(
          "❌ Failed to add queued user candidate:",
          error
        );
      }
    }
  };

  // ========================================
  // ICE DIAGNOSTICS
  // ========================================

  const dumpIceStats = async (peer) => {
    if (!peer) return;

    try {
      const stats = await peer.getStats();

      stats.forEach((report) => {
        if (report.type !== "candidate-pair") return;

        const local = stats.get(report.localCandidateId);
        const remote = stats.get(report.remoteCandidateId);

        console.log("🔍 USER ICE CANDIDATE PAIR:", {
          state: report.state,
          nominated: report.nominated,
          localType: local?.candidateType,
          remoteType: remote?.candidateType,
          localProtocol: local?.protocol,
          remoteProtocol: remote?.protocol,
          localAddress: local?.address,
          localPort: local?.port,
          remoteAddress: remote?.address,
          remotePort: remote?.port,
          requestsSent: report.requestsSent,
          requestsReceived: report.requestsReceived,
          responsesReceived: report.responsesReceived,
          bytesSent: report.bytesSent,
          bytesReceived: report.bytesReceived,
          currentRoundTripTime: report.currentRoundTripTime,
        });
      });
    } catch (error) {
      console.error("ICE stats error:", error);
    }
  };

  // ========================================
  // RECORDING
  // ========================================

  const startRecording = () => {
    try {
      if (recordingInitializedRef.current) return;

      if (!window.MediaRecorder) {
        console.warn("MediaRecorder is not supported");
        return;
      }

      if (!callFullyConnectedRef.current) return;

      const remoteStream =
        remoteAudio.current?.srcObject ||
        remoteStreamRef.current;

      if (!localStream.current || !remoteStream) {
        console.warn("Recording streams are not ready");
        return;
      }

      const combinedStream = new MediaStream();

      localStream.current
        .getAudioTracks()
        .forEach((track) => {
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
        console.warn("No audio tracks available for recording");
        return;
      }

      combinedStreamRef.current = combinedStream;

      const mimeTypes = [
        "audio/webm;codecs=opus",
        "audio/webm",
        "audio/ogg;codecs=opus",
        "audio/mp4",
      ];

      let mimeType = "";

      for (const type of mimeTypes) {
        if (MediaRecorder.isTypeSupported(type)) {
          mimeType = type;
          break;
        }
      }

      const mediaRecorder = new MediaRecorder(
        combinedStream,
        {
          mimeType: mimeType || undefined,
          audioBitsPerSecond: 128000,
        }
      );

      mediaRecorderRef.current = mediaRecorder;
      recordedChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        sendRecordingToServer();
        setIsRecording(false);
        recordingInitializedRef.current = false;
      };

      mediaRecorder.onerror = (error) => {
        console.error("Recording error:", error);

        setIsRecording(false);
        recordingInitializedRef.current = false;
        setUploadStatus("Recording error occurred");
      };

      mediaRecorder.start(1000);

      isRecordingRef.current = true;
      recordingInitializedRef.current = true;

      setIsRecording(true);
      callStartTimeRef.current = Date.now();

      console.log("🔴 Call recording started");
    } catch (error) {
      console.error("Failed to start recording:", error);

      recordingInitializedRef.current = false;
      setUploadStatus("Failed to start recording");
    }
  };

  const stopRecording = () => {
    try {
      const recorder = mediaRecorderRef.current;

      if (
        recorder &&
        recorder.state !== "inactive"
      ) {
        recorder.stop();
      }

      isRecordingRef.current = false;
      setIsRecording(false);

      if (combinedStreamRef.current) {
        combinedStreamRef.current
          .getTracks()
          .forEach((track) => {
            track.stop();
          });

        combinedStreamRef.current = null;
      }
    } catch (error) {
      console.error("Error stopping recording:", error);
    }
  };

  const sendRecordingToServer = async () => {
    try {
      if (recordedChunksRef.current.length === 0) {
        setUploadStatus("No recording data to upload");
        return;
      }

      const mimeType =
        mediaRecorderRef.current?.mimeType ||
        "audio/webm";

      const blob = new Blob(
        recordedChunksRef.current,
        { type: mimeType }
      );

      let userId = "";
      let astroId = "";
      let astroName = "";

      try {
        const user = JSON.parse(
          localStorage.getItem("user") || "{}"
        );

        userId = user?.id || "";

        astroId = callInfoRef.current.astroId || "";
        astroName = callInfoRef.current.astroName || "";
      } catch (error) {
        console.warn(
          "Could not read recording user details:",
          error
        );
      }

      const timestamp = new Date()
        .toISOString()
        .replace(/[:.]/g, "-");

      const filename = `call-${roomId}-${timestamp}.webm`;

      const file = new File([blob], filename, {
        type: mimeType,
      });

      const duration = callStartTimeRef.current
        ? Math.floor(
            (Date.now() - callStartTimeRef.current) / 1000
          )
        : 0;

      const { data, errors } = await uploadRecording({
        variables: {
          recording: file,
          roomId: roomId,
          astroId: astroId || "",
          astroName: astroName || "",
          userId: userId || "",
          duration,
          callType: "audio",
        },
      });

      if (errors?.length) {
        throw new Error(
          errors[0]?.message || "Failed to upload recording"
        );
      }

      if (data?.uploadCallRecording?.success) {
        setUploadStatus("Recording uploaded successfully");
      } else {
        setUploadStatus(
          data?.uploadCallRecording?.message ||
            "Recording upload failed"
        );
      }

      recordedChunksRef.current = [];
    } catch (error) {
      console.error(
        "Failed to send recording:",
        error
      );

      setUploadStatus(`Upload error: ${error.message}`);
      recordedChunksRef.current = [];
    }
  };

  // ========================================
  // CREATE PEER CONNECTION
  // ========================================

  const createPeer = async (activeSocket) => {
    if (pc.current) {
      return pc.current;
    }

    console.log("🔗 Creating user peer connection");

    const peer = new RTCPeerConnection({
      iceServers: ICE_SERVERS,
      iceTransportPolicy: "relay",
    });

    pc.current = peer;

    // ----------------------------------------
    // MICROPHONE
    // ----------------------------------------

    try {
      localStream.current =
        await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            sampleRate: 48000,
          },
        });

      console.log(
        "🎤 User microphone initialized:",
        localStream.current.getAudioTracks().length
      );

      localStream.current.getTracks().forEach((track) => {
        peer.addTrack(track, localStream.current);

        console.log(
          "➕ User local track added:",
          track.kind,
          track.readyState
        );
      });
    } catch (error) {
      console.error("❌ User microphone access error:", error);

      setCallStatus("Mic Error");

      peer.close();
      pc.current = null;

      throw error;
    }

    // ----------------------------------------
    // REMOTE AUDIO
    // ----------------------------------------

    peer.ontrack = async (event) => {
      console.log("🎧 User received remote audio track");

      const remoteStream = event.streams?.[0];

      if (!remoteStream) {
        console.warn("Remote stream not available");
        return;
      }

      remoteStreamRef.current = remoteStream;

      if (remoteAudio.current) {
        remoteAudio.current.srcObject = remoteStream;
        remoteAudio.current.volume = 1;
        remoteAudio.current.muted = false;

        try {
          await remoteAudio.current.play();

          console.log("🔊 User remote audio playback started");
        } catch (error) {
          console.error("Autoplay blocked:", error);
        }
      }

      // Do not set Connected here.
      // Wait for the peer connection state.
    };

    // ----------------------------------------
    // LOCAL ICE CANDIDATES
    // ----------------------------------------

    peer.onicecandidate = (event) => {
      if (event.candidate) {
        console.log("📤 USER LOCAL ICE:", {
          type: event.candidate.type,
          protocol: event.candidate.protocol,
          address: event.candidate.address,
          port: event.candidate.port,
        });

        if (activeSocket?.connected) {
          activeSocket.emit("ice-candidate", {
            room_id: roomId,
            candidate: event.candidate,
          });
        } else {
          console.error(
            "❌ Socket disconnected; user ICE candidate not sent"
          );
        }
      } else {
        console.log("✅ User ICE gathering completed");
      }
    };

    // ----------------------------------------
    // ICE CANDIDATE ERRORS
    // ----------------------------------------

    peer.onicecandidateerror = (event) => {
      console.error("❌ USER ICE CANDIDATE ERROR:", {
        address: event.address,
        port: event.port,
        url: event.url,
        errorCode: event.errorCode,
        errorText: event.errorText,
      });
    };

    // ----------------------------------------
    // ICE CONNECTION STATE
    // ----------------------------------------

    peer.oniceconnectionstatechange = () => {
      const state = peer.iceConnectionState;

      console.log("🧊 USER ICE STATE:", state);

      if (
        state === "connected" ||
        state === "completed"
      ) {
        console.log("✅ User ICE connection established");
      }

      if (state === "failed") {
        console.error("❌ User ICE connection failed");

        dumpIceStats(peer);
      }

      if (state === "disconnected") {
        console.warn("⚠️ User ICE disconnected");
      }
    };

    // ----------------------------------------
    // PEER CONNECTION STATE
    // ----------------------------------------

    peer.onconnectionstatechange = () => {
      const state = peer.connectionState;

      console.log("🔥 USER PEER CONNECTION STATE:", state);

      if (state === "connected") {
        console.log("🎉 User WebRTC connected");

        callFullyConnectedRef.current = true;
        setCallStatus("Connected");

        setTimeout(() => {
          if (
            peer.connectionState === "connected" &&
            !recordingInitializedRef.current
          ) {
            startRecording();
          }
        }, 1500);
      }

      if (state === "failed") {
        console.error("❌ User WebRTC connection failed");

        callFullyConnectedRef.current = false;
        setCallStatus("Connection Failed");

        dumpIceStats(peer);
      }

      if (state === "disconnected") {
        console.warn("⚠️ User WebRTC disconnected");
      }
    };

    // ----------------------------------------
    // SIGNALING STATE
    // ----------------------------------------

    peer.onsignalingstatechange = () => {
      console.log(
        "📡 USER SIGNALING STATE:",
        peer.signalingState
      );
    };

    // ----------------------------------------
    // ICE GATHERING STATE
    // ----------------------------------------

    peer.onicegatheringstatechange = () => {
      console.log(
        "🧊 USER ICE GATHERING STATE:",
        peer.iceGatheringState
      );
    };

    return peer;
  };

  // ========================================
  // CLEANUP
  // ========================================

  const cleanup = () => {
    console.log("🧹 Cleaning up user WebRTC call");

    callFullyConnectedRef.current = false;

    pendingIceCandidatesRef.current = [];

    // Stop recording.
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      try {
        mediaRecorderRef.current.stop();
      } catch (error) {
        console.error("Recorder cleanup error:", error);
      }
    }

    isRecordingRef.current = false;

    // Clear stats.
    if (statsIntervalRef.current) {
      clearInterval(statsIntervalRef.current);
      statsIntervalRef.current = null;
    }

    // Clear timer.
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Close peer connection.
    if (pc.current) {
      pc.current.ontrack = null;
      pc.current.onicecandidate = null;
      pc.current.onicecandidateerror = null;
      pc.current.oniceconnectionstatechange = null;
      pc.current.onconnectionstatechange = null;

      pc.current.close();
      pc.current = null;
    }

    // Stop local microphone.
    if (localStream.current) {
      localStream.current.getTracks().forEach((track) => {
        track.stop();
      });

      localStream.current = null;
    }

    // Stop combined recording stream.
    if (combinedStreamRef.current) {
      combinedStreamRef.current
        .getTracks()
        .forEach((track) => track.stop());

      combinedStreamRef.current = null;
    }

    // Clear remote audio.
    if (remoteAudio.current) {
      remoteAudio.current.pause();
      remoteAudio.current.srcObject = null;
    }

    remoteStreamRef.current = null;

    recordingInitializedRef.current = false;

    setIsRecording(false);
    setIsMuted(false);
  };

  // ========================================
  // SOCKET EVENTS AND CALL SETUP
  // ========================================

  useEffect(() => {
    let activeSocket = socket;

    if (!activeSocket?.connected) {
      activeSocket = connectSocket();
    }

    if (!activeSocket) {
      console.error("❌ Socket not available");
      return;
    }

    let disposed = false;
    let creatingOffer = false;

    // Clear stale candidates at the beginning of a new call.
    pendingIceCandidatesRef.current = [];

    // ----------------------------------------
    // PEER JOINED
    // ----------------------------------------

    const handlePeerJoined = async () => {
      if (disposed || creatingOffer) return;

      creatingOffer = true;

      try {
        console.log("👤 Astrologer joined call room");

        setCallStatus("Ringing...");

        const peer = await createPeer(activeSocket);

        if (disposed) return;

        const offer = await peer.createOffer({
          offerToReceiveAudio: true,
        });

        await peer.setLocalDescription(offer);

        console.log("📤 User offer created and set locally");

        activeSocket.emit("offer", {
          room_id: roomId,
          offer: peer.localDescription,
        });

        console.log("✅ User offer sent");
      } catch (error) {
        console.error("❌ Error creating offer:", error);

        setCallStatus("Error creating offer");
      } finally {
        creatingOffer = false;
      }
    };

    // ----------------------------------------
    // ANSWER RECEIVED
    // ----------------------------------------

    const handleAnswer = async ({ answer }) => {
      const peer = pc.current;

      if (!peer) {
        console.warn("❌ No peer connection available for answer");
        return;
      }

      try {
        console.log("📨 User answer received");

        await peer.setRemoteDescription(
          new RTCSessionDescription(answer)
        );

        console.log("✅ User remote answer description set");

        // Important: process queued ICE candidates now.
        await flushPendingIceCandidates(peer);

        const stored = localStorage.getItem(
          `call_request_${roomId}`
        );

        const activeRequest = JSON.parse(
          localStorage.getItem("activeRequest") || "{}"
        );

        if (stored) {
          const data = JSON.parse(stored);

          const totalSeconds = Number(
            data.maximum_time || 0
          ) * 60;

          setRemainingTime(totalSeconds);

          callInfoRef.current = {
            astroId: data.astro_id || "",
            astroName:
              activeRequest?.astrologer?.name || "",
            userId: data.user_id || "",
          };
        }

        console.log("⏳ Waiting for ICE connection...");
      } catch (error) {
        console.error("❌ Error handling answer:", error);
      }
    };

    // ----------------------------------------
    // REMOTE ICE CANDIDATE
    // ----------------------------------------

    const handleIceCandidate = async ({
      candidate,
      room_id,
    }) => {
      if (room_id !== roomId) {
        return;
      }

      await addRemoteIceCandidate(candidate);
    };

    // ----------------------------------------
    // CALL ENDED BY ASTROLOGER
    // ----------------------------------------

    const handleCallEndedByAstrologer = () => {
      console.log("📴 Call ended by astrologer");

      if (isRecordingRef.current) {
        stopRecording();
      }

      cleanup();

      dispatch(removeActiveRequest(roomId));

      router.push("/astrologer/call");
    };

    // ----------------------------------------
    // CALL ENDED BY ADMIN
    // ----------------------------------------

    const handleCallEndedByAdmin = () => {
      console.log("📴 Call ended by admin");

      if (isRecordingRef.current) {
        stopRecording();
      }

      cleanup();

      dispatch(removeActiveRequest(roomId));

      router.push("/astrologer/call");
    };

    // ----------------------------------------
    // REGISTER SOCKET EVENTS
    // ----------------------------------------

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

    // ----------------------------------------
    // JOIN CALL ROOM
    // ----------------------------------------

    activeSocket.emit("join_call", {
      roomId,
    });

    console.log("🚪 User joined call room:", roomId);

    // ----------------------------------------
    // CLEANUP SOCKET EVENTS
    // ----------------------------------------

    return () => {
      disposed = true;

      console.log("🧹 Removing user socket listeners");

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
  }, []); // Keep existing one-time call setup behavior.

  // ========================================
  // CALL TIMER
  // ========================================

  useEffect(() => {
    if (
      callStatus !== "Connected" ||
      remainingTime <= 0
    ) {
      return;
    }

    timerRef.current = setInterval(() => {
      setRemainingTime((previous) => {
        if (previous <= 1) {
          clearInterval(timerRef.current);
          timerRef.current = null;

          console.log("⏰ Call time expired");

          handleEndCall();

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
  }, [callStatus]);

  // ========================================
  // VOICE WAVE ANIMATION
  // ========================================

  useEffect(() => {
    if (callStatus !== "Connected") return;

    const stream =
      remoteAudio.current?.srcObject ||
      remoteStreamRef.current;

    if (!stream) return;

    let audioContext;
    let source;
    let animationFrameId;

    try {
      audioContext = new AudioContext();

      const analyser = audioContext.createAnalyser();

      analyser.fftSize = 64;

      source = audioContext.createMediaStreamSource(stream);

      source.connect(analyser);

      const dataArray = new Uint8Array(
        analyser.frequencyBinCount
      );

      const animate = () => {
        analyser.getByteFrequencyData(dataArray);

        const normalized = Array.from(dataArray)
          .slice(0, 20)
          .map((value) => Math.max(10, value / 2));

        setWaveHeights(normalized);

        animationFrameId =
          requestAnimationFrame(animate);
      };

      animate();
    } catch (error) {
      console.error("Wave animation error:", error);
    }

    return () => {
      cancelAnimationFrame(animationFrameId);

      if (source) {
        source.disconnect();
      }

      if (audioContext) {
        audioContext.close();
      }
    };
  }, [callStatus]);

  // ========================================
  // END CALL
  // ========================================

  const handleEndCall = () => {
    console.log("📴 Ending user call");

    let data = {};

    try {
      data = JSON.parse(
        localStorage.getItem(`call_request_${roomId}`) || "{}"
      );
    } catch (error) {
      console.error("Unable to read call request:", error);
    }

    if (isRecordingRef.current) {
      stopRecording();
    }

    if (socket?.connected) {
      socket.emit("call_ended_by_user", {
        room_id: roomId,
        astro_id: data?.astro_id,
      });
    }

    cleanup();

    dispatch(removeActiveRequest(roomId));

    router.push("/astrologer/call");
  };

  // ========================================
  // MUTE / UNMUTE
  // ========================================

  const toggleMute = () => {
    if (!localStream.current) return;

    const tracks = localStream.current.getAudioTracks();

    tracks.forEach((track) => {
      track.enabled = !track.enabled;
    });

    setIsMuted(
      tracks.length > 0 ? !tracks[0].enabled : false
    );
  };

  // ========================================
  // TIME FORMAT
  // ========================================

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // ========================================
  // UI
  // ========================================

  return (
    <div className="flex items-center justify-center h-screen overflow-hidden bg-[#120a18e7] relative">

      <div className="absolute w-[400px] h-[400px] bg-purple-600 opacity-20 blur-3xl rounded-full top-[-100px] left-[-100px]" />

      <div className="absolute w-[500px] h-[500px] bg-violet-500 opacity-20 blur-3xl rounded-full bottom-[-100px] right-[-100px]" />

      <div className="md:w-3/5 overflow-hidden w-full shadow-lg rounded-3xl flex flex-col md:h-[95vh] h-[100vh]">

        <div className="flex flex-col w-full rounded-3xl shadow-xl items-center justify-between py-10 h-full bg-gray-900 text-white">

          {/* ASTROLOGER DETAILS */}

          <div className="flex flex-col items-center gap-3">

            <Image
              width={100}
              height={100}
              src={
                astroImage
                  ? `${BASE_URL}${astroImage}`
                  : "/man.png"
              }
              alt={
                astroData?.astrologer?.name || "Astrologer"
              }
              className="rounded-full object-cover"
            />

            <h2 className="text-xl">
              {astroData?.astrologer?.name || astro_Name || "Astrologer"}
            </h2>

            <div className="flex items-center gap-2 mt-2 text-green-400">
              <span className="w-2 h-2 bg-green-400 rounded-full text-xs animate-pulse" />
              {callStatus}
            </div>

          </div>

          {/* CALL TIMER AND WAVE */}

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
                  style={{
                    height: `${height}px`,
                  }}
                />
              ))}

            </div>

          </div>

          {/* REMOTE AUDIO */}

          <audio
            ref={remoteAudio}
            autoPlay
            playsInline
          />

          {/* CALL CONTROLS */}

          <div className="flex gap-6 w-full items-center justify-center">

            <button
              onClick={toggleMute}
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
                    d="M320 64C267 64 224 107 224 160L224 288C224 341 267 384 320 384C373 384 416 341 416 288L416 160C416 107 373 64 320 64zM176 248C176 234.7 165.3 224 152 224C138.7 224 128 234.7 128 248L128 288C128 385.9 201.3 466.7 296 478.5L296 528L248 528C234.7 528 224 538.7 224 552C224 565.3 234.7 576 248 576L392 576C405.3 576 416 565.3 416 552L416 528L344 528L344 478.5C438.7 466.7 512 385.9 512 288L512 248C512 234.7 501.3 224 488 224C474.7 224 464 234.7 464 248L464 288C464 367.5 399.5 432 320 432C240.5 432 176 367.5 176 288L176 248z"
                  />
                </svg>
              )}
            </button>

            <button
              onClick={handleEndCall}
              className="w-18 h-18 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center shadow-2xl"
            >
              <svg width={25} height={25} viewBox="0 0 640 640">
                <path
                  fill="rgb(255, 255, 255)"
                  d="M567 39.1C576.4 29.7 591.6 29.7 600.9 39.1C610.2 48.5 610.3 63.7 600.9 73L73 601.1C63.6 610.5 48.4 610.5 39.1 601.1C29.8 591.7 29.7 576.5 39.1 567.2L173.5 432.6C121.2 374.5 83.6 302.8 66.8 223.4C50.7 147.1 105.9 84.6 170.5 66.9L176 65.4C195.7 60 216.3 70.1 224.1 88.9L264.6 186.2C271.5 202.7 266.7 221.8 252.8 233.2L208.7 269.3C221.6 297.8 238.3 324.1 258.2 347.8L567 39.1zM416.6 573.1C353.6 559.7 295.3 533.3 244.9 496.8L329.8 412C342 420.2 354.8 427.6 368.1 434.2L406.7 387C418 373.1 437.1 368.4 453.7 375.2L551 415.8C569.8 423.6 579.9 444.2 574.5 463.9L573 469.4C555.4 534 492.8 589.2 416.6 573.1z"
                />
              </svg>
            </button>

          </div>

          {uploadStatus && (
            <p className="text-xs text-gray-400">
              {uploadStatus}
            </p>
          )}

        </div>
      </div>
    </div>
  );
}
