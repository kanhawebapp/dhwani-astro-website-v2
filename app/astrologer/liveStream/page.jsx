"use client";

import { useQuery } from "@apollo/client/react";
import Image from "next/image";
import Link from "next/link";

import { GET_UPCOMING_LIVES } from "@/app/graphql/gqlQuery";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "";

function parseLiveDate(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const date =
    typeof value === "number" || /^\d+$/.test(String(value))
      ? new Date(Number(value))
      : new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
}

// Reusable card component
function LiveCard({ live }) {
  const astrologer = live.astrologer;
  const isLive = live.status === "LIVE";
  const liveDate = parseLiveDate(live.scheduledAt);

  const profileImage = astrologer?.profilePic
    ? astrologer.profilePic.startsWith("http")
      ? astrologer.profilePic
      : `${BASE_URL}${astrologer.profilePic}`
    : "/man.png";

  return (
    <article className="group relative isolate overflow-hidden rounded-2xl border border-white/30 shadow-lg transition-all duration-300 hover:shadow-2xl">
      <div className="absolute inset-0 -z-20">
        <Image
          src={isLive ? "/ds-img/bgas.png" : "/ds-img/bgas1.jpeg"}
          alt={
            isLive ? "Live session background" : "Scheduled session background"
          }
          fill
          priority={false}
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
      </div>

      <div className="absolute inset-0 -z-10 " />

      <div className="relative rounded-2xl p-5 backdrop-blur">
        <div className="flex gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-3">
                <Image
                  src={profileImage}
                  alt={astrologer?.displayName || "Astrologer"}
                  width={70}
                  height={70}
                  unoptimized={profileImage.startsWith("http")}
                  className="h-18 w-18 rounded-full border-2 border-yellow-400 object-cover shadow-md"
                />
                <div className="flex flex-col items-start gap-1">
                  <p className={`text-md font-semibold  ${isLive ? "text-black-600" : "text-gray-300"}`}>
                    {astrologer?.displayName ||
                      astrologer?.name ||
                      "Astrologer"}
                  </p>

                  <div className="flex  gap-1">
                    <span className="text-sm">⭐</span>
                    <span className={`font-medium text-sm  ${isLive ? "text-black-600" : "text-gray-300"}`}>
                      {astrologer?.rating.toFixed(2) ?? 0}
                    </span>
                  </div>
                </div>
              </div>
              {isLive ? (
                <img
                  src="/ds-img/live.gif"
                  className="h-10 w-11 rounded-xl"
                  alt=""
                />
              ) : (
                <span className="shrink-0 rounded-full border border-blue-200 bg-blue-100/90 px-2 py-1 text-xs font-semibold text-blue-800">
                  Scheduled
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="mt-5 space-y-2 rounded-xl border border-white/10 bg-white/25 p-3 backdrop-blur-md">
          <h3
            className={`wrap-break-word text-md font-semibold ${
              isLive ? "text-black-600" : "text-gray-200"
            }`}
          >
            {live.title || "Live Astrology Session"}
          </h3>

          {!isLive && (
            <div className=" flex items-center justify-between ">
              {/* Date */}
              <div className="flex justify-between gap-3 text-xs">
                <span className=" text-gray-300">Date :</span>
                <span className=" text-gray-300">
                  {liveDate
                    ? liveDate.toLocaleDateString("en-IN")
                    : "Not scheduled"}
                </span>
              </div>

              <div className="flex justify-between gap-3 text-xs">
                <span className=" text-gray-300">Time :</span>
                <span className="text-right  text-gray-300">
                  {liveDate
                    ? liveDate.toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Not scheduled"}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="mt-5  flex gap-2">
          {isLive && live.channelName && (
            <Link
              href={`/live/${encodeURIComponent(live.channelName)}`}
              className="relative  flex flex-1 items-center justify-center overflow-hidden rounded-full bg-red-600 py-2 text-center text-sm font-semibold text-white shadow-md transition hover:bg-red-700"
            >
              <span className="pointer-events-none absolute inset-0 overflow-hidden">
                <span className="absolute -inset-y-full left-[-100%] h-[300%] w-1/2 -skew-x-[25deg] animate-shimmer bg-gradient-to-r from-transparent via-white/50 to-transparent" />
              </span>

              <span className="relative z-10">Watch Live</span>
            </Link>
          )}
        </div>
      </div>
    </article>
  );
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

  // Loading state
  if (loading) {
    return (
      <div className="py-10 text-center text-gray-600">
        Loading live sessions...
      </div>
    );
  }

  // Error state
  if (error && !result) {
    return (
      <div className="py-10 text-center text-red-600">
        Unable to load live sessions: {error.message}
      </div>
    );
  }

  // Separate sessions by status
  const liveSessions = lives.filter((live) => live.status === "LIVE");

  const scheduledSessions = lives.filter((live) => live.status === "SCHEDULED");

  const hasSessions = liveSessions.length > 0 || scheduledSessions.length > 0;

  return (
    <section className="w-full text-black bg-[#f7efff] py-6">
      <div className="mx-auto max-w-7xl px-4">
        {/* Header */}
        <div className="mb-8 flex flex-col items-center justify-center">
          <h2 className="text-center text-2xl font-bold text-black">
            Live Sessions
          </h2>

          <div className="mt-2 text-center text-sm text-black md:px-20">
       

            {/* <p>
              Experience a free live session with India's leading Astrologers,
              Tarot readers, Vaastu experts, Numerologists, and life coaches.
              Ask your questions about love, relationships, career, marriage,
              finance, and more through a live call today!
            </p> */}
          </div>
        </div>

        {!hasSessions ? (
          <div className="rounded-xl bg-white p-6 text-center shadow">
            No live or scheduled sessions available.
          </div>
        ) : (
          <div className="space-y-10">
            {liveSessions.length > 0 && (
              <section>
                <div className="mb-5 flex flex-wrap items-center gap-3">
                  <h4 className="text-sm ">
                    <b>Ongoing Live Sessions </b>
                  </h4>

                  {/* <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-600">
                    {liveSessions.length} Live
                  </span> */}
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                  {liveSessions.map((live) => (
                    <LiveCard key={live.id} live={live} />
                  ))}
                </div>
              </section>
            )}

            {scheduledSessions.length > 0 && (
              <section>
                <div className="mb-5 flex flex-wrap items-center gap-3">
                  <h3 className="text-sm font-bold text-black ">
                    Upcoming Scheduled Lives
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                  {scheduledSessions.map((live) => (
                    <LiveCard key={live.id} live={live} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
