"use client";

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
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
  START_LIVE_INTERACTION,
  END_LIVE_INTERACTION,
  GET_LIVE_INTERACTION_PRICING,
} from "@/app/graphql/gqlQuery";

// ---------------------------------------------------------------------------
// Silence Agora Chat SDK internal logging (including DNS timeouts).
// ---------------------------------------------------------------------------
if (typeof window !== "undefined" && !window.__AGORA_LOG_FILTER_INSTALLED__) {
  window.__AGORA_LOG_FILTER_INSTALLED__ = true;

  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;

  const isAgoraChatNoise = (args) => {
    try {
      const first = args?.[0];
      if (typeof first !== "string") return false;
      const msg = first.toLowerCase();
      return (
        msg.includes("im sdk") &&
        (msg.includes("get dns failed") ||
          msg.includes("login failed") ||
          msg.includes("dns") ||
          msg.includes("websocket connect failed") ||
          msg.includes("request timeout") ||
          msg.includes("retryrequestdns failed"))
      );
    } catch {
      return false;
    }
  };

  console.error = (...args) => {
    if (isAgoraChatNoise(args)) return;
    originalConsoleError.apply(console, args);
  };

  console.warn = (...args) => {
    if (isAgoraChatNoise(args)) return;
    originalConsoleWarn.apply(console, args);
  };
}

// ---------------------------------------------------------------------------
// sessionStorage key helpers for persisting timer state across refresh.
// ---------------------------------------------------------------------------
const STORAGE_KEY = "live_interaction_timer";

function saveTimerStateToStorage(state) {
  try {
    if (typeof window === "undefined") return;
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.warn("Unable to persist timer state:", err);
  }
}

function loadTimerStateFromStorage() {
  try {
    if (typeof window === "undefined") return null;
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.warn("Unable to load timer state:", err);
    return null;
  }
}

function clearTimerStateFromStorage() {
  try {
    if (typeof window === "undefined") return;
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.warn("Unable to clear timer state:", err);
  }
}

// Helper: format seconds as mm:ss or hh:mm:ss
function formatDuration(totalSeconds) {
  const seconds = Math.max(0, Math.floor(Number(totalSeconds) || 0));
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const pad = (n) => String(n).padStart(2, "0");

  if (hrs > 0) {
    return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
  }
  return `${pad(mins)}:${pad(secs)}`;
}

/**
 * Compute total allowed seconds from pricing API data.
 */
function computeTotalSecondsFromPricing(walletBalance, pricePerMinute) {
  const balance = Number(walletBalance) || 0;
  const price = Number(pricePerMinute) || 0;

  if (price <= 0) return 0;

  const minutesAffordable = Math.floor(balance / price);
  return Math.max(0, minutesAffordable * 60);
}

