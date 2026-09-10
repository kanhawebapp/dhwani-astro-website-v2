"use client";

import Image from "next/image";
import Link from "next/link";
// import styles from "./NavBar.module.css"
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { useLanguage } from "@/app/context/LangContext";
import useScrollZoom from "@/Hooks/scrollZoom";
import { GET_TESTIMONIALS } from "@/app/graphql/gqlQuery";
import { useQuery } from "@apollo/client/react";

export default function Testimon() {
  const { messages: t } = useLanguage();
  useScrollZoom(".head-wrap");
  const { data, loading } = useQuery(GET_TESTIMONIALS);

  const testim = data?.getTestimonials?.data || [];
  if (loading) {
    return (
      <section className="flex justify-center py-10">
        Loading testimonials...
      </section>
    );
  }
  const getImageUrl = (image) => {
    if (!image) return "/ds-img/sachin.svg";

    if (
      image.startsWith("http://") ||
      image.startsWith("https://") ||
      image.startsWith("blob:")
    ) {
      return image;
    }

    return `https://dhwaniastro.com${image}`;
  };
  const formatDate = (timestamp) => {
    return new Date(Number(timestamp)).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };
  return (
    <section className="flex w-full flex-col items-center self-center sm:max-w-7xl pt-2  px-3">
      <div className="sm:py-3 py-1">
        <h1
          dangerouslySetInnerHTML={{
            __html: t?.testimonial?.head || "Frequently Asked Questions",
          }}
          className="relative head-wrap text-[#2f1254] text-md sm:text-xl lg:text-2xl text-center font-semibold"
        />
      </div>
      <div className="slider-astrocard-home  w-full relative">
        <div className="absolute top-1/2 sm:-left-0px -left-2 lg:left-[-50px] transform -translate-y-1/2 z-10">
          <button
            aria-label="Previous Testimonial"
            className="swiper-button-prev-tst"
          >
            ‹
          </button>
        </div>
        <div className="absolute top-1/2 sm:-right-0px -right-2 lg:right-[-50px] transform -translate-y-1/2 z-10">
          <button
            aria-label="Next Testimonial"
            className="swiper-button-next-tst"
          >
            ›
          </button>
        </div>
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={20}
          slidesPerView={2}
          navigation={{
            nextEl: ".swiper-button-next-tst",
            prevEl: ".swiper-button-prev-tst",
          }}
          // pagination={{ clickable: true }}
          autoplay={false}
          loop={true}
          resizeObserver={false}
          observer={false}
          observeParents={false}
          className="mySiperblog"
          style={{
            "--swiper-navigation-color": "#fff",
            "--swiper-navigation-size": "25px",

            padding: "3rem 0",
          }}
          breakpoints={{
            320: {
              slidesPerView: 2,
              spaceBetween: 10,
            },
            480: {
              slidesPerView: 2,
              spaceBetween: 15,
            },
            768: {
              slidesPerView: 3,
              spaceBetween: 15,
            },
            1024: {
              slidesPerView: 3,
              spaceBetween: 20,
            },
            1280: {
              slidesPerView: 3,
              spaceBetween: 20,
            },
          }}
        >
          {testim.map((test, i) => (
            <SwiperSlide key={test.id} className="head-wrap">
              <Link href="#">
                <div className="relative bg-gradient-to-r from-indigo-100 via-purple-100 to-violet-200 bg-white shadow-lg rounded-lg p-3 text-center">
                  <div className="absolute left-1/2 -top-10 transform -translate-x-1/2">
                    <Image
                      src={getImageUrl(test.image)}
                      alt={test.name || "Customer image"}
                      width={40}
                      unoptimized
                      height={40}
                      priority={i === 0}
                      loading={i === 0 ? "eager" : "lazy"}
                      className="w-20 h-20 sm:w-25 sm:h-25 lg:h-30 lg:w-30 rounded-full border-4 border-white shadow-md"
                    />
                  </div>

                  <div className="mt-10 sm:mt-14 lg:mt-18">
                    <h2 className="text-xs sm:text-lg font-semibold text-gray-800">
                      {test.name}
                    </h2>

                    <div className="flex justify-center items-center gap-1 mt-2">
                      <div className="text-yellow-400">
                        {Array.from({ length: Number(test.rating || 0) }).map(
                          (_, index) => (
                            <span
                              className="text-[10px] sm:text-md"
                              key={index}
                            >
                              ⭐
                            </span>
                          ),
                        )}
                      </div>

                      <span className="text-[10px] text-gray-500">
                        ({test.rating}/5)
                      </span>
                    </div>

                    <h3 className="text-[10px] sm:text-sm text-gray-500 mt-1">
                      {test.address}
                    </h3>
                    <p className="text-gray-600 p-s text-start  overflow-y-auto h-15 mt-3 text-[11px] sm:text-sm">
                      {test.content}
                    </p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-[10px] font-semibold text-gray-500">
                        {formatDate(test.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
