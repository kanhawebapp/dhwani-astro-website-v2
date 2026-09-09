"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import { GET_BANNERS } from "@/app/graphql/gqlQuery";
import { useQuery } from "@apollo/client/react";

const SwiperStyles = dynamic(
  () => import("./Custom/SwiperStyles"),
  { ssr: false }
);

export default function Banner() {
  const [isMobile, setIsMobile] = useState(false);

  const { data } = useQuery(GET_BANNERS, {
    variables: { language: "en" },
    fetchPolicy: "cache-first",
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");

    const handleChange = (e) => {
      setIsMobile(e.matches);
    };

    setIsMobile(mediaQuery.matches);

    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  const banners = data?.getBanners?.data || [];

  const filteredBanners = banners.filter((banner) =>
    isMobile
      ? banner.bannerType === "MOBILE"
      : banner.bannerType === "DESKTOP"
  );

  if (!data) {
    return (
      <div className="w-full h-[230px] sm:h-[215px] lg:h-[450px] bg-gray-100 animate-pulse" />
    );
  }

  if (!filteredBanners.length) {
    return null;
  }

  return (
    <div className="slider-banner-home w-full overflow-hidden">
      <SwiperStyles />

      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        slidesPerView={1}
        spaceBetween={0}
        loop={filteredBanners.length > 1}
        pagination={{ clickable: true }}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
        }}
        updateOnWindowResize
        resizeObserver
        observer
        observeParents
        watchOverflow
        autoHeight={false}
        className="mySwiper w-full"
      >
        {filteredBanners.map((banner, index) => (
          <SwiperSlide key={banner.id}>
            <div className="relative w-full h-[230px] sm:h-[215px] lg:h-[450px]">
              <Image
                src={`https://dhwaniastro.com${banner.imageUrl}`}
                alt={banner.heading || "Banner"}
                fill
                priority={index === 0}
                loading={index === 0 ? "eager" : "lazy"}
                className="object-cover"
                sizes="100vw"
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}