export default function WatchLive() {
  const params = useParams();
  const router = useRouter();
  const manuallyEndedInteractionIdRef = useRef(null);
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

  const [interactionPanelOpen, setInteractionPanelOpen] = useState(false);

  // Multi-viewer
  const [otherViewerUids, setOtherViewerUids] = useState([]);

  // Reverse timer
  const [interactionStartedAtMs, setInteractionStartedAtMs] = useState(null);
  const [interactionTotalSeconds, setInteractionTotalSeconds] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [autoEndingDueToBalance, setAutoEndingDueToBalance] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);

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

  const failedInteractionIdRef = useRef(null);

  // Reverse-timer refs
  const timerIntervalRef = useRef(null);
  const autoEndTriggeredRef = useRef(false);
  const remainingSecondsRef = useRef(0);
  const interactionStartedAtRef = useRef(null);
  const interactionTotalSecondsRef = useRef(0);
  const interactionRateRef = useRef(0);
  const interactionTypeRef = useRef("AUDIO");
  const walletBalanceRef = useRef(0);

  // Multi-viewer refs
  const astrologerUidRef = useRef(null);
  const otherViewerStreamsRef = useRef(new Map());
  const localUidRef = useRef(null);

  useEffect(() => {
    liveInfoRef.current = liveInfo;
  }, [liveInfo]);

  // =====================================================
  // PRICING QUERY
  // =====================================================

  const {
    data: pricingData,
    loading: pricingLoading,
    refetch: refetchPricing,
  } = useQuery(GET_LIVE_INTERACTION_PRICING, {
    variables: {
      astrologerId: liveInfo?.astrologerId || "",
    },
    skip: !liveInfo?.astrologerId,
    fetchPolicy: "network-only",
    errorPolicy: "all",
  });

  const interactionPricing = pricingData?.getLiveInteractionPricing;

  const audioPrice = Number(interactionPricing?.audioPrice ?? 0);
  const videoPrice = Number(interactionPricing?.videoPrice ?? 0);

  useEffect(() => {
    if (interactionPricing) {
      const balance = Number(interactionPricing.walletBalance ?? 0);
      setWalletBalance(balance);
      walletBalanceRef.current = balance;
    }
  }, [interactionPricing]);

  useEffect(() => {
    interactionTypeRef.current = interactionType;
  }, [interactionType]);

  useEffect(() => {
    interactionRateRef.current =
      interactionType === "VIDEO" ? videoPrice : audioPrice;
  }, [interactionType, audioPrice, videoPrice]);

  useEffect(() => {
    remainingSecondsRef.current = remainingSeconds;
  }, [remainingSeconds]);

  useEffect(() => {
    interactionStartedAtRef.current = interactionStartedAtMs;
  }, [interactionStartedAtMs]);

  useEffect(() => {
    interactionTotalSecondsRef.current = interactionTotalSeconds;
  }, [interactionTotalSeconds]);

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

  const [startLiveInteractionMutation] = useMutation(START_LIVE_INTERACTION);

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
  // GRAPHQL: LIVE STATUS / SEND GIFT / LEAVE
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

  // =====================================================
  // WAIT FOR RTC CONNECTION
  // =====================================================

  const waitForRtcConnection = useCallback((rtcClient, timeoutMs = 15000) => {
    return new Promise((resolve, reject) => {
      if (!rtcClient) {
        reject(new Error("Agora RTC client is unavailable."));
        return;
      }

      if (rtcClient.connectionState === "CONNECTED") {
        resolve();
        return;
      }

      if (rtcClient.connectionState === "DISCONNECTED") {
        reject(
          new Error(
            "Agora client is disconnected. Please reconnect to the live stream.",
          ),
        );
        return;
      }

      let settled = false;
      let timeoutId = null;

      const cleanup = () => {
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
        try {
          rtcClient.off("connection-state-change", onStateChange);
        } catch (err) {
          console.warn("Unable to remove connection listener:", err);
        }
      };

      const finishResolve = () => {
        if (settled) return;
        settled = true;
        cleanup();
        resolve();
      };

      const finishReject = (error) => {
        if (settled) return;
        settled = true;
        cleanup();
        reject(error);
      };

      const onStateChange = (state) => {
        if (state === "CONNECTED") {
          finishResolve();
        } else if (state === "DISCONNECTED") {
          finishReject(
            new Error(
              "Agora client disconnected before publishing. Please reconnect.",
            ),
          );
        }
      };

      try {
        rtcClient.on("connection-state-change", onStateChange);
      } catch (err) {
        finishReject(
          new Error(
            `Unable to monitor Agora connection state: ${
              err?.message || "unknown error"
            }`,
          ),
        );
        return;
      }

      if (rtcClient.connectionState === "CONNECTED") {
        finishResolve();
        return;
      }

      timeoutId = setTimeout(() => {
        finishReject(
          new Error(
            "Timed out waiting for Agora connection. Please check your network and try again.",
          ),
        );
      }, timeoutMs);
    });
  }, []);

  // =====================================================
  // SAFE CAMERA INITIALIZATION
  // =====================================================

  const createCameraTrackSafely = useCallback(async (AgoraRTC) => {
    try {
      if (
        typeof navigator === "undefined" ||
        !navigator.mediaDevices?.enumerateDevices
      ) {
        throw new Error(
          "Camera access is not supported. Please use HTTPS and a supported browser.",
        );
      }

      const devices = await navigator.mediaDevices.enumerateDevices();

      const cameras = devices.filter((device) => device.kind === "videoinput");

      console.log("Available cameras:", cameras);

      if (cameras.length === 0) {
        throw new Error("No camera detected on this device.");
      }

      const cameraTrack = await AgoraRTC.createCameraVideoTrack({
        encoderConfig: "720p_1",
      });

      if (!cameraTrack) {
        throw new Error("Unable to initialize camera.");
      }

      console.log("Camera initialized successfully.");

      return cameraTrack;
    } catch (error) {
      console.error("Camera initialization failed:", error);

      const errorName = error?.name || error?.data?.name || "";
      const errorCode = error?.code || error?.data?.code || "";
      const errorMessage = String(error?.message || "").toLowerCase();

      if (
        errorName === "NotReadableError" ||
        errorCode === "NOT_READABLE" ||
        errorMessage.includes("not readable") ||
        errorMessage.includes("could not start video source")
      ) {
        throw new Error(
          "Camera is currently being used by another application or browser tab. Close other applications using the camera and try again.",
        );
      }

      if (
        errorName === "NotAllowedError" ||
        errorCode === "PERMISSION_DENIED" ||
        errorMessage.includes("permission denied")
      ) {
        throw new Error(
          "Camera permission denied. Please allow camera access in your browser settings.",
        );
      }

      if (errorName === "NotFoundError" || errorCode === "DEVICE_NOT_FOUND") {
        throw new Error("No camera was found on this device.");
      }

      if (
        errorName === "OverconstrainedError" ||
        errorCode === "CONSTRAINT_NOT_SATISFIED"
      ) {
        throw new Error(
          "The selected camera does not support the requested video settings.",
        );
      }

      throw error;
    }
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
  // ASTROLOGER UID RESOLUTION HELPERS
  // =====================================================

  const resolveAstrologerUidFromLive = useCallback((live) => {
    if (!live) return null;

    const candidates = [
      live.astrologerUid,
      live.hostUid,
      live.astrologer?.uid,
      live.astrologer?.agoraUid,
      live.astrologer?.agoraUserId,
      live.astrologer?.rtcUid,
      live.host?.uid,
    ];

    for (const c of candidates) {
      if (c != null && c !== "") {
        const n = Number(c);
        return Number.isFinite(n) ? n : c;
      }
    }

    return null;
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
          if (rtcClient.connectionState === "CONNECTED") {
            await rtcClient.setClientRole("audience");
          }
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
  // TIMER HELPERS
  // =====================================================

  const resolveInteractionStartedAtMs = useCallback((session, requestId) => {
    const raw =
      session?.startedAt ??
      session?.request?.startedAt ??
      session?.interaction?.startedAt;

    if (raw != null) {
      const num = Number(raw);
      let backendMs = null;

      if (Number.isFinite(num) && num > 0) {
        backendMs = num < 1e11 ? num * 1000 : num;
      } else {
        const parsed = Date.parse(raw);
        if (Number.isFinite(parsed)) backendMs = parsed;
      }

      if (backendMs != null && backendMs <= Date.now()) {
        return backendMs;
      }
    }

    const stored = loadTimerStateFromStorage();

    if (stored && stored.requestId === requestId) {
      const storedMs = Number(stored.startedAtMs);
      if (Number.isFinite(storedMs) && storedMs > 0 && storedMs <= Date.now()) {
        return storedMs;
      }
    }

    return null;
  }, []);

  const resetInteractionTimer = useCallback((options = {}) => {
    const { clearStorage = true } = options;

    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    autoEndTriggeredRef.current = false;
    interactionStartedAtRef.current = null;
    interactionTotalSecondsRef.current = 0;
    remainingSecondsRef.current = 0;

    if (clearStorage) {
      clearTimerStateFromStorage();
    }

    if (mountedRef.current) {
      setInteractionStartedAtMs(null);
      setInteractionTotalSeconds(0);
      setRemainingSeconds(0);
      setAutoEndingDueToBalance(false);
    }
  }, []);

  const recalcTimerFromWallet = useCallback(
    (newBalance) => {
      if (!isInteractionPublishing) return;

      const callRate = Number(interactionRateRef.current) || 0;
      if (callRate <= 0) return;

      const startedAt = interactionStartedAtRef.current;
      if (startedAt == null) return;

      const newTotalSeconds = computeTotalSecondsFromPricing(
        newBalance,
        callRate,
      );

      const elapsed = Math.max(
        0,
        Math.floor((Date.now() - startedAt) / 1000),
      );
      const newRemaining = Math.max(0, newTotalSeconds - elapsed);

      interactionTotalSecondsRef.current = newTotalSeconds;
      remainingSecondsRef.current = newRemaining;

      if (mountedRef.current) {
        setInteractionTotalSeconds(newTotalSeconds);
        setRemainingSeconds(newRemaining);
      }

      const requestId = activeInteractionIdRef.current;
      if (requestId) {
        saveTimerStateToStorage({
          requestId,
          startedAtMs: startedAt,
          totalSeconds: newTotalSeconds,
          interactionType: interactionTypeRef.current,
          callRate,
          walletBalance: Number(newBalance) || 0,
          savedAt: Date.now(),
        });
      }

      if (newRemaining <= 0 && !autoEndTriggeredRef.current) {
        autoEndTriggeredRef.current = true;

        if (mountedRef.current) {
          setAutoEndingDueToBalance(true);
          setInteractionNotice(
            "Your wallet balance has run out. Ending the call...",
          );
        }

        void (async () => {
          try {
            await handleEndInteractionInternal("balance");
          } catch (err) {
            console.error("Auto-end due to balance failed:", err);
          }
        })();
      }
    },
    [isInteractionPublishing],
  );

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

      if (!request?.id || !request?.interactionType) {
        throw new Error("Interaction request is missing required fields.");
      }

      // Guard against re-entry
      if (publishingInteractionRef.current) {
        return;
      }
      publishingInteractionRef.current = true;

      let audioTrack = null;
      let videoTrack = null;
      let tracksPublished = false;

      try {
        setInteractionNotice("Connecting your microphone and camera...");

        await waitForRtcConnection(rtcClient, 15000);

        // Ensure switching to host role does not get interrupted
        await rtcClient.setClientRole("host");
        await rtcClient.renewToken(session.rtcToken);

        // Create audio track
        try {
          audioTrack = await AgoraRTC.createMicrophoneAudioTrack({
            encoderConfig: "speech_standard",
          });
          await audioTrack.setEnabled(true);
        } catch (audioError) {
          console.error("Microphone init failed:", audioError);
          const name = audioError?.name || audioError?.data?.name || "";
          const msg = String(audioError?.message || "").toLowerCase();

          if (
            name === "NotAllowedError" ||
            name === "PermissionDeniedError" ||
            msg.includes("permission")
          ) {
            throw new Error(
              "Microphone permission denied. Please allow microphone access in your browser settings.",
            );
          }
          if (name === "NotFoundError" || name === "DevicesNotFoundError") {
            throw new Error("No microphone was found on this device.");
          }
          throw new Error(
            audioError?.message ||
              "Unable to access your microphone. Please check your device settings.",
          );
        }
        localAudioTrackRef.current = audioTrack;
        const tracksToPublish = [audioTrack];

        // Create video track
        if (request.interactionType === "VIDEO") {
          videoTrack = await createCameraTrackSafely(AgoraRTC);
          await videoTrack.setEnabled(true);
          localVideoTrackRef.current = videoTrack;
          tracksToPublish.push(videoTrack);
        }

        // Publish with a small retry for OPERATION_ABORTED
        const publishWithRetry = async (tracks, attempts = 2) => {
          let lastErr;
          for (let i = 0; i < attempts; i++) {
            try {
              await rtcClient.publish(tracks);
              return;
            } catch (e) {
              lastErr = e;
              const msg = String(e?.message || "").toLowerCase();
              if (
                msg.includes("cancel token") ||
                e?.code === "OPERATION_ABORTED"
              ) {
                await new Promise((r) => setTimeout(r, 1000 * (i + 1)));
                continue;
              }
              throw e;
            }
          }
          throw lastErr;
        };

        await publishWithRetry(tracksToPublish);
        tracksPublished = true;

        // Mark publishing + set interaction type BEFORE the mutation
        if (mountedRef.current) {
          setInteractionType(request.interactionType);
          setIsInteractionPublishing(true);
          setInteractionStatus("ACCEPTED");
          setInteractionNotice("");
        }

        // Immediately play local video so the user sees themselves
        if (
          request.interactionType === "VIDEO" &&
          guestVideoRef.current &&
          videoTrack
        ) {
          try {
            guestVideoRef.current.innerHTML = "";
            videoTrack.play(guestVideoRef.current);
          } catch (playErr) {
            console.warn("Unable to play local video immediately:", playErr);
          }
        }

        await startLiveInteractionMutation({
          variables: { requestId: request.id },
        });

        activeInteractionIdRef.current = request.id;
        failedInteractionIdRef.current = null;

        // Initialize the reverse timer
        const rate =
          request.interactionType === "VIDEO"
            ? Number(videoPrice)
            : Number(audioPrice);

        const startedAt = Date.now();
        const totalSeconds = computeTotalSecondsFromPricing(
          walletBalanceRef.current,
          rate,
        );

        interactionStartedAtRef.current = startedAt;
        interactionTotalSecondsRef.current = totalSeconds;
        remainingSecondsRef.current = totalSeconds;
        interactionRateRef.current = rate;

        saveTimerStateToStorage({
          requestId: request.id,
          startedAtMs: startedAt,
          totalSeconds,
          interactionType: request.interactionType,
          callRate: rate,
          walletBalance: walletBalanceRef.current,
          savedAt: Date.now(),
        });

        if (mountedRef.current) {
          setInteractionStartedAtMs(startedAt);
          setInteractionTotalSeconds(totalSeconds);
          setRemainingSeconds(totalSeconds);
        }
      } catch (err) {
        console.error("Unable to start interaction:", err);

        // If it is an OPERATION_ABORTED error, it may be caused by a brief network fluctuation
        if (
          err?.code === "OPERATION_ABORTED" ||
          err?.message?.includes("cancel token")
        ) {
          console.warn(
            "Publish was aborted, likely due to network or concurrent operation.",
          );
          if (audioTrack) {
            try {
              audioTrack.stop();
              audioTrack.close();
            } catch {}
          }
          if (videoTrack) {
            try {
              videoTrack.stop();
              videoTrack.close();
            } catch {}
          }
          localAudioTrackRef.current = null;
          localVideoTrackRef.current = null;

          if (mountedRef.current) {
            setInteractionNotice(
              "Connection was interrupted. Please try requesting the interaction again.",
            );
            setIsInteractionPublishing(false);
          }
          throw new Error("Connection interrupted, please retry");
        }

        // Generic cleanup on failure
        if (!tracksPublished) {
          if (audioTrack) {
            try {
              audioTrack.stop();
              audioTrack.close();
            } catch {}
          }
          if (videoTrack) {
            try {
              videoTrack.stop();
              videoTrack.close();
            } catch {}
          }
          localAudioTrackRef.current = null;
          localVideoTrackRef.current = null;
        }

        throw err;
      } finally {
        // Only release the lock after publishing completes (or fails)
        publishingInteractionRef.current = false;
      }
    },
    [
      waitForRtcConnection,
      createCameraTrackSafely,
      startLiveInteractionMutation,
      audioPrice,
      videoPrice,
    ],
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

      const pricingResponse = await refetchPricing();

      const pricing = pricingResponse?.data?.getLiveInteractionPricing;

      if (!pricing) {
        throw new Error("Unable to retrieve call pricing.");
      }

      const requiredCoins =
        requestedType === "AUDIO"
          ? Number(pricing.audioPrice)
          : Number(pricing.videoPrice);

      const currentBalance = Number(pricing.walletBalance);

      setWalletBalance(currentBalance);
      walletBalanceRef.current = currentBalance;

      if (currentBalance < requiredCoins) {
        setInteractionNotice(
          `Insufficient wallet balance. You need at least ${requiredCoins} coins for the first minute. Your balance is ${currentBalance} coins. Please recharge your wallet.`,
        );
        return;
      }

      setInteractionType(requestedType);
      setInteractionPanelOpen(true);

      failedInteractionIdRef.current = null;

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
        `Your ${requestedType.toLowerCase()} call request has been sent. Waiting for astrologer's approval.`,
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
    const requestId = interactionRequest.id;

    setInteractionStatus(status);

    if (status !== "ACCEPTED") {
      failedInteractionIdRef.current = null;
    }

    if (status === "ACCEPTED") {
      if (manuallyEndedInteractionIdRef.current === requestId) {
        return;
      }

      if (activeInteractionIdRef.current === requestId) {
        return;
      }

      if (failedInteractionIdRef.current === requestId) {
        return;
      }

      if (publishingInteractionRef.current) {
        return;
      }

      void startInteractionPublishing(interactionSession).catch((err) => {
        console.error("Interaction publishing error:", err);

        failedInteractionIdRef.current = requestId;

        // Release the lock so a retry is possible
        publishingInteractionRef.current = false;

        if (mountedRef.current) {
          setInteractionNotice(err?.message || getErrorMessage(err));

          setInteractionPanelOpen(true);
          setIsInteractionPublishing(false);
        }
      });

      return;
    }

    if (status === "REJECTED" || status === "CANCELLED" || status === "ENDED") {
      void stopInteractionPublishing();

      resetInteractionTimer();

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
    resetInteractionTimer,
  ]);

  // =====================================================
  // REVERSE TIMER TICK
  // =====================================================

  useEffect(() => {
    if (!isInteractionPublishing || !interactionStartedAtMs || streamEnded) {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
      return;
    }

    const tick = () => {
      const startedAt = interactionStartedAtRef.current;
      const totalSeconds = interactionTotalSecondsRef.current;

      if (!startedAt || totalSeconds <= 0) return;

      const elapsed = Math.max(
        0,
        Math.floor((Date.now() - startedAt) / 1000),
      );
      const remaining = Math.max(0, totalSeconds - elapsed);

      remainingSecondsRef.current = remaining;

      if (mountedRef.current) {
        setRemainingSeconds(remaining);
      }

      if (remaining <= 0 && !autoEndTriggeredRef.current) {
        autoEndTriggeredRef.current = true;

        if (mountedRef.current) {
          setAutoEndingDueToBalance(true);
          setInteractionNotice(
            "Your wallet balance has run out. Ending the call...",
          );
        }

        void (async () => {
          try {
            await handleEndInteractionInternal("balance");
          } catch (err) {
            console.error("Auto-end due to balance failed:", err);
          }
        })();
      }
    };

    tick();

    timerIntervalRef.current = setInterval(tick, 1000);

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInteractionPublishing, interactionStartedAtMs, streamEnded]);

  // =====================================================
  // END INTERACTION
  // =====================================================

  const handleEndInteractionInternal = useCallback(
    async (reason = "manual") => {
      const requestId =
        interactionRequest?.id || activeInteractionIdRef.current;

      if (!requestId) {
        return;
      }

      if (interactionLoading && reason === "manual") {
        return;
      }

      const isBalanceEnd = reason === "balance";

      try {
        if (reason === "manual") {
          setInteractionLoading(true);
        }

        setInteractionNotice(
          isBalanceEnd ? "Wallet balance exhausted. Ending the call..." : "",
        );

        manuallyEndedInteractionIdRef.current = requestId;

        await stopInteractionPublishing();

        const response = await endInteractionRequest({
          variables: {
            requestId,
          },
        });

        const result = response?.data?.endLiveInteraction;

        if (!result) {
          throw new Error("Unable to end interaction.");
        }

        failedInteractionIdRef.current = null;
        activeInteractionIdRef.current = null;
        publishingInteractionRef.current = false;

        resetInteractionTimer();

        try {
          await refetchPricing();
        } catch (err) {
          console.warn("Unable to refresh pricing after end:", err);
        }

        if (mountedRef.current) {
          setInteractionStatus(result.status);
          setIsInteractionPublishing(false);
          setInteractionPanelOpen(false);
          setAutoEndingDueToBalance(false);

          if (isBalanceEnd) {
            const charged = Number(result.chargedCoins ?? 0);
            const mins = Number(result.billableMinutes ?? 0);
            setInteractionNotice(
              `Your call ended because your wallet balance ran out. ${
                mins > 0
                  ? `You were charged ${charged} coins for ${mins} minute(s).`
                  : ""
              } Please recharge to continue.`,
            );
          } else {
            setInteractionNotice("You have left the interaction.");
          }
        }

        await refetchInteraction();
      } catch (err) {
        console.error("End interaction error:", err);
        if (mountedRef.current) {
          setInteractionNotice(getErrorMessage(err));
        }
        throw err;
      } finally {
        if (reason === "manual" && mountedRef.current) {
          setInteractionLoading(false);
        }
      }
    },
    [
      interactionRequest,
      interactionLoading,
      stopInteractionPublishing,
      endInteractionRequest,
      resetInteractionTimer,
      refetchPricing,
      refetchInteraction,
      getErrorMessage,
    ],
  );

  const handleEndInteraction = useCallback(async () => {
    try {
      await handleEndInteractionInternal("manual");
    } catch (err) {
      console.error("handleEndInteraction failed:", err);
    }
  }, [handleEndInteractionInternal]);

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
            await chatClient.leaveChatRoom({
              roomId,
            });
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
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

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
    failedInteractionIdRef.current = null;

    for (const entry of otherViewerStreamsRef.current.values()) {
      try {
        entry.videoTrack?.stop();
      } catch {}
      try {
        entry.div?.remove();
      } catch {}
    }
    otherViewerStreamsRef.current.clear();
    astrologerUidRef.current = null;
    localUidRef.current = null;

    if (mountedRef.current) {
      setIsInteractionPublishing(false);
      setOtherViewerUids([]);
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

      resetInteractionTimer();

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
    [
      channelName,
      cleanup,
      isCurrentGeneration,
      leaveLiveStream,
      resetInteractionTimer,
      router,
    ],
  );

  // =====================================================
  // SUBSCRIBE TO USER — MULTI-VIEWER SAFE
  // =====================================================

  const subscribeToUser = useCallback(
    async (user, mediaType, generation) => {
      const client = agoraClientRef.current;

      if (!client || !isCurrentGeneration(generation)) {
        return;
      }

      try {
        console.log(`[Agora RTC] Subscribing to user ${user.uid} for ${mediaType}`);
        await client.subscribe(user, mediaType);

        if (!isCurrentGeneration(generation)) {
          console.log(`[Agora RTC] Generation changed, ignoring subscription for ${user.uid}`);
          return;
        }

        const uid = user?.uid;
        const localUid = localUidRef.current;
        const isSelf = localUid != null && String(uid) === String(localUid);

        if (
          astrologerUidRef.current == null &&
          uid != null &&
          !isSelf &&
          !publishingInteractionRef.current &&
          !isInteractionPublishing
        ) {
          astrologerUidRef.current = uid;
          console.log("[Agora RTC] Astrologer UID resolved:", uid);
        }

        const isAstrologer =
          astrologerUidRef.current != null &&
          String(astrologerUidRef.current) === String(uid);

        // ---- Video ----
        if (mediaType === "video") {
          if (!user.videoTrack) {
            console.warn(`[Agora RTC] User ${uid} published video but videoTrack is missing.`);
            return;
          }

          if (isAstrologer) {
            console.log(`[Agora RTC] Received astrologer video track.`);
            pendingVideoTrackRef.current = user.videoTrack;

            if (remoteVideoRef.current) {
              console.log(`[Agora RTC] Playing astrologer video immediately.`);
              remoteVideoRef.current.innerHTML = "";
              try {
                user.videoTrack.play(remoteVideoRef.current);
                setHostJoined(true);
                setError("");
                pendingVideoTrackRef.current = null;
              } catch (e) {
                console.warn("[Agora RTC] Immediate play failed, will retry via useEffect", e);
              }
            } else {
              console.log(`[Agora RTC] remoteVideoRef not ready yet. Storing in pendingVideoTrackRef.`);
            }
          } else if (!isSelf) {
            if (otherViewerStreamsRef.current.has(uid)) {
              const existing = otherViewerStreamsRef.current.get(uid);
              existing.videoTrack = user.videoTrack;
            } else {
              const div = document.createElement("div");
              div.className = "w-full h-full";

              otherViewerStreamsRef.current.set(uid, {
                div,
                videoTrack: user.videoTrack,
                audioTrack: user.audioTrack || null,
              });

              try {
                user.videoTrack.play(div);
              } catch (playErr) {
                console.warn("Unable to play viewer video:", playErr);
              }
            }

            if (mountedRef.current) {
              setOtherViewerUids((prev) =>
                prev.includes(uid) ? prev : [...prev, uid],
              );
            }
          }
        }

        // ---- Audio ----
        if (mediaType === "audio" && user.audioTrack) {
          user.audioTrack.play();

          if (isAstrologer) {
            setHostJoined(true);
          }
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
    [isCurrentGeneration, isInteractionPublishing],
  );

  // =====================================================
  // OPEN CHAT WITH RETRY (non-fatal for the stream)
  // =====================================================

  const openChatWithRetry = useCallback(
    async (chatClient, user, accessToken, generation, attempts = 3) => {
      let lastError = null;

      for (let i = 0; i < attempts; i++) {
        if (!isCurrentGeneration(generation)) {
          throw new Error("Stale generation during chat open.");
        }

        try {
          await chatClient.open({ user, accessToken });
          return true;
        } catch (err) {
          lastError = err;

          const msg = String(
            err?.message || err?.type || err?.data?.error || "",
          ).toLowerCase();

          if (
            msg.includes("401") ||
            msg.includes("unauthorized") ||
            msg.includes("invalid token") ||
            msg.includes("token expired")
          ) {
            throw err;
          }

          const delayMs = 1000 * Math.pow(2, i);

          console.warn(
            `Agora Chat open failed (attempt ${i + 1}/${attempts}). Retrying in ${delayMs}ms...`,
            err,
          );

          await new Promise((r) => setTimeout(r, delayMs));

          if (!isCurrentGeneration(generation)) {
            throw lastError;
          }
        }
      }

      throw lastError || new Error("Chat login failed after retries.");
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
        if (!isCurrentGeneration(generation)) {
          return;
        }

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
        setOtherViewerUids([]);

        liveInfoRef.current = null;

        failedInteractionIdRef.current = null;
        activeInteractionIdRef.current = null;
        publishingInteractionRef.current = false;

        astrologerUidRef.current = null;
        localUidRef.current = null;

        for (const entry of otherViewerStreamsRef.current.values()) {
          try {
            entry.videoTrack?.stop();
          } catch {}
          try {
            entry.div?.remove();
          } catch {}
        }
        otherViewerStreamsRef.current.clear();

        if (!channelName) {
          throw new Error("Live stream channel name is missing.");
        }

        const [{ default: AgoraRTC }, { default: AgoraChat }] =
          await Promise.all([import("agora-rtc-sdk-ng"), import("agora-chat")]);

        if (!isCurrentGeneration(generation)) {
          return;
        }

        agoraRTCRef.current = AgoraRTC;
        agoraChatRef.current = AgoraChat;

        // Silence Agora Chat SDK logging.
        try {
          AgoraChat.setLogLevel?.(0);
          AgoraChat.logger?.setLevel?.(0);
          AgoraChat.config = {
            ...(AgoraChat.config || {}),
            logLevel: 0,
          };
        } catch (logErr) {
          // Cosmetic only.
        }

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

        const astroUid = resolveAstrologerUidFromLive(live);
        if (astroUid != null) {
          astrologerUidRef.current = astroUid;
          console.log("Astrologer UID from joinLive payload:", astroUid);
        }

        localUidRef.current = live.uid;

        localChatRoomId = live.chatRoomId;
        chatRoomIdRef.current = live.chatRoomId;

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
          if (!isCurrentGeneration(generation)) {
            return;
          }

          if (mediaType === "video") {
            const uid = user?.uid;
            const astroUid = astrologerUidRef.current;

            const isAstrologer =
              astroUid != null && String(astroUid) === String(uid);

            if (isAstrologer) {
              setHostJoined(false);
              pendingVideoTrackRef.current = null;
              if (remoteVideoRef.current) {
                remoteVideoRef.current.innerHTML = "";
              }
            } else {
              const entry = otherViewerStreamsRef.current.get(uid);
              if (entry) {
                try {
                  entry.videoTrack?.stop();
                } catch {}
                otherViewerStreamsRef.current.delete(uid);
              }
              if (mountedRef.current) {
                setOtherViewerUids((prev) =>
                  prev.filter((id) => String(id) !== String(uid)),
                );
              }
            }
          }
        });

        rtcClient.on("user-left", async (user, reason) => {
          console.log("Agora user left:", user?.uid, reason);

          if (!isCurrentGeneration(generation)) {
            return;
          }

          const uid = user?.uid;
          const astroUid = astrologerUidRef.current;
          const isAstrologer =
            astroUid != null && String(astroUid) === String(uid);

          if (isAstrologer) {
            setHostJoined(false);
            pendingVideoTrackRef.current = null;
            if (remoteVideoRef.current) {
              remoteVideoRef.current.innerHTML = "";
            }

            try {
              const chatRoomId = chatRoomIdRef.current;

              if (!chatRoomId) return;

              await new Promise((resolve) => setTimeout(resolve, 5000));

              if (!isCurrentGeneration(generation)) {
                return;
              }

              const { data, errors } = await getLiveStatus({
                variables: {
                  chatRoomId: String(chatRoomId),
                },
              });

              if (!isCurrentGeneration(generation)) {
                return;
              }

              if (errors?.length) {
                console.error(errors);
                return;
              }

              const statusResponse = data?.getLiveStatus;

              if (!statusResponse?.success) {
                return;
              }

              const status = statusResponse.data?.status;

              if (status === "ENDED") {
                await handleStreamEnded(generation);
              } else if (status === "LIVE") {
                console.log("Live session is still active.");
              }
            } catch (err) {
              console.error("Error checking live status:", err);
            }
          } else {
            const entry = otherViewerStreamsRef.current.get(uid);
            if (entry) {
              try {
                entry.videoTrack?.stop();
              } catch {}
              otherViewerStreamsRef.current.delete(uid);
            }
            if (mountedRef.current) {
              setOtherViewerUids((prev) =>
                prev.filter((id) => String(id) !== String(uid)),
              );
            }
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

        // ✅ FIX: Decouple Chat initialization from the main RTC flow.
        // This prevents the "get DNS failed" timeout from blocking video rendering.
        setTimeout(async () => {
          if (!isCurrentGeneration(generation)) return;

          try {
            const chatClient = new AgoraChat.connection({
              appKey: live.chatAppKey,
            });

            localChatClient = chatClient;
            chatClientRef.current = chatClient;

            chatClient.addEventHandler(`LIVE_CHAT_${generation}`, {
              onTextMessage: handleIncomingTextMessage,

              onError: (chatError) => {
                console.warn(
                  "Agora Chat runtime error (non-fatal):",
                  chatError,
                );
              },

              onConnected: () => {
                console.log("Agora Chat connected.");
              },

              onDisconnected: () => {
                console.warn("Agora Chat disconnected — will retry in bg.");

                void (async () => {
                  try {
                    if (
                      chatClient &&
                      chatClientRef.current === chatClient &&
                      isCurrentGeneration(generation)
                    ) {
                      await openChatWithRetry(
                        chatClient,
                        live.chatUserId,
                        live.chatToken,
                        generation,
                        2,
                      );

                      if (isCurrentGeneration(generation)) {
                        await chatClient.joinChatRoom({
                          roomId: live.chatRoomId,
                        });
                        console.log("Agora Chat reconnected.");
                      }
                    }
                  } catch (reconnectErr) {
                    console.warn(
                      "Agora Chat reconnect failed (non-fatal):",
                      reconnectErr,
                    );
                  }
                })();
              },
            });

            await openChatWithRetry(
              chatClient,
              live.chatUserId,
              live.chatToken,
              generation,
              3,
            );

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
          } catch (chatErr) {
            // ── NON-FATAL ──
            console.warn(
              "Agora Chat unavailable — continuing without chat:",
              chatErr,
            );

            if (localChatClient) {
              try {
                localChatClient.removeEventHandler(`LIVE_CHAT_${generation}`);
              } catch {}
              try {
                await localChatClient.close();
              } catch {}
            }

            chatClientRef.current = null;
            localChatClient = null;

            if (mountedRef.current) {
              setInteractionNotice(
                "Chat is temporarily unavailable. You can still watch and call.",
              );

              setTimeout(() => {
                if (mountedRef.current) {
                  setInteractionNotice((prev) =>
                    prev &&
                    prev.startsWith("Chat is temporarily unavailable")
                      ? ""
                      : prev,
                  );
                }
              }, 8000);
            }
          }
        }, 0);

        // Subscribe to existing remote users at join time.
        for (const user of rtcClient.remoteUsers) {
          if (!isCurrentGeneration(generation)) {
            break;
          }

          if (
            astrologerUidRef.current == null &&
            user.uid != null &&
            String(user.uid) !== String(localUidRef.current)
          ) {
            if (user.hasVideo || user.hasAudio) {
              astrologerUidRef.current = user.uid;
              console.log(
                "Astrologer UID resolved from remoteUsers:",
                user.uid,
              );
            }
          }

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
          const rawMsg = String(err?.message || "").toLowerCase();
          let friendly = getErrorMessage(err);

          if (rawMsg.includes("get dns failed") || rawMsg.includes("dns")) {
            friendly =
              "Network error: unable to reach the live server. Please check your connection and try again.";
          } else if (rawMsg.includes("login failed")) {
            friendly =
              "Login failed. This is usually temporary — please refresh the page.";
          } else if (
            rawMsg.includes("invalid token") ||
            rawMsg.includes("token expired")
          ) {
            friendly =
              "Session expired. Please refresh the page to reconnect.";
          }

          setError(friendly);
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
      openChatWithRetry,
      resolveAstrologerUidFromLive,
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

      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }

      void cleanup();
    };
  }, [channelName, initializeLive, cleanup]);

  // =====================================================
  // RESUME TIMER AFTER REFRESH (safety net)
  // =====================================================

  useEffect(() => {
    if (!interactionSession || !isInteractionPublishing) return;
    if (interactionStartedAtMs != null) return;

    const requestId = interactionSession?.request?.id;
    if (!requestId) return;

    const startedAt = resolveInteractionStartedAtMs(
      interactionSession,
      requestId,
    );

    if (startedAt == null) return;

    const type = interactionSession?.request?.interactionType || "AUDIO";
    const price = type === "VIDEO" ? videoPrice : audioPrice;

    const balance = Number(
      interactionPricing?.walletBalance ?? walletBalanceRef.current,
    );

    const totalSeconds = computeTotalSecondsFromPricing(balance, price);
    if (totalSeconds <= 0) return;

    const elapsed = Math.max(
      0,
      Math.floor((Date.now() - startedAt) / 1000),
    );
    const remaining = Math.max(0, totalSeconds - elapsed);

    interactionStartedAtRef.current = startedAt;
    interactionTotalSecondsRef.current = totalSeconds;
    remainingSecondsRef.current = remaining;
    interactionRateRef.current = price;

    saveTimerStateToStorage({
      requestId,
      startedAtMs: startedAt,
      totalSeconds,
      interactionType: type,
      callRate: price,
      walletBalance: balance,
      savedAt: Date.now(),
    });

    if (mountedRef.current) {
      setInteractionType(type);
      setInteractionStartedAtMs(startedAt);
      setInteractionTotalSeconds(totalSeconds);
      setRemainingSeconds(remaining);
    }
  }, [
    interactionSession,
    isInteractionPublishing,
    interactionStartedAtMs,
    resolveInteractionStartedAtMs,
    interactionPricing,
    audioPrice,
    videoPrice,
  ]);

  // =====================================================
  // PLAY PENDING VIDEO (Fixes the AbortError race condition)
  // =====================================================

  useEffect(() => {
    if (
      !loading &&
      liveInfo &&
      pendingVideoTrackRef.current &&
      remoteVideoRef.current
    ) {
      console.log("[Agora RTC] useEffect triggered for pendingVideoTrack");
      // Small delay to ensure the DOM is fully painted before playing
      const timer = setTimeout(() => {
        if (!remoteVideoRef.current || !pendingVideoTrackRef.current) return;
        
        try {
          console.log("[Agora RTC] Playing pending video track from useEffect");
          remoteVideoRef.current.innerHTML = "";
          pendingVideoTrackRef.current.play(remoteVideoRef.current);
          pendingVideoTrackRef.current = null;
          setHostJoined(true);
          setError("");
        } catch (err) {
          console.error("Unable to play remote video:", err);
          setError("Unable to play the astrologer's video.");
        }
      }, 200);

      return () => clearTimeout(timer);
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
  // SEND GIFT (gift-aware timer update)
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

    const giftCost = totalGiftCoins;
    const localBalance = Number(walletBalanceRef.current) || 0;

    if (giftCost > localBalance) {
      setGiftNotice(
        `Insufficient wallet balance. This gift costs ${giftCost} coins but your balance is ${localBalance} coins. Please recharge.`,
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
          quantity,
        },
      });

      const result = response?.data?.sendLiveGift;

      if (!result?.success) {
        throw new Error(result?.message || "Gift transaction failed.");
      }

      const rawNewBalance = result.userBalance;
      const hasNewBalance =
        rawNewBalance != null && Number.isFinite(Number(rawNewBalance));

      if (hasNewBalance) {
        const newBalance = Number(rawNewBalance);

        setWalletBalance(newBalance);
        walletBalanceRef.current = newBalance;

        if (isInteractionPublishing) {
          recalcTimerFromWallet(newBalance);
        }

        try {
          await refetchPricing();
        } catch (pricingErr) {
          console.warn("Unable to refresh pricing after gift:", pricingErr);
        }
      } else {
        try {
          const pricingResponse = await refetchPricing();
          const fresh = pricingResponse?.data?.getLiveInteractionPricing;
          if (fresh) {
            const newBalance = Number(fresh.walletBalance ?? 0);
            setWalletBalance(newBalance);
            walletBalanceRef.current = newBalance;

            if (isInteractionPublishing) {
              recalcTimerFromWallet(newBalance);
            }
          }
        } catch (pricingErr) {
          console.warn(
            "Unable to refresh pricing after gift (fallback):",
            pricingErr,
          );
        }
      }

      const balanceMessage = hasNewBalance
        ? ` Remaining wallet balance: ${Number(rawNewBalance)} coins.`
        : "";

      setGiftNotice(`Successfully sent.${balanceMessage}`);

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
      } else {
        await stopInteractionPublishing();
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

      resetInteractionTimer();

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

  const isAudioCallActive =
    isInteractionPublishing && interactionType === "AUDIO";

  const isVideoCallActive =
    isInteractionPublishing && interactionType === "VIDEO";

  const currentRate =
    interactionType === "VIDEO" ? videoPrice : audioPrice;

  const timerDisplay = useMemo(() => {
    if (!isInteractionPublishing) return null;
    return formatDuration(remainingSeconds);
  }, [isInteractionPublishing, remainingSeconds]);

  useEffect(() => {
    if (interactionStatus === "ACCEPTED") {
      const timer = setTimeout(() => {
        setInteractionPanelOpen(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [interactionStatus]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  const limitMessageWords = (message, limit = 300) => {
    const words = message.trim().split(/\s+/);

    if (words.length <= limit) return message;

    return words.slice(0, limit).join(" ") + "...";
  };

  // =====================================================
  // PLAY LOCAL VIDEO (with retries and logs)
  // =====================================================
  useEffect(() => {
    if (!isVideoCallActive) return;

    let isMounted = true;

    const tryPlay = (attempt = 1) => {
      if (!isMounted) return;
      if (!guestVideoRef.current || !localVideoTrackRef.current) {
        console.log(`[Agora Local Video] Refs not ready, attempt ${attempt}`);
        if (attempt < 5) setTimeout(() => tryPlay(attempt + 1), 300);
        return;
      }

      try {
        guestVideoRef.current.innerHTML = "";
        localVideoTrackRef.current.play(guestVideoRef.current);
        console.log("[Agora Local Video] Local video playing successfully.");
      } catch (err) {
        console.error("[Agora Local Video] Failed to play local video track:", err);
        if (attempt < 5) {
          setTimeout(() => tryPlay(attempt + 1), 300);
        }
      }
    };

    const timer = setTimeout(() => tryPlay(), 200);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [isVideoCallActive]);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-purple-300 sm:p-4 sm:p-6 lg:p-8">
      <div className="relative flex w-full max-w-[1200px] h-[calc(100dvh-0px)] sm:h-[calc(100dvh-48px)] max-h-[780px] overflow-hidden sm:rounded-2xl bg-black text-white flex-col lg:flex-row">
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="border-b block md:hidden border-gray-800 px-4 py-3">
            <div className="flex min-w-0 items-center gap-3">
              {astrologerProfilePic ? (
                <img
                  src={astrologerProfilePic}
                  alt={astrologerName}
                  className="h-11 w-11 shrink-0 rounded-full border border-gray-500 object-cover"
                />
              ) : (
                <div className="flex h-8 w-8 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-full bg-gray-700 text-xl">
                  👳
                </div>
              )}

              <div className="min-w-0">
                <h3 className="truncate text-[10px] sm:text-xs font-semibold">
                  {astrologerName}
                </h3>

                <p className="text-[10px] sm:text-xs text-gray-300">
                  Live Consultation
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:p-4">
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
                  <div className="mb-1 text-sm text-center font-medium text-black">
                    Waiting for astrologer video...
                  </div>
                )}

                <div className="relative isolate h-[calc(96dvh-90px)] sm:h-[calc(100dvh-90px)] min-h-[400px] w-full overflow-hidden rounded-xl bg-black sm:h-[calc(100dvh-65px)]">
                  <div
                    ref={remoteVideoRef}
                    id="remote-video"
                    className="absolute inset-0 z-0 h-full w-full bg-black"
                  />

                  <div className="absolute left-0 right-0 top-0 z-20 flex flex-wrap items-start justify-between gap-3 bg-gradient-to-b from-black/90 to-transparent p-3 pr-14 sm:p-4 sm:pr-16">
                    <div className="flex w-full items-start justify-between gap-2">
                      <div className="mt-2 flex flex-col items-center gap-3 text-sm">
                        <span className="bg-white rounded-full px-3 flex py-1 text-[10px] sm:text-xs text-black">
                          <svg width={16} height={16} viewBox="0 0 640 640">
                            <path
                              fill="#000"
                              d="M320 96C239.2 96 174.5 132.8 127.4 176.6C80.6 220.1 49.3 272 34.4 307.7C31.1 315.6 31.1 324.4 34.4 332.3C49.3 368 80.6 420 127.4 463.4C174.5 507.1 239.2 544 320 544C400.8 544 465.5 507.2 512.6 463.4C559.4 419.9 590.7 368 605.6 332.3C608.9 324.4 608.9 315.6 605.6 307.7C590.7 272 559.4 220 512.6 176.6C465.5 132.9 400.8 96 320 96zM176 320C176 240.5 240.5 176 320 176C399.5 176 464 240.5 464 320C464 399.5 399.5 464 320 464C240.5 464 176 399.5 176 320zM320 256C320 291.3 291.3 320 256 320C244.5 320 233.7 317 224.3 311.6C223.3 322.5 224.2 333.7 227.2 344.8C240.9 396 293.6 426.4 344.8 412.7C396 399 426.4 346.3 412.7 295.1C400.5 249.4 357.2 220.3 311.6 224.3C316.9 233.6 320 244.4 320 256z"
                            />
                          </svg>
                          {Number(liveInfo.totalViews ?? 0).toLocaleString(
                            "en-IN",
                          )}{" "}
                          views
                        </span>

                        <span className="text-[10px] sm:text-xs">
                          👥 {Number(totalFollowers).toLocaleString("en-IN")}{" "}
                          followers
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={handleFollowToggle}
                        disabled={
                          !astrologerId ||
                          followingStatusLoading ||
                          followActionLoading
                        }
                        className={`rounded-full px-4 py-1 text-xs font-semibold disabled:opacity-50 ${
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

                  {isAudioCallActive && (
                    <div
                      role="status"
                      aria-live="polite"
                      className="absolute flex flex-col right-4 top-5 z-40 w-[calc(100%-32px)] max-w-[260px] overflow-hidden rounded-xl border border-green-500/50 bg-gray-950/95 p-3 shadow-2xl backdrop-blur-md sm:right-6 sm:top-15"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="relative flex h-3 w-3">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                            <span className="relative inline-flex h-3 w-3 rounded-full bg-green-500" />
                          </span>

                          <span className="text-[10px] font-semibold uppercase tracking-wide text-green-400">
                            Audio Call Connected
                          </span>
                        </div>

                        <span className="rounded-full bg-black/60 px-2 py-0.5 font-mono text-xs text-green-300">
                          {timerDisplay}
                        </span>
                      </div>

                      <div className="mt-2 flex items-center gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-white">
                            {astrologerName}
                          </p>
                          <p className="text-[10px] text-gray-400">
                            Live audio consultation
                          </p>
                        </div>
                      </div>

                      <div className="mt-2 flex items-center justify-between text-[10px] text-gray-400">
                        <span>Rate: {currentRate}/min</span>
                        <span>Wallet: {walletBalance}</span>
                      </div>

                      {autoEndingDueToBalance && (
                        <p className="mt-2 rounded bg-red-500/20 px-2 py-1 text-[10px] text-red-300">
                          Balance exhausted — ending call...
                        </p>
                      )}

                      <button
                        type="button"
                        onClick={handleEndInteraction}
                        disabled={interactionLoading || autoEndingDueToBalance}
                        title="Disconnect audio call"
                        className="mt-3 flex justify-self-center w-[50%] items-center place-self-center justify-center gap-2 rounded-full text-xs bg-red-600 px-3 py-1.5 font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
                      >
                        {interactionLoading ? (
                          <>
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                            Ending...
                          </>
                        ) : (
                          <>Disconnect</>
                        )}
                      </button>
                    </div>
                  )}

                  {/* FIX APPLIED HERE: Use opacity instead of hidden/block */}
                  <div
                    className={`absolute right-4 top-28 z-30 h-36 w-28 overflow-hidden rounded-xl border-2 border-yellow-400 bg-black shadow-xl sm:h-80 sm:w-65 ${
                      isVideoCallActive
                        ? "opacity-100 pointer-events-auto"
                        : "opacity-50 pointer-events-none"
                    }`}
                  >
                    <div ref={guestVideoRef} className="h-full w-full" />

                    <span className="absolute bottom-1 left-1 rounded bg-black/70 px-2 py-1 text-xs">
                      You
                    </span>

                    <div className="absolute left-2 top-2 rounded bg-black/70 px-2 py-1 font-mono text-xs text-green-300">
                      {timerDisplay}
                    </div>

                    <button
                      type="button"
                      onClick={handleEndInteraction}
                      disabled={interactionLoading || autoEndingDueToBalance}
                      className="absolute right-2 top-2 z-40 flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-white hover:bg-red-600 disabled:opacity-50"
                      title="End video call"
                    >
                      X
                    </button>

                    {autoEndingDueToBalance && (
                      <div className="absolute inset-x-0 bottom-0 bg-red-600/80 px-2 py-1 text-center text-[10px] text-white">
                        Ending (low balance)
                      </div>
                    )}
                  </div>

                  {interactionPanelOpen && (
                    <div className="absolute inset-0 z-[100] pointer-events-auto flex items-center justify-center bg-black/65 p-3 backdrop-blur-sm sm:p-5">
                      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-gray-700 bg-gray-950 shadow-2xl">
                        <div className="flex items-center justify-between border-b bg-gradient-to-r from-purple-900 via-purple-800 to-purple-900 p-4">
                          <div>
                            <h3 className="text-lg text-center font-semibold">
                              {isInteractionPublishing
                                ? "Call Connected"
                                : interactionStatus === "PENDING"
                                  ? "Waiting for Astrologer"
                                  : "Live Consultation"}
                            </h3>
                          </div>

                          {!isInteractionPublishing &&
                            interactionStatus !== "PENDING" && (
                              <button
                                type="button"
                                onClick={() => setInteractionPanelOpen(false)}
                                className="flex h-9 w-9 items-center justify-center cursor-pointer rounded-full bg-red-200 hover:bg-red-600"
                              >
                                <svg
                                  width={17}
                                  height={17}
                                  viewBox="0 0 640 640"
                                >
                                  <path
                                    fill="#fff"
                                    d="M183.1 137.4C170.6 124.9 150.3 124.9 137.8 137.4C125.3 149.9 125.3 170.2 137.8 182.7L275.2 320L137.9 457.4C125.4 469.9 125.4 490.2 137.9 502.7C150.4 515.2 170.7 515.2 183.2 502.7L320.5 365.3L457.9 502.6C470.4 515.1 490.7 515.1 503.2 502.6C515.7 490.1 515.7 469.8 503.2 457.3L365.8 320L503.1 182.6C515.6 170.1 515.6 149.8 503.1 137.3C490.6 124.8 470.3 124.8 457.8 137.3L320.5 274.7L183.1 137.4z"
                                  />
                                </svg>
                              </button>
                            )}
                        </div>

                        <div className="p-5 bg-purple-100">
                          {interactionStatus === "PENDING" &&
                            !isInteractionPublishing && (
                              <div className="text-center flex flex-col items-center justify-center">
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
                                  className="mt-3 sm:mt-4 w-fit sm:w-[40%] rounded-full flex justify-center border border-gray-700 bg-gray-800 px-4 py-1 sm:py-3 text-[10px] sm:text-sm font-semibold hover:bg-gray-700 disabled:opacity-50"
                                >
                                  {interactionLoading
                                    ? "Cancelling..."
                                    : "Cancel Request"}
                                </button>
                              </div>
                            )}

                          {isInteractionPublishing && (
                            <div className="text-center flex flex-col items-center justify-center">
                              <div className="mb-3 text-xl font-bold text-green-400">
                                Connected Successfully
                              </div>

                              <div className="mb-3 rounded-full bg-black/30 px-4 py-1 font-mono text-lg text-green-300">
                                {timerDisplay}
                              </div>

                              <p className="text-xs text-gray-700">
                                Your {interactionType.toLowerCase()} call with{" "}
                                {astrologerName} is active.
                              </p>

                              {interactionType === "VIDEO" ? (
                                <p className="mt-2 text-xs text-gray-700">
                                  Your camera and microphone are connected.
                                </p>
                              ) : (
                                <p className="mt-2 text-xs text-gray-400">
                                  Your microphone is connected.
                                </p>
                              )}

                              <div className="mt-2 grid w-full grid-cols-2 gap-2 text-[11px] text-gray-700">
                                <div className="rounded bg-white/60 px-2 py-1">
                                  Rate: {currentRate}/min
                                </div>
                                <div className="rounded bg-white/60 px-2 py-1">
                                  Wallet: {walletBalance}
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={handleEndInteraction}
                                disabled={
                                  interactionLoading || autoEndingDueToBalance
                                }
                                className="mt-5 w-[50%] rounded-full flex justify-center bg-red-600 px-5 py-2 font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                              >
                                {autoEndingDueToBalance
                                  ? "Ending (low balance)..."
                                  : interactionLoading
                                    ? "Ending Call..."
                                    : "End Call"}
                              </button>
                            </div>
                          )}

                          {interactionStatus === "ACCEPTED" &&
                            !isInteractionPublishing && (
                              <div className="text-center">
                                <div className="mb-3 text-lg font-semibold text-yellow-400">
                                  Interaction Accepted
                                </div>

                                {interactionNotice && (
                                  <p className="mb-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-300">
                                    {interactionNotice}
                                  </p>
                                )}

                                <p className="text-sm text-gray-400">
                                  Your interaction was accepted, but your
                                  microphone or camera could not be initialized.
                                </p>

                                <button
                                  type="button"
                                  onClick={handleEndInteraction}
                                  disabled={interactionLoading}
                                  className="mt-5 w-full rounded-xl bg-red-600 px-5 py-3 font-bold text-white hover:bg-red-700 disabled:opacity-50"
                                >
                                  {interactionLoading
                                    ? "Ending..."
                                    : "End Interaction"}
                                </button>
                              </div>
                            )}

                          {!isInteractionPublishing &&
                            interactionStatus !== "PENDING" &&
                            interactionStatus !== "ACCEPTED" && (
                              <div className="text-center">
                                {interactionNotice && (
                                  <p className="mb-4 text-sm text-yellow-300">
                                    {interactionNotice}
                                  </p>
                                )}

                                <p className="mb-4 text-xs text-gray-700">
                                  Request an audio or video consultation with
                                  the astrologer.
                                </p>

                                <div className="grid grid-cols-2 gap-3">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      handleRequestInteraction("AUDIO");
                                    }}
                                    disabled={!canRequestInteraction}
                                    className="flex cursor-pointer flex-col rounded-2xl border border-yellow-200 bg-yellow-200 p-4 text-black transition hover:scale-103 disabled:cursor-not-allowed disabled:opacity-50"
                                  >
                                    <span className="block text-3xl">🎙️</span>
                                    <span className="text-sm text-gray-800">
                                      Audio Call
                                    </span>
                                    <span className="font-semibold text-purple-800">
                                      {pricingLoading
                                        ? "Loading..."
                                        : `₹ ${audioPrice} /min`}
                                    </span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      handleRequestInteraction("VIDEO");
                                    }}
                                    disabled={!canRequestInteraction}
                                    className="flex cursor-pointer flex-col rounded-2xl border border-purple-400 bg-purple-300 p-4 text-purple-700 transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50"
                                  >
                                    <span className="block text-3xl">📹</span>
                                    <span className="text-sm text-gray-800">
                                      Video Call
                                    </span>
                                    <span className="font-semibold text-purple-800">
                                      {pricingLoading
                                        ? "Loading..."
                                        : `₹ ${videoPrice} /min`}
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

                  {giftPanelOpen && (
                    <div
                      role="dialog"
                      aria-label="Send a gift"
                      className="absolute bottom-20 right-3 z-[100] pointer-events-auto max-h-[65%] w-[calc(100%-24px)] max-w-[560px] overflow-y-auto rounded-2xl border border-white/10 bg-linear-to-r from-pink-100 via-amber-100 to-purple-100 p-4 shadow-2xl backdrop-blur-md"
                    >
                      <div className="mb-1 flex items-center justify-between border-gray-800 pb-1">
                        <div>
                          <h3 className="text-sm text-black font-semibold">
                            {" "}
                            Send Gifts
                          </h3>
                        </div>

                        <button
                          type="button"
                          onClick={() => setGiftPanelOpen(false)}
                          className="flex h-5 w-5 items-center cursor-pointer justify-center rounded-full bg-gray-800"
                        >
                          <svg width={17} height={17} viewBox="0 0 640 640">
                            <path
                              fill="#fff"
                              d="M183.1 137.4C170.6 124.9 150.3 124.9 137.8 137.4C125.3 149.9 125.3 170.2 137.8 182.7L275.2 320L137.9 457.4C125.4 469.9 125.4 490.2 137.9 502.7C150.4 515.2 170.7 515.2 183.2 502.7L320.5 365.3L457.9 502.6C470.4 515.1 490.7 515.1 503.2 502.6C515.7 490.1 515.7 469.8 503.2 457.3L365.8 320L503.1 182.6C515.6 170.1 515.6 149.8 503.1 137.3C490.6 124.8 470.3 124.8 457.8 137.3L320.5 274.7L183.1 137.4z"
                            />
                          </svg>
                        </button>
                      </div>

                      <div className="mb-2 flex items-center justify-between rounded-lg bg-white/70 px-3 py-1.5 text-xs text-black">
                        <span className="font-semibold">Wallet Balance</span>
                        <span className="font-mono font-bold text-purple-800">
                          {walletBalance} coins
                        </span>
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
                          <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
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
                                  className={`relative flex min-h-[105px] flex-col items-center justify-center rounded-xl p-2 text-center ${
                                    isSelected
                                      ? "border-yellow-100 bg-yellow-100 ring-1 ring-yellow-100/40"
                                      : " "
                                  }`}
                                >
                                  {imageUrl ? (
                                    <img
                                      src={imageUrl}
                                      alt={gift.name}
                                      className="h-10 px-5 py-5 bg-pink-200 rounded-full w-10 object-contain"
                                    />
                                  ) : (
                                    <span className="text-3xl">🎁</span>
                                  )}

                                  <span className="mt-1 text-purple-700 text-xs sm:text-sm font-semibold">
                                    {gift.name}
                                  </span>

                                  <span className="mt-1 text-[10px] text-black">
                                    ₹ {getGiftPrice(gift)}
                                  </span>
                                </button>
                              );
                            })}
                          </div>

                          {giftNotice && (
                            <div className="mt-3 rounded-full text-center bg-gray-700 p-3 text-sm text-yellow-300">
                              {giftNotice}
                            </div>
                          )}
                          {selectedGift && (
                            <button
                              type="button"
                              onClick={handleSendGift}
                              disabled={
                                sendingGift ||
                                !selectedGiftId ||
                                !Number.isInteger(quantityNumber) ||
                                quantityNumber < 1 ||
                                quantityNumber > 100 ||
                                totalGiftCoins > walletBalance
                              }
                              className="mt-4 flex w-fit sm:w-[30%] rounded-full text-xs sm:text-sm items-center justify-content-center place-self-center justify-items-center align-items-center text-center bg-linear-to-r from-yellow-500 to-amber-400 px-4 py-2 text-black disabled:opacity-50"
                            >
                              {sendingGift
                                ? "Sending Gift..."
                                : ` Send Gift${
                                    selectedGift
                                      ? ` · ₹  ${totalGiftCoins} `
                                      : ""
                                  }`}
                            </button>
                          )}

                          <p className="mt-2 text-center text-xs text-gray-500">
                            Your wallet will be charged after successful
                            gifting.
                          </p>
                        </>
                      )}
                    </div>
                  )}

                  <div className="absolute bottom-0 left-0 right-0 z-30 bg-gradient-to-t from-black via-black/90 to-transparent px-3 pb-4 pt-12 sm:px-5">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-2">
                      <div className="hidden items-center gap-2 text-sm text-gray-300 sm:flex">
                        <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-red-500" />

                        {hostJoined ? "Live" : "Connecting..."}
                      </div>

                      <div className="flex flex-col sm:flex-row items-end place-self-end items-center gap-2 sm:gap-7">
                        <button
                          type="button"
                          onClick={() => {
                            setInteractionPanelOpen(true);
                            setInteractionNotice("");
                          }}
                          disabled={
                            streamEnded ||
                            interactionStatus === "PENDING" ||
                            interactionStatus === "ACCEPTED" ||
                            isInteractionPublishing
                          }
                          title="Call Now"
                          className="relative flex flex-col cursor-pointer items-center justify-center rounded-full border border-white/20 bg-[linear-gradient(142deg,#148500_-27%,#429d00_9%,#b5d900_68%,#ff0_94%)] px-5 sm:px-8 py-2 text-white shadow-lg transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <span className="absolute -left-4 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-green-700 shadow-md">
                            <svg width={20} height={20} viewBox="0 0 640 640">
                              <path
                                fill="#fff"
                                d="M376 32C504.1 32 608 135.9 608 264C608 277.3 597.3 288 584 288C570.7 288 560 277.3 560 264C560 162.4 477.6 80 376 80C362.7 80 352 69.3 352 56C352 42.7 362.7 32 376 32zM384 224C401.7 224 416 238.3 416 256C416 273.7 401.7 288 384 288C366.3 288 352 273.7 352 256C352 238.3 366.3 224 384 224zM352 152C352 138.7 362.7 128 376 128C451.1 128 512 188.9 512 264C512 277.3 501.3 288 488 288C474.7 288 464 277.3 464 264C464 215.4 424.6 176 376 176C362.7 176 352 165.3 352 152zM176.1 65.4C195.8 60 216.4 70.1 224.2 88.9L264.7 186.2C271.6 202.7 266.8 221.8 252.9 233.2L208.8 269.3C241.3 340.9 297.8 399.3 368.1 434.2L406.7 387C418 373.1 437.1 368.4 453.7 375.2L551 415.8C569.8 423.6 579.9 444.2 574.5 463.9L573 469.4C555.4 534.1 492.9 589.3 416.6 573.2C241.6 536.1 103.9 398.4 66.8 223.4C50.7 147.1 105.9 84.6 170.5 66.9L176 65.4z"
                              />
                            </svg>
                          </span>

                          <span className="text-xs sm:text-sm font-semibold">
                            Call Now
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setGiftPanelOpen((open) => !open);
                            setGiftNotice("");
                          }}
                          aria-label="Send Gift"
                          className="relative flex flex-col cursor-pointer items-end sm:items-center justify-center rounded-full border border-yellow-400/40 bg-yellow-500 px-5 sm:px-8 py-2 text-black shadow-lg transition hover:scale-105 hover:bg-yellow-400"
                        >
                          <span className="absolute -left-4 sm:-right-4 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border-2 border-yellow-200 bg-yellow-600 text-2xl shadow-md">
                            🎁
                          </span>

                          <span className="text-xs sm:text-sm font-bold">
                            Gift
                          </span>
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={handleLeaveLive}
                        disabled={leavingLive}
                        title="Leave Live"
                        className="fixed sm:static top-3 right-5 sm:flex px-3 py-1 cursor-pointer shadow-xl shrink-0 place-self-end items-center sm:justify-center justify-center rounded-full border border-red-500/40 bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                      >
                        {leavingLive ? (
                          <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                        ) : (
                          <span className="text-xs sm:text-sm">END</span>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {giftNotice && !giftPanelOpen && (
                  <div className="mt-3 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3 text-sm text-yellow-300">
                    {giftNotice}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <aside className="flex w-full min-w-0 flex-col border-gray-800 bg-gray-400 lg:w-[350px] lg:shrink-0">
          <div className="border-b hidden md:block border-gray-800 px-4 py-3">
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
                <h3 className="truncate font-semibold">{astrologerName}</h3>

                <p className="text-xs text-gray-300">Live Consultation</p>
              </div>
            </div>
          </div>

          <div
            ref={chatRef}
            className={`h-75 fixed bottom-15 md:bottom-0
  ${
    interactionPanelOpen || giftPanelOpen
      ? "pointer-events-none z-0 md:pointer-events-auto md:z-50"
      : "pointer-events-auto z-10"
  }
  overflow-y-auto
  [&::-webkit-scrollbar]:hidden
  [-ms-overflow-style:none]
  [scrollbar-width:none]
  sm:static w-[80%] md:w-full
  bg-[#00000000] space-y-3 md:bg-white
  px-3 py-3 lg:h-[calc(75vh-0px)]`}
          >
            <div
              className={`${
                interactionPanelOpen || giftPanelOpen
                  ? "hidden md:block"
                  : "block"
              }`}
            >
              {messages.map((item) => (
                <div key={item.id} className="mb-1">
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

                        {item.quantity > 1 && <span> × {item.quantity}</span>}

                        {item.totalCoins != null && (
                          <div className="mt-1 text-xs text-yellow-300">
                            {Number(item.totalCoins).toLocaleString("en-IN")}{" "}
                            coins
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div
                      className={`flex w-fit max-w-[85%] min-w-0 flex-row gap-1 rounded-xl px-3 py-1.5 break-all sm:flex-col sm:gap-0 sm:rounded-xl sm:px-2 sm:py-2 ${
                        item.isOwn ? "ml-auto bg-yellow-200" : "bg-purple-200"
                      } max-sm:!ml-0 max-sm:!bg-black/60`}
                    >
                      <span
                        className={`mb-0.5 shrink-0 text-[10px] font-semibold sm:mb-1 sm:text-xs ${
                          item.isOwn
                            ? "text-yellow-300 sm:text-black"
                            : "text-purple-300 sm:text-purple-800"
                        }`}
                      >
                        {item.isOwn
                          ? "You"
                          : item.senderName
                              ?.split("_")[0]
                              ?.replace(/^./, (char) => char.toUpperCase())}
                      </span>

                      <span className="min-w-0 whitespace-pre-wrap [overflow-wrap:anywhere] text-[10px] text-white sm:text-xs sm:text-black">
                        {limitMessageWords(item.message, 300)}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
            {messages.length === 0 && (
              <p className="text-xs hidden sm:block text-gray-400">
                Messages will appear here.
              </p>
            )}
          </div>

          <div className="mt-auto flex items-center gap-2 border-t border-gray-200 bg-gray-300 p-3">
            <input
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Write a message..."
              maxLength={1000}
              disabled={!liveInfo || loading || streamEnded}
              className="min-w-0 flex-1 rounded-full bg-gray-900 px-4 py-3 text-gray-800 text-[13px] outline-none bg-white/90 placeholder:text-gray-500 placeholder:text-xs disabled:opacity-50"
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
              className="rounded-full bg-yellow-400 px-3 py-3 text-white hover:bg-red-700 disabled:opacity-50"
            >
              <svg width={20} height={20} viewBox="0 0 640 640">
                <path
                  fill="rgb(30, 48, 80)"
                  d="M568.4 37.7C578.2 34.2 589 36.7 596.4 44C603.8 51.3 606.2 62.2 602.7 72L424.7 568.9C419.7 582.8 406.6 592 391.9 592C377.7 592 364.9 583.4 359.6 570.3L295.4 412.3C290.9 401.3 292.9 388.7 300.6 379.7L395.1 267.3C400.2 261.2 399.8 252.3 394.2 246.7C388.6 241.1 379.6 240.7 373.6 245.8L261.2 340.1C252.1 347.7 239.6 349.7 228.6 345.3L70.1 280.8C57 275.5 48.4 262.7 48.4 248.5C48.4 233.8 57.6 220.7 71.5 215.7L568.4 37.7z"
                />
              </svg>
            </button>
          </div>
        </aside>
      </div>

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