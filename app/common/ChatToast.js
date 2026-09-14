"use client";


import React, { useState, useRef, useEffect, useContext, useCallback, memo } from "react";
import Image from "next/image";
import CustomButton from "../../components/Custom/CustomButton";
import { useDispatch, useSelector } from "react-redux";
import SocketContext from "../context/socketContext";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { resetChatAlertData, setOpenCode, } from "../redux/reducer/chat/ChatAlertSlice";
import UserChat from "../ChatComponent/UserChat";
import { setIdRequest } from "../redux/reducer/chat/idSlice";
import { showChatButton, hideChatButton } from "../redux/reducer/chat/chatButton";
import { createPortal } from "react-dom";

function ChatToast({
  name = "Astro Name",
  imgSrc = "/ds-img/a.jpg",
  onAccept,
  onReject,
}) {
  const dispatch = useDispatch();
  const router = useRouter();
  const socket = useContext(SocketContext);

  const { code, astrologerData, openCode } = useSelector(
    (state) => state.chatAlert
  );





  const { isVisible } = useSelector((state) => state.chatbutton);

  const INITIAL_TIME = 20;
  const [timeLeft, setTimeLeft] = useState(INITIAL_TIME);
  const [room_Id, setRoom_Id] = useState("");
  const [astro_id, setAstro_Id] = useState("");

  const timerRef = useRef(null);


  useEffect(() => {
    if (astrologerData?.data) {
      const { room_Id, astro_id } = astrologerData.data;
      setRoom_Id(room_Id);
      setAstro_Id(astro_id);
    }
  }, [astrologerData]);


  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);


  const resetTimer = useCallback(() => {
    stopTimer();
    setTimeLeft(INITIAL_TIME);
  }, [stopTimer]);


  const autoconnect = useCallback(() => {
    if (!room_Id || !astro_id) return;
    socket.emit(
      "autodisconnect",
      { room_id: room_Id, astro_id },
      (res) => console.log("Auto disconnect response:", res)
    );
    dispatch(hideChatButton());
    dispatch(setIdRequest(astro_id));

    resetTimer();
    dispatch(resetChatAlertData());
  }, [socket, room_Id, astro_id, dispatch, resetTimer]);


  useEffect(() => {
    if (!socket || !room_Id || !astro_id) return;

    stopTimer();

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setTimeout(() => {
            autoconnect();
          }, 0);
          return 0;
        }
        //  return () => clearInterval(timerRef.current);
        return [prev - 1, clearInterval(timerRef.current)];
      });
    }, 1000);

    return () => stopTimer();
  }, [socket, room_Id, astro_id, autoconnect, stopTimer]);



  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };


  useEffect(() => {
    if (!socket || !room_Id) return;

    // const handleChatStarted = (data) => {
    //   if (data.roomid === room_Id) {
    //     dispatch(showChatButton());
    //     setTimeLeft(INITIAL_TIME);
    //   }
    // };

    const handleAstroReject = (data) => {
      if (data.roomid === room_Id) {
        stopTimer();
        toast.error("Your chat request was rejected by astrologer");
        dispatch(setIdRequest(astro_id));
        dispatch(resetChatAlertData());
        dispatch(hideChatButton());
        resetTimer();
      }
    };

    const handleChatRejected = (data) => {
      if (data.roomid === room_Id) {
        stopTimer();
        toast.error("The astrologer has rejected your chat request");
        dispatch(resetChatAlertData());
        resetTimer();
      }
    };

    const handleUserConfirmation = (data) => {
      if (data.roomid === room_Id) {
        stopTimer();
        dispatch(resetChatAlertData());
      }
    };

    const handleAutoChat = (data) => {
      if (data.roomId === room_Id) {
        stopTimer();
        toast.error("Your chat request was automatically rejected");
        dispatch(resetChatAlertData());
        resetTimer();
        dispatch(hideChatButton());
        dispatch(setIdRequest(astro_id));
      }
    };

    //socket.on("chatAcceptedByAstrologer", handleChatStarted);
    //socket.on("chat_rejected_astrologer", handleAstroReject);
    socket.on("chat_rejected", handleChatRejected);
    socket.on("user_conformation_chat", handleUserConfirmation);
    socket.on("chat_reject_auto", handleAutoChat);

    return () => {
      stopTimer();
     // socket.off("chatAcceptedByAstrologer", handleChatStarted);
      //socket.off("chat_rejected_astrologer", handleAstroReject);
      socket.off("chat_rejected", handleChatRejected);
      socket.off("user_conformation_chat", handleUserConfirmation);
      socket.off("chat_reject_auto", handleAutoChat);
    };
  }, [socket, room_Id, astro_id, dispatch, stopTimer, resetTimer]);


  const handleAccept = () => {
    socket.emit("chat_accepted_user", { room_id: room_Id });
    dispatch(setOpenCode());
    dispatch(resetChatAlertData());
    stopTimer();
  };


  const handleReject = () => {
    socket.emit(
      "chat_rejected_user",
      { room_id: room_Id, astroid: astro_id },
      (res) => console.log("Rejected response:", res)
    );
    stopTimer();
  };

  return (
    <>

      {code === 200 &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-end justify-center pb-4 pointer-events-none">
            <div className="pointer-events-auto bg-white rounded-full shadow-lg px-8 py-2 flex gap-8 items-center min-w-[340px]">
              <Image
                src={`/ds-img/${astrologerData?.data?.astro_image || "a.jpg"}`}
                alt={astrologerData?.data?.astro_name || name}
                width={80}
                height={80}
                className="object-cover border-4 border-yellow-400 rounded-full w-14 h-14"
              />

              <div className="flex flex-col items-start">
                <span className="text-base font-semibold text-gray-800">
                  {astrologerData?.data?.astro_name || name}
                </span>
                <div className="text-xs text-gray-400">
                  <span>Wait Time:</span> <span>{formatTime(timeLeft)}</span>
                </div>
                <span className="text-sm text-gray-500">
                  Waiting for your response
                </span>
              </div>

              {isVisible && (
                <div className="flex flex-col gap-1 mt-2">
                  <CustomButton aria-label="Accept Chat Request"
                    variant="green"
                    onClick={handleAccept}
                    className="w-20 px-4 py-2 text-sm font-medium text-white bg-green-500 rounded-full shadow hover:bg-green-700"
                  >
                    Accept
                  </CustomButton>
                  <CustomButton aria-label="Reject Chat Request"
                    variant="redo"
                    onClick={handleReject}
                    className="w-20 px-5 py-2 text-sm font-medium text-white bg-red-500 rounded-full shadow hover:bg-red-700"
                  >
                    Reject
                  </CustomButton>
                </div>
              )}
            </div>
          </div>,
          document.body
        )}

     
      {openCode === 201 &&
        createPortal(
          <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-[#00000053] backdrop-blur-sm pointer-events-auto">
            <div className="bg-white rounded-xl h-[90vh] bottom-7 absolute shadow-lg px-0 py-0 flex gap-8 items-center min-w-[800px]">
              <UserChat
                room_Id={room_Id}
                astro_Name={astrologerData?.data?.astro_name}
                astro_Image={astrologerData?.data?.astro_image}
                chattime={astrologerData?.data?.chat_time}
                user_Id={astrologerData?.data?.user_id}
                astroid={astrologerData?.data?.astro_id}
                astro_price={astrologerData?.data?.experts_price}
                userIntakeId={astrologerData?.data?.intakeId}
              />
              hello
            </div>
          </div>,
          document.body
        )}
    </>
  );

}



export default React.memo(ChatToast);