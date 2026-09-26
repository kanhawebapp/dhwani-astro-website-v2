"use client";

import { useQuery } from "@apollo/client/react";
import { GET_UPCOMING_LIVES } from "@/app/graphql/gqlQuery";

import Image from "next/image";
import Link from "next/link";
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export default function UpcomingLives() {
  const { data, loading, error } =
    useQuery(GET_UPCOMING_LIVES, {
      variables: {
        page: 1,
        limit: 20,
      },
      fetchPolicy: "network-only",
    });

  const lives =
    data?.getUpcomingLives?.data || [];

  if (loading) {
    return (
      <div className="text-center py-10">
        Loading upcoming lives...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center py-10">
        {error.message}
      </div>
    );
  }

  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-2xl font-bold text-black">
          Live Sessions
        </h2>

        <span className="text-sm text-gray-500">
          {
            data?.getUpcomingLives
              ?.totalCount
          }{" "}
          Sessions
        </span>
      </div>

      {lives.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-6 text-center">
          No live sessions available
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {lives.map((live) => {
            const liveDate = new Date(
              Number(live.scheduledAt)
            );

            return (
              <div
                key={live.id}
                className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all overflow-hidden border"
              >
                <div
                  className={`h-2 ${
                    live.status === "LIVE"
                      ? "bg-red-500"
                      : "bg-gradient-to-r from-purple-500 to-pink-500"
                  }`}
                />

                <div className="p-5">
                  <div className="flex gap-4">
                    <Image
                      src={
                        live?.astrologer
                          ?.profilePic
                          ? `${BASE_URL}${live.astrologer.profilePic}`
                          : "/man.png"
                      }
                      alt="astrologer"
                      width={70}
                      height={70}
                      className="rounded-full border-2 border-yellow-400 object-cover h-[70px] w-[70px]"
                    />

                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-lg text-black">
                          {live.title}
                        </h3>

                        {live.status ===
                        "LIVE" ? (
                          <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                            🔴 LIVE
                          </span>
                        ) : (
                          <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                            Scheduled
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-gray-600">
                        By{" "}
                        {live.astrologer
                          ?.displayName ||
                          live.astrologer
                            ?.name}
                      </p>

                      <div className="flex items-center gap-1 mt-1">
                        ⭐
                        <span className="font-medium">
                          {live.astrologer
                            ?.rating || 0}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">
                        Date
                      </span>

                      <span className="font-medium">
                        {liveDate.toLocaleDateString(
                          "en-IN"
                        )}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">
                        Time
                      </span>

                      <span className="font-medium">
                        {liveDate.toLocaleTimeString(
                          "en-IN",
                          {
                            hour: "2-digit",
                            minute:
                              "2-digit",
                          }
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 flex gap-2">
                    <Link
                      href={`/astrologerprofile/${live.astrologer?.id}`}
                      className="flex-1"
                    >
                      <button className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-3 rounded-xl">
                        View Astrologer
                      </button>
                    </Link>

                    {live.status ===
                      "LIVE" && (
                      <Link
                        href={`/live/${live.channelName}`}
                        className="flex-1"
                      >
                        <button className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-xl">
                          🔴 Watch Live
                        </button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}