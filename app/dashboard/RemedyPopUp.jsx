"use client";

import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import Image from "next/image";

const GET_SESSION_REMEDIES = gql`
  query GetSessionRemedies($sessionId: String!) {
    getSessionRemedies(sessionId: $sessionId) {
      id
      sessionId
      remedyText
      createdAt
    }
  }
`;

export default function RemedyPopUp({ open, onClose, sessionId }) {
  const { data, loading, error } = useQuery(GET_SESSION_REMEDIES, {
    variables: {
      sessionId,
    },
    skip: !sessionId || !open,
    fetchPolicy: "network-only",
  });
  console.log("testing");
  const remedies = data?.getSessionRemedies || [];

  if (!open) return null;

  const formatDate = (value) => {
    const date = new Date(Number(value));

    if (isNaN(date.getTime())) {
      return "Invalid Date";
    }

    return date.toLocaleDateString() + " • " + date.toLocaleTimeString();
  };

  return (
    <div className="fixed inset-0 z-999 flex items-center justify-center p-4 bg-black/60">
      <div className="relative flex flex-col w-full max-w-2xl overflow-hidden bg-white shadow-2xl h-[65vh] rounded-3xl">
        {/* HEADER */}
        <div className="flex items-center justify-between p-3 text-white bg-green-700">
          <div>
            <h2 className="text-xl font-bold">Session Remedies</h2>
            <p className="text-xs text-green-100">Session ID: {sessionId}</p>
          </div>

          <button
            onClick={onClose}
            className="text-2xl font-bold hover:text-gray-200"
          >
          <svg xmlns="http://www.w3.org/2000/svg" width={18} height={18} viewBox="0 0 640 640"><path fill="#fff" d="M320 112C434.9 112 528 205.1 528 320C528 434.9 434.9 528 320 528C205.1 528 112 434.9 112 320C112 205.1 205.1 112 320 112zM320 576C461.4 576 576 461.4 576 320C576 178.6 461.4 64 320 64C178.6 64 64 178.6 64 320C64 461.4 178.6 576 320 576zM231 231C221.6 240.4 221.6 255.6 231 264.9L286 319.9L231 374.9C221.6 384.3 221.6 399.5 231 408.8C240.4 418.1 255.6 418.2 264.9 408.8L319.9 353.8L374.9 408.8C384.3 418.2 399.5 418.2 408.8 408.8C418.1 399.4 418.2 384.2 408.8 374.9L353.8 319.9L408.8 264.9C418.2 255.5 418.2 240.3 408.8 231C399.4 221.7 384.2 221.6 374.9 231L319.9 286L264.9 231C255.5 221.6 240.3 221.6 231 231z"/></svg>
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 p-5 overflow-y-auto bg-gray-100">
          {loading && (
            <div className="flex items-center justify-center h-full">
              Loading remedies...
            </div>
          )}

          {error && (
            <div className="text-center text-red-500">
              Failed to load remedies
            </div>
          )}

          <div className="space-y-5">
            {remedies.map((item) => (
              <div
                key={item.id}
                className="p-3 bg-white border border-gray-300 rounded-2xl shadow"
              >
                <div className="p-4 bg-green-50 rounded-xl">
                  <p className="whitespace-pre-wrap text-gray-700">
                    {item.remedyText}
                  </p>
                </div>

                <p className="mt-4 text-xs text-gray-500"></p>

                {item.createdAt && (
                  <p className="mt-2 text-[10px] text-gray-500">
                    {formatDate(item.createdAt)}
                  </p>
                )}
              </div>
            ))}
          </div>

          {!loading && remedies.length === 0 && (
            <div className="mt-20 text-center text-gray-500">
              No remedies found for this session.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
