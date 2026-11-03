
"use client";

import { useState } from "react";
import ServicesBankPaymentLogs from "./ServiceLogs";
import RechargePaymentLogs from "./RechargeLogs";


const tabs = [
  { id: "services", label: "Services Payments" },
  { id: "recharge", label: "Recharge Payments" },
];

export default function PaymentLogsTabs() {
  const [activeTab, setActiveTab] = useState("services");

  return (
    <div className="min-h-screen bg-gray-100  sm:p-6">
      <div className="mb-6 rounded-2xl bg-white p-2 shadow-sm">
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
                className={`rounded-full px-2 py-2 text-xs sm:text-sm font-semibold transition-colors ${
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
        {activeTab === "services" && <ServicesBankPaymentLogs />}
        {activeTab === "recharge" && <RechargePaymentLogs />}
      </div>
    </div>
  );
}
