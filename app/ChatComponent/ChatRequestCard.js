"use client";

import { useState, useRef, useEffect, useContext } from "react";
import SocketContext from "../context/socketContext";
import toast from "react-hot-toast";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { removeActiveRequest } from "../redux/reducer/chat/sendRequestSlice";
import { useDispatch } from "react-redux";

const ChatRequestCard = ({
  room_Id,
  astro_Name,
  user_Id,
  astroimage,
  astro_id,
  type,
}) => {
  
  const dispatch = useDispatch();
  const route = useRouter();
  const { socket, connectSocket } = useContext(SocketContext);

  const timerIntervalRef = useRef(null);
  const startTimerRef = useRef(null);
  const timeoutHandledRef = useRef(false);
  const queueRef = useRef(null);

  const [timeLeft, setTimeLeft] = useState(60);
  const [showQueuePopup, setShowQueuePopup] = useState(false);
  const [showWaitingPopup, setShowWaitingPopup] = useState(false);
  const [chatActive, setChatActive] = useState(false);
  // const [type, setType] = useState("");
  const [queueData, setQueueData] = useState(null);
  const { mode } = useParams();

  useEffect(() => {
    queueRef.current = queueData;
  }, [queueData]);

  useEffect(() => {
    if (!socket) return;

    socket.onAny((event, ...args) => {});

    socket.on("connect", () => {});

    return () => {
      socket.offAny();
      socket.off("connect");
    };
  }, [socket]);

  // =========================================================
  // TIMER — defined as a plain function, stored in a ref
  // so any socket closure can call startTimerRef.current(n)
  // and always get the LATEST version, never a stale one
  // =========================================================
  const startTimer = (seconds, isResume = false) => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    let expiry;

    if (isResume) {
      expiry = Number(localStorage.getItem(`timer_${room_Id}`));
      if (!expiry || expiry <= Date.now()) {
        setTimeLeft(0);
        return;
      }
    } else {
      if (!seconds || seconds <= 0) {
        setTimeLeft(0);
        return;
      }
      expiry = Date.now() + seconds * 1000;
      localStorage.setItem(`timer_${room_Id}`, String(expiry));
    }

    timeoutHandledRef.current = false;

    const update = () => {
      const remaining = Math.floor((expiry - Date.now()) / 1000);
      if (remaining <= 0) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
        localStorage.removeItem(`timer_${room_Id}`);
        if (socket) {
          if (socket.connected) {
            socket.emit("autodisconnect", {
              room_id: room_Id,
              astroid: astro_id,
              type: type,
            });
            dispatch(removeActiveRequest(room_Id));
            [`${type}_request_${room_Id}`].forEach((key) =>
              localStorage.removeItem(key),
            );
            toast.success(`${type} request timed out. Please try again.`);
          } else {
            socket.once("connect", () => {
              socket.emit("autodisconnect", {
                room_id: room_Id,
                astroid: astro_id,
                type: type,
              });
              dispatch(removeActiveRequest(room_Id));
              [`${type}_request_${room_Id}`].forEach((key) =>
                localStorage.removeItem(key),
              );
              toast.success(`${type} request timed out. Please try again.`);
            });
          }
        }
        setTimeLeft(0);
        return;
      }
      setTimeLeft(remaining);
    };

    update();
    timerIntervalRef.current = setInterval(update, 1000);
  };

  // Keep the ref always pointing to the latest startTimer
  startTimerRef.current = startTimer;

  // =========================================================
  // TIMEOUT HANDLER — fires when countdown hits 0
  // =========================================================
  useEffect(() => {
    if (timeLeft > 0) return;
    if (chatActive) return;
    if (timeoutHandledRef.current) return;

    const hasActiveRequest =
      localStorage.getItem(`queue_${room_Id}`) ||
      localStorage.getItem(`chat_request_${room_Id}`);

    if (!hasActiveRequest) return;

    timeoutHandledRef.current = true;

    const emitDisconnect = () => {
      socket.emit("autodisconnect", {
        room_id: room_Id,
        astroid: astro_id,
        type: type,
      });
      dispatch(removeActiveRequest(room_Id));
      [`call_request_${room_Id}`].forEach((key) =>
        localStorage.removeItem(key),
      );

      toast.success("Chat request timed out. Please try again.");
    };

    if (!socket?.connected) {
      socket?.once("connect", emitDisconnect);
    } else {
      emitDisconnect();
    }

    localStorage.setItem(`chatCompleted_${room_Id}`, "true");

    [
      "chatActive",
      `activeChatRoom_${room_Id}`,
      "activeChatSession",
      `chat_request_${room_Id}`,
      // "activeRequest",
      `chatJoined_${room_Id}`,
      `queue_${room_Id}`,
      `timer_${room_Id}`,
    ].forEach((key) => localStorage.removeItem(key));

    setShowQueuePopup(false);
    setShowWaitingPopup(false);

    dispatch(removeActiveRequest(room_Id));
  }, [timeLeft]);

  // check active chat

  // =========================================================
  // RESTORE STATE ON MOUNT (runs before socket connects)
  // Shows correct UI instantly on refresh
  // =========================================================

  useEffect(() => {
    const activeRoom = localStorage.getItem(`activeChatRoom_${room_Id}`);
    // setType(JSON.parse(localStorage.getItem("activeRequest"))?.type);

    if (activeRoom === room_Id) {
      setChatActive(true);
      setShowWaitingPopup(false);
      setShowQueuePopup(false);

      return;
    }

    const savedQueue = localStorage.getItem(`queue_${room_Id}`);
    const savedExpiry = localStorage.getItem(`timer_${room_Id}`);

    if (savedQueue) {
      const parsed = JSON.parse(savedQueue);
      setQueueData(parsed);

      if (parsed.position === 0) {
        setShowWaitingPopup(true);
        setShowQueuePopup(false);

        if (savedExpiry) {
          startTimer(null, true); // resume
        } else {
          startTimer(60);
        }
      } else {
        setShowQueuePopup(true);
        setShowWaitingPopup(false);

        if (savedExpiry) {
          startTimer(null, true); // resume
        } else {
          startTimer(parsed.waitTime);
        }
      }

      return;
    }

    // fallback → assume position 0
    if (localStorage.getItem(`chat_request_${room_Id}`)) {
      setShowWaitingPopup(true);
      setShowQueuePopup(false);
      startTimer(60);
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [room_Id]);

  // =========================================================
  // ENSURE SOCKET IS CONNECTED
  // =========================================================
  useEffect(() => {
    if (!socket) connectSocket();
  }, [socket]);

  // =========================================================
  // SOCKET CONNECT HANDLER
  // =========================================================
  useEffect(() => {
    if (!socket) return;

    const handleConnect = () => {
      const activeRoom = localStorage.getItem(`activeChatRoom_${room_Id}`);

      // 1. ACTIVE CHAT — HIGHEST PRIORITY
      if (activeRoom === room_Id) {
        setChatActive(true);
        setShowWaitingPopup(false);
        setShowQueuePopup(false);

        socket.emit("joinChat", {
          username: "customer",
          room_id: room_Id,
          joinpersonid: user_Id,
        });

        return;
      }

      //  2. QUEUE REJOIN
      if (localStorage.getItem(`queue_${room_Id}`)) {
        socket.emit("rejoin_queue", {
          room_id: room_Id,
          astro_id,
          user_id: user_Id,
        });
        return;
      }

      //  3. REQUEST REJOIN
      if (localStorage.getItem(`chat_request_${room_Id}`)) {
        socket.emit("rejoin_queue", {
          room_id: room_Id,
          astro_id,
          user_id: user_Id,
        });

        setTimeout(() => {
          if (
            !queueRef.current &&
            localStorage.getItem(`activeChatRoom_${room_Id}`) !== room_Id
          ) {
            const fallbackQueue = { position: 0, waitTime: 60 };

            setQueueData(fallbackQueue);
            localStorage.setItem(
              `queue_${room_Id}`,
              JSON.stringify(fallbackQueue),
            );

            setShowWaitingPopup(true);
            setShowQueuePopup(false);

            startTimer(60);
          }
        }, 1000);

        return;
      }

      //  4. NEW REQUEST (ONLY IF NOTHING ELSE)
      if (localStorage.getItem(`activeChatRoom_${room_Id}`) === room_Id) {
        return;
      }

      if (!room_Id) {
        return;
      }

      // if (mode != "call") {
      //   socket.emit(`chat_request_${room_Id}`, {
      //     room_id: room_Id,
      //     astro_id,
      //     user_id: user_Id,
      //   });
      // }

      // localStorage.setItem(`chat_request_${room_Id}`, "true");

      setTimeout(() => {
        if (!queueRef.current) {
          if(!localStorage.getItem(`activeChatRoom_${room_Id}`)){
            setShowWaitingPopup(true);
            startTimer(60);
          }
          
        }
      }, 1000);
    };

    socket.on("connect", handleConnect);
    if (socket.connected) handleConnect();

    return () => socket.off("connect", handleConnect);
  }, [socket, room_Id]);

  // =========================================================
  // SOCKET EVENTS: ACCEPT / QUEUE / REJECT
  // =========================================================
  useEffect(() => {
    if (!socket) return;

    const handleAccepted = (data) => {
      if (data.roomid !== room_Id) return;

      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }

      timeoutHandledRef.current = true;

      setChatActive(true);
      setShowWaitingPopup(false);
      setShowQueuePopup(false);
      setQueueData(null);

     localStorage.setItem(
  `activeChatRoom_${room_Id}`,
  JSON.stringify({
    roomId: room_Id,
  })
);

      [
        "chatActive",
        `chat_request_${room_Id}`,
        "activeChatSession",
        `chatCompleted_${room_Id}`,
        `queue_${room_Id}`,
        `timer_${room_Id}`,
      ].forEach((key) => localStorage.removeItem(key));

      setTimeout(() => {
        route.push(`/chat-with-astrologer/${room_Id}`);
      }, 100);
    };

    const handleCallCancelled = (data) => {
      if (data.roomId !== room_Id) return;

      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }

      setShowQueuePopup(false);
      setShowWaitingPopup(false);

      [
        `activeRequests`,
        `call_request_${room_Id}`,
        `queue_${room_Id}`,
        `timer_${room_Id}`,
      ].forEach((key) => localStorage.removeItem(key));

      dispatch(removeActiveRequest(room_Id));

      toast.success("The astrologer has rejected your call request.");

      setTimeout(() => {
        route.push(`/astrologer/call`);
      }, 100);
    };

    const handleQueue = (data) => {
      // OPTIONAL SAFETY
      if (data.roomid && data.roomid !== room_Id) {
        return;
      }

      setQueueData(data);

      localStorage.setItem(`queue_${room_Id}`, JSON.stringify(data));
      const activeChatRoom = localStorage.getItem(`activeChatRoom_${room_Id}`);

      if (data.position === 0 && !activeChatRoom) {
        setShowWaitingPopup(true);
        setShowQueuePopup(false);

        startTimer(60);
      } else {
        if (!activeChatRoom) {
          setShowWaitingPopup(false);
          setShowQueuePopup(true);

          startTimer(data.waitTime);
        }
      }
    };

    const handleReject = (data) => {
      if (data.roomid !== room_Id) return;

      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }

      setShowQueuePopup(false);
      setShowWaitingPopup(false);

      localStorage.setItem(`chatCompleted_${room_Id}`, "true");

      [
        "chatActive",
        `activeChatRoom_${room_Id}`,
        "activeChatSession",
        `chat_request_${room_Id}`,
        `queue_${room_Id}`,
        `timer_${room_Id}`,
      ].forEach((key) => localStorage.removeItem(key));
      dispatch(removeActiveRequest(room_Id));

      toast.success("The astrologer has rejected your chat request.");

      setTimeout(() => {
        route.push(`/astrologer/chat`);
      }, 100);
    };

    const handleCallAccepted = (data) => {
      if (data.roomId !== room_Id) return;

      if (timeoutHandledRef.current) return;

      timeoutHandledRef.current = true;

      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }

      setChatActive(true);
      setShowWaitingPopup(false);
      setShowQueuePopup(false);

      localStorage.setItem(`activeCallRoom_${room_Id}`, room_Id);

      [
        // `call_request_${room_Id}`,
        `queue_${room_Id}`,
        `timer_${room_Id}`,
      ].forEach((key) => localStorage.removeItem(key));

      setTimeout(() => {
        route.push(`/call/${room_Id}`);
      }, 100);
    };

    // =========================
    // REMOVE OLD LISTENERS FIRST
    // =========================

    socket.off("chatAcceptedByAstrologer", handleAccepted);

    // socket.off("call_cancel_by_astrologer", handleCallCancelled);

    socket.off("queue_position", handleQueue);

    socket.off("chat_rejected", handleReject);

    socket.off("callAcceptedByAstrologer", handleCallAccepted);

    // =========================
    // REGISTER NEW LISTENERS
    // =========================

    socket.on("chatAcceptedByAstrologer", handleAccepted);

    socket.on("call_cancel_by_astrologer", handleCallCancelled);

    socket.on("queue_position", handleQueue);

    socket.on("chat_rejected", handleReject);

    socket.on("callAcceptedByAstrologer", handleCallAccepted);

    // =========================
    // CLEANUP
    // =========================

    return () => {
      socket.off("chatAcceptedByAstrologer", handleAccepted);

      socket.off("call_cancel_by_astrologer", handleCallCancelled);

      socket.off("queue_position", handleQueue);

      socket.off("chat_rejected", handleReject);

      socket.off("callAcceptedByAstrologer", handleCallAccepted);
    };
  }, [socket, room_Id]);

  // ----------------------------
  useEffect(() => {
    if (showWaitingPopup && !timerIntervalRef.current) {
      startTimer(60);
    }
  }, [showWaitingPopup]);

  // =========================================================
  // CANCEL
  // =========================================================
  const handleRequestCancel = (type) => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    socket?.emit(`cancel_${type}_request`, {
      room_id: room_Id,
      astroid: astro_id,
      user_id: user_Id,
      type: type,
    });

    [
      "chatActive",
      `activeChatRoom_${room_Id}`,
      "activeChatSession",
      `${type}_request_${room_Id}`,
      `queue_${room_Id}`,
      `timer_${room_Id}`,
      `chatJoined_${room_Id}`,
    ].forEach((key) => localStorage.removeItem(key));

    setShowWaitingPopup(false);
    setShowQueuePopup(false);
    setQueueData(null);
    dispatch(removeActiveRequest(room_Id));
  };

  // =========================================================
  // FORMAT TIME
  // =========================================================
  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  // -----------------------
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  // =========================================================
  // UI
  // =========================================================
  return (
    <div className="flex items-center justify-center w-full">
      {showWaitingPopup && (
        <div className="w-full bg-gray-800 px-3 py-2 rounded-full flex relative">
          <Image
            src={
              astroimage
                ? `https://www.dhwaniastro.com${astroimage}`
                : "/man.png"
            }
            alt="Neha Vermaaaa"
            width={50}
            height={50}
            className="rounded-full w-8 h-auto  object-cover"
          />
          <div className="ml-3">
            <h3 className="font-semibold text-[10px] sm:text-sm text-white ">
              {astro_Name}
            </h3>
            <p className="text-[8px] sm:text-sm text-gray-300 font-extralight">
              Wait Time: {formatTime(timeLeft)}
            </p>
          </div>
          <button
            onClick={() => handleRequestCancel(type)}
            className="absolute right-2 top-2 text-xs bg-red-500 text-white  h-5 w-5 rounded-full"
          >
            ✕
          </button>
        </div>
      )}

      {!showWaitingPopup && showQueuePopup && (
        <div className="w-full  bg-gray-800 px-3 sm:py-2 py-1 rounded-full flex relative">
          <Image
            src={
              astroimage
                ? `https://www.dhwaniastro.com${astroimage}`
                : "/man.png"
            }
            alt="Neha Verma"
            width={50}
            height={50}
            className="rounded-full w-8 h-auto  object-cover"
          />
          <div className="ml-3">
            <h3 className="font-semibold text-[10px] sm:text-sm text-white">
              {astro_Name}
            </h3>

            <p className=" text-[8px] sm:text-sm font-extralight sm:font-medium">
              You are in line! Position : {queueData?.position}
            </p>
            <p className="text-[8px] sm:text-sm text-gray-300 font-extralight">
              Estimated wait time: {formatTime(timeLeft)}
            </p>
          </div>
          <button
            onClick={() => handleRequestCancel(queueData?.type)}
            className="absolute right-2 top-2 text-xs bg-red-500 text-white  h-5 w-5 rounded-full"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};

export default ChatRequestCard;
