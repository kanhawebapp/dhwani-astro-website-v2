"use client";

import React, { useState, useEffect, useRef, useContext } from "react";
import SocketContext from "../context/socketContext";
import { AlertLoading } from "../common";
import Script from "next/script";
import { useDispatch } from "react-redux";
import { useQuery, useMutation } from "@apollo/client/react";
import { gql } from "@apollo/client";
import toast from "react-hot-toast";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createReviewRequest } from "../redux/reducer/auth/reviewSlice";
import { debug } from "three/src/nodes/utils/DebugNode";
import { removeActiveRequest } from "../redux/reducer/chat/sendRequestSlice";
import { BiCheckDouble } from "react-icons/bi";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";
// ================= GRAPHQL =================
const CREATE_ORDER = gql`
  mutation CreateOrder($input: CreateOrderInput!) {
    createOrder(input: $input) {
      success
      orderId
      amount
      currency
    }
  }
`;
const GET_RECHARGE_PACKS = gql`
  query GetRechargePacks {
    getRechargePacks {
      data {
        id
        name
        description
        price
        talktime
      }
      totalCount
    }
  }
`;
const CREATE_REVIEW = gql`
  mutation CreateReview($input: CreateReviewInput!) {
    createReview(input: $input) {
      success
      message

      review {
        id
        rating
        comment
        userName
        astroName
        createdAt
      }
    }
  }
`;

const GET_USER_BY_ID = gql`
  query GetUserById($id: String!) {
    getUserById(id: $id) {
      id
      name
      gender
    }
  }
`;

const GET_INTAKE_BY_ID = gql`
  query GetIntakeById($id: String!) {
    getIntakeById(id: $id) {
      id
      name
      gender
      dob
      btime
      birth_place
      occupation
    }
  }
`;

const UPLOAD_IMAGE = gql`
  mutation UploadImage($file: Upload!) {
    uploadImage(file: $file) {
      url
    }
  }
`;
// ================= COMPONENT =================

