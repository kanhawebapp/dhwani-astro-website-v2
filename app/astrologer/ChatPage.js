"use client";

import { useParams } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import UserChat from "@/app/ChatComponent/UserChat";
import { addActiveRequest } from "@/app/redux/reducer/chat/sendRequestSlice";

export default function ChatPage() {
  const { roomId } = useParams();

  const dispatch = useDispatch();
  const { activeRequests } = useSelector((state) => state.send_request_chat);
  const activeRequest = activeRequests.find((item) => item.roomId === roomId);
  const [restored, setRestored] = useState(false);

  useEffect(() => {
    if (activeRequest) {
      setRestored(true);
      return;
    }

    const saved = localStorage.getItem("activeChatSession");

    if (saved) {
      const parsed = JSON.parse(saved);

      dispatch(
        addActiveRequest({
          roomId: parsed.room_Id,
          userId: parsed.user_Id,

          astrologer: {
            id: parsed.astroid,
            name: parsed.astro_Name,
            profilePic: parsed.astro_Image,
            price: parsed.astro_price,
          },

          chatTime: parsed.timeLeft / 60,
        }),
      );
    }

    setRestored(true);
  }, [activeRequest, dispatch]);

  if (!activeRequest && !restored) {
    return <div className="text-center mt-10">Restoring chat...</div>;
  }

  if (!activeRequest) {
    return null;
  }

  return (
    <div className="w-full h-[calc(100vh-120px)]">
      <UserChat
        room_Id={roomId}
        astroid={activeRequest?.astrologer?.id}
        user_Id={activeRequest?.userId}
        astro_Name={activeRequest?.astrologer?.name}
        astro_Image={activeRequest?.astrologer?.profilePic}
        astro_price={activeRequest?.astrologer?.price}
        chattime={activeRequest?.chatTime}
      />
    </div>
  );
}
