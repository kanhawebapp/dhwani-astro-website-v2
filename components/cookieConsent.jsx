"use client";

import { getConsent, saveConsent } from "@/utils/cookieConsent";
import { useEffect, useState } from "react";

export default function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = getConsent();

    if (!consent) {
      setShow(true);
    }
  }, []);

  const handleAcceptAll = () => {
    saveConsent({
      essential: true,
      analytics: true,
      marketing: true,
      updatedAt: Date.now(),
    });

    setShow(false);
  };

  const handleEssential = () => {
    saveConsent({
      essential: true,
      analytics: false,
      marketing: false,
      updatedAt: Date.now(),
    });

    setShow(false);
  };

  const handleReject = () => {
    saveConsent({
      essential: false,
      analytics: false,
      marketing: false,
      updatedAt: Date.now(),
    });

    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t shadow-xl px-5 py-2">
      <div className="max-w-6xl mx-auto flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="font-semibold text-black text-lg">
            Cookie Preferences
          </h3>

          <p className="text-sm text-gray-600">
            We use cookies to improve your experience,
            personalize content, and analyze traffic.
          </p>
        </div>

        <div className="flex text-xs flex-wrap gap-3">
          <button
            onClick={handleAcceptAll}
            className="px-4 py-2 bg-yellow-500 text-white rounded-full"
          >
            Accept All
          </button>

          <button
            onClick={handleEssential}
            className="px-4 py-2 bg-blue-500 text-white rounded-full"
          >
            Essential Only
          </button>

          <button
            onClick={handleReject}
            className="px-4 py-2 bg-gray-500 text-white rounded-full"
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  );
}