const UserChat = ({
  room_Id,
  astro_Name,
  astro_Image,
  chattime,
  user_Id,
  astroid,
  astro_price,
  userIntakeId,
}) => {
    const [geoInfo, setGeoInfo] = useState({
    ip: "",
    city: "",
    state: "",
    country: "",
  });
  useEffect(() => {
    const getGeo = async () => {
      try {
        const res = await fetch("https://ipapi.co/json/");
        const data = await res.json();
        // console.log("ghjghjgjhjg", data);

        setGeoInfo({
          ip: data.ip,
          city: data.city,
          state: data.region,
          country: data.country_name,
        });
      } catch (err) {
        console.error("Geo fetch failed", err);
      }
    };

    getGeo();
  }, []);
  const [createOrder] = useMutation(CREATE_ORDER);
  const router = useRouter();
  const dispatch = useDispatch();
  const { socket, connectSocket } = useContext(SocketContext);
  const [storedAstroName, setStoredAstroName] = useState("");

  useEffect(() => {
    if (!room_Id) return;

    const savedRoom = localStorage.getItem(`activeChatRoom_${room_Id}`);
    const savedName = localStorage.getItem(`activeChatSession`);

    if (savedRoom) {
      try {
        const parsedRoom = JSON.parse(savedRoom);
         const parsedName = JSON.parse(savedName);

        setStoredAstroName(parsedName?.astro_Name || "");
      } catch (error) {
        console.error("Failed to parse active chat room:", error);
      }
    }
  }, [room_Id]);
  useEffect(() => {
    if (!socket) {
      connectSocket();
    }
  }, [socket]);

  const { data: userRes, loading: userLoading } = useQuery(GET_USER_BY_ID, {
    variables: { id: user_Id },
    skip: !user_Id,
  });

  const { data: intakeRes, loading: intakeLoading } = useQuery(
    GET_INTAKE_BY_ID,
    {
      variables: { id: userIntakeId },
      skip: !userIntakeId,
    },
  );

  const saved = localStorage.getItem("activeChatSession");
  if (saved) {
    const parsed = JSON.parse(saved);
    chattime = parsed.timeLeft / 60;
    room_Id = parsed.room_Id;
    astro_Name = parsed.astro_Name;
    astro_Image = parsed.astro_Image;
    user_Id = parsed.user_Id;
    astroid = parsed.astroid;
    astro_price = parsed.astro_price;
  }
  const { data: rechargeData, loading: rechargePackLoading } =
    useQuery(GET_RECHARGE_PACKS);

  const rechargePacks = rechargeData?.getRechargePacks?.data || [];

  const getintake = intakeRes?.getIntakeById;

  // ================= STATES =================
  const WELCOME_MESSAGE = {
    sender: "Astrologer",
    message:
      "Hey there! Welcome back 😊 Our consultant is reviewing your chat...",
    time: new Date().toLocaleTimeString("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    }),
  };
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  //debugger;
  const [typingStatus, setTypingStatus] = useState("");
  const [timeLeft, setTimeLeft] = useState((chattime || 0) * 60);
  // const [timeLeft, setTimeLeft] = useState(5 * 60);

  const [showPopup, setShowPopup] = useState(false);
  const [leaveMessage, setLeaveMessage] = useState("");
  const [completedChat, setCompletedChat] = useState(false);
  const [showReviewPopup, setShowReviewPopup] = useState(false);
  const [rating, setRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [chatEnded, setChatEnded] = useState(false);
  const [createReview, { loading: reviewLoading }] = useMutation(CREATE_REVIEW);
  const [user, setUser] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  //   const [queueData, setQueueData] = useState(null);
  // const [showQueuePopup, setShowQueuePopup] = useState(false);
  const [uploadImage] = useMutation(UPLOAD_IMAGE);
  const chatEndedRef = useRef(false);
  const hasJoinedRef = useRef(false);
  const messageEndRef = useRef(null);
  const intervalRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const JOIN_KEY = `chatJoined_${room_Id}`;
  const END_KEY = `chatCompleted_${room_Id}`;
  useEffect(() => {
    if (typeof window === "undefined") return;

    const savedSession = localStorage.getItem("activeChatSession");
    if (!savedSession) return;

    const parsed = JSON.parse(savedSession);

    if (parsed.room_Id === room_Id && parsed.chatEnded) {
      chatEndedRef.current = true;
      setChatEnded(true);
    }
  }, [room_Id]);

  // useEffect(() => {
  //   if (!room_Id) return;

  //   localStorage.setItem("chatActive", "true");
  // }, [room_Id]);

  useEffect(() => {
    if (!room_Id) return;

    const chatSession = {
      room_Id,
      astroid,
      user_Id,
      astro_Name,
      astro_Image,
      timeLeft,
      chatEnded,
    };
    localStorage.setItem("activeChatSession", JSON.stringify(chatSession));
  }, [room_Id, timeLeft, chatEnded]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        if (!room_Id) return;

        const res = await fetch("https://dhwaniastro.com/userAuth/graphql", {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: `
                query GetChatMessages($roomId: String!) {
                  getChatMessages(roomId: $roomId) {
                    msg_id
                    sender
                    message
                    image
                    replyTo
                    time
                  }
                }
              `,
            variables: {
              roomId: room_Id,
            },
          }),
        });

        const result = await res.json();
        const isReload =
          performance.getEntriesByType("navigation")[0]?.type === "reload";

        if (result?.data?.getChatMessages?.length > 0) {
          const history = result.data.getChatMessages;

          if (isReload) {
            setMessages((prev) => {
              // prevent duplicate welcome message
              const alreadyHasWelcome = prev.some(
                (msg) => msg.message === WELCOME_MESSAGE.message,
              );

              return alreadyHasWelcome
                ? history
                : [WELCOME_MESSAGE, ...history];
            });
          } else {
            setMessages(history);
          }
        } else {
          // no history → show welcome message
          setMessages([WELCOME_MESSAGE]);
        }
      } catch (err) {
        console.error("Fetch messages error:", err);
      }
    };

    fetchMessages();
  }, [room_Id]);
  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Get user from localStorage safely (client-side only)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user");
      setUser(storedUser ? JSON.parse(storedUser) : {});
    }
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Only images allowed");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };

    reader.readAsDataURL(file);
    setImageFile(file);
  };
  const uploadToServer = async (file) => {
    try {
      const res = await uploadImage({
        variables: { file },
      });

      return res.data.uploadImage.url;
    } catch (err) {
      toast.error("Upload failed");
      return null;
    }
  };
  const customer_recharge = () => {
    if (!socket) return;
    socket.emit("customer_recharge", { room_id: room_Id });
  };

  const customer_recharge_fail = () => {
    if (!socket) return;
    socket.emit("customer_recharge_fail", { room_id: room_Id });
  };

  const customer_recharge_completed = (due_time) => {
    if (!socket) return;
    socket.emit("customer_recharge_completed", {
      room_id: room_Id,
      due_time: due_time,
    });
  };
  // ================= RECHARGE FUNCTION =================
  const handleCheckout = async (amount, packId) => {
    try {
      customer_recharge();
      setIsPaused(true);
      const { data } = await createOrder({
        variables: {
          input: {
            rechargePackId: packId,
            coupan_code: "",
          },
        },
      });

      const order = data?.createOrder;
      if (!order?.success || !order?.orderId) {
        setIsPaused(false);
        toast.error("Error creating order");
        return;
      }

      const options = {
        key:
          process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_live_3zT42YgMgCfOim",

        // Backend ke Razorpay order se aaya amount
        amount: order.amount,

        currency: order.currency,
        order_id: order.orderId,

        name: "Dhwani Astro LLP",
        description: "Wallet Recharge",

        notes: {
          userId: user?.id ?? "guest",
          rechargePackId: packId,
              ipAddress: geoInfo.ip,
                state: geoInfo.state,
                city: geoInfo.city,
                country: geoInfo.country,
          platform: "WEB",
        },

        handler: async function (response) {
          toast.success("Payment Successful");

          const selectedPack = rechargePacks.find((p) => p.id === packId);

          if (selectedPack) {
            const requestData = JSON.parse(
              localStorage.getItem(`activeRequests`) || "null",
            );

            const newTime = timeLeft + selectedPack.talktime * 60/requestData?.[0]?.astrologer?.pricePerMin;

            customer_recharge_completed(newTime);

            setTimeLeft(newTime);
          }

          setIsPaused(false);
        },

        modal: {
          ondismiss: function () {
            customer_recharge_fail();
            toast.error("Payment Cancelled");
            setIsPaused(false);
          },
        },

        theme: {
          color: "#fff49e",
        },
      };

      if (!window.Razorpay) {
        setIsPaused(false);
        toast.error("Razorpay is not loaded");
        return;
      }

      const razor = new window.Razorpay(options);

      razor.open();
    } catch (error) {
      console.error("🔴 Checkout Error:", error);

      setIsPaused(false);

      toast.error(error?.message || "Payment failed");
    }
  };

  const handleMessageChange = (e) => {
    const value = e.target.value;
    setMessage(value);

    if (!socket) return;

    // Emit typing = true
    socket.emit("typing", {
      room_id: room_Id,
      typing: true,
      user_name: user?.name || "User",
    });

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Emit typing = false after 2 sec idle
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("typing", {
        room_id: room_Id,
        typing: false,
        user_name: user?.name || "User",
      });
    }, 2000);
  };

  const emitChatCompleted = () => {
    if (chatEndedRef.current) return;
    clearInterval(intervalRef.current);
    intervalRef.current = null;
    // chatEndedRef.current = true;

    setChatEnded(true);

    localStorage.setItem(`chatCompleted_${room_Id}`, "true");
    localStorage.removeItem(`chatJoined_${room_Id}`);
    localStorage.removeItem("activeRequest");
    localStorage.removeItem(`chat_request_${room_Id}`);

    ["chatActive", `activeChatRoom_${room_Id}`, "activeChatSession"].forEach(
      (key) => {
        localStorage.removeItem(key);
      },
    );

    if (!socket) return;

    socket.emit("chatCompleted", {
      room_id: room_Id,
      astroId: astroid,
      userId: user_Id,
    });

    socket.emit("leave_room", { room_id: room_Id });
  };

  useEffect(() => {
    if (!socket || !room_Id || !user_Id) return;

    const isEnded = localStorage.getItem(`chatCompleted_${room_Id}`) === "true";

    if (isEnded) {
      return;
    }

    const alreadyJoined =
      localStorage.getItem(`chatJoined_${room_Id}`) === "true";

    const isReload =
      performance.getEntriesByType("navigation")[0]?.type === "reload";

    //  First time join
    if (!alreadyJoined) {
      socket.emit("joinChat", {
        username: "customer",
        room_id: room_Id,
        joinpersonid: user_Id,
      });

      localStorage.setItem(`chatJoined_${room_Id}`, "true");
      return;
    }

    //  Refresh → allow rejoin
    if (isReload) {
      socket.emit("joinChat", {
        username: "customer",
        room_id: room_Id,
        joinpersonid: user_Id,
      });
    }
  }, [socket, room_Id, user_Id]);
  useEffect(() => {
    if (!socket || !room_Id || !user_Id) return;

    const handleReconnect = () => {
      const isEnded =
        localStorage.getItem(`chatCompleted_${room_Id}`) === "true";

      if (isEnded) {
        return;
      }

      socket.emit("joinChat", {
        username: "customer",
        room_id: room_Id,
        joinpersonid: user_Id,
      });
    };

    socket.on("connect", handleReconnect);

    return () => {
      socket.off("connect", handleReconnect);
    };
  }, [socket, room_Id, user_Id]);

  useEffect(() => {
    hasJoinedRef.current = false;
  }, [room_Id]);
  const firstLoad = useRef(true);

  useEffect(() => {
    if (!messageEndRef.current) return;

    messageEndRef.current.scrollIntoView({
      behavior: firstLoad.current ? "auto" : "smooth",
      block: "end",
    });

    firstLoad.current = false;
  }, [messages]);
  useEffect(() => {
    if (!socket) return;

    socket.on("receive_message", (data) => {
      setMessages((prev) => {
        //  prevent duplicate
        const alreadyExists = prev.some((msg) => msg.msg_id === data.msg_id);

        if (alreadyExists) return prev;

        return [
          ...prev,
          {
            msg_id: data.msg_id,
            sender: data.sender,
            message: data.message,
            image: data.image || null,
            replyTo: data.replyTo || null,
            time: data.time,
          },
        ];
      });
    });

    socket.on("typing", (data) => {
      if (data.user_name === "Astrologer") {
        setTypingStatus(data.typing ? "Astrologer typing..." : "");
      }
    });
    //  socket.on("queue_position", (data) => {
    //    console.log("Queue Data:", data);
    //    setQueueData(data); // { position: 3, waitTime: 120 }
    //    setShowQueuePopup(true);
    // });
    //  Leave Chat
    socket.on("leave_chat", (data) => {
      if (data.roomId === room_Id) {
        localStorage.removeItem(`chatJoined_${room_Id}`);
        [
          "chatActive",
          `activeChatRoom_${room_Id}`,
          "activeChatSession",
          `queue_${room_Id}`,
`timer_${room_Id}`
        ].forEach((key) => {
          localStorage.removeItem(key);
        });

        setLeaveMessage("Chat ended by astrologer");
        setShowReviewPopup(true);
        setTimeout(() => {
          dispatch(removeActiveRequest(room_Id));
          router.push("/astrologer/chat");
        }, 18000);
        // const isReload = performance.getEntriesByType("navigation")[0]?.type === "reload";

        //         setTimeout(() => {
        //           if (!isReload) {
        //           router.push("/");
        //          }
        //         }, 3000);
      }
    });

    //  Completed Chat
    socket.on("chatCompleted", (data) => {
      if (data.roomId !== room_Id) return;

      if (chatEndedRef.current) return; //  prevent duplicate

      //chatEndedRef.current = true;

      setLeaveMessage("Chat completed successfully");
      setShowReviewPopup(true);
      localStorage.removeItem("activeRequests");
      localStorage.removeItem(`chat_request_${room_Id}`);
      localStorage.removeItem("activeChatSession");
      // dispatch(removeActiveRequest(room_Id));

      setTimeout(() => {
        router.push("/astrologer/chat");
        dispatch(removeActiveRequest(room_Id));
      }, 18000);
    });

    //  User Disconnected
    socket.on("user_disconnected", () => {
      setLeaveMessage("User disconnected");
      setShowPopup(true);

      setTimeout(() => {
        router.push("/astrologer/chat");
      }, 3000);
    });

    return () => {
      socket.off("receive_message");
      socket.off("typing");
      socket.off("leave_chat");
      socket.off("chatCompleted");
      socket.off("user_disconnected");
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [socket, room_Id, user_Id]);

  // ================= TIMER =================

  useEffect(() => {
    if (!socket) return;

    if (intervalRef.current) return;

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (isPaused) return prev;

        if (prev <= 1) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;

          emitChatCompleted();

          setShowReviewPopup(true);
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [socket, isPaused]);

  // ================= SEND MESSAGE =================

  const sendMessage = async () => {
    if (!socket || !socket.connected) {
      toast.error("Connecting... please wait");
      return;
    }
    if (!message.trim() && !imageFile) return;

    socket.emit("typing", {
      room_id: room_Id,
      typing: false,
      user_name: user?.name || "User",
    });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    const msg_id = crypto.randomUUID();

    //  USE PREVIEW INSTANTLY
    const tempImage = imagePreview;

    const newMessage = {
      room_id: room_Id,
      msg_id,
      sender_id: user?.id,
      received_id: astroid,
      sender: "user",
      message: message.trim(),
      image: tempImage,
      replyTo: replyTo
        ? {
            sender: replyTo.sender,
            message: replyTo.message,
            image: replyTo.image || null,
          }
        : null,
      time: new Date().toLocaleTimeString("en-IN", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      }),
    };

    //SHOW IN UI IMMEDIATELY
    setMessages((prev) => [...prev, newMessage]);

    // reset input instantly
    setMessage("");
    setImageFile(null);
    setImagePreview(null);
    setReplyTo(null);

    //  Upload in background
    let finalImageUrl = null;

    if (imageFile) {
      finalImageUrl = await uploadToServer(imageFile);
    }

    //  SEND FINAL MESSAGE WITH REAL URL
    socket.emit("send_message", {
      ...newMessage,
      image: finalImageUrl,
    });

    //  OPTIONAL: replace preview with real URL
    if (finalImageUrl) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.msg_id === msg_id ? { ...msg, image: finalImageUrl } : msg,
        ),
      );
    }
  };

  // ================= REVIEW =================

  const handleSubmitReview = async () => {
    if (chatEndedRef.current) {
      return;
    }

    try {
      chatEndedRef.current = true;

      // socket.emit("chatCompleted", {
      //   room_id: room_Id,
      //   astroId: astroid,
      //   userId: user_Id,
      // });

      await createReview({
        variables: {
          input: {
            astro_id: String(astroid),
            star: rating,
            comment: reviewComment,
            // user_name: getintake?.name || "",
            // astro_name: astro_Name,
          },
        },
      });

      toast.success("Review submitted successfully");

      setShowReviewPopup(false);
      // dispatch(removeActiveRequest(room_Id));

      router.push("/astrologer/chat");

      // setTimeout(() => {
      //   setShowReviewPopup(false);
      //   router.push("/astrologer/chat");
      // }, 8000);
    } catch (error) {
      console.error("Review error:", error);
      toast.error("Failed to submit review");
    }
  };

  const isLoading = userLoading || intakeLoading;

  const formatISTTime = (time) => {
    return new Date(time).toLocaleTimeString("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // ================= UI =================

  return (
    <div className="flex items-center justify-center h-screen justify-center items-center bg-[#120a18e7] relative overflow-hidden">
      <div className="absolute w-[400px] h-[400px] bg-purple-600 opacity-20 blur-3xl rounded-full top-[-100px] left-[-100px]" />
      <div className="absolute w-[500px] h-[500px] bg-violet-500 opacity-20 blur-3xl rounded-full bottom-[-100px] right-[-100px]" />
      <div className="md:w-3/5 overflow-hidden w-full bg-white shadow-lg rounded-2xl md:p-4 flex flex-col md:h-[95vh] h-[100vh]">
        <Script src="https://checkout.razorpay.com/v1/checkout.js" />

        {/* HEADER */}
        <div className="bg-gradient-to-r text-black from-purple-900 to-purple-700 rounded-full text-white px-4 py-2 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Image
              src={
                astro_Image
                  ? `https://www.dhwaniastro.com${astro_Image}`
                  : "/man.png"
              }
              width={45}
              height={45}
              alt="astro"
              className="h-auto rounded-full md:w-10 w-7"
            />
            <div>
              <div className="font-semibold text-sm">{storedAstroName}</div>
              <div className="text-xs text-green-300">
                {typingStatus || "Online"}
              </div>
            </div>
          </div>

          <div className="flex items-center overflow-hidden gap-3">
            <div className="flex items-center gap-2">
              <span className="text-yellow-400 font-semibold text-[10px]">
                Time :
              </span>
              <span className="border border-yellow-400 text-yellow-300 bg-white/10 font-medium shadow-2xl overflow-hidden rounded-full px-2 py-1 text-xs">
                {formatTime(timeLeft)} Min
              </span>
            </div>

            <button
              onClick={() => {
                emitChatCompleted();
                setShowReviewPopup(true);
              }}
              className="bg-red-500 px-3 py-1 rounded-full cursor-pointer text-sm"
            >
              End
            </button>
          </div>
        </div>
        {/* =================  RECHARGE SECTION ================= */}
        {timeLeft <= 60 && (
          <div className="bg-yellow-100 px-4 py-3">
            <p className="text-center text-red-500 text-xs font-semibold mb-2">
              Your time is running low. Recharge now
            </p>

            {rechargePackLoading ? (
              <p className="text-center text-xs">Loading packs...</p>
            ) : (
              <div className="flex flex-wrap justify-center gap-3">
                {rechargePacks.map((pack) => (
                  <button
                    key={pack.id}
                    onClick={() => handleCheckout(pack.price, pack.id)}
                    id={pack.id}
                    className="bg-red-500 text-white px-3 py-2 rounded-lg flex flex-col items-center text-xs"
                  >
                    <span>₹ {pack.price}</span>
                    <span>{pack.talktime} min</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        {/* CHAT */}
        <div className="flex-1 flex flex-col overflow-y-auto px-3 py-4 text-black space-y-2 ">
          {messages.map((msg, i) => (
            <div
              key={i}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              className={`relative w-[60%] max-w-fit flex flex-col ${
                msg.sender === "Astrologer"
                  ? "justify-self-start bg-yellow-100 mx-4"
                  : "self-end bg-purple-100 ms-7"
              } rounded-lg px-3 py-2 text-gray-700 md:text-xs tracking-wide  text-[10px] gap-0.5`}
            >
              <div className="flex flex-col gap-0 msgs-det">
                {/*  REPLY CONTEXT */}
                {msg.replyTo && (
                  <div className="bg-gray-100 rounded-lg border-l-4 border-purple-500 p-2 mb-1 text-xs">
                    <strong>{msg.replyTo.sender}</strong>:{" "}
                    {msg.replyTo.message?.slice(0, 40)}
                    {msg.replyTo.image && (
                    <span>
                              <Zoom>
                                <Image width={100} height={100} 
                                  src={msg.replyTo.image}
                                  alt="reply-img"
                                  className="inline-block object-cover w-8 h-8 align-middle border border-gray-300 rounded-md"
                                />
                              </Zoom>
                            </span>
                    )}
                  </div>
                )}

                {/* MESSAGE TEXT */}
                {msg.message && <div>{msg.message}</div>}

                {msg.image && (
                  <div className="relative">
                       <Zoom>
                             <Image width={100} height={100} 
                              src={msg.image}
                              alt="uploaded"
                              className="object-cover w-32 h-32 rounded-lg cursor-zoom-in"
                            />
                          </Zoom>
                  </div>
                )}

                <div className="flex items-center self-end gap-1 time-check">
                  <span className="text-gray-500 text-[10px]">{msg.time}</span>
                  <span className="text-gray-500 text-[10px]">
                    <BiCheckDouble size={10} style={{ color: "#32CD32" }} />
                  </span>
                </div>

                {/*  REPLY BUTTON (hover) */}
                {hoveredIndex === i && (
                  <button
                    onClick={() => setReplyTo(msg)}
                    className="absolute top-1.25 -left-5.5 group"
                  >
                    <span className="relative flex  cursor-pointer items-center justify-center w-6 h-6 border border-gray-300 rounded-lg shadow bg-white">
                      <svg
                        fill="currentColor"
                        className="text-blue-500"
                        width="16"
                        height="16"
                        viewBox="0 0 640 640"
                      >
                        <path d="M364.2 82.4C376.2 87.4 384 99 384 112L384 192L432 192C529.2 192 608 270.8 608 368C608 481.3 526.5 531.9 507.8 542.1C505.3 543.5 502.5 544 499.7 544C488.8 544 480 535.1 480 524.3C480 516.8 484.3 509.9 489.8 504.8C499.2 496 512 478.4 512 448.1C512 395.1 469 352.1 416 352.1L384 352.1L384 432.1C384 445 376.2 456.7 364.2 461.7C352.2 466.7 338.5 463.9 329.3 454.8L169.3 294.8C156.8 282.3 156.8 262 169.3 249.5L329.3 89.5C338.5 80.3 352.2 77.6 364.2 82.6z" />
                      </svg>

                      <span className="hidden group-hover:block absolute bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-gray-700 text-white text-[10px] rounded px-2 py-1">
                        Reply
                      </span>
                    </span>
                  </button>
                )}
              </div>
            </div>
          ))}
          <div ref={messageEndRef} />
        </div>

        {replyTo && (
          <div className="mx-3 mb-2 p-1 rounded-lg bg-blue-50 max-w-fit flex gap-5 text-black  border-l-4 border-purple-500 flex justify-between items-start">
            <div className="text-xs">
              <strong className="text-[10px]">Reply to {replyTo.sender}</strong>

              <div className="">{replyTo.message?.slice(0, 40)}</div>

              {replyTo.image && (
                <Zoom>
                          <Image width={100} height={100} 
                          src={replyTo.image}
                          alt="reply-img"
                          className="inline-block object-cover w-8 h-8 align-middle border border-gray-300 rounded-md"
                        />
                      </Zoom>
              )}
            </div>

            <button
              onClick={() => setReplyTo(null)}
              className="text-red-500 bg-gray-300 rounded-full h-5 w-5 cursor-pointer text-xs"
            >
              ✕
            </button>
          </div>
        )}

        {/*  IMAGE PREVIEW */}
        {imagePreview && (
          <div className="px-3 py-2 flex items-start gap-0">
             <Image width={100} height={100} alt="hello"
              src={imagePreview}
              className="w-16 h-16 object-cover rounded"
            />
            <button
              onClick={() => {
                setImagePreview(null);
                setImageFile(null);
              }}
              className="text-red-500 bg-gray-300 rounded-full h-5 w-5 cursor-pointer text-xs"
            >
              X
            </button>
          </div>
        )}

        <div className="flex items-center gap-2 relative">
          <div className="flex  items-center w-full border text-black border-gray-300 overflow-hidden rounded-full h-13 shadow inp-attach ps-2 pe-3">
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageChange}
              className="hidden"
            />

            <input
              value={message}
              onChange={handleMessageChange}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              maxLength={200}
              className="flex-grow w-full text-black px-2 py-1 text-xs  border-0 rounded-lg outline-none resize-none placeholder:text-xs md:py-2 focus:outline-none"
              placeholder="Type your message..."
            />
            <button
              type="button"
              onClick={() => fileInputRef.current.click()}
              className="p-1 text-xs text-white bg-purple-400 rounded-full flex items-center gap-1"
              title="Add File"
            >
              <svg
                height={18}
                width={18}
                className="cursor-pointer"
                viewBox="0 0 640 640"
              >
                <path d="M288.6 76.8C344.8 20.6 436 20.6 492.2 76.8C548.4 133 548.4 224.2 492.2 280.4L328.2 444.4C293.8 478.8 238.1 478.8 203.7 444.4C169.3 410 169.3 354.3 203.7 319.9L356.5 167.3C369 154.8 389.3 154.8 401.8 167.3C414.3 179.8 414.3 200.1 401.8 212.6L249 365.3C239.6 374.7 239.6 389.9 249 399.2C258.4 408.5 273.6 408.6 282.9 399.2L446.9 235.2C478.1 204 478.1 153.3 446.9 122.1C415.7 90.9 365 90.9 333.8 122.1L169.8 286.1C116.7 339.2 116.7 425.3 169.8 478.4C222.9 531.5 309 531.5 362.1 478.4L492.3 348.3C504.8 335.8 525.1 335.8 537.6 348.3C550.1 360.8 550.1 381.1 537.6 393.6L407.4 523.6C329.3 601.7 202.7 601.7 124.6 523.6C46.5 445.5 46.5 318.9 124.6 240.8L288.6 76.8z" />
              </svg>
            </button>
          </div>
          {/* SEND BUTTON */}
          <button
            onClick={sendMessage}
            className="px-4 py-4 text-xs text-white bg-green-600 rounded-full bold-full"
          >
            <svg height={22} width={22} viewBox="0 0 640 640">
              <path
                fill="rgb(255, 255, 255)"
                d="M568.4 37.7C578.2 34.2 589 36.7 596.4 44C603.8 51.3 606.2 62.2 602.7 72L424.7 568.9C419.7 582.8 406.6 592 391.9 592C377.7 592 364.9 583.4 359.6 570.3L295.4 412.3C290.9 401.3 292.9 388.7 300.6 379.7L395.1 267.3C400.2 261.2 399.8 252.3 394.2 246.7C388.6 241.1 379.6 240.7 373.6 245.8L261.2 340.1C252.1 347.7 239.6 349.7 228.6 345.3L70.1 280.8C57 275.5 48.4 262.7 48.4 248.5C48.4 233.8 57.6 220.7 71.5 215.7L568.4 37.7z"
              />
            </svg>
          </button>
        </div>
        {/* POPUPS */}
        {showReviewPopup && (
          <div className="fixed inset-0 text-black flex items-center justify-center bg-black/60 z-50">
            <div className="bg-white shadow-xl w-[90%] max-w-md rounded-xl p-6">
              <h2 className="text-xl text-center mb-4">Rate Your Experience</h2>

              <div className="flex justify-center mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    onClick={() => setRating(star)}
                    className={
                      star <= rating ? "text-yellow-400" : "text-gray-300"
                    }
                  >
                    ★
                  </span>
                ))}
              </div>

              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Enter your feedback here..."
                className="w-full border border-gray-300 placeholder:text-gray-400 placeholder:font-light rounded-2xl shadow-xl mb-3 p-2"
              />

              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => {
                    emitChatCompleted();
                    setShowReviewPopup(false);
                    router.push("/astrologer/chat");
                  }}
                  className="w-1/3 border py-2 border-gray-400 rounded-full"
                >
                  Skip
                </button>

                <button
                  onClick={handleSubmitReview}
                  disabled={reviewLoading}
                  className="w-1/3 bg-purple-700 text-white py-2 rounded-full disabled:opacity-50"
                >
                  {reviewLoading ? "Submitting..." : "Submit"}
                </button>
              </div>
            </div>
          </div>
        )}

        <AlertLoading show={isLoading} title="Loading..." />
      </div>
    </div>
  );
};

export default UserChat;
