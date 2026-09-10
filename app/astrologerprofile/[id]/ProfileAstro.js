"use client";

import Image from "next/image";

import { BiSolidBadgeCheck } from "react-icons/bi";
import StarRating from "@/components/Homepagecomp/Remedosha/StarRating";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import Link from "next/link";
import CustomButton from "@/components/Custom/CustomButton";
import GiftPop from "@/components/Smcompo/GiftPop";
import { useLanguage } from "@/app/context/LangContext";
import { AlertLoading, IntentRechage, SingleButton } from "@/app/common";

import { useRouter } from "next/navigation";
import {
  GET_ASTROLOGER_BY_ID,
  GET_SIMILAR_ASTROLOGERS,
} from "@/app/graphql/gqlQuery";
import { useQuery, useMutation } from "@apollo/client/react";
import { gql } from "@apollo/client";
import RecentRequestPopup from "@/components/Custom/RecentRequestPopUp";
export const FOLLOW_ASTROLOGER = gql`
  mutation FollowAstrologer($astrologerId: ID!) {
    followAstrologer(astrologerId: $astrologerId) {
      success
      message
    }
  }
`;

export const UNFOLLOW_ASTROLOGER = gql`
  mutation UnfollowAstrologer($astrologerId: ID!) {
    unfollowAstrologer(astrologerId: $astrologerId) {
      success
      message
    }
  }
`;

export const IS_FOLLOWING = gql`
  query IsFollowing($astrologerId: ID!) {
    isFollowing(astrologerId: $astrologerId) {
      isFollowing
    }
  }
`;

export const GET_ASTROLOGER_FOLLOWERS_COUNT = gql`
  query GetAstrologerFollowersCount($astrologerId: ID!) {
    getAstrologerFollowersCount(astrologerId: $astrologerId) {
      totalFollowers
    }
  }
`;

