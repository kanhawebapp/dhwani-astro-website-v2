"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useLazyQuery, useQuery, useMutation } from "@apollo/client/react";

import {
  JOIN_LIVE_STREAM,
  GET_LIVE_GIFTS,
  SEND_LIVE_GIFT,
  LEAVE_LIVE_STREAM,
  IS_FOLLOWING,
  GET_ASTROLOGER_FOLLOWERS_COUNT,
  FOLLOW_ASTROLOGER,
  UNFOLLOW_ASTROLOGER,
} from "@/app/graphql/gqlQuery";

export default function WatchLive() {
  const params = useParams();
  const router = useRouter();

  const channelName =
    typeof params?.channelName === "string" ? params.channelName : "";

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

  const [followNotice, setFollowNotice] = useState("");

  // =======================================================
  // REFS
  // =======================================================

  const chatRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const pendingVideoTrackRef = useRef(null);

  const agoraClientRef = useRef(null);
  const chatClientRef = useRef(null);

  const agoraRTCRef = useRef(null);
  const agoraChatRef = useRef(null);

  const mountedRef = useRef(false);
  const generationRef = useRef(0);

  const chatRoomIdRef = useRef(null);
  const liveInfoRef = useRef(null);

  const leavingRef = useRef(false);

  // Keep the current live information accessible to event handlers.
  useEffect(() => {
    liveInfoRef.current = liveInfo;
  }, [liveInfo]);

  // =======================================================
  // GRAPHQL: JOIN LIVE
  // =======================================================

  const [joinLive] = useLazyQuery(JOIN_LIVE_STREAM, {
    fetchPolicy: "network-only",
    errorPolicy: "none",
  });

  const joinLiveRef = useRef(joinLive);

  useEffect(() => {
    joinLiveRef.current = joinLive;
  }, [joinLive]);

  // =======================================================
  // GRAPHQL: GIFTS
  // =======================================================

  const {
    data: giftData,
    loading: giftsLoading,
    error: giftsError,
  } = useQuery(GET_LIVE_GIFTS, {
    fetchPolicy: "cache-and-network",
    errorPolicy: "all",
  });

  const [sendLiveGift] = useMutation(SEND_LIVE_GIFT);

  const [leaveLiveStream, { loading: leavingLive }] =
    useMutation(LEAVE_LIVE_STREAM);

  const gifts = giftData?.getLiveGifts ?? [];

  const selectedGift = gifts.find((gift) => gift.id === selectedGiftId);

  const totalGiftCoins = selectedGift
    ? Number(selectedGift.price) * Number(giftQuantity || 0)
    : 0;

  // =======================================================
  // GRAPHQL: FOLLOW / UNFOLLOW
  // =======================================================

  const astrologerId = liveInfo?.astrologerId;

  const {
    data: followingData,
    loading: followingStatusLoading,
    refetch: refetchFollowingStatus,
  } = useQuery(IS_FOLLOWING, {
    variables: {
      astrologerId: astrologerId || "",
    },
    skip: !astrologerId,
    fetchPolicy: "network-only",
    errorPolicy: "all",
  });

  const {
    data: followersData,
    refetch: refetchFollowersCount,
  } = useQuery(GET_ASTROLOGER_FOLLOWERS_COUNT, {
    variables: {
      astrologerId: astrologerId || "",
    },
    skip: !astrologerId,
    fetchPolicy: "network-only",
    errorPolicy: "all",
  });

  const [followAstrologer, { loading: followingLoading }] =
    useMutation(FOLLOW_ASTROLOGER);

  const [unfollowAstrologer, { loading: unfollowingLoading }] =
    useMutation(UNFOLLOW_ASTROLOGER);

  const isFollowing =
    followingData?.isFollowing?.isFollowing ?? false;

  const totalFollowers =
    followersData?.getAstrologerFollowersCount?.totalFollowers ?? 0;

  const followActionLoading =
    followingLoading || unfollowingLoading;

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
      err?.networkError?.result?.errors?.[0]?.message ||
      err?.networkError?.message ||
      err?.message ||
      "Something went wrong. Please try again."
    );
  }, []);

  const isValidLiveResponse = useCallback((live) => {
    if (!live) {
      throw new Error(
        "Live stream not found or has already ended.",
      );
    }

    if (!live.id) {
      throw new Error(
        "Stream database ID is missing from the joinLive response.",
      );
    }

    if (
      !live.appId ||
      !live.channelName ||
      !live.rtcToken ||
      live.uid == null
    ) {
      throw new Error(
        "Required Agora RTC configuration is missing.",
      );
    }

    if (
      !live.chatAppKey ||
      !live.chatUserId ||
      !live.chatToken ||
      !live.chatRoomId
    ) {
      throw new Error(
        "Required Agora Chat configuration is missing.",
      );
    }

    if (!live.astrologerId) {
      console.warn(
        "astrologerId is missing from the joinLive response. Follow functionality will be unavailable.",
      );
    }

    return true;
  }, []);

  // =======================================================
  // FOLLOW / UNFOLLOW HANDLER
  // =======================================================

  const handleFollowToggle = async () => {
    if (!astrologerId) {
      setFollowNotice(
        "Astrologer information is unavailable. Check the joinLive response.",
      );
      return;
    }

    if (followActionLoading || followingStatusLoading) {
      return;
    }

    try {
      setFollowNotice("");

      const action = isFollowing
        ? unfollowAstrologer
        : followAstrologer;

      const resultKey = isFollowing
        ? "unfollowAstrologer"
        : "followAstrologer";

      const response = await action({
        variables: {
          astrologerId,
        },
      });

      const result = response?.data?.[resultKey];

      if (!result?.success) {
        throw new Error(
          result?.message ||
            `Unable to ${
              isFollowing ? "unfollow" : "follow"
            } astrologer.`,
        );
      }

      setFollowNotice(
        result.message ||
          (isFollowing
            ? "You have unfollowed the astrologer."
            : "You are now following the astrologer."),
      );

      await Promise.all([
        refetchFollowingStatus(),
        refetchFollowersCount(),
      ]);
    } catch (err) {
      console.error("Follow/unfollow error:", err);
      setFollowNotice(getErrorMessage(err));
    }
  };

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
  // INCOMING CHAT MESSAGES AND GIFT NOTIFICATIONS
  // =======================================================

  const handleIncomingTextMessage = useCallback((msg) => {
    if (!mountedRef.current) {
      return;
    }

    const rawMessage = msg?.msg || "";
    const currentLive = liveInfoRef.current;

    const isOwnMessage =
      currentLive?.chatUserId &&
      msg?.from === currentLive.chatUserId;

    let payload = null;

    try {
      payload = JSON.parse(rawMessage);
    } catch {
      // Ordinary text message.
    }

    // Gift notification
    if (payload?.type === "GIFT") {
      const messageId = msg?.id
        ? `gift-${msg.id}`
        : `gift-${Date.now()}-${Math.random()}`;

      setMessages((previous) => {
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
              msg?.from ||
              "User",
            giftName: payload.giftName || "Gift",
            giftIcon:
              payload.icon || payload.giftIcon || "🎁",
            quantity: Number(payload.quantity) || 1,
            totalCoins: payload.totalCoins,
          },
        ];
      });

      return;
    }

    // The sender adds their own message locally.
    if (isOwnMessage) {
      return;
    }

    const messageId = msg?.id
      ? `message-${msg.id}`
      : `message-${Date.now()}-${Math.random()}`;

    setMessages((previous) => {
      if (previous.some((item) => item.id === messageId)) {
        return previous;
      }

      return [
        ...previous,
        {
          id: messageId,
          kind: "text",
          senderName: msg?.from || "User",
          message: rawMessage,
          isOwn: false,
        },
      ];
    });
  }, []);

  // =======================================================
  // DISPOSE AGORA CLIENTS
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
            await chatClient.leaveChatRoom({ roomId });
          } catch (err) {
            console.warn(
              "Unable to leave Agora Chat room:",
              err?.message,
            );
          }
        }

        try {
          await chatClient.close();
        } catch (err) {
          console.warn(
            "Unable to close Agora Chat:",
            err?.message,
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
          // Client may not have joined yet.
        }
      }
    },
    [],
  );

  // =======================================================
  // CLEANUP CURRENT CONNECTION
  // =======================================================

  const cleanup = useCallback(async () => {
    const chatClient = chatClientRef.current;
    const rtcClient = agoraClientRef.current;
    const roomId = chatRoomIdRef.current;

    chatClientRef.current = null;
    agoraClientRef.current = null;

    agoraRTCRef.current = null;
    agoraChatRef.current = null;

    chatRoomIdRef.current = null;
    pendingVideoTrackRef.current = null;

    if (mountedRef.current) {
      setHostJoined(false);
    }

    await disposeLocalClients(
      chatClient,
      rtcClient,
      roomId,
    );
  }, [disposeLocalClients]);

  // =======================================================
  // SUBSCRIBE TO ASTROLOGER VIDEO / AUDIO
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

        if (mediaType === "video") {
          if (!user.videoTrack) {
            console.warn(
              "Astrologer video track is unavailable.",
            );
            return;
          }

          pendingVideoTrackRef.current = user.videoTrack;

          if (remoteVideoRef.current) {
            remoteVideoRef.current.innerHTML = "";
            user.videoTrack.play(remoteVideoRef.current);

            setHostJoined(true);
            setError("");

            pendingVideoTrackRef.current = null;
          }
        }

        if (mediaType === "audio" && user.audioTrack) {
          user.audioTrack.play();
        }
      } catch (err) {
        console.error(
          `Agora ${mediaType} subscription failed:`,
          err,
        );

        if (isCurrentGeneration(generation)) {
          setError(
            `Unable to receive the astrologer's ${mediaType}. Please try reconnecting.`,
          );
        }
      }
    },
    [isCurrentGeneration],
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
        setFollowNotice("");

        liveInfoRef.current = null;

        if (!channelName) {
          throw new Error(
            "Live stream channel name is missing.",
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

        const response = await joinLiveRef.current({
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
        liveInfoRef.current = live;

        localChatRoomId = live.chatRoomId;
        chatRoomIdRef.current = live.chatRoomId;

        // ---------------------------------------------------
        // RTC client
        // ---------------------------------------------------

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
              generation,
            );
          },
        );

        rtcClient.on("user-joined", (user) => {
          console.log(
            "Remote user joined:",
            user.uid,
          );
        });

        rtcClient.on(
          "user-unpublished",
          (user, mediaType) => {
            if (!isCurrentGeneration(generation)) {
              return;
            }

            if (mediaType === "video") {
              setHostJoined(false);
              pendingVideoTrackRef.current = null;
            }
          },
        );

        rtcClient.on("user-left", () => {
          if (isCurrentGeneration(generation)) {
            setHostJoined(false);
            pendingVideoTrackRef.current = null;
          }
        });

        rtcClient.on(
          "connection-state-change",
          (state, previousState, reason) => {
            console.log("Agora RTC connection:", {
              state,
              previousState,
              reason,
            });
          },
        );

        await rtcClient.setClientRole("audience");

        if (!isCurrentGeneration(generation)) {
          await disposeLocalClients(
            localChatClient,
            localRtcClient,
            localChatRoomId,
          );
          return;
        }

        await rtcClient.join(
          live.appId,
          live.channelName,
          live.rtcToken,
          live.uid,
        );

        if (!isCurrentGeneration(generation)) {
          await disposeLocalClients(
            localChatClient,
            localRtcClient,
            localChatRoomId,
          );
          return;
        }

        // ---------------------------------------------------
        // Agora Chat client
        // ---------------------------------------------------

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
                chatError,
              );
            },

            onConnected: () => {
              console.log("Agora Chat connected.");
            },

            onDisconnected: () => {
              console.log("Agora Chat disconnected.");
            },
          },
        );

        await chatClient.open({
          user: live.chatUserId,
          accessToken: live.chatToken,
        });

        if (!isCurrentGeneration(generation)) {
          await disposeLocalClients(
            localChatClient,
            localRtcClient,
            localChatRoomId,
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
            localChatRoomId,
          );
          return;
        }

        // ---------------------------------------------------
        // Subscribe to already-published tracks
        // ---------------------------------------------------

        for (const user of rtcClient.remoteUsers) {
          if (!isCurrentGeneration(generation)) {
            break;
          }

          if (user.hasVideo) {
            await subscribeToUser(
              user,
              "video",
              generation,
            );
          }

          if (user.hasAudio) {
            await subscribeToUser(
              user,
              "audio",
              generation,
            );
          }
        }

        if (isCurrentGeneration(generation)) {
          setLoading(false);
          setError("");
        }
      } catch (err) {
        console.error("Initialize live error:", err);

        if (isCurrentGeneration(generation)) {
          setError(getErrorMessage(err));
          setLoading(false);

          await cleanup();
        } else {
          await disposeLocalClients(
            localChatClient,
            localRtcClient,
            localChatRoomId,
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
    ],
  );

  // =======================================================
  // LIVE STREAM LIFECYCLE
  // =======================================================

  useEffect(() => {
    mountedRef.current = true;

    const generation = ++generationRef.current;

    if (!channelName) {
      setLoading(false);
      setError("Live stream channel name is missing.");

      return () => {
        mountedRef.current = false;
        generationRef.current++;
      };
    }

    void initializeLive(generation);

    return () => {
      mountedRef.current = false;
      generationRef.current++;

      void cleanup();
    };
  }, [channelName, initializeLive, cleanup]);

  // =======================================================
  // PLAY VIDEO WHEN THE CONTAINER IS READY
  // =======================================================

  useEffect(() => {
    if (
      !loading &&
      liveInfo &&
      pendingVideoTrackRef.current &&
      remoteVideoRef.current
    ) {
      try {
        remoteVideoRef.current.innerHTML = "";

        pendingVideoTrackRef.current.play(
          remoteVideoRef.current,
        );

        pendingVideoTrackRef.current = null;

        setHostJoined(true);
        setError("");
      } catch (err) {
        console.error("Unable to play remote video:", err);
        setError("Unable to play the astrologer's video.");
      }
    }
  }, [loading, liveInfo]);

  // =======================================================
  // SEND CHAT MESSAGE
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
        "Agora Chat is not connected. Please reconnect.",
      );
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

      setMessages((previous) => [
        ...previous,
        {
          id: `sent-${Date.now()}-${Math.random()}`,
          kind: "text",
          senderName: "You",
          message: trimmedMessage,
          isOwn: true,
        },
      ]);

      setMessage("");
      setError("");
    } catch (err) {
      console.error("Send message error:", err);
      setError(getErrorMessage(err));
    }
  };

  // =======================================================
  // SEND GIFT
  // =======================================================

  const handleSendGift = async () => {
    if (!liveInfo?.id) {
      setGiftNotice(
        "Stream database ID is missing from the joinLive response.",
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
        "Quantity must be between 1 and 100.",
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
          result?.message || "Gift transaction failed.",
        );
      }

      const sentName =
        result.giftName || selectedGift?.name || "gift";

      const sentQuantity =
        result.quantity ?? giftQuantity;

      const coins =
        result.totalCoins ?? totalGiftCoins;

      const balanceMessage =
        Number.isFinite(result.userBalance)
          ? ` Remaining wallet balance: ${result.userBalance} coins.`
          : "";

      setGiftNotice(
        `Successfully sent ${sentName} × ${sentQuantity} for ${coins} coins.${balanceMessage}`,
      );

      setSelectedGiftId("");
      setGiftQuantity(1);
    } catch (err) {
      console.error("Send live gift error:", err);
      setGiftNotice(getErrorMessage(err));
    } finally {
      setSendingGift(false);
    }
  };

  // =======================================================
  // LEAVE LIVE STREAM
  // =======================================================

  const handleLeaveLive = async () => {
    if (leavingRef.current || leavingLive) {
      return;
    }

    leavingRef.current = true;

    try {
      const { data } = await leaveLiveStream({
        variables: {
          channelName,
        },
      });

      if (data?.leaveLive?.success) {
        console.log(data.leaveLive.message);
      }
    } catch (err) {
      console.error("Failed to leave live API:", err);
    } finally {
      generationRef.current++;

      try {
        await cleanup();
      } catch (err) {
        console.error("Agora cleanup error:", err);
      }

      router.push("/astrologer/liveStream");
    }
  };

  // =======================================================
  // UI
  // =======================================================

  const astrologerName =
    liveInfo?.astrologer?.displayName ||
    liveInfo?.astrologer?.name ||
    liveInfo?.astrologerName ||
    "Astrologer";

  const astrologerProfilePic =
    liveInfo?.astrologer?.profilePic ||
    liveInfo?.profilePic ||
    "";

  return (
    <div className="flex min-h-[70vh] w-full flex-col bg-gradient-to-b from-gray-950 to-black text-white lg:flex-row">
      {/* ===================================================
          VIDEO PANEL
      =================================================== */}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Header */}
        <div className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-gray-800 bg-black/80 px-4 py-3 backdrop-blur">
          <div className="flex items-center gap-3">
            <span className="animate-pulse rounded-full bg-red-600 px-3 py-1 text-sm font-semibold">
              🔴 LIVE
            </span>

            <div>
              <h2 className="text-lg font-semibold">
                Live Session
              </h2>

              <p className="text-xs text-gray-400">
                Watch astrologer live
              </p>
            </div>
          </div>

          <span className="rounded-full bg-gray-800 px-3 py-1 text-sm">
            {hostJoined
              ? "● Connected"
              : loading
                ? "Connecting..."
                : "Waiting"}
          </span>
        </div>

        <div className="flex flex-col p-3 sm:p-4">
          {/* Loading */}
          {loading && (
            <div className="flex min-h-[400px] items-center justify-center">
              <div className="text-center">
                <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-red-500 border-t-transparent" />

                <p className="text-lg">
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
            <div className="mb-4 rounded-xl bg-red-600 px-5 py-4 shadow-lg">
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
                <div className="mb-3 rounded-xl bg-yellow-500 p-3 text-center font-medium text-black">
                  Waiting for astrologer video...
                </div>
              )}

              <div className="relative isolate h-[65vh] min-h-[450px] w-full overflow-hidden rounded-2xl bg-black sm:h-[75vh]">
                {/* Agora remote video */}
                <div
                  ref={remoteVideoRef}
                  id="remote-video"
                  className="absolute inset-0 z-0 h-full w-full bg-black"
                />

                {/* =================================================
                    STREAM HEADER OVERLAY
                ================================================= */}

                <div className="absolute left-0 right-0 top-0 z-10 flex flex-wrap items-start justify-between gap-3 bg-gradient-to-b from-black/90 to-transparent p-3 sm:p-4">
                  {/* Astrologer information */}
                  <div className="flex min-w-0 items-center gap-3">
                    {astrologerProfilePic ? (
                      <img
                        src={astrologerProfilePic}
                        alt={astrologerName}
                        className="h-11 w-11 shrink-0 rounded-full border border-gray-500 object-cover"
                      />
                    ) : (
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gray-700 text-xl">
                        👳
                      </div>
                    )}

                    <div className="min-w-0">
                      <h3 className="truncate font-semibold">
                        {astrologerName}
                      </h3>

                      <p className="text-xs text-gray-300">
                        Live Consultation
                      </p>

                      {/* Views and followers */}
                      <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
                        <span
                          className="inline-flex items-center gap-1"
                          title="Total views"
                        >
                          👁️
                          <strong>
                            {Number(
                              liveInfo.totalViews ?? 0,
                            ).toLocaleString("en-IN")}
                          </strong>
                          <span className="text-gray-300">
                            views
                          </span>
                        </span>

                        <span
                          className="inline-flex items-center gap-1"
                          title="Total followers"
                        >
                          👥
                          <strong>
                            {Number(
                              totalFollowers,
                            ).toLocaleString("en-IN")}
                          </strong>
                          <span className="text-gray-300">
                            followers
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Follow button */}
                  <div className="flex flex-col items-end gap-2">
                    <span className="animate-pulse rounded-full bg-red-600 px-3 py-1 text-sm font-medium">
                      🔴 LIVE
                    </span>

                    <button
                      type="button"
                      onClick={handleFollowToggle}
                      disabled={
                        !astrologerId ||
                        followingStatusLoading ||
                        followActionLoading
                      }
                      className={`rounded-full px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                        isFollowing
                          ? "border border-gray-500 bg-gray-800 text-white hover:bg-gray-700"
                          : "bg-yellow-500 text-black hover:bg-yellow-400"
                      }`}
                    >
                      {followActionLoading
                        ? "Please wait..."
                        : followingStatusLoading
                          ? "Loading..."
                          : isFollowing
                            ? "✓ Following"
                            : "+ Follow"}
                    </button>
                  </div>

                  {/* Follow status notice */}
                  {followNotice && (
                    <p
                      role="status"
                      aria-live="polite"
                      className="w-full break-words text-sm text-yellow-300"
                    >
                      {followNotice}
                    </p>
                  )}
                </div>

                {/* =================================================
                    GIFT PANEL
                ================================================= */}

                {giftPanelOpen && (
                  <div className="absolute bottom-20 left-3 right-3 z-30 max-h-[60%] overflow-y-auto rounded-xl border border-gray-700 bg-gray-950/95 p-4 shadow-xl sm:bottom-24">
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="font-semibold">
                        Send a Gift
                      </h3>

                      <button
                        type="button"
                        onClick={() => setGiftPanelOpen(false)}
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
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
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

                              <div className="mt-1 text-sm">
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
                            className="text-sm"
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

                {/* =================================================
                    BOTTOM CONTROLS
                ================================================= */}

                <div className="absolute bottom-0 left-0 right-0 z-20 flex items-center justify-around gap-3 bg-black/90 px-3 py-3">
                  <button
                    type="button"
                    onClick={() => {
                      setGiftPanelOpen((open) => !open);
                      setGiftNotice("");
                    }}
                    className="flex flex-col items-center text-white"
                  >
                    <span className="text-xl">🎁</span>
                    <span className="text-xs">Gift</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleLeaveLive}
                    disabled={leavingLive}
                    className="rounded-full bg-red-600 px-5 py-2 font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                  >
                    {leavingLive
                      ? "Leaving..."
                      : "Leave Live"}
                  </button>
                </div>
              </div>

              {/* Gift notice outside the gift panel */}
              {giftNotice && !giftPanelOpen && (
                <div className="mt-3 rounded-lg bg-gray-900 p-3 text-sm text-yellow-300">
                  {giftNotice}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* =====================================================
          CHAT PANEL
      ===================================================== */}

      <aside className="flex w-full min-w-0 flex-col border-t border-gray-800 bg-gray-950 lg:w-[350px] lg:shrink-0 lg:border-l lg:border-t-0">
        <div className="border-b border-gray-800 px-4 py-3">
          <h3 className="font-semibold">Live Chat</h3>

          <p className="text-xs text-gray-400">
            Chat with the community
          </p>
        </div>

        {/* Messages */}
        <div
          ref={chatRef}
          className="h-[300px] space-y-3 overflow-y-auto px-3 py-3 lg:h-[calc(75vh-120px)]"
        >
          {messages.map((item) => (
            <div key={item.id} className="mb-2">
              {item.kind === "gift" ? (
                <div className="inline-flex max-w-full items-center rounded-xl border border-yellow-400/40 bg-yellow-500/10 p-3">
                  <span className="mr-2 text-2xl">
                    {item.giftIcon || "🎁"}
                  </span>

                  <div className="break-words text-sm">
                    <strong className="text-yellow-300">
                      {item.senderName}
                    </strong>

                    {" sent "}

                    <strong>{item.giftName}</strong>

                    {item.quantity > 1 && (
                      <span> × {item.quantity}</span>
                    )}

                    {item.totalCoins != null && (
                      <div className="mt-1 text-xs text-yellow-300">
                        {item.totalCoins} coins
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div
                  className={`flex max-w-[95%] flex-col break-words rounded-xl px-3 py-2 ${
                    item.isOwn
                      ? "ml-auto bg-red-900/50"
                      : "bg-gray-800"
                  }`}
                >
                  <span
                    className={`mb-1 font-semibold ${
                      item.isOwn
                        ? "text-green-400"
                        : "text-yellow-400"
                    }`}
                  >
                    {item.isOwn
                      ? "You"
                      : item.senderName
                          ?.split("_")[0]
                          ?.replace(/^./, (char) =>
                            char.toUpperCase(),
                          )}
                  </span>

                  <span className="whitespace-pre-wrap text-sm text-white">
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

        {/* Chat input */}
        <div className="mt-auto flex items-center gap-2 border-t border-gray-800 bg-black/80 p-3">
          <input
            value={message}
            onChange={(event) =>
              setMessage(event.target.value)
            }
            placeholder="Write a message..."
            maxLength={1000}
            disabled={!liveInfo || loading}
            className="min-w-0 flex-1 rounded-full bg-gray-900 px-4 py-3 text-white outline-none placeholder:text-gray-500 focus:ring-1 focus:ring-red-500 disabled:opacity-50"
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
            disabled={!message.trim() || !liveInfo || loading}
            className="rounded-full bg-red-600 px-5 py-3 text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </aside>
    </div>
  );
}