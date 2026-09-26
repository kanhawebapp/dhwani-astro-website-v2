"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useGetDailyNakshatraQuery, useGetNextNakshatraQuery, useGetPrevNakshatraQuery } from "@/app/redux/services/astrologyAPI";



const NakprevClient = dynamic(() => import("./previous/NakprevClient"), {
  loading: () => <p className="text-center">Loading previous...</p>,
});

const NaktodayClient = dynamic(() => import("./naktoday/NaktodayClient"), {
  loading: () => <p className="text-center">Loading today...</p>,
});

const NaktommClient = dynamic(() => import("./tomorrow/NaktommClient"), {
  loading: () => <p className="text-center">Loading tomorrow...</p>,
});

const TABS = [
  { id: "nakprev", label: "Yesterday " },
  { id: "naktoday", label: "Today " },
  { id: "naktomm", label: "Tomorrow " },
];

export default function NakshatraTabsClient({
  formData,
  defaultTab = "naktoday",
}) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  const skip = !formData;

  const {
    data: prev,
    isLoading: prevLoading,
    error: prevError,
  } = useGetPrevNakshatraQuery(formData, { skip });

  const {
    data: today,
    isLoading: todayLoading,
    error: todayError,
  } = useGetDailyNakshatraQuery(formData, { skip });

  const {
    data: tomorrow,
    isLoading: tomorrowLoading,
    error: tomorrowError,
  } = useGetNextNakshatraQuery(formData, { skip });

  const loading =
    prevLoading ||
    todayLoading ||
    tomorrowLoading;

  const error =
    prevError ||
    todayError ||
    tomorrowError;

  if (loading) {
    return (
      <div className="flex justify-center flex-col gap-4 items-center h-32">
        <span className="loader-all"></span>
        <span className="ml-3 text-purple-600 font-medium">
          Loading Nakshatra Predictions...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-center text-red-500">
        Failed to load Nakshatra predictions.
      </p>
    );
  }

  if (!prev || !today || !tomorrow) {
    return (
      <p className="text-center text-gray-500">
        No Nakshatra prediction available.
      </p>
    );
  }

  return (
    <>
      <div className="basic-list bg-[#2f1254] px-5 py-2 rounded-lg">
        <ul className="flex gap-5 justify-center">
          {TABS.map((tab) => (
            <li
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`cursor-pointer px-4 py-1 rounded-full text-xs ${
                activeTab === tab.id
                  ? "bg-purple-500 text-white"
                  : "text-white"
              }`}
            >
              {tab.label}
            </li>
          ))}
        </ul>
      </div>

      <div className="sm:py-5">
        {activeTab === "nakprev" && (
          <NakprevClient prev={prev} />
        )}

        {activeTab === "naktoday" && (
          <NaktodayClient today={today} />
        )}

        {activeTab === "naktomm" && (
          <NaktommClient tomorrow={tomorrow} />
        )}
      </div>
    </>
  );
}