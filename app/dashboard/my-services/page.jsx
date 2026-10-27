
"use client";

import { useState } from "react";
import ServiceBookingHistory from "./service";
import PujaBookingHistory from "./puja";


const tabs = [
  { id: "services", label: "Booked Services" },
  { id: "puja", label: "Booked Puja " },
];

export default function PaymentLogsTabs() {
  const [activeTab, setActiveTab] = useState("services");

  return (
    <div className="min-h-screen bg-gray-100 p-3 sm:p-6">
      <div className="mb-6 rounded-xl bg-white p-2 shadow-sm">
        <div
          role="tablist"
          aria-label="Payment logs"
          className="flex flex-wrap gap-2"
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={`panel-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-lg px-4 py-3 text-sm font-semibold transition-colors ${
                  isActive
                    ? "bg-indigo-600 text-white shadow"
                    : "bg-gray-100 text-gray-600 hover:bg-indigo-50 hover:text-indigo-700"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div
        id={`panel-${activeTab}`}
        role="tabpanel"
        aria-labelledby={`tab-${activeTab}`}
      >
        {activeTab === "services" && <ServiceBookingHistory />}
        {activeTab === "puja" && <PujaBookingHistory />}
      </div>
    </div>
  );
}
