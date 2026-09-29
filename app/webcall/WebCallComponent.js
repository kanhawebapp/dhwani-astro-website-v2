"use client";

import React, {
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import toast from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";

import { decryptData } from "../helper/cryptoHelper";
import SocketContext from "../context/socketContext";

export default function WebCallComponent() {
  const router = useRouter();
  const socket = useContext(SocketContext);
  const searchParams = useSearchParams();

  const containerRef = useRef(null);
  const zpRef = useRef(null);
  const intervalRef = useRef(null);
  const chatParamsRef = useRef({});
  const completedRef = useRef(false);

  const [timeLeft, setTimeLeft] = useState(0);
  const [lowAlert, setLowAlert] = useState(false);
  const [chatParams, setChatParams] = useState({});

  // ---------------------------------------
  // Decrypt call parameters
  // ---------------------------------------
  useEffect(() => {
    const encryptedData = searchParams.get("data");

    if (!encryptedData) return;

    const params = decryptData(encryptedData) || {};

    setChatParams(params);
    chatParamsRef.current = params;

    if (params?.chattime) {
      setTimeLeft(Number(params.chattime));
    }
  }, [searchParams]);

  // ---------------------------------------
  // Keep ref updated
  // ---------------------------------------
  useEffect(() => {
    chatParamsRef.current = chatParams;
  }, [chatParams]);

  // ---------------------------------------
  // Complete call
  // ---------------------------------------
  const completeChat = useCallback(() => {
    if (completedRef.current) return;

    const {
      roomId,
      astro_id,
      astro_price,
      is_promotional,
    } = chatParamsRef.current || {};

    if (!roomId) return;

    completedRef.current = true;

    console.log("Completing call:", {
      roomId,
      astro_id,
      astro_price,
      is_promotional,
    });

    // Notify backend through socket
    if (socket) {
      socket.emit("compltedchat", {
        room_id: roomId,
        astro_id,
        astro_amount: astro_price,
        is_promotional,
      });
    }

    // Stop timer
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Destroy Zego room
    if (zpRef.current) {
      try {
        zpRef.current.destroy();
      } catch (error) {
        console.error("Failed to destroy Zego:", error);
      }

      zpRef.current = null;
    }

    toast.success("Call Ended Successfully!");

    // Go back after call completion
    setTimeout(() => {
      router.push("/talk-to-astrologer");
    }, 500);
  }, [router, socket]);

  // ---------------------------------------
  // Timer
  // ---------------------------------------
  const startTimer = useCallback(() => {
    if (intervalRef.current) return;

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }

          completeChat();

          return 0;
        }

        if (prev === 20) {
          setLowAlert(true);
        }

        if (prev === 2) {
          completeChat();
        }

        return prev - 1;
      });
    }, 1000);
  }, [completeChat]);

  useEffect(() => {
    if (chatParams?.roomId && chatParams?.chattime) {
      startTimer();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [
    chatParams?.roomId,
    chatParams?.chattime,
    startTimer,
  ]);

  // ---------------------------------------
  // Initialize Zego
  // ---------------------------------------
  useEffect(() => {
    if (!chatParams?.roomId || !chatParams?.astroname) {
      return;
    }

    let isMounted = true;

    const loadZego = async () => {
      try {
        const { ZegoUIKitPrebuilt } = await import(
          /* webpackChunkName: "zego-uikit-prebuilt" */
          "@zegocloud/zego-uikit-prebuilt"
        );

        if (!isMounted) return;

        const appID = Number(
          process.env.NEXT_PUBLIC_ZEGO_APP_ID
        );

        const serverSecret =
          process.env.NEXT_PUBLIC_ZEGO_SERVER_SECRET;

        if (!appID || !serverSecret) {
          console.error(
            "Zego credentials are missing."
          );

          toast.error(
            "Video calling configuration is missing."
          );

          return;
        }

        const userID = String(
          Math.floor(Math.random() * 10000)
        );

        const userName = `${chatParams.astroname}${userID}`;

        const kitToken =
          ZegoUIKitPrebuilt.generateKitTokenForTest(
            appID,
            serverSecret,
            chatParams.roomId,
            userID,
            userName
          );

        const zp =
          ZegoUIKitPrebuilt.create(kitToken);

        zpRef.current = zp;

        zp.joinRoom({
          container: containerRef.current,

          turnOnMicrophoneWhenJoining: true,
          turnOnCameraWhenJoining: false,

          showMyCameraToggleButton: false,
          showMyMicrophoneToggleButton: true,
          showAudioVideoSettingsButton: false,
          showScreenSharingButton: false,

          showTextChat: true,
          showUserList: true,
          showLeaveRoomButton: true,

          maxUsers: 2,

          layout: "Auto",
          showLayoutButton: true,
          showPreJoinView: false,

          scenario: {
            mode: ZegoUIKitPrebuilt.OneONoneCall,
          },

          onLeaveRoom: completeChat,
        });
      } catch (error) {
        console.error(
          "Zego failed to load:",
          error
        );

        toast.error(
          "Unable to initialize the call."
        );
      }
    };

    const timeout = setTimeout(
      loadZego,
      100
    );

    return () => {
      isMounted = false;

      clearTimeout(timeout);

      if (zpRef.current) {
        try {
          zpRef.current.destroy();
        } catch (error) {
          console.error(
            "Failed to destroy Zego:",
            error
          );
        }

        zpRef.current = null;
      }
    };
  }, [chatParams, completeChat]);

  // ---------------------------------------
  // Socket events
  // ---------------------------------------
  useEffect(() => {
    if (!socket) return;

    /*
     * IMPORTANT:
     *
     * Do NOT call completeChat when the server
     * sends "compltedchat" because completeChat
     * itself emits "compltedchat".
     *
     * Otherwise it can create an emit/listener loop.
     */

    const handleCallCompleted = (data) => {
      console.log(
        "Call completion received from socket:",
        data
      );

      if (completedRef.current) {
        return;
      }

      completedRef.current = true;

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      if (zpRef.current) {
        try {
          zpRef.current.destroy();
        } catch (error) {
          console.error(
            "Failed to destroy Zego:",
            error
          );
        }

        zpRef.current = null;
      }

      toast.success(
        "Call Ended Successfully!"
      );

      setTimeout(() => {
        router.push("/talk-to-astrologer");
      }, 500);
    };

    socket.on(
      "compltedchat",
      handleCallCompleted
    );

    return () => {
      socket.off(
        "compltedchat",
        handleCallCompleted
      );
    };
  }, [socket, router]);

  // ---------------------------------------
  // Format timer
  // ---------------------------------------
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;

    return `${String(m).padStart(
      2,
      "0"
    )}:${String(s).padStart(2, "0")}`;
  };

  // ---------------------------------------
  // UI
  // ---------------------------------------
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        position: "relative",
      }}
    >
      {lowAlert && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
          <div className="p-6 bg-white rounded-lg shadow-lg max-w-sm w-full text-center">
            <h2 className="text-xl font-semibold text-red-500">
              Your wallet balance is low.
            </h2>

            <p className="mt-2 text-gray-600">
              Please recharge your wallet to continue
              chatting with the astrologer.
            </p>

            <button
              aria-label="Close Low Balance Alert"
              className="mt-4 px-4 py-2 text-white bg-green-500 rounded-md hover:bg-green-600"
              onClick={() =>
                setLowAlert(false)
              }
            >
              OK
            </button>
          </div>
        </div>
      )}

      <div
        style={{
          position: "absolute",
          top: 20,
          right: 20,
          padding: "10px 15px",
          backgroundColor: "#000",
          color: "#fff",
          borderRadius: "8px",
          fontSize: "16px",
          zIndex: 10,
        }}
      >
        Calling Time:{" "}
        {formatTime(timeLeft)}
      </div>

      <div
        ref={containerRef}
        style={{
          width: "100%",
          height: "100%",
        }}
      />
    </div>
  );
}