export default function ProfileAstro({ astrologerId }) {
  const router = useRouter();
  const id = astrologerId;
  const [showRecentPopup, setShowRecentPopup] = useState(false);
  const [selectedAstroData, setSelectedAstroData] = useState(null);
  const [quick, setQuick] = useState(false);
  const [astroId, setAstroId] = useState(null);
  const getAstroStatus = (astro, mode = "chat") => {
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

  const {
    data: astrologerResponse,
    loading: astrologerloading,
    error,
  } = useQuery(GET_ASTROLOGER_BY_ID, {
    variables: {
      id,
    },
    skip: !id,
    fetchPolicy: "cache-first",
  });
  const { data: similarData } = useQuery(GET_SIMILAR_ASTROLOGERS, {
    variables: {
      astrologerId: id,
    },
    skip: !id,
  });

  const similarAstrologers = similarData?.getSimilarAstrologers || [];
  console.log("Astrologer ID:", id);
  console.log("Skip Value:", !id);
  const [userData, setUserData] = useState({
    user_status: 0,
    balance_amount: 0,
  });
  const {
    data: followStatusData,
    loading: followLoadingStatus,
    error: followError,
    refetch: refetchFollow,
  } = useQuery(IS_FOLLOWING, {
    variables: {
      astrologerId: id,
    },
    skip: !id,
    fetchPolicy: "network-only",
    notifyOnNetworkStatusChange: true,
  });

  const {
    data: followersCountData,
    loading: followersCountLoading,
    error: followersCountError,
    refetch: refetchFollowersCount,
  } = useQuery(GET_ASTROLOGER_FOLLOWERS_COUNT, {
    variables: {
      astrologerId: id,
    },
    skip: !id,
    fetchPolicy: "network-only",
  });
  const followersCount =
    followersCountData?.getAstrologerFollowersCount?.totalFollowers || 0;

  const astrologerdetail = astrologerResponse?.getAstrologerById;
  const { messages: t } = useLanguage();
  const chatStatus = getAstroStatus(astrologerdetail, "chat");
  const callStatus = getAstroStatus(astrologerdetail, "call");
  const profileStatus = getAstroStatus(astrologerdetail, "chat");
  const [showGiftPopup, setShowGiftPopup] = useState(false);

  const [astrofollow, setAstroFollow] = useState(false);

  useEffect(() => {
    setAstroFollow(followStatusData?.isFollowing?.isFollowing ?? false);
  }, [followStatusData]);

  const [followAstrologer, { loading: followLoading }] =
    useMutation(FOLLOW_ASTROLOGER);

  const [unfollowAstrologer, { loading: unfollowLoading }] =
    useMutation(UNFOLLOW_ASTROLOGER);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showAll, setShowAll] = useState(false);

  // const astrologerlist = useMemo(() => {
  //   const list = astrologersData?.filter((item) => item.availability === 1);
  //   return list;
  // }, []);

  const useunfollow = () => setShowConfirmModal(true);

  const unfollow = async (confirm) => {
    if (!confirm) return;

    try {
      const { data } = await unfollowAstrologer({
        variables: {
          astrologerId: id,
        },
      });

      if (data?.unfollowAstrologer?.success) {
        setAstroFollow(false);

        await Promise.all([refetchFollow(), refetchFollowersCount()]);

        toast.success(
          data.unfollowAstrologer.message ||
            "Astrologer unfollowed successfully",
        );
      }

      setShowConfirmModal(false);
    } catch (error) {
      toast.error(error.message);
    }
  };
  const follow = async () => {
    try {
      const { data } = await followAstrologer({
        variables: {
          astrologerId: id,
        },
      });

      if (data?.followAstrologer?.success) {
        setAstroFollow(true);

        await Promise.all([refetchFollow(), refetchFollowersCount()]);

        toast.success(
          data.followAstrologer.message || "Astrologer followed successfully",
        );
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (astrologerloading) {
    return (
      <div className="text-center text-gray-600 mt-10">
        Loading astrologer details...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 mt-10">{error.message}</div>
    );
  }

  if (!astrologerdetail) {
    return (
      <div className="text-center text-gray-600 mt-10">
        Astrologer not found
      </div>
    );
  }

  const chatPricing = astrologerdetail?.pricing?.find(
    (item) => item.type === "CHAT",
  );
  const callPricing = astrologerdetail?.pricing?.find(
    (item) => item.type === "CALL",
  );
  const openRecentPopup = ({ astroId, mode, astrologer }) => {
    setSelectedAstroData({
      astroId,
      mode,
      astrologer,
    });

    setShowRecentPopup(true);
  };

  const handleClick = ({ mode, price }) => {
    if (!userData) {
      toast.error("User data not loaded yet");
      return;
    }

    const goToRequest = () => {
      openRecentPopup({
        astroId: id,
        mode,
        astrologer: astrologerdetail,
      });
    };

    if (userData.user_status === 0) {
      goToRequest();
      return;
    }

    if (userData.user_status === 1 || userData.user_status === 2) {
      const astro_price = (price || 0) * 5;

      if (astro_price > userData.balance_amount) {
        setQuick(true);
        setAstroId(id);
      } else {
        goToRequest();
      }

      return;
    }

    goToRequest();
  };

  return (
    <div className="w-full sm:p-3 sm:pt-5 md:pt-5">
      <div className="max-w-7xl p-3 mx-auto rounded-lg shadow-md  md:p-6">
        <div className="flex items-start relative overflow-hidden justify-evenly bg-linear-to-r from-yellow-100 p-3 rounded-2xl md:p-6 via-yellow-50 to-yellow-100 flex-col gap-5 sm:flex-row md:gap-10">
          {!astrologerdetail?.tags ? (
            <></>
          ) : (
            <div className="celeb-tag absolute -rotate-45 top-4 left-[-35px] z-20">
              <span className="bg-[#ffd70a] p-1 text-[9px] text-black w-30 inline-block text-center  px-8">
                {astrologerdetail?.tags}
              </span>
            </div>
          )}

          <div className="flex flex-col items-center justify-center w-full gap-2">
            <Image
              src={
                astrologerdetail?.profilePic
                  ? `https://www.dhwaniastro.com${astrologerdetail.profilePic}`
                  : "/man.png"
              }
              alt="image"
              width={100}
              height={100}
              className="border-4 border-yellow-400 rounded-full w-30 h-30 sm:w-35 sm:h-35 object-cover"
            />
            {followLoadingStatus ? (
              <CustomButton variant="yellow" disabled>
                Please Wait...
              </CustomButton>
            ) : astrofollow ? (
              <CustomButton
                variant="yellow"
                disabled={unfollowLoading}
                onClick={useunfollow}
              >
                {unfollowLoading ? "Please Wait..." : "Following"}
              </CustomButton>
            ) : (
              <CustomButton
                variant="yellow"
                disabled={followLoading}
                onClick={follow}
              >
                {followLoading ? "Please Wait..." : "Follow"}
              </CustomButton>
            )}

            <button
              onClick={() => setShowGiftPopup(true)}
              className="relative shine-text mt-3 sm:mt-7 px-5 py-2 text-xs sm:text-base rounded-full text-white font-medium
             bg-linear-to-r from-pink-500 to-red-500 shadow-[4px_4px_8px_rgba(0,0,0,0.2)]
             overflow-hidden transition-transform duration-300 hover:scale-105"
              aria-label="Send Gift to Astrologer"
            >
              🎁 Send Gift
            </button>
          </div>

          <div className="flex flex-col gap-5 sm:flex-row  md:items-start sm:gap-5 lg:gap-20">
            <div className="flex flex-col gap-2 py-2 text-sm md:text-base">
              <h2 className="flex items-center gap-1 font-bold text-xl text-gray-800 sm:text-xl sm:font-bold lg:text-3xl lg:font-semibold">
                {astrologerdetail?.displayName || astrologerdetail?.name}
                <BiSolidBadgeCheck className="w-5 h-5 text-green-500" />
              </h2>

              <div className="flex items-center gap-2">
                <span
                  className={`sm:w-3 sm:h-3 h-1 h-1 rounded-full ${profileStatus.color}`}
                />
                <span className="font-semibold text-xs sm:text-sm text-black">
                  {profileStatus.status}
                </span>
              </div>

              <div className="flex items-center gap-4">
                <span className="font-semibold text-black">
                  {Number(astrologerdetail?.rating || 0).toFixed(1)}/5
                </span>
                <StarRating
                  className="text-yellow-500"
                  onRate={(val) => console.log("Rated:", val)}
                />
              </div>

              <span className="text-xs sm:text-sm font-semibold text-black">
                {astrologerdetail?.totalSessions || 0} + Satisfied Consultations
              </span>
                  <div className="text-xs sm:text-sm my-1 text-black font-semibold">
                👥 {followersCount} Followers
              </div>

              {/* <div className="flex flex-col mt-0 text-sm text-gray-700 sm:gap-1 lg:gap-1">
                <span className="font-bold charge-price flex items-center gap-2">
                  <>
                    <span className="text-lg text-red-600 font-extrabold">
                      ₹{callPricing.price}
                    </span>

                    <span className="line-through text-gray-500 text-sm">
                      ₹{callPricing.offerPrice}/min
                    </span>
                  </>
                </span>
              </div> */}
            </div>

            <div className="sm:w-60 lg:w-120 w-full flex flex-col text-black">
              <div className="space-y-2 text-xs sm:text-sm lg:text-base">
                <div className="grid grid-cols-2 gap-5">
                  <span className="font-semibold">Experience</span>
                  <span>{astrologerdetail?.experience} Years</span>
                </div>
                <div className="grid grid-cols-2 gap-5">
                  <span className="font-semibold">Language</span>
                  <span>{astrologerdetail?.languages?.join(", ")}</span>
                </div>
                <div className="grid grid-cols-2 gap-5">
                  <span className="font-semibold">Skills</span>
                  <span>{astrologerdetail?.skills?.join(", ")}</span>
                </div>
                <div className="grid grid-cols-2 gap-5">
                  <span className="font-semibold">Expertise</span>
                  <span>{astrologerdetail?.problems?.join(", ")}</span>
                </div>
              </div>

              <div className="flex items-center w-full self-align-center place-self-center justify-center gap-5 mt-6 text-sm sm:flex-col lg:flex-row md:text-base">
                <button
                  disabled={chatStatus.disabled}
                  className={
                    chatStatus.disabled
                      ? "opacity-50 cursor-not-allowed w-35 sm:w-50 bg-green-300  rounded-2xl"
                      : " bg-green-500 cursor-pointer hover:scale:105 w-35 sm:w-50 rounded-2xl py-1"
                  }
                  onClick={() => {
                    if (!chatStatus.canConnect) {
                      if (!astrologerdetail?.isOnline) {
                        toast.error(
                          "Astrologer selected by you is offline now so please choose another astrologer.",
                        );
                      } else {
                        toast.error("Chat service is currently unavailable.");
                      }
                      return;
                    }

                    handleClick({
                      mode: "chat",
                      price: chatPricing?.price,
                    });
                  }}
                >
                  <div className="flex flex-col gap-1 items-center justify-center">
                    {" "}
                    <span className="text-white font-semibold">
                      {" "}
                      Start Chat
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-lg text-red-500 font-extrabold">
                          {chatPricing?.price === 0 ? "Free" : `₹${chatPricing?.price}`}
                      </span>

                      <span className="line-through text-gray-200 text-sm">
                        ₹{chatPricing?.offerPrice}/min
                      </span>
                    </div>
                  </div>
                </button>
                <button
                  disabled={callStatus.disabled}
                  className={
                    callStatus.disabled
                      ? "opacity-50 cursor-not-allowed w-35 sm:w-50 bg-green-300  rounded-2xl"
                      : " bg-green-500 cursor-pointer hover:scale:105 w-35 sm:w-50 rounded-2xl py-1"
                  }
                  onClick={() => {
                    if (!callStatus.canConnect) {
                      if (!astrologerdetail?.isOnline) {
                        toast.error(
                          "Astrologer selected by you is offline now so please choose another astrologer.",
                        );
                      } else {
                        toast.error("Call service is currently unavailable.");
                      }
                      return;
                    }

                    handleClick({
                      mode: "call",
                      price: callPricing?.price,
                    });
                  }}
                >
                  <div className="flex flex-col gap- items-center justify-center">
                    <span className="text-white font-semibold">
                      {" "}
                      Start Call
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-lg text-red-500 font-extrabold">
                         {callPricing?.price === 0 ? "Free" : `₹${callPricing?.price}`}
                      </span>

                      <span className="line-through text-gray-200 text-sm">
                        ₹{callPricing?.offerPrice}/min
                      </span>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <div className="p-4 mt-4 border   shadow bg-linear-to-r from-purple-50  rounded-2xl md:p-6 via-violet-50 to-yellow-50">
            <h3 className="mb-1 text-lg font-bold text-gray-800">About Me</h3>
            <div className="text-sm text-gray-700">
              <div className="text-xs sm:text-sm"
                dangerouslySetInnerHTML={{
                  __html:
                    astrologerdetail?.about || "No description available.",
                }}
              />
          
            </div>
          </div>

          <div className="astro-rate flex flex-col md:flex-row gap-8 py-6 rounded-2xl">
            <div className="as-tate-simi shadow-xl rounded-2xl p-4 flex-1 bg-linear-to-r from-purple-50  md:p-6 via-violet-50 to-yellow-50">
              <div className="flex flex-col items-center justify-center text-center">
                <h5 className="text-lg font-semibold mb-4 text-gray-800">
                  Check Similar Consultants
                </h5>

                <div className="flex flex-wrap justify-center gap-4">
                  {similarAstrologers.length > 0 ? (
                    similarAstrologers.map((astro) => {
                      const chatPrice = astro.pricing?.find(
                        (p) => p.type === "CHAT",
                      );

                      return (
                        <div
                          key={astro.id}
                          onClick={() =>
                            router.push(`/astrologerprofile/${astro.id}`)
                          }
                          className="flex flex-col sm:flex-row items-center gap-3 bg-white rounded-xl shadow-md hover:shadow-lg cursor-pointer p-2 sm:p-3 w-36 sm:w-60"
                        >
                          <Image
                            src={
                              astro.profilePic
                                ? `https://www.dhwaniastro.com${astro.profilePic}`
                                : "/man.png"
                            }
                            width={60}
                            height={60}
                            alt={astro.name}
                            className="rounded-full object-cover w-12 h-12 sm:w-15 sm:h-15"
                          />

                          <div className="flex text-xs sm:text-sm text-black flex-col flex-1">
                            <h4 className="font-semibold text-xs sm:text-sm">{astro.name}</h4>

                            <p className="text-xs sm:text-sm text-gray-500">
                              {astro.skills?.join(", ")}
                            </p>

                            <p className="text-xs sm:text-sm text-gray-500">
                              {astro.languages?.join(", ")}
                            </p>

                            <span className="text-sm text-red-600 font-bold">
                             {chatPrice?.price === 0 ? "Free" : `₹${chatPrice?.price}/min`}

                            </span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p>No similar consultants found.</p>
                  )}
                </div>
              </div>
            </div>
            <div className="flex flex-col shadow-xl rounded-2xl p-4 items-center flex-1 bg-linear-to-r from-yellow-50 md:p-6 via-violet-50 to-purple-100">
              <h5 className="text-lg font-semibold text-gray-800 text-center mb-2">
                Ratings & Reviews
              </h5>
              <div className="flex items-center bg-black/60 rounded-full text-white px-3  gap-4 mb-1">
                <span className="font-semibold ">
                  {Number(astrologerdetail?.rating || 0).toFixed(1)}/5
                </span>

                <StarRating
                  className="text-yellow-500"
                  onRate={(val) => console.log("Rated:", val)}
                />
              </div>

              {astrologerdetail?.reviews?.length > 0 ? (
                <>
                  <div className="w-full h-70 overflow-y-auto max-w-xl space-y-5">
                    {astrologerdetail.reviews
                      .slice(0, showAll ? astrologerdetail.reviews.length : 3)
                      .map((review) => (
                        <div
                          key={review.id}
                          className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all p-2 px-4"
                        >
                          <div className="flex justify-between items-center ">
                            <h5 className="font-semibold text-xs sm:text-sm text-gray-700">
                              {review?.userName?.split(" ")[0] || "User"}
                            </h5>

                            <div className="text-right">
                              <p className="text-xs text-gray-400">
                                {(() => {
                                  const date = new Date(
                                    Number(review.createdAt),
                                  );

                                  return date
                                    .toLocaleDateString("en-GB", {
                                      day: "numeric",
                                      month: "short",
                                      year: "numeric",
                                    })
                                    .replace(/(\w+) (\d{4})$/, "$1, $2");
                                })()}
                              </p>

                              <div>
                                {[...Array(review?.rating || 0)].map(
                                  (_, index) => (
                                    <span
                                      key={index}
                                      style={{
                                        color: "gold",
                                        fontSize: "18px",
                                      }}
                                    >
                                      ★
                                    </span>
                                  ),
                                )}
                              </div>
                            </div>
                          </div>

                          <hr className="border-gray-200 p-1" />

                          <div className="text-xs italic text-gray-600 mb-2">
                            {review?.comment}
                          </div>

                          {review?.reply && (
                            <div className="bg-gray-50 p-3 rounded-md text-xs text-black border-l-4 border-blue-400">
                              <strong className="text-gray-700">
                                Astrologer:
                              </strong>{" "}
                              <i>{review.reply}</i>
                            </div>
                          )}
                        </div>
                      ))}
                  </div>

                  {!showAll && astrologerdetail?.recentReviews?.length > 3 && (
                    <div className="mt-5">
                      <button
                        onClick={() => setShowAll(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm transition-all"
                      >
                        View More
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-gray-500">No reviews yet</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showConfirmModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60">
          <div className="p-6 bg-white rounded-lg shadow-lg">
            <p className="text-sm text-center text-black">
              Are you sure you want to unfollow{" "}
              {astrologerdetail?.displayName || astrologerdetail?.name}?
            </p>
            <div className="flex justify-center gap-4 mt-4">
              <button
                aria-label="Confirm Unfollow"
                className="px-4 py-2 text-white bg-green-500 rounded-md"
                onClick={() => unfollow(true)}
              >
                Yes
              </button>
              <button
                aria-label="Cancel Unfollow"
                className="px-4 py-2 text-white bg-red-500 rounded-md"
                onClick={() => setShowConfirmModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      <GiftPop
        open={showGiftPopup}
        astrologername={astrologerdetail?.displayName || astrologerdetail?.name}
        astro_id={astrologerdetail?.id}
        onClose={() => setShowGiftPopup(false)}
      />
      <IntentRechage
        showrecharge={quick}
        astro_id={astroId}
        reqmode={selectedAstroData?.mode}
      />

      <RecentRequestPopup
        show={showRecentPopup}
        onClose={() => setShowRecentPopup(false)}
        astroId={selectedAstroData?.astroId}
        mode={selectedAstroData?.mode}
        astrologer={selectedAstroData?.astrologer}
      />

      <AlertLoading
        show={followLoading || unfollowLoading}
        title="Please Wait..."
      />
    </div>
  );
}
