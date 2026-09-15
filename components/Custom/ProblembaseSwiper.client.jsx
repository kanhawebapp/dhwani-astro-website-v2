"use client";

import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@apollo/client/react";
import { GET_CATEGORY } from "@/app/graphql/gqlQuery";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export default function ProblembaseSwiper({ categorySlug }) {
  const { data, loading, error } = useQuery(GET_CATEGORY, {
    variables: {
      slug: categorySlug,
    },
  });

  const services = data?.getCategory?.services || [];

  if (loading) {
    return <div className="h-[220px] bg-gray-100 animate-pulse rounded-xl" />;
  }

  if (error) {
    return <p>Error loading services .</p>;
  }

  return (
    <div className="slider-horo-home w-full">
      <div className="absolute top-[50%] sm:left-[-45px] -left-[12px] -translate-y-1/2 z-10">
        <button className="swiper-button-prev-blg">‹</button>
      </div>

      <div className="absolute top-[50%] sm:right-[-45px] -right-[12px] -translate-y-1/2 z-10">
        <button className="swiper-button-next-blg">›</button>
      </div>

      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        navigation={{
          nextEl: ".swiper-button-next-blg",
          prevEl: ".swiper-button-prev-blg",
        }}
        spaceBetween={20}
        slidesPerView={4}
        loop
        breakpoints={{
          320: { slidesPerView: 2, spaceBetween: 10 },
          480: { slidesPerView: 2, spaceBetween: 15 },
          768: { slidesPerView: 4, spaceBetween: 15 },
          1024: { slidesPerView: 4, spaceBetween: 20 },
        }}
      >
        {services.map((service) => (
          <SwiperSlide key={service.id}>
            <Link
            href={`/dhwani-services/${categorySlug}/${service.slug}`}
              className="prob-wrap prblm-card-top flex items-center justify-center sm:w-75 sm:h-55 xl:min-w-70 xl:h-60 min-w-40 sm:min-w-55 h-40"
            >
              <Image
                src={`https://dhwaniastro.com${service.image}`}
                alt={service.name}
                width={300}
                height={300}
                className="prblm-image"
              />

              <div className="absolute bottom-2 left-0 flex w-full justify-center">
                <h2 className="prblm-txt w-[90%] rounded-full border border-gray-400 text-xs sm:text-sm lg:text-base">
                  {service.name}
                </h2>
              </div>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}