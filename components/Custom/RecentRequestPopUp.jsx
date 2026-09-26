"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import SocketContext from "@/app/context/socketContext";
import { useContext } from "react";

import { createRequestAndEmit } from "@/utils/createRequestAndEmit";
import { gql } from "@apollo/client";
import { useMutation, useQuery } from "@apollo/client/react";

const CREATE_INTAKE = gql`
  mutation CreateIntake($input: IntakeInput!) {
    createIntake(input: $input) {
      intakeId
      roomId
      chatTime
      message
      pricePerMin
      pricingType
    }
  }
`;

const GET_RECENT_INTAKES = gql`
  query RecentIntakes {
    recentIntakes {
      success
      message
      data {
        id
        name
        countryCode
        mobile
        gender
        birthDate
        birthTime
        occupation
        birthPlace
        latitude
        longitude
      }
    }
  }
`;

export default function RecentRequestPopup({
  show,
  onClose,
  astroId,
  mode,
  astrologer,
}) {
  const router = useRouter();

  const dispatch = useDispatch();

  const [userId, setUserId] = React.useState("");

  React.useEffect(() => {
    const stored = localStorage.getItem("user");

    if (stored) {
      const parsed = JSON.parse(stored);

      setUserId(parsed?.id);
    }
  }, []);

  const { socket, connectSocket } = useContext(SocketContext);

  const [createIntake] = useMutation(CREATE_INTAKE);

  const { data, loading } = useQuery(GET_RECENT_INTAKES, {
    skip: !show,
    fetchPolicy: "no-cache",
  });

  if (!show) return null;

  const profiles = data?.recentIntakes?.data || [];

  const formatDate = (date) => {
    if (!date) return "N/A";

    const parsedDate =
      String(date).length > 10 ? new Date(Number(date)) : new Date(date);

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const handleProfileSelect = async (profile) => {
    // FIND ACTIVE PRICING BASED ON MODE
    const selectedPricing = astrologer?.pricing?.find(
      (item) =>
        item?.type?.toUpperCase() === mode?.toUpperCase() && item?.isActive,
    );

    const updatedAstrologer = {
      ...astrologer,

      price: selectedPricing?.offerPrice || selectedPricing?.price || 0,

      pricePerMin: selectedPricing?.offerPrice || selectedPricing?.price || 0,

      pricingType: selectedPricing?.type || mode,

      activePricing: selectedPricing || null,
    };

    await createRequestAndEmit({
      createIntake,
      mode,
      astro_id: astroId,
      profileData: profile,
      socket,
      connectSocket,
      astrologer: updatedAstrologer,
      dispatch,
      router,
      userId,
    });

    onClose();
  };

  const handleCreateNew = () => {
    router.push(`/request/${mode}/${astroId}`);

    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60  flex items-center justify-center p-4 text-black">
      <div className="bg-white  rounded-3xl p-3 sm:p-5 w-full max-w-lg max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base  sm:text-2xl font-semibold">Recent Requests</h2>

          <button className="bg-gray-700 text-white px-1 py- rounded-full" onClick={onClose}>✕</button>
        </div>

        <button
          onClick={handleCreateNew}
          className="w-full bg-purple-600 text-white py-2 sm:py-3 rounded-full mb-3 text-sm sm:text-base sm:mb-5"
        >
          + Create New Request
        </button>

        {loading ? (
          <div className="py-10 text-center">Loading...</div>
        ) : (
          <div className="space-y-3">
            {profiles.map((profile) => (
              <div
                key={profile.id}
                onClick={() => handleProfileSelect(profile)}
                className="px-3 py-2 rounded-2xl border border-gray-200 cursor-pointer hover:bg-purple-50"
              >
                <h3 className="font-semibold text-xs sm:text-lg">{profile.name}</h3>

                <div className="grid grid-cols-3 gap-1 sm:gap-3 sm:mt-2 text-sm">
                  <div>
                    <p className="text-purple-600 text-xs">Gender</p>

                    <p className="font-medium text-xs sm:text-sm text-gray-700">
                      {profile.gender}
                    </p>
                  </div>

                  <div>
                    <p className="text-purple-600 text-xs">Occupation</p>

                    <p className="font-medium text-xs sm:text-sm text-gray-700">
                      {profile.occupation}
                    </p>
                  </div>

                  <div>
                    <p className="text-purple-600 text-xs">Date of Birth</p>

                    <p className="font-medium text-xs sm:text-sm text-gray-700">
                      {formatDate(profile.birthDate)}
                    </p>
                  </div>

                  <div>
                    <p className="text-purple-600 text-xs">Time of Birth</p>

                    <p className="font-medium text-xs sm:text-sm text-gray-700">
                      {profile.birthTime}
                    </p>
                  </div>

                  <div className="col-span-2">
                    <p className="text-purple-600 text-xs">Birth Place</p>

                    <p className="font-medium text-xs sm:text-sm text-gray-700">
                      {profile.birthPlace || "India"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
