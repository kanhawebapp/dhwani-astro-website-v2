"use client";

import { useQuery } from "@apollo/client/react";
import Image from "next/image";
import Link from "next/link";

import { GET_UPCOMING_LIVES } from "@/app/graphql/gqlQuery";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "";

// Supports ISO date strings and numeric millisecond timestamps.
function parseLiveDate(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const date =
    typeof value === "number" ||
    /^\d+$/.test(String(value))
      ? new Date(Number(value))
      : new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
}

export default function UpcomingLives() {
  const { data, loading, error } = useQuery(GET_UPCOMING_LIVES, {
    variables: {
      page: 1,
      limit: 20,
    },
    fetchPolicy: "network-only",
    errorPolicy: "all",
  });

  const result = data?.getUpcomingLives;
  const lives = result?.data || [];

  if (loading) {
    return (
      <div className="py-10 text-center text-gray-600">
        Loading live sessions...
      </div>
    );
  }

  if (error && !result) {
    return (
      <div className="py-10 text-center text-red-600">
        Unable to load live sessions: {error.message}
      </div>
    );
  }

  return (
    <section className="w-full py-6">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-black">
          Live Sessions
        </h2>

        <span className="text-sm text-gray-500">
          {result?.totalCount ?? lives.length} Sessions
        </span>
      </div>

      {lives.length === 0 ? (
        <div className="rounded-xl bg-white p-6 text-center shadow">
          No live sessions available.
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {lives.map((live) => {
            const astrologer = live.astrologer;
            const isLive = live.status === "LIVE";
            const liveDate = parseLiveDate(live.scheduledAt);

            const profileImage = astrologer?.profilePic
              ? astrologer.profilePic.startsWith("http")
                ? astrologer.profilePic
                : `${BASE_URL}${astrologer.profilePic}`
              : "/man.png";

            return (
              <article
                key={live.id}
                className="overflow-hidden rounded-2xl border bg-white shadow-md transition-shadow hover:shadow-xl"
              >
                <div
                  className={`h-2 ${
                    isLive
                      ? "bg-red-500"
                      : "bg-gradient-to-r from-purple-500 to-pink-500"
                  }`}
                />

                <div className="p-5">
                  <div className="flex gap-4">
                    <Image
                      src={profileImage}
                      alt={astrologer?.displayName || "Astrologer"}
                      width={70}
                      height={70}
                      unoptimized={profileImage.startsWith("http")}
                      className="h-[70px] w-[70px] rounded-full border-2 border-yellow-400 object-cover"
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="break-words text-lg font-bold text-black">
                          {live.title || "Live Astrology Session"}
                        </h3>

                        {isLive ? (
                          <span className="shrink-0 animate-pulse rounded-full bg-red-500 px-2 py-1 text-xs text-white">
                            🔴 LIVE
                          </span>
                        ) : (
                          <span className="shrink-0 rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-700">
                            Scheduled
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-gray-600">
                        By{" "}
                        {astrologer?.displayName ||
                          astrologer?.name ||
                          "Astrologer"}
                      </p>

                      <div className="mt-1 flex items-center gap-1">
                        <span>⭐</span>
                        <span className="font-medium">
                          {astrologer?.rating ?? 0}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 space-y-2">
                    <div className="flex justify-between gap-3 text-sm">
                      <span className="text-gray-500">Date</span>

                      <span className="text-right font-medium">
                        {liveDate
                          ? liveDate.toLocaleDateString("en-IN")
                          : "Not scheduled"}
                      </span>
                    </div>

                    <div className="flex justify-between gap-3 text-sm">
                      <span className="text-gray-500">Time</span>

                      <span className="text-right font-medium">
                        {liveDate
                          ? liveDate.toLocaleTimeString("en-IN", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "Not scheduled"}
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 flex gap-2">
                    <Link
                      href={
                        astrologer?.id
                          ? `/astrologerprofile/${astrologer.id}`
                          : "#"
                      }
                      aria-disabled={!astrologer?.id}
                      className={`flex flex-1 items-center justify-center rounded-xl bg-yellow-500 py-3 text-center font-semibold text-black hover:bg-yellow-600 ${
                        !astrologer?.id
                          ? "pointer-events-none opacity-50"
                          : ""
                      }`}
                    >
                      View Astrologer
                    </Link>

                    {isLive && (
                      <Link
                        href={`/live/${encodeURIComponent(
                          live.channelName
                        )}`}
                        className="flex flex-1 items-center justify-center rounded-xl bg-red-600 py-3 text-center font-semibold text-white hover:bg-red-700"
                      >
                        🔴 Watch Live
                      </Link>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}