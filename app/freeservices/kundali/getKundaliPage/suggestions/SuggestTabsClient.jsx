"use client";

import { useState } from "react";
import Pujasuggest from "./puja/Pujasuggest";
import Gemsuggest from "./gem/Gemsuggest";
import Rudrasuggest from "./rudra/Rudrasuggest";

const TABS = [
  {
    id: "puja",
    label: "Puja Suggestions",
  },
  {
    id: "gem",
    label: "Gemstone Suggestions",
  },
  {
    id: "rudra",
    label: "Rudraksha Suggestions",
  },
];

export default function SuggestTabsClient({ formData }) {
  const [activeTab, setActiveTab] = useState("puja");

  return (
    <>
      <div className="basic-list bg-[#2f1254] px-5 py-2 rounded-lg">
        <ul className="flex gap-5 justify-center">
          {TABS.map((tab) => (
            <li
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`cursor-pointer flex items-center gap-2 px-2 sm:px-4 py-1 rounded-full text-xs sm:text-sm ${
                activeTab === tab.id
                  ? "border-b border-purple-300 rounded-xl text-white"
                  : "text-white"
              }`}
            >
              {tab.label}
            </li>
          ))}
        </ul>
      </div>

      <div className="py-5">
        {activeTab === "puja" && (
          <Pujasuggest formData={formData} />
        )}

        {activeTab === "gem" && (
          <Gemsuggest formData={formData} />
        )}

        {activeTab === "rudra" && (
          <Rudrasuggest formData={formData} />
        )}
      </div>
    </>
  );
}