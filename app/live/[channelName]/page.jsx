
"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import {
  useLazyQuery,
  useQuery,
  useMutation,
} from "@apollo/client/react";

import {
  JOIN_LIVE_STREAM,
  GET_LIVE_GIFTS,
  SEND_LIVE_GIFT,
} from "@/app/graphql/gqlQuery";

export default function WatchLive() {
  const params = useParams();
  const channelName = params?.channelName;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hostJoined, setHostJoined] = useState(false);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [liveInfo, setLiveInfo] = useState(null);

  const [giftPanelOpen, setGiftPanelOpen] = useState(false);
  const [selectedGiftId, setSelectedGiftId] = useState("");
  const [giftQuantity, setGiftQuantity] = useState(1);
  const [sendingGift, setSendingGift] = useState(false);
  const [giftNotice, setGiftNotice] = useState("");

  const chatRef = useRef(null);
  const agoraClientRef = useRef(null);
  const chatClientRef = useRef(null);
  const agoraRTCRef = useRef(null);
  const agoraChatRef = useRef(null);
  const initializingRef = useRef(false);
  const mountedRef = useRef(false);

  const [joinLive] = useLazyQuery(JOIN_LIVE_STREAM);

  const {
    data: giftData,
    loading: giftsLoading,
    error: giftsError,
  } = useQuery(GET_LIVE_GIFTS);

  const [sendLiveGift] = useMutation(SEND_LIVE_GIFT);

  const gifts = giftData?.getLiveGifts ?? [];

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop =
        chatRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    mountedRef.current = true;

    if (!channelName) {
      setLoading(false);
      return;
    }

    initializeLive();

    return () => {
      mountedRef.current = false;
      cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelName]);

  // -------------------------------------------------------
  // Send ordinary chat message
  // -------------------------------------------------------
  const sendMessage = async () => {
    if (!message.trim() || !liveInfo) return;

    try {
      const chatClient = chatClientRef.current;
      const AgoraChat = agoraChatRef.current;

      if (!chatClient || !AgoraChat) {
        throw new Error("Agora Chat is not initialized");
      }

      const msg = AgoraChat.message.create({
        chatType: "chatRoom",
        type: "txt",
        to: liveInfo.chatRoomId,
        msg: message.trim(),
      });

      await chatClient.send(msg);
      setMessage("");
    } catch (err) {
      console.error("Send message error:", err);
      setError(err?.message || "Unable to send message");
    }
  };

  // -------------------------------------------------------
  // Send gift through the backend resolver
  // -------------------------------------------------------
  const handleSendGift = async () => {
    if (!liveInfo?.id) {
      setGiftNotice(
        "Stream database ID is missing. Check JOIN_LIVE_STREAM."
      );
      return;
    }

    if (!selectedGiftId) {
      setGiftNotice("Please select a gift.");
      return;
    }

    if (
      !Number.isInteger(giftQuantity) ||
      giftQuantity < 1 ||
      giftQuantity > 100
    ) {
      setGiftNotice("Quantity must be between 1 and 100.");
      return;
    }

    try {
      setSendingGift(true);
      setGiftNotice("");

      const { data } = await sendLiveGift({
        variables: {
          streamId: liveInfo.id,
          giftId: selectedGiftId,
          quantity: giftQuantity,
        },
      });

      const result = data?.sendLiveGift;

      if (!result?.success) {
        throw new Error(
          result?.message || "Gift transaction failed"
        );
      }

      setGiftNotice(
        `Successfully sent ${result.giftName} × ${result.quantity}.`
      );

      // Update the UI immediately for the sender.
      // The Agora Chat broadcast should notify other viewers
      // and the astrologer.
      setMessages((previous) => [
        ...previous,
        {
          id: `gift-${result.transactionId}`,
          kind: "gift",
          senderName: liveInfo.chatUserId,
          giftName: result.giftName,
          giftIcon: result.icon || "🎁",
          quantity: result.quantity,
          totalCoins: result.totalCoins,
        },
      ]);

      setSelectedGiftId("");
      setGiftQuantity(1);
    } catch (err) {
      console.error("Send live gift error:", err);

      setGiftNotice(
        err?.graphQLErrors?.[0]?.message ||
        err?.message ||
        "Unable to send gift"
      );
    } finally {
      setSendingGift(false);
    }
  };

  // -------------------------------------------------------
  // Cleanup Agora RTC + Chat
  // -------------------------------------------------------
  const cleanup = async () => {
    try {
      const chatClient = chatClientRef.current;
      const client = agoraClientRef.current;
      const chatRoomId = liveInfo?.chatRoomId;

      if (chatClient && chatRoomId) {
        try {
          await chatClient.leaveChatRoom({
            roomId: chatRoomId,
          });
        } catch (err) {
          console.error("Leave chat room error:", err);
        }
      }

      if (chatClient) {
        try {
          await chatClient.close();
        } catch (err) {
          console.error("Close chat client error:", err);
        }

        chatClientRef.current = null;
      }

      if (client) {
        try {
          client.removeAllListeners();
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

  // -------------------------------------------------------
  // Subscribe to astrologer's RTC tracks
  // -------------------------------------------------------
  const subscribeToUser = async (user, mediaType) => {
    try {
      const client = agoraClientRef.current;

      if (!client) return;

      await client.subscribe(user, mediaType);

      if (mediaType === "video") {
        if (!mountedRef.current) return;

        setHostJoined(true);

        const videoContainer =
          document.getElementById("remote-video");

        if (!videoContainer) {
          console.error("Remote video container not found");
          return;
        }

        if (user.videoTrack) {
          user.videoTrack.play("remote-video");
        }
      }

      if (mediaType === "audio" && user.audioTrack) {
        user.audioTrack.play();
      }
    } catch (err) {
      console.error("Subscribe error:", err);
    }
  };

  // -------------------------------------------------------
  // Initialize RTC + Chat
  // -------------------------------------------------------
  const initializeLive = async () => {
    if (initializingRef.current) return;

    initializingRef.current = true;

    try {
      setLoading(true);
      setError("");

      const [
        { default: AgoraRTC },
        { default: AgoraChat },
      ] = await Promise.all([
        import("agora-rtc-sdk-ng"),
        import("agora-chat"),
      ]);

      if (!mountedRef.current) return;

      agoraRTCRef.current = AgoraRTC;
      agoraChatRef.current = AgoraChat;

      const client = AgoraRTC.createClient({
        mode: "live",
        codec: "vp8",
      });

      agoraClientRef.current = client;

      const chatClient = new AgoraChat.connection({
        appKey: process.env.NEXT_PUBLIC_AGORA_CHAT_APPKEY || "61200039703#200055699",
      });

      chatClientRef.current = chatClient;

      // Receive ordinary text messages and JSON gift events.
      chatClient.addEventHandler("LIVE_CHAT", {
        onTextMessage: (msg) => {
          if (!mountedRef.current) return;

          let payload = null;

          try {
            payload = JSON.parse(msg.msg || "");
          } catch {
            // Ordinary text message.
          }

          if (payload?.type === "GIFT") {
            setMessages((previous) => [
              ...previous,
              {
                id: `received-${msg.id || Date.now()}-${Math.random()}`,
                kind: "gift",
                senderName:
                  payload.senderName || msg.from,
                giftName: payload.giftName || "Gift",
                giftIcon:
                  payload.icon || payload.giftIcon || "🎁",
                quantity: payload.quantity || 1,
                totalCoins: payload.totalCoins,
              },
            ]);
            return;
          }

          setMessages((previous) => [
            ...previous,
            {
              id: `message-${msg.id || Date.now()}-${Math.random()}`,
              kind: "text",
              senderName: msg.from,
              message: msg.msg || "",
            },
          ]);
        },
      });

      const { data } = await joinLive({
        variables: { channelName },
      });

      if (!mountedRef.current) return;

      if (!data?.joinLive) {
        throw new Error("Live stream unavailable");
      }

      const live = data.joinLive;
      setLiveInfo(live);

      client.on("user-published", async (user, mediaType) => {
        await subscribeToUser(user, mediaType);
      });

      client.on("user-unpublished", () => {
        if (mountedRef.current) setHostJoined(false);
      });

      client.on("user-left", () => {
        if (mountedRef.current) setHostJoined(false);
      });

      await client.setClientRole("audience");

      await client.join(
        live.appId,
        live.channelName,
        live.rtcToken,
        live.uid
      );

      if (!mountedRef.current) return;

      await chatClient.open({
        user: live.chatUserId,
        accessToken: live.chatToken,
      });

      if (!mountedRef.current) return;

      await chatClient.joinChatRoom({
        roomId: live.chatRoomId,
      });

      if (!mountedRef.current) return;

      for (const user of client.remoteUsers) {
        if (!mountedRef.current) break;

        if (user.hasVideo) {
          await subscribeToUser(user, "video");
        }

        if (user.hasAudio) {
          await subscribeToUser(user, "audio");
        }
      }

      if (mountedRef.current) {
        setLoading(false);
      }
    } catch (err) {
      console.error("Initialize live error:", err);

      if (mountedRef.current) {
        setError(
          err?.message || "Unable to join live stream"
        );
        setLoading(false);
      }
    } finally {
      initializingRef.current = false;
    }
  };

  const selectedGift = gifts.find(
    (gift) => gift.id === selectedGiftId
  );

  const totalGiftCoins = selectedGift
    ? selectedGift.price * giftQuantity
    : 0;

  // -------------------------------------------------------
  // UI
  // -------------------------------------------------------
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-black">
      <div className="sticky top-0 z-20 flex items-center justify-between border-b border-gray-800 bg-black/80 px-4 py-3 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="animate-pulse rounded-full bg-red-600 px-3 py-1 text-sm font-semibold text-white">
            🔴 LIVE
          </div>

          <div>
            <h2 className="text-lg font-semibold text-white">
              Live Session
            </h2>
            <p className="text-xs text-gray-400">
              Watch astrologer live
            </p>
          </div>
        </div>

        <div className="rounded-full bg-gray-800 px-3 py-1 text-sm text-white">
          👁 LIVE
        </div>
      </div>

      <div className="mx-auto max-w-md p-4">
        {loading && (
          <div className="flex h-[75vh] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-red-500 border-t-transparent" />
              <p className="text-lg text-white">
                Connecting to live stream...
              </p>
            </div>
          </div>
        )}

        {error && !loading && (
          <div className="mb-4 rounded-xl bg-red-600 px-6 py-4 text-white shadow-lg">
            {error}
          </div>
        )}

        {!loading && liveInfo && (
          <>
            {!hostJoined && (
              <div className="mb-4 rounded-xl bg-yellow-500 p-3 text-center font-medium text-black shadow">
                Waiting for astrologer video...
              </div>
            )}

            <div className="relative overflow-hidden rounded-2xl border border-gray-800 bg-black shadow-2xl">
              <div
                id="remote-video"
                className="h-[75vh] w-full bg-black"
              />

              <div className="absolute left-0 right-0 top-0 flex items-center justify-between bg-gradient-to-b from-black/70 to-transparent p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-700 text-lg text-white">
                    👳
                  </div>

                  <div>
                    <h3 className="font-semibold text-white">
                      Astrologer
                    </h3>
                    <p className="text-xs text-gray-300">
                      Live Consultation
                    </p>
                  </div>
                </div>

                <div className="animate-pulse rounded-full bg-red-600 px-3 py-1 text-sm font-medium text-white">
                  LIVE
                </div>
              </div>

              {/* Gift picker overlay */}
              {giftPanelOpen && (
                <div className="absolute bottom-28 left-3 right-3 z-30 max-h-[55%] overflow-y-auto rounded-xl border border-gray-700 bg-gray-950/95 p-4 shadow-xl">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="font-semibold text-white">
                      Send a Gift
                    </h3>
                    <button
                      onClick={() => setGiftPanelOpen(false)}
                      className="text-gray-400"
                    >
                      ✕
                    </button>
                  </div>

                  {giftsLoading ? (
                    <p className="text-gray-300">
                      Loading gifts...
                    </p>
                  ) : giftsError ? (
                    <p className="text-sm text-red-400">
                      Unable to load gifts.
                    </p>
                  ) : gifts.length === 0 ? (
                    <p className="text-gray-300">
                      No gifts available.
                    </p>
                  ) : (
                    <>
                      <div className="grid grid-cols-3 gap-2">
                        {gifts.map((gift) => (
                          <button
                            key={gift.id}
                            onClick={() => {
                              setSelectedGiftId(gift.id);
                              setGiftNotice("");
                            }}
                            className={`rounded-lg border p-3 ${
                              selectedGiftId === gift.id
                                ? "border-yellow-400 bg-yellow-500/20"
                                : "border-gray-700 bg-gray-800"
                            }`}
                          >
                            <div className="text-2xl">
                              {gift.icon || "🎁"}
                            </div>
                            <div className="mt-1 text-sm text-white">
                              {gift.name}
                            </div>
                            <div className="mt-1 text-xs text-yellow-400">
                              {gift.price} coins
                            </div>
                          </button>
                        ))}
                      </div>

                      <div className="mt-4 flex items-center gap-3">
                        <label
                          htmlFor="gift-quantity"
                          className="text-sm text-white"
                        >
                          Quantity
                        </label>
                        <input
                          id="gift-quantity"
                          type="number"
                          min="1"
                          max="100"
                          value={giftQuantity}
                          onChange={(event) => {
                            const value = Number(
                              event.target.value
                            );

                            if (
                              Number.isInteger(value) &&
                              value >= 1 &&
                              value <= 100
                            ) {
                              setGiftQuantity(value);
                            }
                          }}
                          className="w-20 rounded-lg border border-gray-700 bg-gray-800 p-2 text-white"
                        />
                      </div>

                      <p className="mt-3 text-sm text-gray-300">
                        Total: {totalGiftCoins} coins
                      </p>

                      {giftNotice && (
                        <p className="mt-2 text-sm text-yellow-300">
                          {giftNotice}
                        </p>
                      )}

                      <button
                        onClick={handleSendGift}
                        disabled={
                          sendingGift || !selectedGiftId
                        }
                        className="mt-4 w-full rounded-lg bg-yellow-500 py-3 font-semibold text-black disabled:opacity-50"
                      >
                        {sendingGift
                          ? "Sending..."
                          : "Send Gift 🎁"}
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* Chat and controls */}
              <div className="absolute bottom-0 left-0 right-0">
                <div
                  className="h-56 space-y-2 overflow-y-auto px-3 py-2"
                  ref={chatRef}
                >
                  {messages.map((item) => (
                    <div
                      key={item.id}
                      className="mb-2"
                    >
                      {item.kind === "gift" ? (
                        <div className="inline-flex max-w-[95%] items-center rounded-xl border border-yellow-400/40 bg-yellow-500/20 p-3 text-white">
                          <span className="mr-2 text-2xl">
                            {item.giftIcon || "🎁"}
                          </span>
                          <div className="break-words">
                            <strong>{item.senderName}</strong>
                            {" sent "}
                            <strong>{item.giftName}</strong>
                            {item.quantity > 1 && (
                              <span>
                                {" "}× {item.quantity}
                              </span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="inline-flex max-w-[95%] break-words rounded-full bg-black/60 px-3 py-2">
                          <span className="mr-2 font-semibold text-yellow-400">
                            {item.senderName}
                          </span>
                          <span className="text-white">
                            {item.message}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 bg-black/80 p-3">
                  <input
                    value={message}
                    onChange={(event) =>
                      setMessage(event.target.value)
                    }
                    placeholder="Write a message..."
                    className="flex-1 rounded-full bg-gray-900 px-4 py-3 text-white outline-none"
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        sendMessage();
                      }
                    }}
                  />
                  <button
                    onClick={sendMessage}
                    className="rounded-full bg-red-600 px-5 py-3 text-white hover:bg-red-700"
                  >
                    Send
                  </button>
                </div>

                <div className="flex justify-around bg-black/80 py-3">
                  <button className="flex flex-col items-center text-white">
                    ❤️
                    <span className="text-xs">Like</span>
                  </button>

                  <button
                    onClick={() => {
                      setGiftPanelOpen((open) => !open);
                      setGiftNotice("");
                    }}
                    className="flex flex-col items-center text-white"
                  >
                    🎁
                    <span className="text-xs">Gift</span>
                  </button>

                  <button className="flex flex-col items-center text-green-400">
                    📞
                    <span className="text-xs">Call</span>
                  </button>

                  <button
                    onClick={cleanup}
                    className="flex flex-col items-center text-red-500"
                  >
                    ❌
                    <span className="text-xs">Leave</span>
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

