"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { useLazyQuery } from "@apollo/client/react";
import { JOIN_LIVE_STREAM } from "@/app/graphql/gqlQuery";

export default function WatchLive() {
const params = useParams();
const channelName = params?.channelName;

const [loading, setLoading] = useState(true);
const [error, setError] = useState("");
const [hostJoined, setHostJoined] = useState(false);
const [messages, setMessages] = useState([]);
const [message, setMessage] = useState("");
const [liveInfo, setLiveInfo] = useState(null);

const chatRef = useRef(null);

// Agora clients
const agoraClientRef = useRef(null);
const chatClientRef = useRef(null);

// Agora modules
const agoraRTCRef = useRef(null);
const agoraChatRef = useRef(null);

// Prevent duplicate initialization
const initializingRef = useRef(false);
const mountedRef = useRef(false);

const [joinLive] = useLazyQuery(JOIN_LIVE_STREAM);

// ---------------------------------------------------------
// Scroll chat to bottom
// ---------------------------------------------------------
useEffect(() => {
if (chatRef.current) {
chatRef.current.scrollTop = chatRef.current.scrollHeight;
}
}, [messages]);

// ---------------------------------------------------------
// Initialize live stream
// ---------------------------------------------------------
useEffect(() => {
mountedRef.current = true;


if (!channelName) {
  return;
}

initializeLive();

return () => {
  mountedRef.current = false;
  cleanup();
};


}, [channelName]);

// ---------------------------------------------------------
// Send chat message
// ---------------------------------------------------------
const sendMessage = async () => {
if (!message.trim()) return;


if (!liveInfo) {
  console.error("Live information is not available");
  return;
}

try {
  const chatClient = chatClientRef.current;
  const AgoraChat = agoraChatRef.current;

  if (!chatClient) {
    console.error("Agora Chat client is not initialized");
    return;
  }

  if (!AgoraChat) {
    console.error("Agora Chat module is not initialized");
    return;
  }

  const msg = AgoraChat.message.create({
    chatType: "chatRoom",
    type: "txt",
    to: liveInfo.chatRoomId,
    msg: message,
  });

  await chatClient.send(msg);

  setMessage("");
} catch (err) {
  console.error("Send message error:", err);
}


};

// ---------------------------------------------------------
// Cleanup Agora RTC + Agora Chat
// ---------------------------------------------------------
const cleanup = async () => {
try {
const chatClient = chatClientRef.current;
const client = agoraClientRef.current;


  // Leave Agora Chat room
  if (chatClient && liveInfo?.chatRoomId) {
    try {
      await chatClient.leaveChatRoom({
        roomId: liveInfo.chatRoomId,
      });
    } catch (err) {
      console.error("Leave chat room error:", err);
    }
  }

  // Close Agora Chat
  if (chatClient) {
    try {
      await chatClient.close();
    } catch (err) {
      console.error("Close chat client error:", err);
    }

    chatClientRef.current = null;
  }

  // Leave Agora RTC
  if (client) {
    try {
      client.removeAllListeners();
    } catch (err) {
      console.error("Remove Agora listeners error:", err);
    }

    try {
      await client.leave();
    } catch (err) {
      console.error("Leave Agora channel error:", err);
    }

    agoraClientRef.current = null;
  }

  agoraRTCRef.current = null;
  agoraChatRef.current = null;
} catch (err) {
  console.error("Cleanup error:", err);
}


};

// ---------------------------------------------------------
// Subscribe to Agora user
// ---------------------------------------------------------
const subscribeToUser = async (user, mediaType) => {
try {
const client = agoraClientRef.current;


  if (!client) {
    console.error("Agora RTC client is not initialized");
    return;
  }

  console.log("================================");
  console.log("Subscribing User:", user.uid);
  console.log("Media Type:", mediaType);

  await client.subscribe(user, mediaType);

  console.log("Subscribed Successfully");

  // Video
  if (mediaType === "video") {
    setHostJoined(true);

    console.log("Video Track:", user.videoTrack);

    const videoContainer =
      document.getElementById("remote-video");

    console.log("Container:", videoContainer);

    if (!videoContainer) {
      console.error("Remote video container not found");
      return;
    }

    if (user.videoTrack) {
      user.videoTrack.play("remote-video");
      console.log("Video Playing...");
    }
  }

  // Audio
  if (mediaType === "audio") {
    if (user.audioTrack) {
      user.audioTrack.play();
      console.log("Audio Playing...");
    }
  }

  console.log("================================");
} catch (err) {
  console.error("Subscribe Error:", err);
}


};

// ---------------------------------------------------------
// Initialize live
// ---------------------------------------------------------
const initializeLive = async () => {
if (initializingRef.current) {
console.log("Live initialization already running");
return;
}


initializingRef.current = true;

try {
  setLoading(true);
  setError("");

  console.log("Loading Agora SDKs...");

  // -----------------------------------------------------
  // IMPORTANT:
  // Dynamic imports prevent Agora from being evaluated
  // on the Next.js server.
  // -----------------------------------------------------
  const [{ default: AgoraRTC }, { default: AgoraChat }] =
    await Promise.all([
      import("agora-rtc-sdk-ng"),
      import("agora-chat"),
    ]);

  if (!mountedRef.current) {
    return;
  }

  console.log("Agora SDKs loaded successfully");

  // Store modules
  agoraRTCRef.current = AgoraRTC;
  agoraChatRef.current = AgoraChat;

  // -----------------------------------------------------
  // Create Agora RTC client
  // -----------------------------------------------------
  const client = AgoraRTC.createClient({
    mode: "live",
    codec: "vp8",
  });

  agoraClientRef.current = client;

  // -----------------------------------------------------
  // Create Agora Chat client
  // -----------------------------------------------------
  const chatClient = new AgoraChat.connection({
    appKey:
      process.env.NEXT_PUBLIC_AGORA_CHAT_APPKEY ||
      "61200039703#200055699",
  });

  chatClientRef.current = chatClient;

  // -----------------------------------------------------
  // Agora Chat message listener
  // -----------------------------------------------------
  chatClient.addEventHandler("LIVE_CHAT", {
    onTextMessage: (msg) => {
      if (!mountedRef.current) {
        return;
      }

      console.log("Live chat message:", msg);

      setMessages((prev) => [
        ...prev,
        {
          senderName: msg.from,
          message: msg.msg || msg.ext?.msg || "",
        },
      ]);
    },
  });

  // -----------------------------------------------------
  // Get live stream information
  // -----------------------------------------------------
  const { data } = await joinLive({
    variables: {
      channelName,
    },
  });

  if (!mountedRef.current) {
    return;
  }

  if (!data?.joinLive) {
    throw new Error("Live stream unavailable");
  }

  const live = data.joinLive;

  console.log("Live information:", live);

  setLiveInfo(live);

  // -----------------------------------------------------
  // Agora RTC user published event
  // -----------------------------------------------------
  client.on(
    "user-published",
    async (user, mediaType) => {
      console.log(
        "EVENT -> user-published",
        user.uid,
        mediaType
      );

      await subscribeToUser(user, mediaType);
    }
  );

  // -----------------------------------------------------
  // Agora RTC user unpublished event
  // -----------------------------------------------------
  client.on("user-unpublished", (user) => {
    console.log(
      "User Unpublished:",
      user.uid
    );

    if (mountedRef.current) {
      setHostJoined(false);
    }
  });

  // -----------------------------------------------------
  // Agora RTC user left event
  // -----------------------------------------------------
  client.on("user-left", (user) => {
    console.log(
      "User Left:",
      user.uid
    );

    if (mountedRef.current) {
      setHostJoined(false);
    }
  });

  // -----------------------------------------------------
  // Set audience role
  // -----------------------------------------------------
  await client.setClientRole("audience");

  console.log("Joining Agora...");

  // -----------------------------------------------------
  // Join Agora RTC channel
  // -----------------------------------------------------
  await client.join(
    live.appId,
    live.channelName,
    live.rtcToken,
    live.uid
  );

  if (!mountedRef.current) {
    return;
  }

  console.log("Agora RTC joined successfully");

  // -----------------------------------------------------
  // Open Agora Chat
  // -----------------------------------------------------
  await chatClient.open({
    user: live.chatUserId,
    accessToken: live.chatToken,
  });

  if (!mountedRef.current) {
    return;
  }

  console.log("Agora Chat connected");

  // -----------------------------------------------------
  // Join Agora Chat room
  // -----------------------------------------------------
  await chatClient.joinChatRoom({
    roomId: live.chatRoomId,
  });

  if (!mountedRef.current) {
    return;
  }

  console.log("Joined Agora Chat Room");

  // -----------------------------------------------------
  // Check users already present in channel
  // -----------------------------------------------------
  console.log(
    "Remote Users:",
    client.remoteUsers
  );

  for (const user of client.remoteUsers) {
    if (!mountedRef.current) {
      break;
    }

    console.log(
      "Existing User:",
      user.uid
    );

    if (user.hasVideo) {
      await subscribeToUser(
        user,
        "video"
      );
    }

    if (user.hasAudio) {
      await subscribeToUser(
        user,
        "audio"
      );
    }
  }

  if (mountedRef.current) {
    setLoading(false);
  }
} catch (err) {
  console.error(
    "Initialize Live Error:",
    err
  );

  if (mountedRef.current) {
    setError(
      err?.message ||
        "Unable to join live stream"
    );

    setLoading(false);
  }
} finally {
  initializingRef.current = false;
}


};

// ---------------------------------------------------------
// UI
// ---------------------------------------------------------
return ( <div className="min-h-screen bg-gradient-to-b from-gray-950 to-black">


  {/* Header */}
  <div className="sticky top-0 z-20 flex items-center justify-between px-4 py-3 bg-black/80 backdrop-blur border-b border-gray-800">

    <div className="flex items-center gap-3">

      <div className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold animate-pulse">
        🔴 LIVE
      </div>

      <div>
        <h2 className="text-white font-semibold text-lg">
          Live Session
        </h2>

        <p className="text-gray-400 text-xs">
          Watch astrologer live
        </p>
      </div>

    </div>

    <div className="bg-gray-800 text-white px-3 py-1 rounded-full text-sm">
      👁 128
    </div>

  </div>

  <div className="max-w-md mx-auto p-4">

    {/* Loading */}
    {loading && (
      <div className="h-[75vh] flex items-center justify-center">

        <div className="text-center">

          <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />

          <p className="text-white text-lg">
            Connecting to live stream...
          </p>

        </div>

      </div>
    )}

    {/* Error */}
    {error && (
      <div className="h-[75vh] flex items-center justify-center">

        <div className="bg-red-600 text-white px-6 py-4 rounded-xl shadow-lg">
          {error}
        </div>

      </div>
    )}

    {/* Live Content */}
    {!loading && !error && (
      <>

        {/* Waiting for host */}
        {!hostJoined && (
          <div className="mb-4 bg-yellow-500 text-black rounded-xl p-3 text-center font-medium shadow">
            Waiting for astrologer to start live...
          </div>
        )}

        <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-800 bg-black">

          {/* Agora Video */}
          <div
            id="remote-video"
            className="w-full h-[75vh] bg-black"
          />

          {/* Top Overlay */}
          <div className="absolute top-0 left-0 right-0 flex justify-between items-center p-4 bg-gradient-to-b from-black/70 to-transparent">

            <div className="flex items-center gap-3">

              <div className="w-11 h-11 rounded-full bg-gray-700 flex items-center justify-center text-white text-lg">
                👳
              </div>

              <div>
                <h3 className="text-white font-semibold">
                  Astrologer
                </h3>

                <p className="text-gray-300 text-xs">
                  Live Consultation
                </p>
              </div>

            </div>

            <div className="bg-red-600 px-3 py-1 rounded-full text-white text-sm font-medium animate-pulse">
              LIVE
            </div>

          </div>

          {/* Bottom Overlay */}
          <div className="absolute bottom-0 left-0 right-0">

            {/* Live Chat */}
            <div
              className="h-56 overflow-y-auto px-3 py-2 space-y-2"
              ref={chatRef}
            >
              {messages.map((item, index) => (
                <div
                  key={index}
                  className="bg-black/60 rounded-full px-3 py-2 inline-flex max-w-[90%]"
                >
                  <span className="text-yellow-400 font-semibold mr-2">
                    {item.senderName}
                  </span>

                  <span className="text-white break-words">
                    {item.message}
                  </span>
                </div>
              ))}
            </div>

            {/* Message Box */}
            <div className="flex items-center gap-2 p-3 bg-black/80">

              <input
                value={message}
                onChange={(e) =>
                  setMessage(e.target.value)
                }
                placeholder="Write a message..."
                className="flex-1 rounded-full bg-gray-900 text-white px-4 py-3 outline-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    sendMessage();
                  }
                }}
              />

              <button
                onClick={sendMessage}
                className="bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-full"
              >
                Send
              </button>

            </div>

            {/* Actions */}
            <div className="flex justify-around bg-black/80 py-3">

              <button className="flex flex-col items-center text-white">
                ❤️
                <span className="text-xs">
                  Like
                </span>
              </button>

              <button className="flex flex-col items-center text-white">
                🎁
                <span className="text-xs">
                  Gift
                </span>
              </button>

              <button className="flex flex-col items-center text-green-400">
                📞
                <span className="text-xs">
                  Call
                </span>
              </button>

              <button
                onClick={cleanup}
                className="flex flex-col items-center text-red-500"
              >
                ❌
                <span className="text-xs">
                  Leave
                </span>
              </button>

            </div>

          </div>
        </div>
      </>
    )}

  </div>
</div>


);
}
