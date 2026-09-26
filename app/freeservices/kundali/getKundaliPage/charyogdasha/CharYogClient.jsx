"use client";

import { useState } from "react";
import Chardasha from "./chardasha/Chardasha";
import Yoginidasha from "./yognidasha/Yognidasha";
import {
  useGetCharDashaQuery,
  useGetCurrentCharDashaQuery,
  useGetCurrentYoginiDashaQuery,
  useGetYoginiDashaQuery,
} from "@/app/redux/services/astrologyAPI";

const TABS = [
  { id: "char", label: "Char Dasha" },
  { id: "yogni", label: "Yogini Dasha" },
];

export default function CharYogClient({ formData }) {
  const [activeTab, setActiveTab] = useState("char");

  const skip = !formData;

  const {
    data: charData,
    isLoading: charLoading,
    error: charError,
  } = useGetCharDashaQuery(formData, { skip });

  const {
    data: charcData,
    isLoading: charCurrentLoading,
    error: charCurrentError,
  } = useGetCurrentCharDashaQuery(formData, { skip });

  const {
    data: yogniData,
    isLoading: yoginiLoading,
    error: yoginiError,
  } = useGetYoginiDashaQuery(formData, { skip });

  const {
    data: yognicData,
    isLoading: yoginiCurrentLoading,
    error: yoginiCurrentError,
  } = useGetCurrentYoginiDashaQuery(formData, { skip });

  const loading =
    charLoading || charCurrentLoading || yoginiLoading || yoginiCurrentLoading;

  const error =
    charError || charCurrentError || yoginiError || yoginiCurrentError;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <span className="loader-all" />
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-center text-red-500">Failed to load Dasha data.</p>
    );
  }

  return (
    <>
      <div className="basic-list bg-[#2f1254] px-10 py-2 rounded-lg">
        <ul className="flex gap-5 justify-center">
          {TABS.map((tab) => (
            <li
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`cursor-pointer px-4 py-1 rounded-full text-xs sm:text-sm ${
                activeTab === tab.id ? "bg-purple-500 text-white" : "text-white"
              }`}
            >
              {tab.label}
            </li>
          ))}
        </ul>
      </div>

      <div className="sm:py-5">
        {activeTab === "char" && (
          <Chardasha charData={charData} charcData={charcData} />
        )}

        {activeTab === "yogni" && (
          <Yoginidasha yogniData={yogniData} yognicData={yognicData} />
        )}
      </div>
    </>
  );
}
