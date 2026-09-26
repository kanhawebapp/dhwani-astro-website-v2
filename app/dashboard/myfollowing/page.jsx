"use client";

import { GET_FOLLOWED_ASTROLOGERS } from "@/app/graphql/gqlQuery";
import { useQuery } from "@apollo/client/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
export default function FollowingPage() {
  const { data, loading, error } = useQuery(GET_FOLLOWED_ASTROLOGERS, {
    variables: {
      page: 1,
      limit: 10,
    },
    fetchPolicy: "network-only",
  });
  const router = useRouter();
 const astrologerprofile = (id) => {
  router.push(`/astrologerprofile/${id}`);
};
  const astrologers = data?.getFollowedAstrologers?.astrologers || [];

  if (loading) {
    return (
      <div className="p-6 text-black">
        <h1 className="text-xl sm:text-2xl font-semibold text-black mb-6">
          My Following
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="border border-gray-200 rounded-2xl p-5 animate-pulse"
            >
              <div className="flex gap-4">
                <div className="w-16 h-16 rounded-full bg-gray-200" />

                <div className="flex-1 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="h-3 bg-gray-200 rounded w-1/3" />
                  <div className="h-3 bg-gray-200 rounded w-3/4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-xl sm:text-2xl text-black font-semibold mb-6">
          My Following
        </h1>

        <div className="border border-red-200 bg-red-50 text-red-600 rounded-xl p-4">
          Failed to load followed astrologers.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl text-black font-semibold">
            My Following
          </h1>

          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            {data?.getFollowedAstrologers?.total || 0} astrologers
          </p>
        </div>
      </div>

      {astrologers.length === 0 ? (
        <div className="border border-gray-200 rounded-2xl p-10 text-center">
          <p className="text-gray-500">
            You are not following any astrologers yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {astrologers.map((astrologer) => (
            <div
              key={astrologer.id}
              className="border border-gray-200 rounded-2xl sm:p-5 p-3 px-4 bg-white hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-4">
                {/* Image */}
                <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full cursor-pointer overflow-hidden bg-gray-100 shrink-0">
                  <Image
                    src={
                      astrologer?.profilePic
                        ? `${BASE_URL}${astrologer.profilePic}`
                        : "/man.png"
                    }
                    // src={astrologer.profilePic || "/images/default-user.png"}
                    alt={astrologer.name || "Astrologer"}
                    fill
                    className="object-cover"
                    onClick={() => astrologerprofile(id)}
                  />
                </div>

                {/* Name + Rating */}
                <div className="min-w-0">
                  <h2 className="font-semibold text-black text-lg truncate">
                    {astrologer.displayName}
                  </h2>

                  <div className="flex items-center gap-1 text-sm mt-1">
                    <span className="text-yellow-500">★</span>

                    <span className="font-medium text-black">
                      {astrologer.rating?.toFixed(2) ?? 0}
                    </span>
                  </div>
                </div>
              </div>

              {/* Skills */}
              {astrologer.skills?.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {astrologer.skills.map((skill, index) => (
                    <span
                      key={`${skill}-${index}`}
                      className="text-xs bg-purple-50 text-purple-600 px-3 py-1 rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
