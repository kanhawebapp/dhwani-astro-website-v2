"use client";

import { useEffect, useState, useRef, useCallback } from "react";
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
  const channelName =
    typeof params?.channelName === "string"
      ? params.channelName
      : "";

  // -------------------------------------------------------
  // State
  // -------------------------------------------------------

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

  // -------------------------------------------------------
  // Refs
  // -------------------------------------------------------

  const chatRef = useRef(null);

  const agoraClientRef = useRef(null);
  const chatClientRef = useRef(null);

  const agoraRTCRef = useRef(null);
  const agoraChatRef = useRef(null);

  const mountedRef = useRef(false);
  const initializingRef = useRef(false);

  const generationRef = useRef(0);
  const chatRoomIdRef = useRef(null);

  // -------------------------------------------------------
  // GraphQL
  // -------------------------------------------------------

  const [joinLive] = useLazyQuery(JOIN_LIVE_STREAM, {
    fetchPolicy: "network-only",
    errorPolicy: "none",
  });

  const {
    data: giftData,
    loading: giftsLoading,
    error: giftsError,
  } = useQuery(GET_LIVE_GIFTS, {
    fetchPolicy: "cache-and-network",
  });

  const [sendLiveGift] = useMutation(SEND_LIVE_GIFT);

  const gifts = giftData?.getLiveGifts ?? [];

  // -------------------------------------------------------
  // Helpers
  // -------------------------------------------------------

  const isCurrentGeneration = useCallback((generation) => {
    return (
      mountedRef.current &&
      generationRef.current === generation
    );
  }, []);

  const getErrorMessage = (err) => {
    return (
      err?.graphQLErrors?.[0]?.message ||
      err?.networkError?.message ||
      err?.message ||
      "Something went wrong"
    );
  };

  // -------------------------------------------------------
  // Auto-scroll chat
  // -------------------------------------------------------

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop =
        chatRef.current.scrollHeight;
    }
  }, [messages]);

  // -------------------------------------------------------
  // Handle incoming chat messages and gifts
  // -------------------------------------------------------

  const handleIncomingTextMessage = useCallback((msg) => {
    if (!mountedRef.current) return;

    const rawMessage = msg?.msg || "";

    let payload = null;

    try {
      payload = JSON.parse(rawMessage);
    } catch {
      // Normal text message, not a JSON payload.
    }

    // Gift notification sent by the backend through Agora Chat.
    if (payload?.type === "GIFT") {
      setMessages((previous) => {
        const messageId = `gift-${msg.id || `${Date.now()}-${Math.random()}`}`;

        // Prevent duplicate events if Agora delivers the same message again.
        if (previous.some((item) => item.id === messageId)) {
          return previous;
        }

        return [
          ...previous,
          {
            id: messageId,
            kind: "gift",
            senderName:
              payload.senderName ||
              payload.sender ||
              msg.from ||
              "User",
            giftName: payload.giftName || "Gift",
            giftIcon:
              payload.icon ||
              payload.giftIcon ||
              "🎁",
            quantity: Number(payload.quantity) || 1,
            totalCoins: payload.totalCoins,
          },
        ];
      });

      return;
    }

    // Ordinary text message.
    setMessages((previous) => {
      const messageId = `message-${msg.id || `${Date.now()}-${Math.random()}`}`;

      if (previous.some((item) => item.id === messageId)) {
        return previous;
      }

      return [
        ...previous,
        {
          id: messageId,
          kind: "text",
          senderName: msg.from || "User",
          message: rawMessage,
        },
      ];
    });
  }, []);

  // -------------------------------------------------------
  // Cleanup Agora RTC and Chat
  // -------------------------------------------------------

  const cleanup = useCallback(async () => {
    // Capture current clients and clear refs immediately.
    // This prevents a second cleanup from using the same clients.
    const chatClient = chatClientRef.current;
    const rtcClient = agoraClientRef.current;

    const chatRoomId = chatRoomIdRef.current;

    chatClientRef.current = null;
    agoraClientRef.current = null;

    agoraRTCRef.current = null;
    agoraChatRef.current = null;

    chatRoomIdRef.current = null;

    // Reset visible connection state.
    if (mountedRef.current) {
      setHostJoined(false);
    }

    // Leave the Agora Chat room.
    if (chatClient && chatRoomId) {
      try {
        await chatClient.leaveChatRoom({
          roomId: chatRoomId,
        });
      } catch (err) {
        console.warn(
          "Unable to leave Agora Chat room:",
          err?.message
        );
      }
    }

    // Close Agora Chat connection.
    if (chatClient) {
      try {
        await chatClient.close();
      } catch (err) {
        console.warn(
          "Unable to close Agora Chat:",
          err?.message
        );
      }
    }

    // Leave Agora RTC channel.
    if (rtcClient) {
      try {
        rtcClient.removeAllListeners();
      } catch (err) {
        console.warn(
          "Unable to remove RTC listeners:",
          err?.message
        );
      }

      try {
        await rtcClient.leave();
      } catch (err) {
        console.warn(
          "Unable to leave Agora RTC channel:",
          err?.message
        );
      }
    }
  }, []);

  // -------------------------------------------------------
  // Subscribe to astrologer's RTC tracks
  // -------------------------------------------------------

  const subscribeToUser = useCallback(
    async (user, mediaType, generation) => {
      const client = agoraClientRef.current;

      if (
        !client ||
        !isCurrentGeneration(generation)
      ) {
        return;
      }

      try {
        await client.subscribe(user, mediaType);

        if (!isCurrentGeneration(generation)) {
          return;
        }

        if (mediaType === "video") {
          if (!user.videoTrack) {
            console.warn(
              "Astrologer video track is unavailable"
            );
            return;
          }

          const videoContainer =
            document.getElementById("remote-video");

          if (!videoContainer) {
            console.error(
              "Remote video container not found"
            );
            return;
          }

          user.videoTrack.play(videoContainer);

          if (mountedRef.current) {
            setHostJoined(true);
            setError("");
          }
        }

        if (
          mediaType === "audio" &&
          user.audioTrack
        ) {
          user.audioTrack.play();
        }
      } catch (err) {
        console.error(
          `Agora ${mediaType} subscription failed:`,
          err
        );

        if (isCurrentGeneration(generation)) {
          setError(
            `Unable to receive astrologer's ${mediaType}. Please try reconnecting.`
          );
        }
      }
    },
    [isCurrentGeneration]
  );

  // -------------------------------------------------------
  // Initialize live stream
  // -------------------------------------------------------

  const initializeLive = useCallback(
    async (generation) => {
      if (initializingRef.current) {
        return;
      }

      initializingRef.current = true;

      let localRtcClient = null;
      let localChatClient = null;

      try {
        setLoading(true);
        setError("");
        setHostJoined(false);
        setLiveInfo(null);
        setMessages([]);

        if (!channelName) {
          throw new Error(
            "Live stream channel name is missing"
          );
        }

        // Dynamically import browser-only SDKs.
        const [
          { default: AgoraRTC },
          { default: AgoraChat },
        ] = await Promise.all([
          import("agora-rtc-sdk-ng"),
          import("agora-chat"),
        ]);

        if (!isCurrentGeneration(generation)) {
          return;
        }

        agoraRTCRef.current = AgoraRTC;
        agoraChatRef.current = AgoraChat;

        // -------------------------------------------------
        // 1. Fetch stream information and tokens
        // -------------------------------------------------

        const response = await joinLive({
          variables: {
            channelName,
          },
        });

        if (!isCurrentGeneration(generation)) {
          return;
        }

        const live = response?.data?.joinLive;

        if (!live) {
          throw new Error(
            "Live stream not found or has already ended"
          );
        }

        if (
          !live.appId ||
          !live.channelName ||
          !live.rtcToken ||
          live.uid == null
        ) {
          throw new Error(
            "Required Agora RTC configuration is missing"
          );
        }

        if (
          !live.chatAppKey ||
          !live.chatUserId ||
          !live.chatToken ||
          !live.chatRoomId
        ) {
          throw new Error(
            "Required Agora Chat configuration is missing"
          );
        }

        // Required by SEND_LIVE_GIFT.
        if (!live.id) {
          throw new Error(
            "Stream database ID is missing. Add stream.id to the joinLive GraphQL response."
          );
        }

        setLiveInfo(live);
        chatRoomIdRef.current = live.chatRoomId;

        // -------------------------------------------------
        // 2. Initialize Agora RTC
        // -------------------------------------------------

        const rtcClient = AgoraRTC.createClient({
          mode: "live",
          codec: "vp8",
        });

        localRtcClient = rtcClient;
        agoraClientRef.current = rtcClient;

        rtcClient.on(
          "user-published",
          async (user, mediaType) => {
            await subscribeToUser(
              user,
              mediaType,
              generation
            );
          }
        );

        rtcClient.on("user-unpublished", () => {
          if (isCurrentGeneration(generation)) {
            setHostJoined(false);
          }
        });

        rtcClient.on("user-left", () => {
          if (isCurrentGeneration(generation)) {
            setHostJoined(false);
          }
        });

        rtcClient.on("connection-state-change", (state) => {
          console.log(
            "Agora RTC connection state:",
            state
          );
        });

        await rtcClient.setClientRole("audience");

        if (!isCurrentGeneration(generation)) {
          try {
            await rtcClient.leave();
          } catch {}

          return;
        }

        await rtcClient.join(
          live.appId,
          live.channelName,
          live.rtcToken,
          live.uid
        );

        if (!isCurrentGeneration(generation)) {
          try {
            await rtcClient.leave();
          } catch {}

          return;
        }

        // -------------------------------------------------
        // 3. Initialize Agora Chat
        // -------------------------------------------------

        const chatClient = new AgoraChat.connection({
          appKey: live.chatAppKey,
        });

        localChatClient = chatClient;
        chatClientRef.current = chatClient;

        chatClient.addEventHandler(
          `LIVE_CHAT_${generation}`,
          {
            onTextMessage: handleIncomingTextMessage,

            onError: (chatError) => {
              console.error(
                "Agora Chat error:",
                chatError
              );
            },
          }
        );

        await chatClient.open({
          user: live.chatUserId,
          accessToken: live.chatToken,
        });

        if (!isCurrentGeneration(generation)) {
          try {
            await chatClient.close();
          } catch {}

          return;
        }

        await chatClient.joinChatRoom({
          roomId: live.chatRoomId,
        });

        if (!isCurrentGeneration(generation)) {
          try {
            await chatClient.leaveChatRoom({
              roomId: live.chatRoomId,
            });
          } catch {}

          try {
            await chatClient.close();
          } catch {}

          return;
        }

        // -------------------------------------------------
        // 4. Subscribe to tracks already published
        // -------------------------------------------------

        for (const user of rtcClient.remoteUsers) {
          if (!isCurrentGeneration(generation)) {
            break;
          }

          if (user.hasVideo) {
            await subscribeToUser(
              user,
              "video",
              generation
            );
          }

          if (user.hasAudio) {
            await subscribeToUser(
              user,
              "audio",
              generation
            );
          }
        }

        if (isCurrentGeneration(generation)) {
          setLoading(false);
        }
      } catch (err) {
        console.error("Initialize live error:", err);

        // Only update the current component instance.
        if (isCurrentGeneration(generation)) {
          setError(getErrorMessage(err));
          setLoading(false);

          // Clean up resources after an initialization failure.
          await cleanup();
        } else {
          // This initialization belongs to an old/unmounted
          // component instance. Close its local clients.
          if (localChatClient) {
            try {
              await localChatClient.close();
            } catch {}
          }

          if (localRtcClient) {
            try {
              localRtcClient.removeAllListeners();
              await localRtcClient.leave();
            } catch {}
          }
        }
      } finally {
        initializingRef.current = false;
      }
    },
    [
      channelName,
      joinLive,
      cleanup,
      subscribeToUser,
      handleIncomingTextMessage,
      isCurrentGeneration,
    ]
  );

  // -------------------------------------------------------
  // Start/stop live stream lifecycle
  // -------------------------------------------------------

  useEffect(() => {
    mountedRef.current = true;

    const generation = ++generationRef.current;

    if (!channelName) {
      setLoading(false);
      setError("Live stream channel name is missing");

      return () => {
        mountedRef.current = false;
        generationRef.current++;
      };
    }

    initializeLive(generation);

    return () => {
      mountedRef.current = false;

      // Invalidate pending async work.
      generationRef.current++;

      // Cleanup the RTC and Chat clients.
      cleanup();
    };
  }, [channelName, initializeLive, cleanup]);

  // -------------------------------------------------------
  // Send ordinary chat message
  // -------------------------------------------------------

  const sendMessage = async () => {
    const trimmedMessage = message.trim();

    if (!trimmedMessage || !liveInfo) {
      return;
    }

    const chatClient = chatClientRef.current;
    const AgoraChat = agoraChatRef.current;

    if (!chatClient || !AgoraChat) {
      setError("Agora Chat is not connected");
      return;
    }

    try {
      const chatMessage = AgoraChat.message.create({
        chatType: "chatRoom",
        type: "txt",
        to: liveInfo.chatRoomId,
        msg: trimmedMessage,
      });

      await chatClient.send(chatMessage);

      setMessage("");
      setError("");
    } catch (err) {
      console.error("Send message error:", err);

      setError(getErrorMessage(err));
    }
  };

  // -------------------------------------------------------
  // Send gift
  // -------------------------------------------------------

  const handleSendGift = async () => {
    if (!liveInfo?.id) {
      setGiftNotice(
        "Stream database ID is missing. Check the joinLive resolver."
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
      setGiftNotice(
        "Quantity must be between 1 and 100."
      );
      return;
    }

    try {
      setSendingGift(true);
      setGiftNotice("");

      const response = await sendLiveGift({
        variables: {
          streamId: liveInfo.id,
          giftId: selectedGiftId,
          quantity: giftQuantity,
        },
      });

      const result = response?.data?.sendLiveGift;

      if (!result?.success) {
        throw new Error(
          result?.message || "Gift transaction failed"
        );
      }

      setGiftNotice(
        `Successfully sent ${result.giftName} × ${result.quantity}.`
      );

      /*
       * Do not append the gift locally here.
       *
       * The backend should broadcast the successful gift to
       * the Agora Chat room. That room event updates the sender,
       * astrologer, and other viewers without duplicate messages.
       */

      setSelectedGiftId("");
      setGiftQuantity(1);
    } catch (err) {
      console.error("Send live gift error:", err);

      setGiftNotice(getErrorMessage(err));
    } finally {
      setSendingGift(false);
    }
  };

  // -------------------------------------------------------
  // Leave live stream
  // -------------------------------------------------------

  const handleLeaveLive = async () => {
    // Invalidate any initialization still in progress.
    generationRef.current++;

    await cleanup();

    if (mountedRef.current) {
      setHostJoined(false);
      setLiveInfo(null);
      setMessages([]);
      setMessage("");
      setLoading(false);
      setError("You have left the live stream.");
    }
  };

  // -------------------------------------------------------
  // Gift calculations
  // -------------------------------------------------------

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
      {/* Header */}
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
          {hostJoined ? "● Connected" : "Connecting"}
        </div>
      </div>

      <div className="mx-auto max-w-md p-4">
        {/* Loading */}
        {loading && (
          <div className="flex h-[75vh] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-red-500 border-t-transparent" />

              <p className="text-lg text-white">
                Connecting to live stream...
              </p>

              <p className="mt-2 text-sm text-gray-400">
                Please wait while we connect you.
              </p>
            </div>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="mb-4 rounded-xl bg-red-600 px-6 py-4 text-white shadow-lg">
            <p>{error}</p>
          </div>
        )}

        {/* Connected stream */}
        {!loading && liveInfo && (
          <>
            {!hostJoined && (
              <div className="mb-4 rounded-xl bg-yellow-500 p-3 text-center font-medium text-black shadow">
                Waiting for astrologer video...
              </div>
            )}

            <div className="relative overflow-hidden rounded-2xl border border-gray-800 bg-black shadow-2xl">
              {/* Remote video */}
              <div
                id="remote-video"
                className="h-[75vh] min-h-[450px] w-full bg-black"
              />

              {/* Stream header overlay */}
              <div className="absolute left-0 right-0 top-0 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent p-4">
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

              {/* Gift picker */}
              {giftPanelOpen && (
                <div className="absolute bottom-28 left-3 right-3 z-30 max-h-[55%] overflow-y-auto rounded-xl border border-gray-700 bg-gray-950/95 p-4 shadow-xl">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="font-semibold text-white">
                      Send a Gift
                    </h3>

                    <button
                      type="button"
                      onClick={() =>
                        setGiftPanelOpen(false)
                      }
                      className="text-gray-400 hover:text-white"
                      aria-label="Close gift panel"
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
                            type="button"
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
                            const rawValue =
                              event.target.value;

                            if (rawValue === "") {
                              setGiftQuantity("");
                              return;
                            }

                            const value = Number(rawValue);

                            if (
                              Number.isInteger(value) &&
                              value >= 1 &&
                              value <= 100
                            ) {
                              setGiftQuantity(value);
                            }
                          }}
                          onBlur={() => {
                            if (
                              !Number.isInteger(giftQuantity) ||
                              giftQuantity < 1 ||
                              giftQuantity > 100
                            ) {
                              setGiftQuantity(1);
                            }
                          }}
                          className="w-20 rounded-lg border border-gray-700 bg-gray-800 p-2 text-white"
                        />
                      </div>

                      <p className="mt-3 text-sm text-gray-300">
                        Total: {totalGiftCoins} coins
                      </p>

                      {giftNotice && (
                        <p className="mt-2 break-words text-sm text-yellow-300">
                          {giftNotice}
                        </p>
                      )}

                      <button
                        type="button"
                        onClick={handleSendGift}
                        disabled={
                          sendingGift ||
                          !selectedGiftId ||
                          !Number.isInteger(giftQuantity) ||
                          giftQuantity < 1 ||
                          giftQuantity > 100
                        }
                        className="mt-4 w-full rounded-lg bg-yellow-500 py-3 font-semibold text-black disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {sendingGift
                          ? "Sending..."
                          : "Send Gift 🎁"}
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* Chat messages */}
              <div className="absolute bottom-28 left-0 right-0">
                <div
                  ref={chatRef}
                  className="h-44 space-y-2 overflow-y-auto px-3 py-2"
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
                            <strong>
                              {item.senderName}
                            </strong>

                            {" sent "}

                            <strong>
                              {item.giftName}
                            </strong>

                            {item.quantity > 1 && (
                              <span>
                                {" "}× {item.quantity}
                              </span>
                            )}

                            {item.totalCoins != null && (
                              <div className="mt-1 text-xs text-yellow-300">
                                {item.totalCoins} coins
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="inline-flex max-w-[95%] break-words rounded-xl bg-black/70 px-3 py-2">
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

                  {messages.length === 0 && (
                    <p className="text-sm text-gray-400">
                      Messages will appear here.
                    </p>
                  )}
                </div>
              </div>

              {/* Message input */}
              <div className="absolute bottom-14 left-0 right-0 flex items-center gap-2 bg-black/80 p-3">
                <input
                  value={message}
                  onChange={(event) =>
                    setMessage(event.target.value)
                  }
                  placeholder="Write a message..."
                  maxLength={1000}
                  className="min-w-0 flex-1 rounded-full bg-gray-900 px-4 py-3 text-white outline-none"
                  onKeyDown={(event) => {
                    if (
                      event.key === "Enter" &&
                      !event.shiftKey
                    ) {
                      event.preventDefault();
                      sendMessage();
                    }
                  }}
                />

                <button
                  type="button"
                  onClick={sendMessage}
                  disabled={!message.trim()}
                  className="rounded-full bg-red-600 px-5 py-3 text-white hover:bg-red-700 disabled:opacity-50"
                >
                  Send
                </button>
              </div>

              {/* Bottom controls */}
              <div className="absolute bottom-0 left-0 right-0 flex justify-around bg-black/90 py-3">
                <button
                  type="button"
                  onClick={() => {
                    setGiftNotice(
                      "Likes are not connected to the backend yet."
                    );
                    setGiftPanelOpen(false);
                  }}
                  className="flex flex-col items-center text-white"
                >
                  ❤️
                  <span className="text-xs">Like</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setGiftPanelOpen((open) => !open);
                    setGiftNotice("");
                  }}
                  className="flex flex-col items-center text-white"
                >
                  🎁
                  <span className="text-xs">Gift</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setGiftNotice(
                      "Calling is not connected to the backend yet."
                    );
                  }}
                  className="flex flex-col items-center text-green-400"
                >
                  📞
                  <span className="text-xs">Call</span>
                </button>

                <button
                  type="button"
                  onClick={handleLeaveLive}
                  className="flex flex-col items-center text-red-500"
                >
                  ❌
                  <span className="text-xs">Leave</span>
                </button>
              </div>
            </div>

            {/* General notices */}
            {giftNotice && !giftPanelOpen && (
              <div className="mt-3 rounded-lg bg-gray-900 p-3 text-sm text-yellow-300">
                {giftNotice}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}