"use client";

import { useLanguage } from "@/app/context/LangContext";
import CustomButton from "@/components/Custom/CustomButton";
import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { useRouter } from "next/navigation";

const GET_RECHARGE_PACKS = gql`
  query GetRechargePacks {
    getRechargePacks {
      data {
        id
        name
        description
        price
        coins
        talktime
        isFirstTimeOffer
        isFirstTimeOfferUsed
      }
      totalCount
    }
  }
`;

const RechargePackSkeleton = () => {
  return (
    <div className="relative flex animate-pulse flex-col justify-between overflow-hidden rounded-xl border border-gray-200 bg-white p-4 shadow-lg">
      <span className="absolute top-[8px] left-[-32px] h-5 w-28 rotate-[-42deg] rounded-tr-lg rounded-bl-lg bg-gray-200" />

      <div className="text-center">
        <div className="mx-auto mb-2 h-5 w-24 rounded bg-gray-200" />
        <div className="mx-auto h-8 w-20 rounded bg-gray-200" />
        <div className="mx-auto mt-2 h-4 w-28 rounded bg-gray-200" />
      </div>

      <div className="mt-2 h-10 w-full rounded-full bg-gray-200" />
    </div>
  );
};

const RePack = () => {
  const { messages: t } = useLanguage();
  const router = useRouter();

  const { data, loading, error } = useQuery(GET_RECHARGE_PACKS, {
    fetchPolicy: "network-only",
  });

  const rechargeResponse = data?.getRechargePacks;
  const packData = rechargeResponse?.data ?? [];

  const handleSelect = (id) => {
    router.push(`/add-wallet-money/cart/${id}`);
  };

  if (loading) {
    return (
      <div className="w-full p-6">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="relative flex w-full animate-pulse items-center justify-center overflow-hidden rounded-lg bg-white p-6 shadow-lg">
            <div className="flex w-full items-center justify-between">
              <div className="h-6 w-52 rounded bg-gray-200" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: 10 }).map((_, index) => (
            <RechargePackSkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-500">
        Error: {error.message}
      </div>
    );
  }

  if (packData.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">
        No recharge packs are currently available.
      </div>
    );
  }

  return (
    <div className="w-full p-6">
      <div>
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="relative flex w-full items-center justify-center overflow-hidden rounded-lg bg-white p-6 shadow-lg">
            <div className="relative z-10 flex w-full items-center justify-between">
              <div className="text-lg font-semibold text-gray-800">
                <span className="text-xl font-semibold">
                  {t?.astrocard?.add || "Add Money to Wallet"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6 rounded-lg border border-purple-200 bg-purple-50 p-4">
          <p className="font-semibold text-purple-800">
            Choose your recharge pack
          </p>

         
        </div>

        <div className="grid grid-cols-2 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {packData.map((pack) => {
            const isFirstTimeOffer = pack.isFirstTimeOffer === true;

            const isFirstTimeOfferUsed =
              pack.isFirstTimeOfferUsed === true;

            const isAvailableFirstTimeOffer =
              isFirstTimeOffer && !isFirstTimeOfferUsed;

            // Show coins for an unused first-time offer;
            // otherwise, show the pack's regular talktime.
            const displayAmount = isAvailableFirstTimeOffer
              ? pack.coins
              : pack.talktime;

            const displayLabel = "Talktime";

            return (
              <div
                key={pack.id}
                className="relative flex flex-col justify-between overflow-hidden rounded-xl border border-gray-200 bg-white p-4 shadow-lg"
              >
                {isFirstTimeOffer && (
                  <span
                    className={`absolute top-[8px] left-[-32px] w-28 rotate-[-42deg] rounded-tr-lg rounded-bl-lg px-2 py-1 text-center text-[8px] text-white shadow ${
                      isFirstTimeOfferUsed
                        ? "bg-gray-500"
                        : "bg-gradient-to-r from-yellow-400 to-orange-400"
                    }`}
                  >
                    {isFirstTimeOfferUsed
                      ? "Used Offer"
                      : t?.astrocard?.offer || "Special Offer"}
                  </span>
                )}

                <div className="text-center">
                  <h3 className="mb-1 text-lg font-semibold text-purple-700">
                    {pack.name}
                  </h3>

                  <p className="text-2xl font-bold text-gray-900">
                    ₹ {pack.price}
                  </p>

                  <p className="mt-1 text-sm font-medium text-gray-600">
                    {displayLabel}: {displayAmount}
                  </p>

                 

                  
                </div>

                <CustomButton
                  aria-label={`Select Pack ${pack.name}`}
                  className="mt-2 w-full rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2 text-xs font-medium text-white hover:from-purple-700 hover:to-indigo-700 sm:text-sm"
                  onClick={() => handleSelect(pack.id)}
                >
                  {t?.astrocard?.pack || "Select Pack"}
                </CustomButton>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RePack;