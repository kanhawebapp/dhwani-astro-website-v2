"use client";

import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { useRouter } from "next/navigation";

import { Navigation, Pagination, Autoplay } from "swiper/modules";
import CustomButton from "./Custom/CustomButton";

import { useEffect, useState, useContext } from "react";

import { AlertLoading, AstrologerPrice } from "@/app/common";
import SocketContext from "@/app/context/socketContext";
import { useLanguage } from "../app/context/LangContext";
import useScrollZoom from "@/Hooks/scrollZoom";

import { useQuery } from "@apollo/client/react";
import { GET_ASTROLOGERS_USER } from "@/app/graphql/gqlQuery";
import RecentRequestPopup from "./Custom/RecentRequestPopUp";
import { useSelector } from "react-redux";

export default function Astronewcard() {
  const busySet = new Set();
  const [showRecentPopup, setShowRecentPopup] = useState(false);
  const { code } = useSelector((state) => state.chatAlert);

  const [selectedAstroData, setSelectedAstroData] = useState(null);

  const openRecentPopup = ({ astroId, mode, astrologer }) => {
    setSelectedAstroData({
      astroId,
      mode,
      astrologer,
    });

    setShowRecentPopup(true);
  };
  const { messages: t } = useLanguage();
  const router = useRouter();

  const [alert, setAlert] = useState(false);
  const [astroId, setAstroId] = useState(0);
  const [busyAstros, setBusyAstros] = useState([]);

  const [userData, setUserData] = useState({
    user_status: 0,
    balance_amount: 0,
  });
  useScrollZoom(".setup-wrap");

  const {
    data: astrologerResponse,
    loading: astrologerLoading,
    error: astrologerError,
  } = useQuery(GET_ASTROLOGERS_USER, {
    variables: {
      searchInput: {
        limit: 10,
        page: 1,
        sortField: "RATING",
        sortOrder: "DESC",
        type: "CHAT",
      },
    },
    fetchPolicy: "network-only",
  });

  const { socket } = useContext(SocketContext);

const astrologerlist =
  astrologerResponse?.getAstrologerListForUser?.data || [];

  useEffect(() => {
    if (!socket) {
      console.log("socket not available");
      return;
    }

    socket.on("astrologer_request_busy", (data) => {
      const id = Number(data?.astro_id);

      if (busySet.has(id)) {
        return;
      }

      busySet.add(id);
      setBusyAstros([...busySet]);
    });

    const handleFree = (data) => {
      const id = parseInt(data.astro_id);

      setBusyAstros((prev) => prev.filter((astroId) => astroId !== id));
    };

    socket.on("astrologerfree", handleFree);

    return () => {
      socket.off("astrologer_request_busy");
      socket.off("astrologerfree", handleFree);
    };
  }, [socket]);

  const astrologeroffline = () => {
    toast.error(
      "Astrologer selected by you is offline now so please choose another astrologer.",
    );
  };

  if (astrologerLoading) {
    return <AlertLoading show={true} title="Please Wait.." />;
  }

  if (astrologerError) {
    console.error("Astrologer API Error:", astrologerError);
    return null;
  }
  const handleClick = ({ id, mode, price, astro }) => {
    if (!userData) {
      toast.error("User data not loaded yet");
      return;
    }

    const goToRequest = () => {
      if (!mode || !id) return;

      openRecentPopup({
        astroId: id,
        mode,
        astrologer: astro,
      });
    };

    if (userData.user_status === 0) {
      if (code === 200) {
        toast.error("Astrologer selected by Your Chat Running Already!");
      } else {
        goToRequest();
      }

      return;
    }

    if (userData.user_status === 1 || userData.user_status === 2) {
      const astro_price = (price || 0) * 5;

      if (astro_price > userData.balance_amount) {
        setQuick(true);
        setAstroId(id);
      } else {
        if (code === 200) {
          toast.error("Astrologer selected by Your Chat Running Already!");
        } else {
          goToRequest();
        }
      }

      return;
    }

    goToRequest();
  };
const getAstroStatus = (astro, mode) => {
  const isServiceActive =
    mode === "chat" ? astro?.isChatActive : astro?.isCallActive;

  const isSocketBusy = busyAstros.includes(astro?.id);

  if (!astro?.isOnline) {
    return {
      color: "bg-red-600",
      disabled: true,
    };
  }

  if (!isServiceActive) {
    return {
      color: "bg-red-600",
      disabled: true,
    };
  }

  if (astro?.isBusy || isSocketBusy) {
    return {
      color: "bg-yellow-500",
      disabled: false,
    };
  }

  return {
    color: "bg-green-600",
    disabled: false,
  };
};
  return (
    <section className="flex-col items-center self-center w-full sm:max-w-7xl">
      <div className="flex flex-col items-center justify-center rounded-full px-4 sm:py-4 py-0 sm:max-w-7xl">
        <h1
          dangerouslySetInnerHTML={{
            __html:
              t?.consult?.heading || "Consult with our Top Premium Astrologers",
          }}
          className=" text-[#2f1254] text-[15px] sm:text-xl lg:text-2xl  py-3 text-center font-semibold"
        ></h1>
        <div className="setup-wrap w-full">
          <div className="relative rounded-xl md:rounded-full z-10 grid items-start justify-center w-full grid-cols-4 gap-1 py-2 mt-3 shadow-lg user-sign-up sm:grid-cols-4 lg:grid-cols-4 sm:gap-6">
            <div className="flex flex-col items-center justify-center gap-2 p-1 text-center service-card-sign rounded-xl sm:p-3">
              <svg
                fill="#000000"
                width={30}
                height={30}
                viewBox="0 0 24 24"
                id="user"
                data-name="Flat Color"
                className="p-1.5 bg-purple-300 rounded-full"
              >
                <path
                  id="primary"
                  d="M21,20a2,2,0,0,1-2,2H5a2,2,0,0,1-2-2,6,6,0,0,1,6-6h6A6,6,0,0,1,21,20Zm-9-8A5,5,0,1,0,7,7,5,5,0,0,0,12,12Z"
                ></path>
              </svg>
              <p
                dangerouslySetInnerHTML={{
                  __html: t?.consult?.tag1 || "Sign Up with Dhwani Astro",
                }}
                className="text-[9px] sm:text-xs text-[#2f1254] sm:font-semibold"
              ></p>
            </div>

            <div className="flex flex-col items-center justify-center gap-2 p-1 text-center service-card-sign rounded-xl sm:p-3">
              <svg
                width={30}
                height={30}
                viewBox="0 0 15 15"
                fill="none"
                className="p-1.5 bg-fuchsia-300 rounded-full"
              >
                <path
                  d="M11 10.5H12.5V9M11 4.5H12.5V6M4 4.5H2.5V6M2.5 9V10.5H4M7.5 9.5C6.39543 9.5 5.5 8.60457 5.5 7.5C5.5 6.39543 6.39543 5.5 7.5 5.5C8.60457 5.5 9.5 6.39543 9.5 7.5C9.5 8.60457 8.60457 9.5 7.5 9.5ZM1.5 2.5H13.5C14.0523 2.5 14.5 2.94772 14.5 3.5V11.5C14.5 12.0523 14.0523 12.5 13.5 12.5H1.5C0.947716 12.5 0.5 12.0523 0.5 11.5V3.5C0.5 2.94772 0.947715 2.5 1.5 2.5Z"
                  stroke="#000000"
                />
              </svg>
              <p
                dangerouslySetInnerHTML={{
                  __html:
                    t?.consult?.tag2 || "Put Money in Dhwani Astro Wallet",
                }}
                className="text-[9px] sm:text-xs text-[#2f1254] sm:font-semibold"
              ></p>
            </div>

            <div className="flex text-black text flex-col items-center justify-center gap-2 p-1 text-center service-card-sign rounded-xl sm:p-3">
              <svg
                fill="#000000"
                width={30}
                height={30}
                viewBox="0 0 24 24"
                version="1.2"
                baseProfile="tiny"
                className="p-1.5 bg-purple-300 rounded-full"
              >
                <path d="M12 14c1.381 0 2.631-.56 3.536-1.465.904-.904 1.464-2.154 1.464-3.535s-.56-2.631-1.464-3.535c-.905-.905-2.155-1.465-3.536-1.465s-2.631.56-3.536 1.465c-.904.904-1.464 2.154-1.464 3.535s.56 2.631 1.464 3.535c.905.905 2.155 1.465 3.536 1.465zM20 15c.69 0 1.315-.279 1.768-.731.453-.452.732-1.077.732-1.769 0-.69-.279-1.315-.732-1.768-.453-.453-1.078-.732-1.768-.732-.691 0-1.316.279-1.769.732-.452.453-.731 1.078-.731 1.768 0 .691.279 1.316.731 1.769s1.078.731 1.769.731zM20 15.59c-1.331 0-2.332.406-2.917.968-1.115-.917-2.878-1.558-5.083-1.558-2.266 0-3.995.648-5.092 1.564-.596-.565-1.608-.974-2.908-.974-2.188 0-3.5 1.09-3.5 2.182 0 .545 1.312 1.092 3.5 1.092.604 0 1.146-.051 1.623-.133l-.04.27c0 1 2.406 2 6.417 2 3.762 0 6.417-1 6.417-2l-.02-.255c.463.073.995.118 1.603.118 2.051 0 3.5-.547 3.5-1.092 0-1.092-1.373-2.182-3.5-2.182zM4 15c.69 0 1.315-.279 1.768-.732.453-.453.732-1.078.732-1.768 0-.689-.279-1.314-.732-1.768-.453-.452-1.078-.732-1.768-.732-.691 0-1.316.28-1.769.732-.452.454-.731 1.079-.731 1.768 0 .69.279 1.315.731 1.768.453.453 1.078.732 1.769.732z" />
              </svg>
              <p
                dangerouslySetInnerHTML={{
                  __html: t?.consult?.tag3 || "Click on Call or Chat",
                }}
                className="text-[9px] sm:text-xs text-[#2f1254] sm:font-semibold"
              ></p>
            </div>

            <div className="flex flex-col items-center justify-center gap-2 p-1 text-center service-card-sign rounded-xl sm:p-3">
              <svg
                width={30}
                height={30}
                viewBox="0 0 16 16"
                className="p-1.5 bg-violet-300 rounded-full"
                fill="#000000"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M4.111 2.18a7 7 0 1 1 7.778 11.64A7 7 0 0 1 4.11 2.18zm.556 10.809a6 6 0 1 0 6.666-9.978 6 6 0 0 0-6.666 9.978zM6.5 7a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm5 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM8 11a3 3 0 0 1-2.65-1.58l-.87.48a4 4 0 0 0 7.12-.16l-.9-.43A3 3 0 0 1 8 11z"
                />
              </svg>
              <p
                dangerouslySetInnerHTML={{
                  __html:
                    t?.consult?.tag4 || "Rate & Review after consultation",
                }}
                className="text-[9px] sm:text-xs text-[#2f1254] sm:font-semibold"
              ></p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative p-4 astrocard-swipe sm:max-w-7xl">
        {/* Custom Navigation Buttons */}
        <div className="absolute top-1/2 left-0 sm:-left-1px lg:left-[-50px] transform -translate-y-1/2 z-10">
          <button
            aria-label="Previous Astrologer"
            className="swiper-button-prev-astro"
          >
            ‹
          </button>
        </div>
        <div className="absolute top-1/2 right-0  sm:-right-1px lg:right-[-50px] transform -translate-y-1/2 z-10">
          <button
            aria-label="Next Astrologer"
            className="swiper-button-next-astro"
          >
            ›
          </button>
        </div>
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={20}
          slidesPerView={2}
          navigation={{
            nextEl: ".swiper-button-next-astro",
            prevEl: ".swiper-button-prev-astro",
          }}
          // pagination={{ clickable: true }}
          resizeObserver={false}
          observer={false}
          observeParents={false}
          autoplay={false}
          loop={true}
          className="mySwiperhoro"
          style={{
            "--swiper-navigation-color": "#fff",
            "--swiper-navigation-size": "25px",
          }}
          breakpoints={{
            320: {
              slidesPerView: 2,
              spaceBetween: 10,
            },
            480: {
              slidesPerView: 2,
              spaceBetween: 15,
            },
            768: {
              slidesPerView: 3,
              spaceBetween: 15,
            },
            1024: {
              slidesPerView: 4,
              spaceBetween: 20,
            },
            1280: {
              slidesPerView: 4,
              spaceBetween: 20,
            },
          }}
        >
          {astrologerlist?.map((astro, index) => (
            <SwiperSlide key={index}>
              <div>
                <div
                  className="relative w-full p-1 overflow-hidden bg-center bg-cover rounded-lg shadow-lg md:h-77 h-68 lg:h-80 sm:h-88 sm:p-1 back-astro-image"
                  style={{ backgroundImage: "url('/ds-img/mnew.jpg')" }}
                >
                  <div className="absolute inset-0 bg-[#00000030] bg-opacity-0"></div>

                  <div className="relative h-full p-2 flex rounded-lg flex-col backdrop-blur-none  items-center text-white bg-linear-to-r  from-[#f4eaffc9] via-[#e1e7fda8] to-[#f3e8ffb8]">
                    <div className="flex flex-col items-start justify-start gap-2 astro-image-price-box ">
                      <div className="flex items-center justify-between gap-1 astro-image-name sm:flex-row place-self-center sm:gap-2">
                        <Image
                          src={
                            astro?.profilePic
                              ? `https://www.dhwaniastro.com${astro.profilePic}`
                              : "/man.png"
                          }
                          className="object-cover w-16 h-16 border-4 border-yellow-400 rounded-full shadow-md sm:w-22 sm:h-22"
                          width={80}
                          height={80}
                          priority={index === 0}
                          loading={index === 0 ? "eager" : "lazy"}
                          alt={
                            astro?.displayName || astro?.name || "Astrologer"
                          }
                          onClick={() =>
                            router.push(`/astrologerprofile/${astro?.id}`)
                          }
                        />
                      </div>

                      <div className="flex flex-col items-center justify-center p-1 rounded-lg astrologer-price-skill md:p-2 bg-linear-to-r from-violet-200 to-purple-200">
                        <div className="flex flex-col items-center gap-1 astro-name-exp">
                          <h2
                            className="text-sm font-bold text-black  sm:text-base"
                            onClick={() =>
                              router.push(`/astrologerprofile/${astro?.id}`)
                            }
                          >
                            {astro?.displayName || astro?.name}
                          </h2>

                          <p className="w-[230px] text-[10px] md:text-xs text-black text-center truncate">
                            {astro?.skills?.join(", ")}
                          </p>
                          <div className="flex items-center gap-2 lang-bar">
                            <svg width={10} height={10} viewBox="0 -64 640 640">
                              <path d="M152.1 236.2c-3.5-12.1-7.8-33.2-7.8-33.2h-.5s-4.3 21.1-7.8 33.2l-11.1 37.5H163zM616 96H336v320h280c13.3 0 24-10.7 24-24V120c0-13.3-10.7-24-24-24zm-24 120c0 6.6-5.4 12-12 12h-11.4c-6.9 23.6-21.7 47.4-42.7 69.9 8.4 6.4 17.1 12.5 26.1 18 5.5 3.4 7.3 10.5 4.1 16.2l-7.9 13.9c-3.4 5.9-10.9 7.8-16.7 4.3-12.6-7.8-24.5-16.1-35.4-24.9-10.9 8.7-22.7 17.1-35.4 24.9-5.8 3.5-13.3 1.6-16.7-4.3l-7.9-13.9c-3.2-5.6-1.4-12.8 4.2-16.2 9.3-5.7 18-11.7 26.1-18-7.9-8.4-14.9-17-21-25.7-4-5.7-2.2-13.6 3.7-17.1l6.5-3.9 7.3-4.3c5.4-3.2 12.4-1.7 16 3.4 5 7 10.8 14 17.4 20.9 13.5-14.2 23.8-28.9 30-43.2H412c-6.6 0-12-5.4-12-12v-16c0-6.6 5.4-12 12-12h64v-16c0-6.6 5.4-12 12-12h16c6.6 0 12 5.4 12 12v16h64c6.6 0 12 5.4 12 12zM0 120v272c0 13.3 10.7 24 24 24h280V96H24c-13.3 0-24 10.7-24 24zm58.9 216.1L116.4 167c1.7-4.9 6.2-8.1 11.4-8.1h32.5c5.1 0 9.7 3.3 11.4 8.1l57.5 169.1c2.6 7.8-3.1 15.9-11.4 15.9h-22.9a12 12 0 0 1-11.5-8.6l-9.4-31.9h-60.2l-9.1 31.8c-1.5 5.1-6.2 8.7-11.5 8.7H70.3c-8.2 0-14-8.1-11.4-15.9z" />
                            </svg>
                            <p className="text-[10px] md:text-xs text-black  whitespace-nowrap overflow-hidden text-ellipsis">
                              {astro?.languages?.join(", ")}
                            </p>
                          </div>

                          <span className="flex flex-wrap items-center justify-center gap-1">
                            <p className="text-[10px] md:text-xs text-yellow-300 bg-[#00000880] rounded-lg py-1 px-2 w-fit">
                              Exp: {astro?.experience} Yrs
                            </p>
                            <p className="text-[10px] md:text-xs bg-[#00000880] text-yellow-300 rounded-lg py-1 px-2 w-fit flex items-center gap-2">
                              {astro?.rating.toFixed(1)}
                              <svg
                                width={10}
                                height={10}
                                viewBox="0 0 36 36"
                                aria-hidden="true"
                                role="img"
                                className="iconify iconify--twemoji"
                                preserveAspectRatio="xMidYMid meet"
                              >
                                <path
                                  fill="#FFAC33"
                                  d="M27.287 34.627c-.404 0-.806-.124-1.152-.371L18 28.422l-8.135 5.834a1.97 1.97 0 0 1-2.312-.008a1.971 1.971 0 0 1-.721-2.194l3.034-9.792l-8.062-5.681a1.98 1.98 0 0 1-.708-2.203a1.978 1.978 0 0 1 1.866-1.363L12.947 13l3.179-9.549a1.976 1.976 0 0 1 3.749 0L23 13l10.036.015a1.975 1.975 0 0 1 1.159 3.566l-8.062 5.681l3.034 9.792a1.97 1.97 0 0 1-.72 2.194a1.957 1.957 0 0 1-1.16.379z"
                                ></path>
                              </svg>
                            </p>
                            {/* <span className="text-[10px] md:text-xs text-yellow-300 flex gap-1 bg-[#00000880] p-1 rounded-lg">
                                                            {ascard.ordr} <h6>Orders</h6>
                                                        </span> */}
                          </span>
                        </div>

                        <div className="flex items-center justify-center w-full  astrologer-price-box">
                          <div className="mt-2 text-[10px] sm:text-xs  font-semibold flex gap-1 items-center justify-center">
                            {/* <span className="text-black">
                              Price : ₹ {astro?.disc_chat_charge}/min
                            </span>
                            <span className="text-red-400 text-[10px]  sm:text-xs line-through">
                              ₹ {astro?.astro_chat_charges}/min
                            </span> */}
                            {/* <AstrologerPrice mode="chat" astro={astro} /> */}
                            {(() => {
                              const chatPrice = astro?.pricing?.find(
                                (item) => item.type === "CHAT" && item.isActive,
                              );

                              return (
                                <div className="mt-2 text-[10px] sm:text-xs font-semibold flex gap-1 items-center justify-center">
                                  <span className="text-red-500 text-base">
                                    ₹{" "}
                                    {chatPrice?.offerPrice ||
                                      chatPrice?.price ||
                                      0}
                                    /min
                                  </span>

                                  {chatPrice?.offerPrice &&
                                    chatPrice.offerPrice !==
                                      chatPrice.originalPrice && (
                                      <span className="text-black text-[10px] sm:text-xs line-through">
                                        ₹ {chatPrice.originalPrice}/min
                                      </span>
                                    )}
                                </div>
                              );
                            })()}
                          </div>
                        </div>
                      </div>
                    </div>
                  <div className="flex justify-around w-full mt-1 space-x-4 md:mt-1">
  {/* CALL BUTTON */}
{(() => {
  const callStatus = getAstroStatus(astro, "call");

  const callPrice = astro?.pricing?.find(
    (item) => item.type === "CALL" && item.isActive,
  );

  return (
    <CustomButton
      disabled={callStatus.disabled}
      aria-label="Call Astrologer"
      className={`${callStatus.color} rounded-full p-3 ${
        callStatus.disabled
          ? "cursor-not-allowed opacity-70"
          : "cursor-pointer"
      }`}
      onClick={() => {
        if (callStatus.disabled) return;

        handleClick({
          id: astro?.id,
          mode: "call",
          price: callPrice?.offerPrice || callPrice?.price || 0,
          astro,
        });
      }}
    >
      <svg
        width={20}
        height={20}
        viewBox="0 0 16 16"
        version="1.1"
        className="si-glyph si-glyph-call"
      >
        <g
          stroke="none"
          strokeWidth="1"
          fill="none"
          fillRule="evenodd"
        >
          <path
            d="M14.031,11.852 C13.603,11.313 12.908,10.532 12.313,10.458 C11.951,10.413 11.535,10.713 11.125,10.996 C11.045,11.036 10.427,11.404 10.352,11.426 C9.956,11.539 9.111,11.572 8.6,11.106 C8.108,10.656 7.33,9.823 6.702,9.06 C6.102,8.274 5.473,7.329 5.151,6.749 C4.815,6.148 5.057,5.353 5.265,5.003 C5.303,4.94 5.763,4.467 5.866,4.357 L5.881,4.375 C6.262,4.055 6.661,3.73 6.706,3.378 C6.78,2.792 6.181,1.939 5.753,1.399 C5.325,0.858 4.662,-0.089 3.759,0.045 C3.419,0.095 3.126,0.214 2.837,0.385 L2.829,0.376 C2.823,0.38 2.795,0.402 2.781,0.413 C2.772,0.418 2.764,0.421 2.756,0.426 L2.759,0.43 C2.593,0.558 2.119,0.912 2.065,0.96 C1.479,1.481 0.597,2.708 1.279,4.915 C1.785,6.555 2.864,8.481 4.334,10.429 L4.326,10.436 C4.398,10.53 4.472,10.615 4.547,10.706 C4.617,10.799 4.686,10.891 4.758,10.983 L4.768,10.976 C6.328,12.855 7.964,14.357 9.457,15.243 C11.467,16.435 12.896,15.898 13.556,15.471 C13.618,15.43 14.09,15.063 14.25,14.942 L14.254,14.946 C14.26,14.94 14.264,14.932 14.272,14.926 C14.284,14.917 14.31,14.897 14.315,14.893 L14.309,14.885 C14.551,14.651 14.745,14.401 14.879,14.086 C15.23,13.257 14.459,12.393 14.031,11.852 L14.031,11.852 Z"
            fill="#fff"
            className="si-glyph-fill"
          />
        </g>
      </svg>
    </CustomButton>
  );
})()}

  {/* CHAT BUTTON */}
{(() => {
  const chatStatus = getAstroStatus(astro, "chat");

  const chatPrice = astro?.pricing?.find(
    (item) => item.type === "CHAT" && item.isActive,
  );

  return (
    <CustomButton
      disabled={chatStatus.disabled}
      aria-label="Chat with Astrologer"
      className={`${chatStatus.color} rounded-full p-3 ${
        chatStatus.disabled
          ? "cursor-not-allowed opacity-70"
          : "cursor-pointer"
      }`}
      onClick={() => {
        if (chatStatus.disabled) return;

        handleClick({
          id: astro?.id,
          mode: "chat",
          price: chatPrice?.offerPrice || chatPrice?.price || 0,
          astro,
        });
      }}
    >
      <svg
        width="20px"
        height="20px"
        viewBox="0 0 16 16"
        version="1.1"
      >
        <path
          fill="#fff"
          d="M14 14.2c0 0 0 0 0 0 0-0.6 2-1.8 2-3.1 0-1.5-1.4-2.7-3.1-3.2 0.7-0.8 1.1-1.7 1.1-2.8 0-2.8-2.9-5.1-6.6-5.1-3.5 0-7.4 2.1-7.4 5.1 0 2.1 1.6 3.6 2.3 4.2-0.1 1.2-0.6 1.7-0.6 1.7l-1.2 1h1.5c1.6 0 2.9-0.5 3.7-1.1 0 0.1 0 0.1 0 0.2 0 2 2.2 3.6 5 3.6 0.2 0 0.6 0 0.6 0 0.4 0.5 1.7 1.4 3.4 1.4 0.1-0.1-0.7-0.5-0.7-1.9zM7.4 1c3.1 0 5.6 1.9 5.6 4.1s-2.6 4.1-5.8 4.1c-0.2 0-0.6 0-0.8 0h-0.3l-.1.2c-.3.4-1.5 1.2-3.1 1.5.1-.4.1-1 .1-1.8v-.3c-1-.8-2.1-2.2-2.1-3.6 0-2.2 3.2-4.2 6.5-4.2z"
        />
      </svg>
    </CustomButton>
  );
})()}
</div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
      <AlertLoading show={alert} title="Please Wait.." />
      <RecentRequestPopup
        show={showRecentPopup}
        onClose={() => setShowRecentPopup(false)}
        astroId={selectedAstroData?.astroId}
        mode={selectedAstroData?.mode}
        astrologer={selectedAstroData?.astrologer}
      />
    </section>
  );
}
