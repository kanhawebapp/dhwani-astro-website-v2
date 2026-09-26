"use client";

import { useParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import UserCall from '../CallComponent/UserCall';
import { addActiveRequest } from "@/app/redux/reducer/chat/sendRequestSlice";

export default function CallPage() {
  const { roomId } = useParams();

  const dispatch = useDispatch();

  const { activeRequests } = useSelector(
    (state) => state.send_request_chat
  );

  const activeRequest = activeRequests.find(
    (item) => item.roomId === roomId
  );

  const [restored, setRestored] = useState(false);

  useEffect(() => {
    if (activeRequest) {
      setRestored(true);
      return;
    }

    const saved = localStorage.getItem("activeCallSession");

    if (saved) {
      const parsed = JSON.parse(saved);

      dispatch(
        addActiveRequest({
          roomId: parsed.roomId,
          userId: parsed.userId,

          astrologer: {
            id: parsed.astroid,
            name: parsed.astroName,
            profilePic: parsed.astroImage,
          },

          callTime: parsed.callTime,
        })
      );
    }

    setRestored(true);
  }, [activeRequest, dispatch]);

  if (!activeRequest && !restored) {
    return <div className="text-center mt-10">Restoring Call...</div>;
  }

  if (!activeRequest) {
    return null;
  }

  return (
    <div className="w-full h-[calc(100vh-120px)]">
      <UserCall
        roomId={roomId}
        userId={activeRequest.userId}
        astroId={activeRequest.astrologer.id}
        astroName={activeRequest.astrologer.name}
        astroImage={activeRequest.astrologer.profilePic}
        callTime={activeRequest.callTime}
      />
    </div>
  );
}