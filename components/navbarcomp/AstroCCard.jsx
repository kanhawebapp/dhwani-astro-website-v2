"use client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import React, { useState, useEffect, useRef, useContext } from "react";
import CustomButton from "../Custom/CustomButton";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { AlertLoading, AstrologerPrice, IntentRechage } from "@/app/common";
import SocketContext from "@/app/context/socketContext";
import { useLanguage } from "../../app/context/LangContext";
import { useLazyQuery, gql } from "@apollo/client";
import RecentRequestPopup from "../Custom/RecentRequestPopUp";

function AstroCCard({ mode = "chat", data = [], loading }) {
  const busySet = new Set();
  const { messages: t } = useLanguage();
  const socket = useContext(SocketContext);
  const [busyAstros, setBusyAstros] = useState([]);
  const { code } = useSelector((state) => state.chatAlert);
  const [search, setSearch] = useState("");
  const router = useRouter();
  const dispatch = useDispatch();
  const { id } = useSelector((state) => state.id_slice);
  useEffect(() => {
    setSameUser(parseInt(id));
  }, [id]);
  const [visibleCount, setVisibleCount] = useState(20);
  const loaderRef = useRef(null);
  const [quick, setQuick] = useState(false);
  const [auth, setAuth] = useState(true);
  const [astroId, setAstroId] = useState(0);
  const [busyastro, setBusyAstro] = useState(null);
  const [sameUser, setSameUser] = useState(0);
  const [alert, setAlert] = useState(false);

  // =====================================
  const [showRecentPopup, setShowRecentPopup] = useState(false);

  const [selectedAstroData, setSelectedAstroData] = useState(null);

  const openRecentPopup = ({ astroId, mode, astrologer }) => {
    setSelectedAstroData({
      astroId,
      mode,
      astrologer,
    });

    setShowRecentPopup(true);
  };

  const [userData, setUserData] = useState({
    user_status: 0,
    balance_amount: 0,
  });

  useEffect(() => {}, [sameUser]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0];
      if (entry.isIntersecting && visibleCount < data.length) {
        setVisibleCount((prev) => prev + 4);
      }
    });

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => {
      if (loaderRef.current) observer.unobserve(loaderRef.current);
    };
  }, [visibleCount, data.length]);

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

  const astrologeroffline = () => {
    toast.error(
      "Astrologer selected by you is offline now so please choose another astrologer.",
    );
  };

  // const astrologerbusy = () => {
  //   toast.success(
  //     "Astrologer selected by you is Busy now so please choose another astrologer.",
  //   );
  // };
  console.log("xxxx");
  

  const astrologerprofile = (id) => {
    setAlert(true);
    setTimeout(() => {
      setAlert(false);
      router.push(`/astrologerprofile/${id}`);
    }, 1500);
  };

  const buttonLabel =
    mode === "call" ? `${t?.astrocard?.call}` : `${t?.astrocard?.chat}`;

  const getAstroStatus = (astro) => {
    const serviceActive =
      mode === "chat" ? astro?.isChatActive : astro?.isCallActive;

    if (!astro?.isOnline) {
      return {
        status: "Offline",
        color: "bg-red-500",
        canConnect: false,
        disabled: true,
      };
    }

    if (!serviceActive) {
      return {
        status: "Online",
        color: "bg-green-500",
        canConnect: false,
        disabled: true,
      };
    }

    if (astro?.isBusy) {
      return {
        status: "Busy",
        color: "bg-yellow-500",
        canConnect: true,
        disabled: false,
      };
    }

    return {
      status: "Online",
      color: "bg-green-500",
      canConnect: true,
      disabled: false,
    };
  };

  return (
    <section className="relative flex flex-col items-center w-full p-2 sm:p-5">
      <section className="chatastro-cards-main items-center flex-wrap gap-2 sm:gap-5 grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 justify-around w-full lg:w-[95%]">
        {data?.slice(0, visibleCount).map((astro, index) => (
          <div key={astro?.id}  className="overflow-hidden ">
            <div className="relative w-full   bg-center bg-cover  shadow-lg h-66 md:h-51 sm:p-1 back-astro-image">
              <div className="relative h-full p-2 overflow-hidden flex rounded-xl justify-center items-center text-white 	bg-linear-to-r from-purple-100 via-indigo-100 to-purple-100">
                {!astro?.tags ? (
                  <></>
                ) : (
                  <div className="celeb-tag absolute -rotate-45 top-2 -left-8.75 z-20">
                    <span className="bg-[#ffd70a] p-1 text-[9px] text-black w-30 inline-block text-center  px-8">
                      {astro?.tags}
                    </span>
                  </div>
                )}

                <div className="flex flex-col items-center justify-between w-full gap-1 sm:gap-2 astro-image-price-box md:flex-row md:gap-3">
                  <div className="md:w-[30%] flex flex-col items-center justify-between gap-1 md:pt-5 astro-image-name place-self-center sm:gap-2">
                    <Image
                      src={
                        astro?.profilePic
                          ? `https://www.dhwaniastro.com${astro.profilePic}`
                          : "/man.png"
                      }
                      className="object-cover cursor-pointer border-3 border-purple-200 rounded-full shadow-md w-18 h-18 sm:w-22 sm:h-22"
                      width={50}
                      height={50}
                      loading="lazy"
                      alt="Astro Image"
                      onClick={() => astrologerprofile(astro?.id)}
                    />
                    <div className="hidden md:flex space-x-4 justify-around w-[80%]">
                      <CustomButton
                        aria-label={`Select Astrologer ${astro.displayName}`}
                        variant="green"
                        disabled={getAstroStatus(astro).disabled}
                        className={
                          getAstroStatus(astro).disabled
                            ? "opacity-50 cursor-not-allowed hover:scale-104"
                            : "hover:scale-104"
                        }
                        onClick={() => {
                          const status = getAstroStatus(astro);

                          if (!status.canConnect) {
                            if (!astro?.isOnline) {
                              astrologeroffline();
                            } else if (
                              (mode === "chat" && !astro?.isChatActive) ||
                              (mode === "call" && !astro?.isCallActive)
                            ) {
                              toast.error(
                                mode === "chat"
                                  ? "Chat service is currently unavailable."
                                  : "Call service is currently unavailable.",
                              );
                            }
                            return;
                          }

                          handleClick({
                            id: astro?.id,
                            mode,
                            price: astro?.price,
                            astro,
                          });
                        }}
                      >
                        <h5 className="text-white">
                          {mode === "chat" ? " Chat" : " Call"}
                        </h5>
                      </CustomButton>
                    </div>
                    {(() => {
                      const status = getAstroStatus(astro);

                      return (
                        <div className="flex absolute top-1 right-2 items-center gap-1">
                          <span
                            className={`sm:w-2 sm:h-2 h-2 w-2  rounded-full ${status.color}`}
                          />
                          <span className="text-[9px] sm:text-[9px] text-black ">
                            {status.status}
                          </span>
                        </div>
                      );
                    })()}
                  </div>
                  <div className="md:w-[70%] flex flex-col items-center justify-center md:p-1 rounded-lg astrologer-price-skill from-violet-200 to-purple-200">
                    <div className="flex flex-col items-center md:gap-1.5 gap-1 astro-name-exp">
                      <h2
                        onClick={() => astrologerprofile(astro?.id)}
                        className="text-sm sm:text-[17px] font-semibold cursor-pointer text-black sm:mt-1 sm:text-[18px]"
                      >
                        {astro?.displayName}
                      </h2>

                      <p className="text-[11px] font- text-gray-700  break-all line-clamp-1">
                        {astro?.skills?.join(", ")}
                      </p>

                      <div className="flex items-center gap-2 lang-bar">
                        <p className="overflow-hidden text-[11px] font- text-gray-700 whitespace-nowrap text-ellipsis">
                          {astro?.languages?.join(", ")}
                        </p>
                      </div>

                      <span className="flex flex-wrap items-center justify-center gap-1 ">
                        <p className="text-[10px] text-gray-700 border border-purple-300 rounded-lg md:py-1 px-1 w-fit">
                          Exp: {astro.experience} Yrs
                        </p>
                        <span className="text-[10px] text-gray-700 border border-purple-300 flex gap-1  md:p-1 px-1 rounded-lg">
                          2000 <h6>Orders</h6>
                        </span>
                        <p className="text-[10px]  text-gray-700 border border-purple-300 rounded-lg md:py-1 px-1 w-fit flex items-center gap-2">
                          {astro.rating?.toFixed?.(2) ?? "0.00"}
                          <svg width={15} height={15} viewBox="0 0 640 640">
                            <path d="M320.1 417.6C330.1 417.6 340 419.9 349.1 424.6L423.5 462.5L410.5 380C407.3 359.8 414 339.3 428.4 324.8L487.4 265.7L404.9 252.6C384.7 249.4 367.2 236.7 357.9 218.5L319.9 144.1L319.9 417.7zM489.4 553C482.1 558.3 472.4 559.1 464.4 555L320.1 481.6L175.8 555C167.8 559.1 158.1 558.3 150.8 553C143.5 547.7 139.8 538.8 141.2 529.8L166.4 369.9L52 255.4C45.6 249 43.4 239.6 46.2 231C49 222.4 56.3 216.1 65.3 214.7L225.2 189.3L298.8 45.1C302.9 37.1 311.2 32 320.2 32C329.2 32 337.5 37.1 341.6 45.1L415 189.3L574.9 214.7C583.8 216.1 591.2 222.4 594 231C596.8 239.6 594.5 249 588.2 255.4L473.7 369.9L499 529.8C500.4 538.7 496.7 547.7 489.4 553z" />
                          </svg>
                          <svg width={15} height={15} viewBox="0 0 640 640">
                            <path d="M320.1 417.6C330.1 417.6 340 419.9 349.1 424.6L423.5 462.5L410.5 380C407.3 359.8 414 339.3 428.4 324.8L487.4 265.7L404.9 252.6C384.7 249.4 367.2 236.7 357.9 218.5L319.9 144.1L319.9 417.7zM489.4 553C482.1 558.3 472.4 559.1 464.4 555L320.1 481.6L175.8 555C167.8 559.1 158.1 558.3 150.8 553C143.5 547.7 139.8 538.8 141.2 529.8L166.4 369.9L52 255.4C45.6 249 43.4 239.6 46.2 231C49 222.4 56.3 216.1 65.3 214.7L225.2 189.3L298.8 45.1C302.9 37.1 311.2 32 320.2 32C329.2 32 337.5 37.1 341.6 45.1L415 189.3L574.9 214.7C583.8 216.1 591.2 222.4 594 231C596.8 239.6 594.5 249 588.2 255.4L473.7 369.9L499 529.8C500.4 538.7 496.7 547.7 489.4 553z" />
                          </svg>
                          <svg width={15} height={15} viewBox="0 0 640 640">
                            <path d="M320.1 417.6C330.1 417.6 340 419.9 349.1 424.6L423.5 462.5L410.5 380C407.3 359.8 414 339.3 428.4 324.8L487.4 265.7L404.9 252.6C384.7 249.4 367.2 236.7 357.9 218.5L319.9 144.1L319.9 417.7zM489.4 553C482.1 558.3 472.4 559.1 464.4 555L320.1 481.6L175.8 555C167.8 559.1 158.1 558.3 150.8 553C143.5 547.7 139.8 538.8 141.2 529.8L166.4 369.9L52 255.4C45.6 249 43.4 239.6 46.2 231C49 222.4 56.3 216.1 65.3 214.7L225.2 189.3L298.8 45.1C302.9 37.1 311.2 32 320.2 32C329.2 32 337.5 37.1 341.6 45.1L415 189.3L574.9 214.7C583.8 216.1 591.2 222.4 594 231C596.8 239.6 594.5 249 588.2 255.4L473.7 369.9L499 529.8C500.4 538.7 496.7 547.7 489.4 553z" />
                          </svg>
                          <svg width={15} height={15} viewBox="0 0 640 640">
                            <path d="M320.1 417.6C330.1 417.6 340 419.9 349.1 424.6L423.5 462.5L410.5 380C407.3 359.8 414 339.3 428.4 324.8L487.4 265.7L404.9 252.6C384.7 249.4 367.2 236.7 357.9 218.5L319.9 144.1L319.9 417.7zM489.4 553C482.1 558.3 472.4 559.1 464.4 555L320.1 481.6L175.8 555C167.8 559.1 158.1 558.3 150.8 553C143.5 547.7 139.8 538.8 141.2 529.8L166.4 369.9L52 255.4C45.6 249 43.4 239.6 46.2 231C49 222.4 56.3 216.1 65.3 214.7L225.2 189.3L298.8 45.1C302.9 37.1 311.2 32 320.2 32C329.2 32 337.5 37.1 341.6 45.1L415 189.3L574.9 214.7C583.8 216.1 591.2 222.4 594 231C596.8 239.6 594.5 249 588.2 255.4L473.7 369.9L499 529.8C500.4 538.7 496.7 547.7 489.4 553z" />
                          </svg>{" "}
                        </p>
                      </span>
                    </div>

                    <div className="flex items-center justify-center w-full gap-2 py-2 md:mt-3 astrologer-price-box">
                      <AstrologerPrice mode={mode} astro={astro} />
                    </div>
                    <div className="sm:hidden space-x-4 flex items-center justify-center w-[80%]">
                      <CustomButton
                        aria-label={`Select Astrologer ${astro.name}`}
                        variant="green"
                        disabled={getAstroStatus(astro).disabled}
                        className={
                          getAstroStatus(astro).disabled
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }
                        onClick={() => {
                          const status = getAstroStatus(astro);

                          if (!status.canConnect) {
                            if (!astro?.isOnline) {
                              astrologeroffline();
                            } else if (
                              (mode === "chat" && !astro?.isChatActive) ||
                              (mode === "call" && !astro?.isCallActive)
                            ) {
                              toast.error(
                                mode === "chat"
                                  ? "Chat service is currently unavailable."
                                  : "Call service is currently unavailable.",
                              );
                            }
                            return;
                          }

                          handleClick({
                            id: astro?.id,
                            mode,
                            price: astro?.price,
                            astro,
                          });
                        }}
                      >
                        <h5 className="text-white">{buttonLabel}</h5>
                      </CustomButton>
                    </div>

                    <div className=" md:hidden flex space-x-4 justify-around w-[80%]"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </section>

      {loading && (
        <div className="flex items-center justify-center h-64" role="status">
          <svg
            aria-hidden="true"
            className="inline w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-yellow-400"
            viewBox="0 0 100 101"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
              fill="currentColor"
            />
            <path
              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
              fill="currentFill"
            />
          </svg>
          <span className="sr-only">Loading...</span>
        </div>
      )}

      <div ref={loaderRef} className="h-10" />
      <AlertLoading show={alert} title="Please Wait.." />

      <IntentRechage showrecharge={quick} astro_id={astroId} reqmode={mode} />
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

export default React.memo(AstroCCard);
