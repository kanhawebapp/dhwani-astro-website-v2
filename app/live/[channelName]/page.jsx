"use client";

import {
  useEffect,
  useState,
  useRef,
  useCallback,
} from "react";
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

  // =======================================================
  // STATE
  // =======================================================

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

  // =======================================================
  // REFS
  // =======================================================

  const chatRef = useRef(null);
  const remoteVideoRef = useRef(null); 

  // NEW: Store the video track so we can play it when the container is ready
  const pendingVideoTrackRef = useRef(null);

  const agoraClientRef = useRef(null);
  const chatClientRef = useRef(null);

  const agoraRTCRef = useRef(null);
  const agoraChatRef = useRef(null);

  const mountedRef = useRef(false);
  const generationRef = useRef(0);

  const chatRoomIdRef = useRef(null);
  const joinedRef = useRef(false);

  // Keep the latest Apollo lazy-query function without making
  // the stream initialization effect depend on its identity.
  const [joinLive] = useLazyQuery(JOIN_LIVE_STREAM, {
    fetchPolicy: "network-only",
    errorPolicy: "none",
  });

  const joinLiveRef = useRef(joinLive);

  useEffect(() => {
    joinLiveRef.current = joinLive;
  }, [joinLive]);

  // =======================================================
  // GRAPHQL
  // =======================================================

  const {
    data: giftData,
    loading: giftsLoading,
    error: giftsError,
  } = useQuery(GET_LIVE_GIFTS, {
    fetchPolicy: "cache-and-network",
  });

  const [sendLiveGift] = useMutation(SEND_LIVE_GIFT);

  const gifts = giftData?.getLiveGifts ?? [];

  // =======================================================
  // HELPERS
  // =======================================================

  const isCurrentGeneration = useCallback((generation) => {
    return (
      mountedRef.current &&
      generationRef.current === generation
    );
  }, []);

  const getErrorMessage = useCallback((err) => {
    return (
      err?.graphQLErrors?.[0]?.message ||
      err?.networkError?.message ||
      err?.message ||
      "Something went wrong. Please try again."
    );
  }, []);

  const isValidLiveResponse = useCallback((live) => {
    if (!live) {
      throw new Error(
        "Live stream not found or has already ended."
      );
    }

    if (!live.id) {
      throw new Error(
        "Stream database ID is missing. Add id to LiveJoinResponse and JOIN_LIVE_STREAM."
      );
    }

    if (
      !live.appId ||
      !live.channelName ||
      !live.rtcToken ||
      live.uid == null
    ) {
      throw new Error(
        "Required Agora RTC configuration is missing."
      );
    }

    if (
      !live.chatAppKey ||
      !live.chatUserId ||
      !live.chatToken ||
      !live.chatRoomId
    ) {
      throw new Error(
        "Required Agora Chat configuration is missing."
      );
    }

    return true;
  }, []);

  // =======================================================
  // CHAT AUTO-SCROLL
  // =======================================================

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop =
        chatRef.current.scrollHeight;
    }
  }, [messages]);

  // =======================================================
  // HANDLE INCOMING CHAT MESSAGES AND GIFTS
  // =======================================================

  const handleIncomingTextMessage = useCallback((msg) => {
    if (!mountedRef.current) {
      return;
    }

    const rawMessage = msg?.msg || "";

    let payload = null;

    try {
      payload = JSON.parse(rawMessage);
    } catch {
      // The message is ordinary text, not a JSON payload.
    }

    if (payload?.type === "GIFT") {
      const messageId = msg?.id
        ? `gift-${msg.id}`
        : `gift-${Date.now()}-${Math.random()}`;

      setMessages((previous) => {
        if (
          previous.some(
            (item) => item.id === messageId
          )
        ) {
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
              msg?.from ||
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

    const messageId = msg?.id
      ? `message-${msg.id}`
      : `message-${Date.now()}-${Math.random()}`;

    setMessages((previous) => {
      if (
        previous.some(
          (item) => item.id === messageId
        )
      ) {
        return previous;
      }

      return [
        ...previous,
        {
          id: messageId,
          kind: "text",
          senderName: msg?.from || "User",
          message: rawMessage,
        },
      ];
    });
  }, []);

  // =======================================================
  // DISPOSE LOCAL CLIENTS
  // =======================================================

  const disposeLocalClients = useCallback(
    async (chatClient, rtcClient, roomId) => {
      if (chatClientRef.current === chatClient) {
        chatClientRef.current = null;
      }

      if (agoraClientRef.current === rtcClient) {
        agoraClientRef.current = null;
      }

      if (chatRoomIdRef.current === roomId) {
        chatRoomIdRef.current = null;
      }

      if (chatClient) {
        if (roomId) {
          try {
            await chatClient.leaveChatRoom({
              roomId,
            });
          } catch (err) {
            console.warn(
              "Unable to leave Agora Chat room:",
              err?.message
            );
          }
        }

        try {
          await chatClient.close();
        } catch (err) {
          console.warn(
            "Unable to close Agora Chat:",
            err?.message
          );
        }
      }

      if (rtcClient) {
        try {
          rtcClient.removeAllListeners();
        } catch {
          // Client may already be closed.
        }

        try {
          await rtcClient.leave();
        } catch {
          // Client may not have joined a channel.
        }
      }
    },
    []
  );

  // =======================================================
  // CLEANUP CURRENT CONNECTION
  // =======================================================

  const cleanup = useCallback(async () => {
    const chatClient = chatClientRef.current;
    const rtcClient = agoraClientRef.current;
    const chatRoomId = chatRoomIdRef.current;

    chatClientRef.current = null;
    agoraClientRef.current = null;

    agoraRTCRef.current = null;
    agoraChatRef.current = null;

    chatRoomIdRef.current = null;
    joinedRef.current = false;
    
    // Clear pending track
    pendingVideoTrackRef.current = null;

    if (mountedRef.current) {
      setHostJoined(false);
    }

    await disposeLocalClients(
      chatClient,
      rtcClient,
      chatRoomId
    );
  }, [disposeLocalClients]);

  // =======================================================
  // SUBSCRIBE TO ASTROLOGER'S RTC TRACKS
  // =======================================================

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

        // ---------------------------------------------------
        // Video
        // ---------------------------------------------------

        if (mediaType === "video") {
          if (!user.videoTrack) {
            console.warn(
              "Astrologer video track is unavailable."
            );
            return;
          }

          // Store the track in the ref. 
          // The useEffect below will handle playing it when the container is ready.
          pendingVideoTrackRef.current = user.videoTrack;
          
          // If container is ALREADY ready, play immediately
          if (remoteVideoRef.current) {
             remoteVideoRef.current.innerHTML = ""; 
             user.videoTrack.play(remoteVideoRef.current);
             if (isCurrentGeneration(generation)) {
                console.log("Host video published and playing (immediate)");
                setHostJoined(true);
                setError("");
             }
          } else {
             console.log("Video track ready, waiting for container...");
          }
        }

        // ---------------------------------------------------
        // Audio
        // ---------------------------------------------------

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

  // =======================================================
  // INITIALIZE LIVE STREAM
  // =======================================================

  const initializeLive = useCallback(
    async (generation) => {
      let localRtcClient = null;
      let localChatClient = null;
      let localChatRoomId = null;

      try {
        if (!isCurrentGeneration(generation)) {
          return;
        }

        setLoading(true);
        setError("");
        setHostJoined(false);
        setLiveInfo(null);
        setMessages([]);

        if (!channelName) {
          throw new Error(
            "Live stream channel name is missing."
          );
        }

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

        const response =
          await joinLiveRef.current({
            variables: {
              channelName,
            },
          });

        if (!isCurrentGeneration(generation)) {
          return;
        }

        const live = response?.data?.joinLive;

        isValidLiveResponse(live);

        setLiveInfo(live);

        localChatRoomId = live.chatRoomId;
        chatRoomIdRef.current = live.chatRoomId;

        const rtcClient =
          AgoraRTC.createClient({
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

        rtcClient.on("user-joined", (user) => {
          console.log("Remote user joined:", user.uid);
        });

        rtcClient.on(
          "user-unpublished",
          (user, mediaType) => {
            if (
              !isCurrentGeneration(generation)
            ) {
              return;
            }

            if (mediaType === "video") {
              setHostJoined(false);
            }
          }
        );

        rtcClient.on("user-left", () => {
          if (isCurrentGeneration(generation)) {
            setHostJoined(false);
          }
        });

        rtcClient.on(
          "connection-state-change",
          (state, previousState, reason) => {
            console.log(
              "Agora RTC connection:",
              {
                state,
                previousState,
                reason,
              }
            );
          }
        );

        await rtcClient.setClientRole("audience");

        if (!isCurrentGeneration(generation)) {
          await disposeLocalClients(
            localChatClient,
            localRtcClient,
            localChatRoomId
          );
          return;
        }

        await rtcClient.join(
          live.appId,
          live.channelName,
          live.rtcToken,
          live.uid
        );

        if (!isCurrentGeneration(generation)) {
          await disposeLocalClients(
            localChatClient,
            localRtcClient,
            localChatRoomId
          );
          return;
        }

        joinedRef.current = true;

        const chatClient =
          new AgoraChat.connection({
            appKey: live.chatAppKey,
          });

        localChatClient = chatClient;
        chatClientRef.current = chatClient;

        chatClient.addEventHandler(
          `LIVE_CHAT_${generation}`,
          {
            onTextMessage:
              handleIncomingTextMessage,

            onError: (chatError) => {
              console.error(
                "Agora Chat error:",
                chatError
              );
            },

            onConnected: () => {
              console.log(
                "Agora Chat connected."
              );
            },

            onDisconnected: () => {
              console.log(
                "Agora Chat disconnected."
              );
            },
          }
        );

        await chatClient.open({
          user: live.chatUserId,
          accessToken: live.chatToken,
        });

        if (!isCurrentGeneration(generation)) {
          await disposeLocalClients(
            localChatClient,
            localRtcClient,
            localChatRoomId
          );
          return;
        }

        await chatClient.joinChatRoom({
          roomId: live.chatRoomId,
        });

        if (!isCurrentGeneration(generation)) {
          await disposeLocalClients(
            localChatClient,
            localRtcClient,
            localChatRoomId
          );
          return;
        }

        // ---------------------------------------------------
        // 5. Subscribe to tracks already published
        // ---------------------------------------------------

        if (rtcClient.remoteUsers.length > 0) {
          console.log(`Found ${rtcClient.remoteUsers.length} existing remote users.`);
          
          for (const user of rtcClient.remoteUsers) {
            if (!isCurrentGeneration(generation)) {
              break;
            }

            if (user.hasVideo) {
              console.log(`Subscribing to existing video track for user ${user.uid}`);
              await subscribeToUser(
                user,
                "video",
                generation
              );
            }

            if (user.hasAudio) {
              console.log(`Subscribing to existing audio track for user ${user.uid}`);
              await subscribeToUser(
                user,
                "audio",
                generation
              );
            }
          }
        } else {
          console.log("No remote users found upon joining. Waiting for host to publish...");
        }

        if (isCurrentGeneration(generation)) {
          setLoading(false); // This triggers the render of the video container
          setError("");
        }
      } catch (err) {
        console.error(
          "Initialize live error:",
          err
        );

        if (isCurrentGeneration(generation)) {
          setError(getErrorMessage(err));
          setLoading(false);

          await cleanup();
        } else {
          await disposeLocalClients(
            localChatClient,
            localRtcClient,
            localChatRoomId
          );
        }
      }
    },
    [
      channelName,
      cleanup,
      disposeLocalClients,
      getErrorMessage,
      handleIncomingTextMessage,
      isCurrentGeneration,
      isValidLiveResponse,
      subscribeToUser,
    ]
  );

  // =======================================================
  // START / STOP LIVE STREAM LIFECYCLE
  // =======================================================

  useEffect(() => {
    mountedRef.current = true;

    const generation =
      ++generationRef.current;

    if (!channelName) {
      setLoading(false);
      setError(
        "Live stream channel name is missing."
      );

      return () => {
        mountedRef.current = false;
        generationRef.current++;
      };
    }

    initializeLive(generation);

    return () => {
      mountedRef.current = false;
      generationRef.current++;
      void cleanup();
    };
  }, [
    channelName,
    initializeLive,
    cleanup,
  ]);

  // =======================================================
  // NEW EFFECT: Play video when container becomes ready
  // =======================================================
  useEffect(() => {
    // If we are not loading, we have live info, and we have a pending video track
    if (!loading && liveInfo && pendingVideoTrackRef.current && remoteVideoRef.current) {
      console.log("Container is ready. Playing pending video track.");
      
      // Clear container to prevent duplicates
      remoteVideoRef.current.innerHTML = "";
      
      // Play the track
      pendingVideoTrackRef.current.play(remoteVideoRef.current);
      
      // Update state
      setHostJoined(true);
      setError("");
      
      // Clear the pending ref since it's now playing
      pendingVideoTrackRef.current = null;
    }
  }, [loading, liveInfo]);

  // =======================================================
  // SEND ORDINARY CHAT MESSAGE
  // =======================================================

  const sendMessage = async () => {
    const trimmedMessage = message.trim();

    if (!trimmedMessage || !liveInfo) {
      return;
    }

    const chatClient = chatClientRef.current;
    const AgoraChat = agoraChatRef.current;

    if (!chatClient || !AgoraChat) {
      setError(
        "Agora Chat is not connected. Please reconnect."
      );
      return;
    }

    try {
      const chatMessage =
        AgoraChat.message.create({
          chatType: "chatRoom",
          type: "txt",
          to: liveInfo.chatRoomId,
          msg: trimmedMessage,
        });

      await chatClient.send(chatMessage);

      setMessage("");
      setError("");
    } catch (err) {
      console.error(
        "Send message error:",
        err
      );

      setError(getErrorMessage(err));
    }
  };

  // =======================================================
  // SEND GIFT
  // =======================================================

  const handleSendGift = async () => {
    if (!liveInfo?.id) {
      setGiftNotice(
        "Stream database ID is missing. Check the joinLive GraphQL response."
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

      const result =
        response?.data?.sendLiveGift;

      if (!result?.success) {
        throw new Error(
          result?.message ||
            "Gift transaction failed."
        );
      }

      setGiftNotice(
        `Successfully sent ${result.giftName || "gift"} × ${result.quantity ?? giftQuantity}.`
      );

      setSelectedGiftId("");
      setGiftQuantity(1);
    } catch (err) {
      console.error(
        "Send live gift error:",
        err
      );

      setGiftNotice(getErrorMessage(err));
    } finally {
      setSendingGift(false);
    }
  };

  // =======================================================
  // LEAVE LIVE STREAM
  // =======================================================

  const handleLeaveLive = async () => {
    generationRef.current++;

    await cleanup();

    if (mountedRef.current) {
      setHostJoined(false);
      setLiveInfo(null);
      setMessages([]);
      setMessage("");
      setLoading(false);
      setError(
        "You have left the live stream."
      );
    }
  };

  // =======================================================
  // GIFT CALCULATIONS
  // =======================================================

  const selectedGift = gifts.find(
    (gift) => gift.id === selectedGiftId
  );

  const totalGiftCoins = selectedGift
    ? Number(selectedGift.price) *
      Number(giftQuantity || 0)
    : 0;

  // =======================================================
  // UI
  // =======================================================

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
          {hostJoined
            ? "● Connected"
            : loading
              ? "Connecting"
              : "Waiting"}
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

            {!liveInfo && (
              <button
                type="button"
                onClick={() => {
                  setError("");
                  setLoading(true);

                  const generation =
                    ++generationRef.current;

                  void initializeLive(generation);
                }}
                className="mt-3 rounded-lg bg-white px-4 py-2 font-semibold text-red-600"
              >
                Try Again
              </button>
            )}
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

            <div className="relative isolate h-[75vh] min-h-[450px] w-full overflow-hidden rounded-2xl bg-black">
              {/* Remote Agora video */}
              <div
                ref={remoteVideoRef}
                id="remote-video"
                className="absolute inset-0 z-0 h-full w-full bg-black"
              />

              {/* Stream header overlay */}
              <div className="absolute left-0 right-0 top-0 z-10 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent p-4">
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
                              setSelectedGiftId(
                                gift.id
                              );
                              setGiftNotice("");
                            }}
                            className={`rounded-lg border p-3 ${
                              selectedGiftId ===
                              gift.id
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

                            const value =
                              Number(rawValue);

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
                              !Number.isInteger(
                                giftQuantity
                              ) ||
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
                          !Number.isInteger(
                            giftQuantity
                          ) ||
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
              <div className="absolute bottom-28 left-0 right-0 z-10">
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
                                {" "}
                                × {item.quantity}
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
              <div className="absolute bottom-14 left-0 right-0 z-20 flex items-center gap-2 bg-black/80 p-3">
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
                      void sendMessage();
                    }
                  }}
                />

                <button
                  type="button"
                  onClick={() => void sendMessage()}
                  disabled={!message.trim()}
                  className="rounded-full bg-red-600 px-5 py-3 text-white hover:bg-red-700 disabled:opacity-50"
                >
                  Send
                </button>
              </div>

              {/* Bottom controls */}
              <div className="absolute bottom-0 left-0 right-0 z-20 flex justify-around bg-black/90 py-3">
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
                  <span className="text-xs">
                    Like
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setGiftPanelOpen(
                      (open) => !open
                    );
                    setGiftNotice("");
                  }}
                  className="flex flex-col items-center text-white"
                >
                  🎁
                  <span className="text-xs">
                    Gift
                  </span>
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
                  <span className="text-xs">
                    Call
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    void handleLeaveLive()
                  }
                  className="flex flex-col items-center text-red-500"
                >
                  ❌
                  <span className="text-xs">
                    Leave
                  </span>
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