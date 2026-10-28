
"use client";

import dynamic from "next/dynamic";

const RemedyCalculator = dynamic(() => import("../Homepagecomp/RemedyCalculator"), {
  ssr: false,
  loading: () => (
    <section
      className="w-full py-8 px-4"
      aria-label="Loading remedies and calculators"
    >
      <div className="mx-auto max-w-7xl animate-pulse space-y-6">
        <div className="mx-auto h-6 w-64 rounded bg-gray-200" />

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: 5 }, (_, i) => (
            <div
              key={i}
              className="h-28 rounded-xl bg-gray-200"
            />
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <div
              key={i}
              className="h-24 rounded-xl bg-gray-200"
            />
          ))}
        </div>
      </div>
    </section>
  ),
});

export default RemedyCalculator;
