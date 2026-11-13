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
  GET_LIVE_STATUS,
  CREATE_LIVE_INTERACTION_REQUEST,
  GET_MY_LIVE_INTERACTION,
  END_LIVE_INTERACTION,
} from "@/app/graphql/gqlQuery";

export default function WatchLive() {
  const params = useParams();
  const router = useRouter();

  const channelName =
    typeof params?.channelName === "string" ? params.channelName : "";

  // =====================================================
  // STATE
  // =====================================================

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hostJoined, setHostJoined] = useState(false);

  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [liveInfo, setLiveInfo] = useState(null);

  // Gift states
  const [giftPanelOpen, setGiftPanelOpen] = useState(false);
  const [selectedGiftId, setSelectedGiftId] = useState("");
  const [giftQuantity, setGiftQuantity] = useState(1);
  const [sendingGift, setSendingGift] = useState(false);
  const [giftNotice, setGiftNotice] = useState("");

  // Follow states
  const [followNotice, setFollowNotice] = useState("");

  // Stream states
  const [streamEnded, setStreamEnded] = useState(false);

  // Interaction states
  const [interactionType, setInteractionType] = useState("AUDIO");
  const [interactionNotice, setInteractionNotice] = useState("");
  const [interactionLoading, setInteractionLoading] = useState(false);
  const [interactionStatus, setInteractionStatus] = useState(null);
  const [isInteractionPublishing, setIsInteractionPublishing] = useState(false);

  // New call UI state
  const [interactionPanelOpen, setInteractionPanelOpen] = useState(false);

  // =====================================================
  // REFS
  // =====================================================

  const chatRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const guestVideoRef = useRef(null);
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
  const endingRef = useRef(false);

  const redirectTimeoutRef = useRef(null);

  const localAudioTrackRef = useRef(null);
  const localVideoTrackRef = useRef(null);

  const publishingInteractionRef = useRef(false);
  const activeInteractionIdRef = useRef(null);

  useEffect(() => {
    liveInfoRef.current = liveInfo;
  }, [liveInfo]);

  // =====================================================
  // GRAPHQL: JOIN LIVE
  // =====================================================

  const [joinLive] = useLazyQuery(JOIN_LIVE_STREAM, {
    fetchPolicy: "network-only",
    errorPolicy: "none",
  });

  const joinLiveRef = useRef(joinLive);

  useEffect(() => {
    joinLiveRef.current = joinLive;
  }, [joinLive]);

  // =====================================================
  // GRAPHQL: INTERACTION
  // =====================================================

  const [createInteractionRequest] = useMutation(
    CREATE_LIVE_INTERACTION_REQUEST,
  );

  const [endInteractionRequest] = useMutation(END_LIVE_INTERACTION);

  const {
    data: interactionData,
    loading: interactionQueryLoading,
    refetch: refetchInteraction,
  } = useQuery(GET_MY_LIVE_INTERACTION, {
    variables: {
      liveStreamId: liveInfo?.id || "",
    },
    skip: !liveInfo?.id || streamEnded,
    fetchPolicy: "network-only",
    pollInterval: liveInfo?.id && !streamEnded ? 3000 : 0,
    errorPolicy: "all",
  });

  const interactionSession = interactionData?.getMyLiveInteraction ?? null;

  const interactionRequest = interactionSession?.request ?? null;

  // =====================================================
  // GRAPHQL: GIFTS
  // =====================================================

  const {
    data: giftData,
    loading: giftsLoading,
    error: giftsError,
    refetch: refetchGifts,
  } = useQuery(GET_LIVE_GIFTS, {
    fetchPolicy: "cache-and-network",
    errorPolicy: "all",
  });

  const gifts = giftData?.getLiveGifts ?? [];

  const getGiftImage = (gift) => gift?.icon || gift?.image || "";

  const getGiftPrice = (gift) => Number(gift?.price ?? gift?.amount ?? 0);

  const selectedGift = gifts.find(
    (gift) => String(gift.id) === String(selectedGiftId),
  );

  const quantityNumber = giftQuantity === "" ? 0 : Number(giftQuantity);

  const totalGiftCoins = selectedGift
    ? getGiftPrice(selectedGift) * quantityNumber
    : 0;

  // =====================================================
  // GRAPHQL: LIVE STATUS
  // =====================================================

  const [getLiveStatus] = useLazyQuery(GET_LIVE_STATUS, {
    fetchPolicy: "network-only",
    errorPolicy: "all",
  });

  const [sendLiveGift] = useMutation(SEND_LIVE_GIFT);

  const [leaveLiveStream, { loading: leavingLive }] =
    useMutation(LEAVE_LIVE_STREAM);

  // =====================================================
  // GRAPHQL: FOLLOW
  // =====================================================

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

  const { data: followersData, refetch: refetchFollowersCount } = useQuery(
    GET_ASTROLOGER_FOLLOWERS_COUNT,
    {
      variables: {
        astrologerId: astrologerId || "",
      },
      skip: !astrologerId,
      fetchPolicy: "network-only",
      errorPolicy: "all",
    },
  );

  const [followAstrologer, { loading: followingLoading }] =
    useMutation(FOLLOW_ASTROLOGER);

  const [unfollowAstrologer, { loading: unfollowingLoading }] =
    useMutation(UNFOLLOW_ASTROLOGER);

  const isFollowing = followingData?.isFollowing?.isFollowing ?? false;

  const totalFollowers =
    followersData?.getAstrologerFollowersCount?.totalFollowers ?? 0;

  const followActionLoading = followingLoading || unfollowingLoading;

  // =====================================================
  // HELPERS
  // =====================================================

  const isCurrentGeneration = useCallback((generation) => {
    return mountedRef.current && generationRef.current === generation;
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
      throw new Error("Live stream not found or has already ended.");
    }

    if (!live.id) {
      throw new Error("Stream database ID is missing from joinLive response.");
    }

    if (
      !live.appId ||
      !live.channelName ||
      !live.rtcToken ||
      live.uid == null
    ) {
      throw new Error("Required Agora RTC configuration is missing.");
    }

    if (
      !live.chatAppKey ||
      !live.chatUserId ||
      !live.chatToken ||
      !live.chatRoomId
    ) {
      throw new Error("Required Agora Chat configuration is missing.");
    }

    return true;
  }, []);

  // =====================================================
  // STOP INTERACTION
  // =====================================================

  const stopInteractionPublishing = useCallback(async () => {
    const rtcClient = agoraClientRef.current;

    const audioTrack = localAudioTrackRef.current;
    const videoTrack = localVideoTrackRef.current;

    const tracks = [audioTrack, videoTrack].filter(Boolean);

    try {
      if (rtcClient && tracks.length > 0) {
        try {
          await rtcClient.unpublish(tracks);
        } catch (err) {
          console.warn("Unable to unpublish interaction tracks:", err);
        }
      }

      if (audioTrack) {
        try {
          audioTrack.stop();
          audioTrack.close();
        } catch (err) {
          console.warn("Audio cleanup error:", err);
        }

        localAudioTrackRef.current = null;
      }

      if (videoTrack) {
        try {
          videoTrack.stop();
          videoTrack.close();
        } catch (err) {
          console.warn("Video cleanup error:", err);
        }

        localVideoTrackRef.current = null;
      }

      if (guestVideoRef.current) {
        guestVideoRef.current.innerHTML = "";
      }

      if (rtcClient && !streamEnded) {
        try {
          await rtcClient.setClientRole("audience");
        } catch (err) {
          console.warn("Unable to switch back to audience:", err);
        }
      }
    } finally {
      publishingInteractionRef.current = false;
      activeInteractionIdRef.current = null;

      if (mountedRef.current) {
        setIsInteractionPublishing(false);
      }
    }
  }, [streamEnded]);

  // =====================================================
  // START AUDIO / VIDEO PUBLISHING
  // =====================================================

  const startInteractionPublishing = useCallback(
    async (session) => {
      const rtcClient = agoraClientRef.current;
      const AgoraRTC = agoraRTCRef.current;

      if (!rtcClient || !AgoraRTC || !session) {
        throw new Error("Agora RTC connection is unavailable.");
      }

      const request = session.request;

      if (request?.status !== "ACCEPTED") {
        return;
      }

      if (
        activeInteractionIdRef.current === request.id ||
        publishingInteractionRef.current
      ) {
        return;
      }

      if (!session.rtcToken || !session.channelName || session.uid == null) {
        throw new Error("Publisher RTC configuration is missing.");
      }

      if (Number(session.uid) !== Number(liveInfoRef.current?.uid)) {
        throw new Error(
          "Interaction UID does not match your live viewer UID. Please reconnect.",
        );
      }

      if (session.channelName !== liveInfoRef.current?.channelName) {
        throw new Error(
          "Interaction channel does not match the current live stream.",
        );
      }

      publishingInteractionRef.current = true;

      try {
        // Switch audience to host.
        await rtcClient.setClientRole("host");

        // Renew publisher token.
        await rtcClient.renewToken(session.rtcToken);

        // Create microphone.
        const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();

        localAudioTrackRef.current = audioTrack;

        const tracksToPublish = [audioTrack];

        // Create camera only for video calls.
        if (request.interactionType === "VIDEO") {
          const videoTrack = await AgoraRTC.createCameraVideoTrack();

          localVideoTrackRef.current = videoTrack;

          tracksToPublish.push(videoTrack);

          if (guestVideoRef.current) {
            guestVideoRef.current.innerHTML = "";
            videoTrack.play(guestVideoRef.current);
          }
        }

        await rtcClient.publish(tracksToPublish);

        activeInteractionIdRef.current = request.id;

        if (mountedRef.current) {
          setInteractionType(request.interactionType);
          setInteractionStatus("ACCEPTED");
          setInteractionPanelOpen(true);
          setIsInteractionPublishing(true);

          setInteractionNotice(
            request.interactionType === "VIDEO"
              ? "You are connected through video."
              : "You are connected through audio.",
          );
        }
      } catch (err) {
        console.error("Unable to start interaction:", err);

        await stopInteractionPublishing();

        throw err;
      } finally {
        publishingInteractionRef.current = false;
      }
    },
    [stopInteractionPublishing],
  );

  // =====================================================
  // REQUEST AUDIO / VIDEO INTERACTION
  // =====================================================

  const handleRequestInteraction = async (requestedType = interactionType) => {
    if (!liveInfo?.id || streamEnded) {
      return;
    }

    if (
      interactionStatus === "PENDING" ||
      interactionStatus === "ACCEPTED" ||
      isInteractionPublishing ||
      interactionLoading
    ) {
      return;
    }

    try {
      setInteractionLoading(true);
      setInteractionNotice("");
      setInteractionType(requestedType);
      setInteractionPanelOpen(true);

      const response = await createInteractionRequest({
        variables: {
          liveStreamId: liveInfo.id,
          interactionType: requestedType,
        },
      });

      const result = response?.data?.createLiveInteractionRequest;

      if (!result?.id) {
        throw new Error("Unable to create interaction request.");
      }

      setInteractionStatus(result.status);

      setInteractionNotice(
        result.status === "PENDING"
          ? `Your ${requestedType.toLowerCase()} call request has been sent. Waiting for astrologer's approval.`
          : `Request status: ${result.status}`,
      );

      await refetchInteraction();
    } catch (err) {
      console.error("Interaction request error:", err);

      setInteractionNotice(getErrorMessage(err));
    } finally {
      setInteractionLoading(false);
    }
  };

  // =====================================================
  // WATCH INTERACTION STATUS
  // =====================================================

  useEffect(() => {
    if (!interactionRequest || streamEnded) {
      return;
    }

    const status = interactionRequest.status;

    setInteractionStatus(status);

    if (status === "ACCEPTED") {
      setInteractionPanelOpen(true);

      if (
        activeInteractionIdRef.current === interactionRequest.id ||
        publishingInteractionRef.current
      ) {
        return;
      }

      void startInteractionPublishing(interactionSession).catch((err) => {
        console.error("Interaction publishing error:", err);

        setInteractionNotice(getErrorMessage(err));
      });

      return;
    }

    if (status === "REJECTED" || status === "CANCELLED" || status === "ENDED") {
      void stopInteractionPublishing();

      const statusMessages = {
        REJECTED: "The astrologer has rejected your call request.",
        CANCELLED: "Your call request has been cancelled.",
        ENDED: "Your interaction with the astrologer has ended.",
      };

      setInteractionNotice(statusMessages[status] || "");
    }
  }, [
    interactionRequest,
    interactionSession,
    streamEnded,
    startInteractionPublishing,
    stopInteractionPublishing,
    getErrorMessage,
  ]);

  // =====================================================
  // END INTERACTION
  // =====================================================

  const handleEndInteraction = async () => {
    if (!interactionRequest?.id || interactionLoading) {
      return;
    }

    try {
      setInteractionLoading(true);
      setInteractionNotice("");

      await stopInteractionPublishing();

      const response = await endInteractionRequest({
        variables: {
          requestId: interactionRequest.id,
        },
      });

      const result = response?.data?.endLiveInteraction;

      if (!result) {
        throw new Error("Unable to end interaction.");
      }

      setInteractionStatus(result.status);

      setInteractionNotice("You have left the interaction.");

      await refetchInteraction();
    } catch (err) {
      console.error("End interaction error:", err);

      setInteractionNotice(getErrorMessage(err));
    } finally {
      setInteractionLoading(false);
    }
  };

  // =====================================================
  // FOLLOW / UNFOLLOW
  // =====================================================

  const handleFollowToggle = async () => {
    if (!astrologerId) {
      setFollowNotice("Astrologer information is unavailable.");
      return;
    }

    if (followActionLoading || followingStatusLoading) {
      return;
    }

    try {
      setFollowNotice("");

      const action = isFollowing ? unfollowAstrologer : followAstrologer;

      const resultKey = isFollowing ? "unfollowAstrologer" : "followAstrologer";

      const response = await action({
        variables: {
          astrologerId,
        },
      });

      const result = response?.data?.[resultKey];

      if (!result?.success) {
        throw new Error(result?.message || "Unable to update follow status.");
      }

      setFollowNotice(
        result.message ||
          (isFollowing
            ? "You have unfollowed the astrologer."
            : "You are now following the astrologer."),
      );

      await Promise.all([refetchFollowingStatus(), refetchFollowersCount()]);
    } catch (err) {
      console.error("Follow/unfollow error:", err);

      setFollowNotice(getErrorMessage(err));
    }
  };

  // =====================================================
  // CHAT AUTO SCROLL
  // =====================================================

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  // =====================================================
  // INCOMING CHAT MESSAGES
  // =====================================================

  const handleIncomingTextMessage = useCallback((msg) => {
    if (!mountedRef.current) return;

    const rawMessage = msg?.msg || "";
    const currentLive = liveInfoRef.current;

    const isOwnMessage =
      currentLive?.chatUserId && msg?.from === currentLive.chatUserId;

    let payload = null;

    try {
      payload = JSON.parse(rawMessage);
    } catch {
      // Normal text message.
    }

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
              payload.senderName || payload.sender || msg?.from || "User",
            giftName: payload.giftName || "Gift",
            giftIcon: payload.icon || payload.giftIcon || "🎁",
            quantity: Number(payload.quantity) || 1,
            totalCoins: payload.totalCoins,
          },
        ];
      });

      return;
    }

    if (isOwnMessage) return;

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

  // =====================================================
  // DISPOSE AGORA CLIENTS
  // =====================================================

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
            console.warn("Unable to leave chat room:", err?.message);
          }
        }

        try {
          await chatClient.close();
        } catch (err) {
          console.warn("Unable to close Agora Chat:", err?.message);
        }
      }

      if (rtcClient) {
        try {
          rtcClient.removeAllListeners();
        } catch {}

        try {
          await rtcClient.leave();
        } catch {}
      }
    },
    [],
  );

  // =====================================================
  // CLEANUP
  // =====================================================

  const cleanup = useCallback(async () => {
    const audioTrack = localAudioTrackRef.current;
    const videoTrack = localVideoTrackRef.current;

    if (audioTrack) {
      try {
        audioTrack.stop();
        audioTrack.close();
      } catch (err) {
        console.warn(err);
      }

      localAudioTrackRef.current = null;
    }

    if (videoTrack) {
      try {
        videoTrack.stop();
        videoTrack.close();
      } catch (err) {
        console.warn(err);
      }

      localVideoTrackRef.current = null;
    }

    if (guestVideoRef.current) {
      guestVideoRef.current.innerHTML = "";
    }

    publishingInteractionRef.current = false;
    activeInteractionIdRef.current = null;

    if (mountedRef.current) {
      setIsInteractionPublishing(false);
    }

    const rtcClient = agoraClientRef.current;
    const chatClient = chatClientRef.current;
    const roomId = chatRoomIdRef.current;

    await disposeLocalClients(chatClient, rtcClient, roomId);

    pendingVideoTrackRef.current = null;

    if (remoteVideoRef.current) {
      remoteVideoRef.current.innerHTML = "";
    }
  }, [disposeLocalClients]);

  // =====================================================
  // AUTOMATIC STREAM END
  // =====================================================

  const handleStreamEnded = useCallback(
    async (generation) => {
      if (endingRef.current || !isCurrentGeneration(generation)) {
        return;
      }

      endingRef.current = true;
      leavingRef.current = true;

      setStreamEnded(true);
      setHostJoined(false);
      setGiftPanelOpen(false);
      setInteractionPanelOpen(false);
      setSelectedGiftId("");
      setGiftNotice("");
      setError("");

      generationRef.current++;

      try {
        try {
          await leaveLiveStream({
            variables: {
              channelName,
            },
          });
        } catch (err) {
          console.error("Failed to record viewer leaving:", err);
        }

        await cleanup();
      } catch (err) {
        console.error("Ended-stream cleanup error:", err);
      } finally {
        if (mountedRef.current) {
          redirectTimeoutRef.current = setTimeout(() => {
            if (mountedRef.current) {
              router.push("/astrologer/liveStream");
            }
          }, 3000);
        }
      }
    },
    [channelName, cleanup, isCurrentGeneration, leaveLiveStream, router],
  );

  // =====================================================
  // SUBSCRIBE TO ASTROLOGER VIDEO / AUDIO
  // =====================================================

  const subscribeToUser = useCallback(
    async (user, mediaType, generation) => {
      const client = agoraClientRef.current;

      if (!client || !isCurrentGeneration(generation)) {
        return;
      }

      try {
        await client.subscribe(user, mediaType);

        if (!isCurrentGeneration(generation)) {
          return;
        }

        if (mediaType === "video") {
          if (!user.videoTrack) return;

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
          setHostJoined(true);
        }
      } catch (err) {
        console.error(`Agora ${mediaType} subscription failed:`, err);

        if (isCurrentGeneration(generation)) {
          setError(
            `Unable to receive astrologer's ${mediaType}. Please reconnect.`,
          );
        }
      }
    },
    [isCurrentGeneration],
  );

  // =====================================================
  // INITIALIZE LIVE
  // =====================================================

  const initializeLive = useCallback(
    async (generation) => {
      let localRtcClient = null;
      let localChatClient = null;
      let localChatRoomId = null;

      try {
        if (!isCurrentGeneration(generation)) return;

        endingRef.current = false;
        leavingRef.current = false;

        setStreamEnded(false);
        setGiftPanelOpen(false);
        setInteractionPanelOpen(false);
        setLoading(true);
        setError("");
        setHostJoined(false);
        setLiveInfo(null);
        setMessages([]);
        setFollowNotice("");
        setInteractionNotice("");
        setInteractionStatus(null);

        liveInfoRef.current = null;

        if (!channelName) {
          throw new Error("Live stream channel name is missing.");
        }

        const [{ default: AgoraRTC }, { default: AgoraChat }] =
          await Promise.all([import("agora-rtc-sdk-ng"), import("agora-chat")]);

        if (!isCurrentGeneration(generation)) return;

        agoraRTCRef.current = AgoraRTC;
        agoraChatRef.current = AgoraChat;

        const response = await joinLiveRef.current({
          variables: {
            channelName,
          },
        });

        if (!isCurrentGeneration(generation)) return;

        const live = response?.data?.joinLive;

        isValidLiveResponse(live);

        setLiveInfo(live);
        liveInfoRef.current = live;

        localChatRoomId = live.chatRoomId;
        chatRoomIdRef.current = live.chatRoomId;

        // Create RTC client.
        const rtcClient = AgoraRTC.createClient({
          mode: "live",
          codec: "vp8",
        });

        localRtcClient = rtcClient;
        agoraClientRef.current = rtcClient;

        rtcClient.on("user-published", async (user, mediaType) => {
          await subscribeToUser(user, mediaType, generation);
        });

        rtcClient.on("user-joined", (user) => {
          console.log("Remote user joined:", user.uid);
        });

        rtcClient.on("user-unpublished", (user, mediaType) => {
          if (!isCurrentGeneration(generation)) return;

          if (mediaType === "video") {
            setHostJoined(false);
            pendingVideoTrackRef.current = null;
          }
        });

        // Astrologer leaves.
        rtcClient.on("user-left", async (user, reason) => {
          console.log("Agora user left:", user?.uid, reason);

          if (!isCurrentGeneration(generation)) return;

          setHostJoined(false);
          pendingVideoTrackRef.current = null;

          try {
            const chatRoomId = chatRoomIdRef.current;

            if (!chatRoomId) return;

            await new Promise((resolve) => setTimeout(resolve, 5000));

            if (!isCurrentGeneration(generation)) return;

            const { data, errors } = await getLiveStatus({
              variables: {
                chatRoomId: String(chatRoomId),
              },
            });

            if (!isCurrentGeneration(generation)) return;

            if (errors?.length) {
              console.error(errors);
              return;
            }

            const statusResponse = data?.getLiveStatus;

            if (!statusResponse?.success) return;

            const status = statusResponse.data?.status;

            if (status === "ENDED") {
              await handleStreamEnded(generation);
            } else if (status === "LIVE") {
              console.log("Live session is still active.");
            }
          } catch (err) {
            console.error("Error checking live status:", err);
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

        // Agora Chat.
        const chatClient = new AgoraChat.connection({
          appKey: live.chatAppKey,
        });

        localChatClient = chatClient;
        chatClientRef.current = chatClient;

        chatClient.addEventHandler(`LIVE_CHAT_${generation}`, {
          onTextMessage: handleIncomingTextMessage,

          onError: (chatError) => {
            console.error("Agora Chat error:", chatError);
          },

          onConnected: () => {
            console.log("Agora Chat connected.");
          },

          onDisconnected: () => {
            console.log("Agora Chat disconnected.");
          },
        });

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

        // Subscribe to existing host tracks.
        for (const user of rtcClient.remoteUsers) {
          if (!isCurrentGeneration(generation)) break;

          if (user.hasVideo) {
            await subscribeToUser(user, "video", generation);
          }

          if (user.hasAudio) {
            await subscribeToUser(user, "audio", generation);
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
      getLiveStatus,
      handleIncomingTextMessage,
      handleStreamEnded,
      isCurrentGeneration,
      isValidLiveResponse,
      subscribeToUser,
    ],
  );

  // =====================================================
  // LIVE LIFECYCLE
  // =====================================================

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

      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
        redirectTimeoutRef.current = null;
      }

      void cleanup();
    };
  }, [channelName, initializeLive, cleanup]);

  // =====================================================
  // PLAY PENDING VIDEO
  // =====================================================

  useEffect(() => {
    if (
      !loading &&
      liveInfo &&
      pendingVideoTrackRef.current &&
      remoteVideoRef.current
    ) {
      try {
        remoteVideoRef.current.innerHTML = "";

        pendingVideoTrackRef.current.play(remoteVideoRef.current);

        pendingVideoTrackRef.current = null;

        setHostJoined(true);
        setError("");
      } catch (err) {
        console.error("Unable to play remote video:", err);

        setError("Unable to play the astrologer's video.");
      }
    }
  }, [loading, liveInfo]);

  // =====================================================
  // SEND CHAT MESSAGE
  // =====================================================

  const sendMessage = async () => {
    const trimmedMessage = message.trim();

    if (!trimmedMessage || !liveInfo || streamEnded) {
      return;
    }

    const chatClient = chatClientRef.current;
    const AgoraChat = agoraChatRef.current;

    if (!chatClient || !AgoraChat) {
      setError("Agora Chat is not connected. Please reconnect.");
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

  // =====================================================
  // SEND GIFT
  // =====================================================

  const handleSendGift = async () => {
    if (streamEnded) return;

    if (!liveInfo?.id) {
      setGiftNotice("Stream database ID is missing.");
      return;
    }

    if (!selectedGiftId) {
      setGiftNotice("Please select a gift.");
      return;
    }

    const quantity = Number(giftQuantity);

    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 100) {
      setGiftNotice("Quantity must be between 1 and 100.");
      return;
    }

    if (sendingGift) return;

    try {
      setSendingGift(true);
      setGiftNotice("");

      const response = await sendLiveGift({
        variables: {
          streamId: liveInfo.id,
          giftId: selectedGiftId,
          quantity,
        },
      });

      const result = response?.data?.sendLiveGift;

      if (!result?.success) {
        throw new Error(result?.message || "Gift transaction failed.");
      }

      const sentName = result.giftName || selectedGift?.name || "Gift";

      const sentQuantity = Number(result.quantity ?? quantity);

      const coins = Number(result.totalCoins ?? totalGiftCoins);

      const balance = Number(result.userBalance);

      const balanceMessage =
        result.userBalance != null && Number.isFinite(balance)
          ? ` Remaining wallet balance: ${balance} coins.`
          : "";

      setGiftNotice(
        `Successfully sent ${sentName} × ${sentQuantity} for ${coins} coins.${balanceMessage}`,
      );

      setSelectedGiftId("");
      setGiftQuantity(1);

      await refetchGifts();
    } catch (err) {
      console.error("Send gift error:", err);
      setGiftNotice(getErrorMessage(err));
    } finally {
      setSendingGift(false);
    }
  };

  // =====================================================
  // LEAVE LIVE
  // =====================================================

  const handleLeaveLive = async () => {
    if (leavingRef.current || leavingLive || streamEnded) {
      return;
    }

    leavingRef.current = true;

    try {
      if (interactionRequest?.id) {
        try {
          await stopInteractionPublishing();

          await endInteractionRequest({
            variables: {
              requestId: interactionRequest.id,
            },
          });
        } catch (err) {
          console.warn("Unable to end interaction:", err);
        }
      }

      await leaveLiveStream({
        variables: {
          channelName,
        },
      });
    } catch (err) {
      console.error("Failed to leave live:", err);
    } finally {
      generationRef.current++;

      await cleanup();

      router.push("/astrologer/liveStream");
    }
  };

  // =====================================================
  // GIFT QUANTITY
  // =====================================================

  const decreaseGiftQuantity = () => {
    setGiftQuantity((previous) => {
      const current = Number(previous) || 1;
      return Math.max(1, current - 1);
    });

    setGiftNotice("");
  };

  const increaseGiftQuantity = () => {
    setGiftQuantity((previous) => {
      const current = Number(previous) || 1;
      return Math.min(100, current + 1);
    });

    setGiftNotice("");
  };

  // =====================================================
  // UI DATA
  // =====================================================

  const astrologerName =
    liveInfo?.astrologer?.displayName ||
    liveInfo?.astrologer?.name ||
    liveInfo?.astrologerName ||
    "Astrologer";

  const astrologerProfilePic =
    liveInfo?.astrologer?.profilePic || liveInfo?.profilePic || "";

  const canRequestInteraction =
    !streamEnded &&
    interactionStatus !== "PENDING" &&
    interactionStatus !== "ACCEPTED" &&
    !isInteractionPublishing &&
    !interactionLoading;

  // =====================================================
  // MAIN UI
  // =====================================================

  return (
    <div className="relative flex min-h-[70vh] w-full flex-col bg-black text-white lg:flex-row">
      {/* ============================================
          VIDEO SECTION
      ============================================ */}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* HEADER */}

        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-gray-800 bg-black/90 px-4 py-3 backdrop-blur">
          <div className="flex items-center gap-3">
            <span className="animate-pulse rounded-full bg-red-600 px-3 py-1 text-sm font-semibold">
              🔴 LIVE
            </span>

            <div>
              <h2 className="text-lg font-semibold">Live Session</h2>

              <p className="text-xs text-gray-400">Watch astrologer live</p>
            </div>
          </div>

          <span className="rounded-full bg-gray-800 px-3 py-1 text-xs">
            {hostJoined ? "● Connected" : loading ? "Connecting..." : "Waiting"}
          </span>
        </div>

        <div className="flex flex-col p-2 sm:p-4">
          {/* LOADING */}

          {loading && (
            <div className="flex min-h-[400px] items-center justify-center">
              <div className="text-center">
                <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-yellow-500 border-t-transparent" />

                <p className="text-lg">Connecting to live stream...</p>

                <p className="mt-2 text-sm text-gray-400">
                  Please wait while we connect you.
                </p>
              </div>
            </div>
          )}

          {/* ERROR */}

          {error && !loading && (
            <div className="mb-4 rounded-xl bg-red-600 p-4">
              <p>{error}</p>

              {!liveInfo && (
                <button
                  type="button"
                  onClick={() => {
                    setError("");
                    setLoading(true);

                    const generation = ++generationRef.current;

                    void initializeLive(generation);
                  }}
                  className="mt-3 rounded-lg bg-white px-4 py-2 font-semibold text-red-600"
                >
                  Try Again
                </button>
              )}
            </div>
          )}

          {/* LIVE VIDEO */}

          {!loading && liveInfo && (
            <>
              {!hostJoined && (
                <div className="mb-3 rounded-xl bg-yellow-500 p-3 text-center font-medium text-black">
                  Waiting for astrologer video...
                </div>
              )}

              <div className="relative isolate h-[65vh] min-h-[450px] w-full overflow-hidden rounded-xl bg-black sm:h-[75vh]">
                {/* REMOTE VIDEO */}

                <div
                  ref={remoteVideoRef}
                  id="remote-video"
                  className="absolute inset-0 z-0 h-full w-full bg-black"
                />

                {/* ASTROLOGER HEADER */}

                <div className="absolute left-0 right-0 top-0 z-20 flex flex-wrap items-start justify-between gap-3 bg-gradient-to-b from-black/90 to-transparent p-3 pr-14 sm:p-4 sm:pr-16">
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

                      <p className="text-xs text-gray-300">Live Consultation</p>

                      <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
                        <span>
                          👁️{" "}
                          {Number(liveInfo.totalViews ?? 0).toLocaleString(
                            "en-IN",
                          )}{" "}
                          views
                        </span>

                        <span>
                          👥 {Number(totalFollowers).toLocaleString("en-IN")}{" "}
                          followers
                        </span>
                      </div>
                    </div>
                  </div>

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
                      className={`rounded-full px-4 py-2 text-sm font-semibold disabled:opacity-50 ${
                        isFollowing
                          ? "border border-gray-500 bg-gray-800 text-white"
                          : "bg-yellow-500 text-black"
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

                  {followNotice && (
                    <p className="w-full text-sm text-yellow-300">
                      {followNotice}
                    </p>
                  )}
                </div>

                {/* USER CAMERA PREVIEW */}

                {/* USER CAMERA PREVIEW */}

                <div
                  className={`absolute right-4 top-28 z-30 h-36 w-28 overflow-hidden rounded-xl border-2 border-yellow-400 bg-black shadow-xl sm:h-44 sm:w-36 ${
                    isInteractionPublishing && interactionType === "VIDEO"
                      ? "block"
                      : "hidden"
                  }`}
                >
                  <div ref={guestVideoRef} className="h-full w-full" />

                  <span className="absolute bottom-1 left-1 rounded bg-black/70 px-2 py-1 text-xs">
                    You
                  </span>
                </div>

                {/* ==================================
                    CALL REQUEST MODAL
                ================================== */}

                {interactionPanelOpen && (
                  <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/65 p-3 backdrop-blur-sm sm:p-5">
                    <div className="w-full max-w-md overflow-hidden rounded-2xl border border-gray-700 bg-gray-950 shadow-2xl">
                      {/* MODAL HEADER */}

                      <div className="flex items-center justify-between border-b border-gray-800 p-4">
                        <div>
                          <h3 className="text-lg font-bold">
                            {isInteractionPublishing
                              ? "Call Connected"
                              : interactionStatus === "PENDING"
                                ? "Waiting for Astrologer"
                                : "Live Consultation"}
                          </h3>

                          <p className="mt-1 text-xs text-gray-400">
                            {astrologerName}
                          </p>
                        </div>

                        {!isInteractionPublishing &&
                          interactionStatus !== "PENDING" && (
                            <button
                              type="button"
                              onClick={() => setInteractionPanelOpen(false)}
                              className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-800 hover:bg-red-600"
                            >
                              ✕
                            </button>
                          )}
                      </div>

                      <div className="p-5">
                        {/* CALL ICON */}

                        <div className="mb-5 flex justify-center">
                          <div className="flex h-20 w-20 items-center justify-center rounded-full border border-yellow-500/30 bg-yellow-500/10 text-4xl">
                            {interactionType === "AUDIO" ? "🎙️" : "📹"}
                          </div>
                        </div>

                        {/* PENDING */}

                        {interactionStatus === "PENDING" &&
                          !isInteractionPublishing && (
                            <div className="text-center">
                              <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-yellow-500 border-t-transparent" />

                              <h4 className="text-lg font-semibold text-yellow-400">
                                Request Sent
                              </h4>

                              <p className="mt-2 text-sm text-gray-400">
                                Waiting for {astrologerName} to accept your{" "}
                                {interactionType.toLowerCase()} call.
                              </p>

                              <p className="mt-4 text-xs text-gray-500">
                                Please keep watching the live session.
                              </p>

                              <button
                                type="button"
                                onClick={handleEndInteraction}
                                disabled={interactionLoading}
                                className="mt-5 w-full rounded-xl border border-gray-700 bg-gray-800 px-4 py-3 text-sm font-semibold hover:bg-gray-700 disabled:opacity-50"
                              >
                                {interactionLoading
                                  ? "Cancelling..."
                                  : "Cancel Request"}
                              </button>
                            </div>
                          )}

                        {/* ACTIVE CALL */}

                        {isInteractionPublishing && (
                          <div className="text-center">
                            <div className="mb-3 text-xl font-bold text-green-400">
                              ✓ Connected Successfully
                            </div>

                            <p className="text-sm text-gray-300">
                              Your {interactionType.toLowerCase()} call with{" "}
                              {astrologerName} is active.
                            </p>

                            {interactionType === "VIDEO" ? (
                              <p className="mt-2 text-xs text-gray-400">
                                Your camera and microphone are connected.
                              </p>
                            ) : (
                              <p className="mt-2 text-xs text-gray-400">
                                Your microphone is connected.
                              </p>
                            )}

                            <button
                              type="button"
                              onClick={handleEndInteraction}
                              disabled={interactionLoading}
                              className="mt-6 w-full rounded-xl bg-red-600 px-5 py-3 font-bold text-white hover:bg-red-700 disabled:opacity-50"
                            >
                              {interactionLoading
                                ? "Ending Call..."
                                : "📞 End Call"}
                            </button>
                          </div>
                        )}

                        {/* NEW REQUEST */}

                        {!isInteractionPublishing &&
                          interactionStatus !== "PENDING" && (
                            <div className="text-center">
                              {interactionNotice && (
                                <p className="mb-4 text-sm text-yellow-300">
                                  {interactionNotice}
                                </p>
                              )}

                              <p className="mb-5 text-sm text-gray-400">
                                Request an audio or video consultation with the
                                astrologer.
                              </p>

                              <div className="grid grid-cols-2 gap-3">
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleRequestInteraction("AUDIO")
                                  }
                                  disabled={!canRequestInteraction}
                                  className="rounded-xl border border-yellow-500/40 bg-yellow-500/10 p-4 text-yellow-300 transition hover:bg-yellow-500/20 disabled:opacity-50"
                                >
                                  <span className="block text-3xl">🎙️</span>

                                  <span className="mt-2 block font-semibold">
                                    Audio Call
                                  </span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleRequestInteraction("VIDEO")
                                  }
                                  disabled={!canRequestInteraction}
                                  className="rounded-xl border border-blue-500/40 bg-blue-500/10 p-4 text-blue-300 transition hover:bg-blue-500/20 disabled:opacity-50"
                                >
                                  <span className="block text-3xl">📹</span>

                                  <span className="mt-2 block font-semibold">
                                    Video Call
                                  </span>
                                </button>
                              </div>

                              {interactionLoading && (
                                <p className="mt-4 text-sm text-yellow-400">
                                  Sending request...
                                </p>
                              )}
                            </div>
                          )}
                      </div>
                    </div>
                  </div>
                )}

                {/* ==================================
                    GIFT PANEL
                ================================== */}

                {giftPanelOpen && (
                  <div
                    role="dialog"
                    aria-label="Send a gift"
                    className="absolute bottom-20 right-3 z-50 max-h-[65%] w-[calc(100%-24px)] max-w-[360px] overflow-y-auto rounded-2xl border border-white/10 bg-gray-950/95 p-4 shadow-2xl backdrop-blur-md"
                  >
                    <div className="mb-4 flex items-center justify-between border-b border-gray-800 pb-3">
                      <div>
                        <h3 className="text-lg font-bold">🎁 Send a Gift</h3>

                        <p className="mt-1 text-xs text-gray-400">
                          Support the astrologer.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setGiftPanelOpen(false)}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-800"
                      >
                        ✕
                      </button>
                    </div>

                    {giftsLoading && gifts.length === 0 && (
                      <p className="py-6 text-center text-sm text-gray-300">
                        Loading gifts...
                      </p>
                    )}

                    {giftsError && gifts.length === 0 && (
                      <div className="text-sm text-red-300">
                        Unable to load gifts.
                        <button
                          type="button"
                          onClick={() => void refetchGifts()}
                          className="ml-2 text-yellow-400"
                        >
                          Try again
                        </button>
                      </div>
                    )}

                    {gifts.length > 0 && (
                      <>
                        <div className="grid grid-cols-3 gap-2">
                          {gifts.map((gift) => {
                            const isSelected =
                              String(selectedGiftId) === String(gift.id);

                            const image = getGiftImage(gift);

                            const imageUrl = image
                              ? image.startsWith("http")
                                ? image
                                : `${process.env.NEXT_PUBLIC_BASE_URL}${image}`
                              : "";

                            return (
                              <button
                                type="button"
                                key={gift.id}
                                onClick={() => {
                                  setSelectedGiftId(gift.id);
                                  setGiftNotice("");
                                }}
                                className={`relative flex min-h-[105px] flex-col items-center justify-center rounded-xl border p-2 text-center ${
                                  isSelected
                                    ? "border-yellow-400 bg-yellow-500/20 ring-2 ring-yellow-400/40"
                                    : "border-gray-700 bg-gray-900"
                                }`}
                              >
                                {imageUrl ? (
                                  <img
                                    src={imageUrl}
                                    alt={gift.name}
                                    className="h-10 w-10 object-contain"
                                  />
                                ) : (
                                  <span className="text-3xl">🎁</span>
                                )}

                                <span className="mt-2 text-xs font-semibold">
                                  {gift.name}
                                </span>

                                <span className="mt-1 text-xs text-yellow-400">
                                  {getGiftPrice(gift)} coins
                                </span>
                              </button>
                            );
                          })}
                        </div>

                        {selectedGift && (
                          <div className="mt-4 rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-3">
                            <p className="font-semibold">{selectedGift.name}</p>

                            <p className="text-sm text-yellow-400">
                              {getGiftPrice(selectedGift)} coins each
                            </p>

                            <div className="mt-4 flex items-center justify-between">
                              <span className="text-sm text-gray-300">
                                Quantity
                              </span>

                              <div className="flex items-center gap-3">
                                <button
                                  type="button"
                                  onClick={decreaseGiftQuantity}
                                  disabled={sendingGift || quantityNumber <= 1}
                                  className="h-9 w-9 rounded-lg bg-gray-800 text-lg disabled:opacity-40"
                                >
                                  −
                                </button>

                                <input
                                  type="number"
                                  min="1"
                                  max="100"
                                  value={giftQuantity}
                                  disabled={sendingGift}
                                  onChange={(event) => {
                                    const raw = event.target.value;

                                    if (raw === "") {
                                      setGiftQuantity("");
                                      return;
                                    }

                                    const value = Number(raw);

                                    if (
                                      Number.isInteger(value) &&
                                      value >= 1 &&
                                      value <= 100
                                    ) {
                                      setGiftQuantity(value);
                                    }
                                  }}
                                  onBlur={() => {
                                    const value = Number(giftQuantity);

                                    if (
                                      !Number.isInteger(value) ||
                                      value < 1 ||
                                      value > 100
                                    ) {
                                      setGiftQuantity(1);
                                    }
                                  }}
                                  className="w-14 rounded-lg border border-gray-700 bg-gray-900 p-2 text-center"
                                />

                                <button
                                  type="button"
                                  onClick={increaseGiftQuantity}
                                  disabled={
                                    sendingGift || quantityNumber >= 100
                                  }
                                  className="h-9 w-9 rounded-lg bg-gray-800 text-lg disabled:opacity-40"
                                >
                                  +
                                </button>
                              </div>
                            </div>

                            <div className="mt-4 flex justify-between border-t border-yellow-500/20 pt-3">
                              <span className="text-sm text-gray-300">
                                Total
                              </span>

                              <span className="font-bold text-yellow-400">
                                {totalGiftCoins.toLocaleString("en-IN")} coins
                              </span>
                            </div>
                          </div>
                        )}

                        {giftNotice && (
                          <div className="mt-3 rounded-lg bg-gray-900 p-3 text-sm text-yellow-300">
                            {giftNotice}
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={handleSendGift}
                          disabled={
                            sendingGift ||
                            !selectedGiftId ||
                            !Number.isInteger(quantityNumber) ||
                            quantityNumber < 1 ||
                            quantityNumber > 100
                          }
                          className="mt-4 w-full rounded-xl bg-gradient-to-r from-yellow-500 to-amber-400 px-4 py-3 font-bold text-black disabled:opacity-50"
                        >
                          {sendingGift
                            ? "Sending Gift..."
                            : `🎁 Send Gift${selectedGift ? ` · ${totalGiftCoins} coins` : ""}`}
                        </button>

                        <p className="mt-2 text-center text-xs text-gray-500">
                          Your wallet will be charged after successful gifting.
                        </p>
                      </>
                    )}
                  </div>
                )}

                {/* ==================================
                    BOTTOM CONTROLS
                ================================== */}

                <div className="absolute bottom-0 left-0 right-0 z-30 bg-gradient-to-t from-black via-black/90 to-transparent px-3 pb-4 pt-12 sm:px-5">
                  <div className="flex items-center justify-between gap-2">
                    {/* LIVE STATUS */}

                    <div className="hidden items-center gap-2 text-sm text-gray-300 sm:flex">
                      <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-red-500" />

                      {hostJoined ? "Live now" : "Connecting..."}
                    </div>

                    {/* AUDIO / VIDEO / GIFT */}

                    <div className="flex flex-1 items-center justify-center gap-2 sm:gap-4">
                      {/* AUDIO CALL */}

                      <button
                        type="button"
                        onClick={() => {
                          setInteractionType("AUDIO");
                          setInteractionPanelOpen(true);
                          setInteractionNotice("");
                        }}
                        disabled={
                          streamEnded ||
                          interactionStatus === "PENDING" ||
                          interactionStatus === "ACCEPTED" ||
                          isInteractionPublishing
                        }
                        title="Audio Call"
                        className="flex flex-col items-center justify-center gap-1 rounded-xl border border-white/20 bg-gray-900/90 px-4 py-2 text-white shadow-lg transition hover:scale-105 hover:bg-yellow-600 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <span className="text-2xl">🎙️</span>

                        <span className="text-[11px] font-semibold sm:text-xs">
                          Audio Call
                        </span>
                      </button>

                      {/* VIDEO CALL */}

                      <button
                        type="button"
                        onClick={() => {
                          setInteractionType("VIDEO");
                          setInteractionPanelOpen(true);
                          setInteractionNotice("");
                        }}
                        disabled={
                          streamEnded ||
                          interactionStatus === "PENDING" ||
                          interactionStatus === "ACCEPTED" ||
                          isInteractionPublishing
                        }
                        title="Video Call"
                        className="flex flex-col items-center justify-center gap-1 rounded-xl border border-white/20 bg-gray-900/90 px-4 py-2 text-white shadow-lg transition hover:scale-105 hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <span className="text-2xl">📹</span>

                        <span className="text-[11px] font-semibold sm:text-xs">
                          Video Call
                        </span>
                      </button>

                      {/* GIFT */}

                      <button
                        type="button"
                        onClick={() => {
                          setGiftPanelOpen((open) => !open);
                          setGiftNotice("");
                        }}
                        aria-label="Send Gift"
                        className="flex flex-col items-center justify-center gap-1 rounded-xl border border-yellow-400/40 bg-yellow-500 px-4 py-2 text-black shadow-lg transition hover:scale-105 hover:bg-yellow-400"
                      >
                        <span className="text-2xl">🎁</span>

                        <span className="text-[11px] font-bold sm:text-xs">
                          Gift
                        </span>
                      </button>
                    </div>

                    {/* LEAVE LIVE */}

                    <button
                      type="button"
                      onClick={handleLeaveLive}
                      disabled={leavingLive}
                      title="Leave Live"
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-red-500/40 bg-red-600 text-white shadow-lg hover:bg-red-700 disabled:opacity-50"
                    >
                      {leavingLive ? (
                        <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      ) : (
                        <span className="text-xl">✕</span>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* GIFT NOTICE */}

              {giftNotice && !giftPanelOpen && (
                <div className="mt-3 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3 text-sm text-yellow-300">
                  {giftNotice}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ================================================
          RIGHT SIDE CHAT
      ================================================ */}

      <aside className="flex w-full min-w-0 flex-col border-t border-gray-800 bg-gray-950 lg:w-[350px] lg:shrink-0 lg:border-l lg:border-t-0">
        {/* CHAT HEADER */}

        <div className="border-b border-gray-800 px-4 py-3">
          <h3 className="font-semibold">Live Chat</h3>

          <p className="text-xs text-gray-400">Chat with the community</p>
        </div>

        {/* MESSAGES */}

        <div
          ref={chatRef}
          className="h-[300px] space-y-3 overflow-y-auto px-3 py-3 lg:h-[calc(75vh-120px)]"
        >
          {messages.map((item) => (
            <div key={item.id} className="mb-2">
              {item.kind === "gift" ? (
                <div className="inline-flex max-w-full items-center rounded-xl border border-yellow-400/40 bg-yellow-500/10 p-3">
                  <span className="mr-2 text-2xl">{item.giftIcon || "🎁"}</span>

                  <div className="break-words text-sm">
                    <strong className="text-yellow-300">
                      {item.senderName}
                    </strong>

                    {" sent "}

                    <strong>{item.giftName}</strong>

                    {item.quantity > 1 && <span> × {item.quantity}</span>}

                    {item.totalCoins != null && (
                      <div className="mt-1 text-xs text-yellow-300">
                        {Number(item.totalCoins).toLocaleString("en-IN")} coins
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div
                  className={`flex max-w-[95%] flex-col break-words rounded-xl px-3 py-2 ${
                    item.isOwn ? "ml-auto bg-red-900/50" : "bg-gray-800"
                  }`}
                >
                  <span
                    className={`mb-1 font-semibold ${
                      item.isOwn ? "text-green-400" : "text-yellow-400"
                    }`}
                  >
                    {item.isOwn
                      ? "You"
                      : item.senderName
                          ?.split("_")[0]
                          ?.replace(/^./, (char) => char.toUpperCase())}
                  </span>

                  <span className="whitespace-pre-wrap text-sm text-white">
                    {item.message}
                  </span>
                </div>
              )}
            </div>
          ))}

          {messages.length === 0 && (
            <p className="text-sm text-gray-400">Messages will appear here.</p>
          )}
        </div>

        {/* CHAT INPUT */}

        <div className="mt-auto flex items-center gap-2 border-t border-gray-800 bg-black/80 p-3">
          <input
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Write a message..."
            maxLength={1000}
            disabled={!liveInfo || loading || streamEnded}
            className="min-w-0 flex-1 rounded-full bg-gray-900 px-4 py-3 text-white outline-none placeholder:text-gray-500 focus:ring-1 focus:ring-red-500 disabled:opacity-50"
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                void sendMessage();
              }
            }}
          />

          <button
            type="button"
            onClick={() => void sendMessage()}
            disabled={!message.trim() || !liveInfo || loading || streamEnded}
            className="rounded-full bg-red-600 px-5 py-3 text-white hover:bg-red-700 disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </aside>

      {/* ================================================
          LIVE ENDED SCREEN
      ================================================ */}

      {streamEnded && (
        <div
          role="alert"
          aria-live="assertive"
          className="fixed inset-0 z-[100] flex min-h-screen flex-col items-center justify-center bg-gray-950 px-6 text-center text-white"
        >
          <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full border border-red-500/30 bg-red-500/10">
            <span className="text-5xl">📴</span>
          </div>

          <h2 className="text-3xl font-bold sm:text-4xl">Live Session Ended</h2>

          <p className="mt-4 max-w-md text-base leading-7 text-gray-300">
            The astrologer has ended the live session. Thank you for joining!
          </p>

          <div className="mt-8 flex items-center gap-3 rounded-full border border-gray-700 bg-gray-900 px-5 py-3">
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-yellow-400" />

            <span className="text-sm text-gray-300">
              Redirecting you shortly...
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              if (redirectTimeoutRef.current) {
                clearTimeout(redirectTimeoutRef.current);
                redirectTimeoutRef.current = null;
              }

              router.push("/astrologer/liveStream");
            }}
            className="mt-8 rounded-xl bg-red-600 px-6 py-3 font-semibold text-white hover:bg-red-700"
          >
            Go Back Now
          </button>
        </div>
      )}
    </div>
  );
}
