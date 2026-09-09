"use client";

import { useEffect, useRef, useContext, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import SocketContext from "@/app/context/socketContext";
import Image from "next/image";
import { useDispatch } from "react-redux";
import { removeActiveRequest } from "@/app/redux/reducer/chat/sendRequestSlice";
import { useQuery, useMutation } from "@apollo/client/react";
import { gql } from "@apollo/client";

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
  userIntakeId,
) {
  const dispatch = useDispatch();
  const { roomId } = useParams();

  const router = useRouter();
  const [remainingTime, setRemainingTime] = useState(0);

  const timerRef = useRef(null);

  const { socket, connectSocket } = useContext(SocketContext);

  // GraphQL mutation for uploading recording
  const [uploadRecording, { loading: uploadLoading, error: uploadError }] =
    useMutation(UPLOAD_CALL_RECORDING);

  const pc = useRef(null);

  const remoteAudio = useRef(null);

  const localStream = useRef(null);

  const statsIntervalRef = useRef(null);

  // Recording refs (hidden from UI)
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const isRecordingRef = useRef(false);
  const callStartTimeRef = useRef(null);
  const combinedStreamRef = useRef(null);
  const recordingInitializedRef = useRef(false);
  const remoteStreamRef = useRef(null);
  const callFullyConnectedRef = useRef(false);

  const [callStatus, setCallStatus] = useState("Connecting...");
  const [isMuted, setIsMuted] = useState(false);
  const [waveHeights, setWaveHeights] = useState(Array(20).fill(10));
  const [isRecording, setIsRecording] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  // const [astroLogerData, setAstrologerData] = useState("");
  const callInfoRef = useRef({
    astroId: "",
    astroName: "",
    userId: "",
  });

  // voice waves
  useEffect(() => {
    if (!remoteAudio.current?.srcObject) return;

    const audioContext = new AudioContext();

    const analyser = audioContext.createAnalyser();

    analyser.fftSize = 64;

    const source = audioContext.createMediaStreamSource(
      remoteAudio.current.srcObject,
    );

    source.connect(analyser);

    const bufferLength = analyser.frequencyBinCount;

    const dataArray = new Uint8Array(bufferLength);

    const animate = () => {
      analyser.getByteFrequencyData(dataArray);

      const normalized = Array.from(dataArray)
        .slice(0, 20)
        .map((v) => Math.max(10, v / 2));

      setWaveHeights(normalized);

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      audioContext.close();
    };
  }, [remoteAudio.current?.srcObject]);

  const startRecording = () => {
    try {
      if (recordingInitializedRef.current) {
        return;
      }

      if (!window.MediaRecorder) {
        return;
      }

      if (!callFullyConnectedRef.current) {
        setTimeout(() => startRecording(), 1000);
        return;
      }

      let remoteStream = null;
      if (remoteAudio.current?.srcObject) {
        remoteStream = remoteAudio.current.srcObject;
      }

      const combinedStream = new MediaStream();

      if (localStream.current) {
        const localTracks = localStream.current.getAudioTracks();
        localTracks.forEach((track) => {
          if (track.readyState === "live") {
            combinedStream.addTrack(track);
          }
        });
      } else {
        return;
      }

      if (remoteStream) {
        const remoteTracks = remoteStream.getAudioTracks();
        remoteTracks.forEach((track) => {
          if (track.readyState === "live") {
            combinedStream.addTrack(track);
          }
        });
      } else {
        return;
      }

      // Check if we have any tracks
      if (combinedStream.getAudioTracks().length === 0) {
        return;
      }

      combinedStreamRef.current = combinedStream;

      // Create MediaRecorder instance
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

      const mediaRecorder = new MediaRecorder(combinedStream, {
        mimeType: mimeType || undefined,
        audioBitsPerSecond: 128000,
      });

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
        setIsRecording(false);
        recordingInitializedRef.current = false;
        setUploadStatus("Recording error occurred");
      };

      // Start recording
      mediaRecorder.start(1000);
      isRecordingRef.current = true;
      recordingInitializedRef.current = true;
      setIsRecording(true);
      callStartTimeRef.current = Date.now();
    } catch (error) {
      recordingInitializedRef.current = false;
      setUploadStatus("Failed to start recording");
    }
  };

  const stopRecording = () => {
    try {
      if (mediaRecorderRef.current && isRecordingRef.current) {
        mediaRecorderRef.current.stop();
        isRecordingRef.current = false;
        setIsRecording(false);
        recordingInitializedRef.current = false;

        // Clean up combined stream
        if (combinedStreamRef.current) {
          combinedStreamRef.current.getTracks().forEach((track) => {
            combinedStreamRef.current.removeTrack(track);
          });
          combinedStreamRef.current = null;
        }
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

      // Create blob from recorded chunks
      const blob = new Blob(recordedChunksRef.current, {
        type: mediaRecorderRef.current?.mimeType || "audio/webm",
      });

      let astroData = null;
      let userId = null;
      let astroId = "";
      let astroName = "";

      try {
        const user = JSON.parse(localStorage.getItem("user"));
        userId = user?.id || "";

        astroId = callInfoRef.current.astroId || "";
        astroName = callInfoRef.current.astroName || "";
      } catch (e) {
        console.warn("Could not parse data from localStorage:", e);
      }

      if (!astroId) {
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const filename = `call-${roomId}-${timestamp}.webm`;

      const file = new File([blob], filename, {
        type: mediaRecorderRef.current?.mimeType || "audio/webm",
      });

      const duration = Math.floor(
        (Date.now() - callStartTimeRef.current) / 1000,
      );

      const { data, errors } = await uploadRecording({
        variables: {
          recording: file,
          roomId: roomId,
          astroId: astroId || "",
          astroName: astroName || "",
          userId: userId || "",
          duration: duration,
          callType: "audio",
        },
      });

      if (errors) {
        console.error("GraphQL errors:", errors);
        setUploadStatus(
          `Upload failed: ${errors[0]?.message || "Unknown error"}`,
        );
        throw new Error(errors[0]?.message || "Failed to upload recording");
      }

      if (data?.uploadCallRecording?.success) {
        setUploadStatus("Recording uploaded successfully");
      } else {
        console.error(
          " Failed to save recording:",
          data?.uploadCallRecording?.message,
        );
        setUploadStatus(
          `Upload failed: ${data?.uploadCallRecording?.message || "Unknown error"}`,
        );
      }

      // Clear chunks after successful upload
      recordedChunksRef.current = [];
    } catch (error) {
      console.error("Failed to send recording to server:", error);
      setUploadStatus(`Upload error: ${error.message}`);
      recordedChunksRef.current = [];
    }
  };

  useEffect(() => {
    let activeSocket = socket;

    if (!activeSocket?.connected) {
      activeSocket = connectSocket();
    }

    if (!activeSocket) return;

    const createPeer = async () => {
      if (pc.current) {
        return pc.current;
      }

      const iceConfig = {
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
          { urls: "stun:stun2.l.google.com:19302" },
          {
            urls: "turn:openrelay.metered.ca:80",
            username: "openrelayproject",
            credential: "openrelayproject",
          },
          {
            urls: "turn:openrelay.metered.ca:443",
            username: "openrelayproject",
            credential: "openrelayproject",
          },
        ],
        iceCandidatePoolSize: 10,
        bundlePolicy: "max-bundle",
        rtcpMuxPolicy: "require",
      };

      pc.current = new RTCPeerConnection(iceConfig);

      pc.current.onconnectionstatechange = () => {
        // When connection is fully established, trigger recording
        if (pc.current.connectionState === "connected") {
          callFullyConnectedRef.current = true;

          // Start recording automatically (hidden)
          setTimeout(() => {
            if (!recordingInitializedRef.current) {
              startRecording();
            }
          }, 1500);
        }
      };

      pc.current.oniceconnectionstatechange = () => {
        if (pc.current.iceConnectionState === "connected") {
          callFullyConnectedRef.current = true;

          // Start recording automatically (hidden)
          setTimeout(() => {
            if (!recordingInitializedRef.current) {
              startRecording();
            }
          }, 1500);
        }

        if (
          ["failed", "disconnected"].includes(pc.current.iceConnectionState)
        ) {
          console.warn(" ICE Connection failing! Check network/TURN");
        }
      };

      pc.current.onsignalingstatechange = () => {};

      pc.current.onicegatheringstatechange = () => {};

      try {
        localStream.current = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            sampleRate: 48000,
          },
        });

        const tracks = localStream.current.getAudioTracks();
        tracks.forEach((track) => {
          const sender = pc.current.addTrack(track, localStream.current);
        });

        // Verify senders
        setTimeout(() => {
          if (pc.current) {
            const senders = pc.current.getSenders() || [];
            senders.forEach((sender, i) => {});
          }
        }, 1500);
      } catch (err) {
        console.error(" Microphone access error:", err);
        setCallStatus("Mic Error");
        return;
      }

      pc.current.ontrack = async (event) => {
        const remoteStream = event.streams[0];

        // Store remote stream for recording
        remoteStreamRef.current = remoteStream;

        if (remoteAudio.current) {
          remoteAudio.current.srcObject = remoteStream;
          remoteAudio.current.volume = 1.0;
          remoteAudio.current.muted = false;

          try {
            await remoteAudio.current.play();
          } catch (err) {
            console.error(" Autoplay blocked:", err);
          }
        }
        setCallStatus("Connected");

        // Try to start recording after remote track is received
        setTimeout(() => {
          if (
            !recordingInitializedRef.current &&
            callFullyConnectedRef.current
          ) {
            startRecording();
          } else if (!callFullyConnectedRef.current) {
          }
        }, 2000);
      };

      pc.current.onicecandidate = (event) => {
        if (event.candidate) {
          activeSocket.emit("ice-candidate", {
            room_id: roomId,
            candidate: event.candidate,
          });
        } else {
          console.log(" All ICE candidates gathered");
        }
      };

      statsIntervalRef.current = setInterval(async () => {
        if (!pc.current) return;
        try {
          const stats = await pc.current.getStats();
          stats.forEach((report) => {
            if (report.type === "outbound-rtp" && report.kind === "audio") {
            }
            if (report.type === "inbound-rtp" && report.kind === "audio") {
            }
          });
        } catch (e) {
          console.error("Stats error:", e);
        }
      }, 3000);

      return pc.current;
    };

    activeSocket.on("peer_joined", async () => {
      setCallStatus("Ringing...");

      const peer = await createPeer();

      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Check if peer exists before accessing getSenders
      if (peer && peer.getSenders) {
      } else {
        return;
      }

      try {
        const offer = await peer.createOffer({
          offerToReceiveAudio: true,
        });

        await peer.setLocalDescription(offer);

        activeSocket.emit("offer", {
          room_id: roomId,
          offer,
        });
      } catch (error) {
        console.error("Error creating offer:", error);
        setCallStatus("Error creating offer");
      }
    });

    activeSocket.on("answer", async ({ answer }) => {
      if (!pc.current) {
        console.warn("No peer connection available for answer");
        return;
      }

      try {
        await pc.current.setRemoteDescription(
          new RTCSessionDescription(answer),
        );

        setCallStatus("Connected");
        const stored = localStorage.getItem(`call_request_${roomId}`);
        const activeRequest = JSON.parse(
          localStorage.getItem("activeRequest") || "{}",
        );

        if (stored) {
          const data = JSON.parse(stored);

          const totalSeconds = Number(data.maximum_time || 0) * 60;
          setRemainingTime(totalSeconds);

          callInfoRef.current = {
            astroId: data.astro_id || "",
            astroName: activeRequest?.astrologer?.name || "",
            userId: data.user_id || "",
          };
        }

        // Try to start recording after answer received
        setTimeout(() => {
          if (
            !recordingInitializedRef.current &&
            callFullyConnectedRef.current
          ) {
            startRecording();
          } else if (!callFullyConnectedRef.current) {
          }
        }, 2000);
      } catch (error) {
        console.error("Error handling answer:", error);
      }
    });

    activeSocket.on("ice-candidate", async ({ candidate, room_id }) => {
      if (!pc.current) {
        return;
      }

      try {
        if (!pc.current.remoteDescription) {
          setTimeout(async () => {
            if (pc.current && pc.current.remoteDescription) {
              await pc.current.addIceCandidate(new RTCIceCandidate(candidate));
            }
          }, 800);
          return;
        }

        await pc.current.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.error("ICE error:", err);
      }
    });

    activeSocket.on("call_ended_by_astrologer", () => {
      // Stop recording before cleanup (hidden)
      if (isRecordingRef.current) {
        stopRecording();
      }

      cleanup();
      dispatch(removeActiveRequest(roomId));

      router.push("/astrologer/call");
    });

    activeSocket.on("call_ended_by_admin", () => {
     
      console.log("call_ended_by_admin");
      // Stop recording before cleanup (hidden)
      if (isRecordingRef.current) {
        stopRecording();
      }

      cleanup();
      dispatch(removeActiveRequest(roomId));

      router.push("/astrologer/call");
    });

    activeSocket.emit("join_call", {
      roomId,
    });

    return () => {
      // Stop recording on unmount (hidden)
      if (isRecordingRef.current) {
        stopRecording();
      }

      activeSocket.off("peer_joined");

      activeSocket.off("answer");

      activeSocket.off("ice-candidate");

      activeSocket.off("call_ended_by_astrologer");

      cleanup();
    };
  }, []);

  // call status time
  useEffect(() => {
    if (callStatus !== "Connected" || remainingTime <= 0) {
      return;
    }

    timerRef.current = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);

          // Stop recording when timer expires (hidden)
          if (isRecordingRef.current) {
            stopRecording();
          }

          handleEndCall();

          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timerRef.current);
    };
  }, [callStatus]);

  const handleEndCall = () => {
    const stored = localStorage.getItem(`call_request_${roomId}`);

    const data = JSON.parse(stored);

    // Stop recording when user ends call (hidden)
    if (isRecordingRef.current) {
      stopRecording();
    }

    socket.emit("call_ended_by_user", {
      room_id: roomId,
      astro_id: data?.astro_id,
    });

    cleanup();

    dispatch(removeActiveRequest(roomId));

    router.push("/astrologer/call");
  };

  const toggleMute = () => {
    if (!localStream.current) return;

    localStream.current.getAudioTracks().forEach((track) => {
      track.enabled = !track.enabled;
    });

    setIsMuted(!isMuted);
  };

  // =========================
  // CLEANUP
  // =========================
  const cleanup = () => {
    // Stop recording if active (hidden)
    if (isRecordingRef.current) {
      stopRecording();
    }

    // Reset connection flag
    callFullyConnectedRef.current = false;

    // CLEAR STATS
    if (statsIntervalRef.current) {
      clearInterval(statsIntervalRef.current);

      statsIntervalRef.current = null;
    }

    // CLOSE PEER
    if (pc.current) {
      pc.current.close();

      pc.current = null;
    }

    // STOP TRACKS
    if (localStream.current) {
      localStream.current.getTracks().forEach((track) => {
        track.stop();
      });

      localStream.current = null;
    }

    // CLEAR AUDIO
    if (remoteAudio.current) {
      remoteAudio.current.pause();

      remoteAudio.current.srcObject = null;
    }

    // Clear remote stream ref
    remoteStreamRef.current = null;

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    [
      `call_request_${roomId}`,
      `activeCallRoom_${roomId}`,
      "activeRequests",
      `queue_${roomId}`,
      `timer_${roomId}`,
    ].forEach((key) => localStorage.removeItem(key));
  };

  // format time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);

    const secs = seconds % 60;

    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // =========================
  // UI - No recording indicators shown
  // =========================

  const astroData = JSON.parse(localStorage.getItem("activeRequest"));
  return (
    <div className="flex items-center justify-center h-screen justify-center overflow-hidden  items-center bg-[#120a18e7] relative overflow-hidden">
      <div className="absolute w-[400px] h-[400px] bg-purple-600 opacity-20 blur-3xl rounded-full top-[-100px] left-[-100px]" />
      <div className="absolute w-[500px] h-[500px] bg-violet-500 opacity-20 blur-3xl rounded-full bottom-[-100px] right-[-100px]" />
      <div className="md:w-3/5 overflow-hidden w-full shadow-lg rounded-3xl  flex flex-col md:h-[95vh] h-[100vh]">
        <div className="flex flex-col w-full  rounded-3xl shadow-xl items-center justify-between py-10    h-full bg-gray-900 text-white">
          <div className="flex flex-col  items-center gap-3">
            <img
              src={
                astroImage
                  ? `https://www.dhwaniastro.com${astroImage}`
                  : "/man.png"
              }
              alt={astroData?.astrologer?.name}
              width={50}
              height={50}
              className="rounded-full object-cover"
            />

            <h2 className="text-xl">{astroData?.astrologer?.name}</h2>
                  <div className="flex items-center gap-2 mt-2 text-green-400">
                    <span className="w-2 h-2 bg-green-400 rounded-full text-xs animate-pulse" />{callStatus}</div>
          </div>
          <div className="flex flex-col items-center ">
            {/* <h2 className="text-2xl mb-4">📞 Call Status</h2> */}



            {callStatus === "Connected" && (
              <p className="mb-2 text-lg">
                Time Left : {formatTime(remainingTime)}
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
          <audio ref={remoteAudio} autoPlay playsInline />

          <div className="flex gap-6  w-full items-center justify-center   ">
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
                    d="M320 64C267 64 224 107 224 160L224 288C224 341 267 384 320 384C373 384 416 341 416 288L416 160C416 107 373 64 320 64zM176 248C176 234.7 165.3 224 152 224C138.7 224 128 234.7 128 248L128 288C128 385.9 201.3 466.7 296 478.5L296 528L248 528C234.7 528 224 538.7 224 552C224 565.3 234.7 576 248 576L392 576C405.3 576 416 565.3 416 552C416 538.7 405.3 528 392 528L344 528L344 478.5C438.7 466.7 512 385.9 512 288L512 248C512 234.7 501.3 224 488 224C474.7 224 464 234.7 464 248L464 288C464 367.5 399.5 432 320 432C240.5 432 176 367.5 176 288L176 248z"
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
        </div>
      </div>
    </div>
  );
}
