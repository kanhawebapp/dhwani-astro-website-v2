"use client";

import React from "react";

export default function Healdetail({ data, sp }) {
  const serviceName = data?.name || "Astrology Service";

  return (
    <div
      className="flex flex-col gap-2"
      itemScope
      itemType="https://schema.org/Service"
    >
      <h1
        className="mb-0 text-center text-xl font-bold text-purple-700 sm:text-3xl"
        itemProp="name"
      >
        {serviceName}
      </h1>

      <div className="mt-0 flex items-center space-x-2">
        <span
          className="text-sm font-semibold text-purple-600 sm:text-xl"
          aria-label={`Starting price ₹${sp ?? 0} per session`}
        >
          Starting From: ₹ {sp ?? 0}
        </span>

        <span className="text-xs text-gray-500">
          (Per Session)
        </span>
      </div>

      {data?.description && (
        <p
          className="mb-1 text-xs text-gray-600 sm:text-base"
          itemProp="description"
        >
          {data.description}
        </p>
      )}

      {data?.longText && (
        <div
          className="mb-1 text-xs text-gray-600 sm:text-base"
          itemProp="description"
        >
          {data.longText}
        </div>
      )}
    </div>
  );
}
