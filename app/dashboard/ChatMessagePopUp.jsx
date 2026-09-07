"use client";

import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import Image from "next/image";

const GET_CHAT_MESSAGES = gql`
  query GetChatMessagesBySessionId($sessionId: String!) {
    getChatMessagesBySessionId(sessionId: $sessionId) {
      msg_id
      room_id
      sender_id
      received_id
      sender
      message
      image
      time
    }
  }
`;

export default function ChatMessagePopUp({ open, onClose, sessionId }) {
  const { data, loading, error } = useQuery(GET_CHAT_MESSAGES, {
    variables: {
      sessionId,
    },
    skip: !sessionId || !open,
    fetchPolicy: "network-only",
  });

  const messages = data?.getChatMessagesBySessionId || [];

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-999 flex items-center justify-center bg-black/60 p-4">
      <div className="relative flex flex-col w-full max-w-3xl overflow-hidden bg-white shadow-2xl h-[80vh] rounded-3xl">
        {/* HEADER */}
        <div className="flex items-center justify-between p-3 text-white bg-purple-900">
          <div>
            <h2 className="text-xl font-bold">Chat Messages</h2>

            <p className="text-xs text-gray-300">Session ID: {sessionId}</p>
          </div>

          <button onClick={onClose} className="text-2xl">
                    <svg xmlns="http://www.w3.org/2000/svg" width={18} height={18} viewBox="0 0 640 640"><path fill="#fff" d="M320 112C434.9 112 528 205.1 528 320C528 434.9 434.9 528 320 528C205.1 528 112 434.9 112 320C112 205.1 205.1 112 320 112zM320 576C461.4 576 576 461.4 576 320C576 178.6 461.4 64 320 64C178.6 64 64 178.6 64 320C64 461.4 178.6 576 320 576zM231 231C221.6 240.4 221.6 255.6 231 264.9L286 319.9L231 374.9C221.6 384.3 221.6 399.5 231 408.8C240.4 418.1 255.6 418.2 264.9 408.8L319.9 353.8L374.9 408.8C384.3 418.2 399.5 418.2 408.8 408.8C418.1 399.4 418.2 384.2 408.8 374.9L353.8 319.9L408.8 264.9C418.2 255.5 418.2 240.3 408.8 231C399.4 221.7 384.2 221.6 374.9 231L319.9 286L264.9 231C255.5 221.6 240.3 221.6 231 231z"/></svg>

          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 p-5 overflow-y-auto bg-gray-100">
          {loading && (
            <div className="flex items-center justify-center h-full">
              Loading messages...
            </div>
          )}

          {error && (
            <div className="text-center text-red-500">
              Failed to load messages
            </div>
          )}

          <div className="space-y-4 text-black">
            {messages?.map((msg) => {
              const isUser = msg?.sender === "user";

              return (
                <div
                  key={msg?.msg_id}
                  className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-3 shadow ${
                      isUser
                        ? "bg-white text-black"
                        : "bg-purple-500 text-white"
                    }`}
                  >
                    <p
                      className={`mb-1 text-[10px] font-semibold ${
                        isUser ? "text-purple-900" : "text-gray-200"
                      }`}
                    >
                      {msg?.sender}
                    </p>

                    {msg?.message && (
                      <>
                        <p className="wrap-break-word text-xs">{msg.message}</p>
                        <p className="text-[9px] text-gray-400 mt-1">
                          {msg.time}
                        </p>
                      </>
                    )}

                    {/* IMAGE */}
                    {msg?.image && (
                      <Image
                        src={msg?.image}
                        width={220}
                        height={220}
                        alt="Chat Image"
                        className="object-cover mt-3 rounded-2xl"
                      />
                    )}

                    {/* TIME */}
                    {msg?.createdAt && (
                      <p
                        className={`mt-2 text-[11px] ${
                          isUser ? "text-gray-500" : "text-gray-300"
                        }`}
                      >
                        {new Date(msg?.createdAt).toLocaleDateString()} •{" "}
                        {new Date(msg?.createdAt).toLocaleTimeString()}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {!loading && messages?.length === 0 && (
            <div className="mt-20 text-center text-gray-500">
              No messages found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
