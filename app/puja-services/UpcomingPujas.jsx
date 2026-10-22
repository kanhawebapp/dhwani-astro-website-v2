"use client";

import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
// import {
//   CalendarDays,
//   MapPin,
//   Image as ImageIcon,
//   ArrowRight,
// } from "lucide-react";

const GET_PUJA_SERVICES = gql`
  query GetPujaServices {
    pujaServices {
      id
      title
      slug
      image
      category
      shortDescription
      price
      mrp
      discount
      rating
    }
  }
`;
const backendUrl = new URL(process.env.NEXT_PUBLIC_BASE_URL).origin;

function PujaSocialProof({ pujaId }) {
  const [showRating, setShowRating] = useState(false);

  const seed = Array.from(String(pujaId || "puja")).reduce(
    (total, char) => total + char.charCodeAt(0),
    0,
  );

  const rating = Number((4.1 + ((seed * 17) % 9) / 10).toFixed(1));
  const bookings = 5 + ((seed * 13) % 101) / 10;

  useEffect(() => {
    const interval = setInterval(() => {
      setShowRating((previous) => !previous);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative h-14 min-w-0 flex-1 overflow-hidden">
      {/* Booked by */}
      <div
        className={`absolute inset-x-0 top-0 transition-all duration-500 ${
          showRating
            ? "-translate-y-full opacity-0"
            : "translate-y-0 opacity-100"
        }`}
      >
        <p className="text-[10px] text-gray-500">Booked by</p>
        <p className="flex items-baseline gap-1">
          <span className="text-md font-bold text-purple-600">
            {Math.round(bookings)}K+
          </span>
          <span className="text-[10px] text-gray-500">devotees</span>
        </p>
      </div>

      {/* Rating */}
      <div
        className={`absolute inset-x-0 top-0 transition-all duration-500 ${
          showRating
            ? "translate-y-0 opacity-100"
            : "translate-y-full opacity-0"
        }`}
      >
        <p className="text-[10px] text-gray-500">Rated</p>
        <p className="flex items-center gap-1.5">
          <span className="text-md leading-6 text-yellow-500">★</span>
          <span className="text-md font-bold text-gray-900">
            {rating.toFixed(1)}
          </span>
          <span className="text-[10px] text-gray-500">by devotees</span>
        </p>
      </div>
    </div>
  );
}

function PujaImage({ src, title }) {
  const [imageError, setImageError] = useState(false);

  const imageUrl = src
    ? src.startsWith("http")
      ? src
      : `${backendUrl}${src}`
    : null;

  return (
    <div className="relative h-48 w-full overflow-hidden rounded-t-xl bg-gray-100">
      {imageUrl && !imageError ? (
        <Image
          src={imageUrl}
          alt={title || "Puja"}
          fill
          unoptimized
          sizes="(max-width: 768px) 100vw, 400px"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="flex h-full items-center justify-center">
          {/* <ImageIcon className="h-10 w-10 text-gray-400" /> */}
        </div>
      )}
    </div>
  );
}

export default function UpcomingPujas() {
  const pathname = usePathname();
const hideHeading = pathname.includes("puja-services");
  const backendUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, "").replace(
      /\/adminAuth\/graphql\/?$/,
      "",
    ) || "";

  const { data, loading, error } = useQuery(GET_PUJA_SERVICES, {
    fetchPolicy: "cache-and-network",
  });

  const pujas = data?.pujaServices ?? [];

  return (
    <section className="w-full bg-white px-4 py-8 md:px-8 md:py-8">
      <div className="mx-auto max-w-7xl">
     
    {!hideHeading && (
  <h1 className="text-[#2f1254] text-md md:text-2xl py-1 md:py-5 text-center font-semibold">
    • Get Blessings from
    <strong> Upcoming Special Pujas with Dhwani Astro</strong> •
  </h1>
)}

          {/* <p className="mx-auto mt-3 max-w-2xl text-sm text-gray-600 md:text-base">
            Explore pujas and rituals to connect with your spiritual journey.
          </p> */}
        </div>

        {loading && !data && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="animate-pulse overflow-hidden rounded-xl border"
              >
                <div className="h-48 bg-gray-200" />
                <div className="space-y-3 p-5">
                  <div className="h-4 w-1/3 rounded bg-gray-200" />
                  <div className="h-5 w-3/4 rounded bg-gray-200" />
                  <div className="h-4 w-full rounded bg-gray-200" />
                  <div className="h-10 rounded bg-gray-200" />
                </div>
              </div>
            ))}
          </div>
        )}

        {error && !data && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
            <p className="font-medium text-red-700">
              Unable to load puja services.
            </p>
            <p className="mt-1 text-sm text-red-600">Please try again later.</p>
          </div>
        )}

        {!loading && !error && pujas.length === 0 && (
          <div className="rounded-xl border border-gray-200 p-8 text-center">
            <p className="font-medium text-gray-700">
              No puja services available right now.
            </p>
          </div>
        )}

        {pujas.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {pujas.map((puja) => (
              <article
                key={puja.id}
                className="group overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xs transition-shadow duration-300 hover:shadow-lg"
              >
                <PujaImage
                  src={puja.image}
                  title={puja.title}
                  backendUrl={backendUrl}
                />

                <div className="py-2 md:py-2 px-4">
                  {/* {puja.category && (
                    <span className="inline-block rounded-full bg-pink-50 px-3 py-1 text-xs font-semibold capitalize text-pink-600">
                      {puja.category}
                    </span>
                  )} */}

                  <h3 className=" line-clamp-2 text-lg font-bold text-[#2f1254]">
                    {puja.title}
                  </h3>

                  {puja.shortDescription && (
                    <p className="mt-1 line-clamp-3 text-sm leading-6 text-gray-600">
                      {puja.shortDescription}
                    </p>
                  )}
                  {/* Stars based on customer count */}
                  <div className="mt-1 flex items-center gap-1">
                    {Array.from({
                      length: Math.max(0, Math.floor(puja.rating || 0)),
                    }).map((_, index) => (
                      <svg
                        key={`${puja.id}-star-${index}`}
                        width={16}
                        height={16}
                        viewBox="0 0 640 640"
                      >
                        <path
                          fill="#FFCE1B"
                          d="M341.5 45.1C337.4 37.1 329.1 32 320.1 32C311.1 32 302.8 37.1 298.7 45.1L225.1 189.3L65.2 214.7C56.3 216.1 48.9 222.4 46.1 231C43.3 239.6 45.6 249 51.9 255.4L166.3 369.9L141.1 529.8C139.7 538.7 143.4 547.7 150.7 553C158 558.3 167.6 559.1 175.7 555L320.1 481.6L464.4 555C472.4 559.1 482.1 558.3 489.4 553C496.7 547.7 500.4 538.8 499 529.8L473.7 369.9L588.1 255.4C594.5 249 596.7 239.6 593.9 231C591.1 222.4 583.8 216.1 574.8 214.7L415 189.3L341.5 45.1z"
                        />
                      </svg>
                    ))}
                  </div>

                  <div className="mt-1 flex items-center justify-between gap-3  border-gray-100 pt-4">
                    {/* <div>
                      {puja.price != null && (
                        <p className="text-lg font-bold text-[#2f1254]">
                          ₹{puja.price}
                        </p>
                      )}

                      {puja.mrp != null &&
                        puja.price != null &&
                        Number(puja.mrp) > Number(puja.price) && (
                          <p className="text-xs text-gray-400 line-through">
                            ₹{puja.mrp}
                          </p>
                        )}
                    </div> */}
                    <PujaSocialProof pujaId={puja.id} />

                <Link
  href={`/puja-services/${puja.slug}`}
  className="inline-flex items-center gap-2 rounded-full bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-prple-700"
>
  Book Now
</Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
   
    </section>
  );
}
