
"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";

const PujaSection = dynamic(() => import("../../app/puja-services/PujaSection"), {
  loading: () => (
    <div
      className="mx-auto w-full max-w-7xl space-y-4 px-4 py-8"
      aria-label="Loading puja section"
    >
      <div className="mx-auto h-7 w-72 max-w-full animate-pulse rounded bg-gray-200" />
      <div className="h-48 animate-pulse rounded-xl bg-gray-100 sm:h-64" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="h-64 animate-pulse rounded-xl bg-gray-100"
          />
        ))}
      </div>
    </div>
  ),
});

export default function PujaSectionLazy() {
  const sectionRef = useRef(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const element = sectionRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: "500px 0px",
      }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={sectionRef} className="min-h-[320px] w-full">
      {shouldLoad ? (
        <PujaSection />
      ) : (
        <div
          className="mx-auto min-h-[320px] w-full max-w-7xl px-4 py-8"
          aria-hidden="true"
        />
      )}
    </div>
  );
}
