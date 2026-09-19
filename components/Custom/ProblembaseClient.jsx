"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import useScrollZoom from "@/Hooks/scrollZoom";
import { useLanguage } from "@/app/context/LangContext";
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

const ProblembaseSwiper = dynamic(
  () => import("./ProblembaseSwiper.client"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[220px] bg-gray-100 rounded-xl animate-pulse" />
    ),
  }
);

export default function ProblembaseClient({ services }) {
  const { messages } = useLanguage();

  useScrollZoom(".head-wrap, .prob-wrap");

  const swiperData =
    services?.map((service) => ({
      id: service.id,
      src: `${BASE_URL}${service.image}`,
      alt: service.name,
      ulname: service.name,
      href: `/consultation/${service.slug}`,
    })) || [];

  return (
    <section className="relative w-full mx-auto py-5 sm:py-10 px-4">
      {/* Background */}
      <div className="absolute inset-0">
        <Image
          src="/ds-img/ZODIAC-CONSTELL.webp"
          alt="Zodiac constellation astrology background"
          fill
          className="object-cover opacity-5"
          priority={false}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center">
        <div className="w-full max-w-7xl">
          {/* Heading */}
          <div className="head-wrap">
            <h2 className="text-[#2f1254] text-[15px] sm:text-xl lg:text-2xl  py-3 text-center font-semibold">
              {messages?.problem?.heading ||
                "Get expert astrological guidance to overcome your problems & challenges"}
            </h2>
          </div>

          {/* Swiper */}
          {swiperData.length > 0 ? (
            <div className="py-2">
              <div className="relative w-full h-[180px] sm:h-[220px] lg:h-[260px]">
                <ProblembaseSwiper categorySlug="consultation"/>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-[220px]">
              <p className="text-gray-500">
                No consultation services available.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}