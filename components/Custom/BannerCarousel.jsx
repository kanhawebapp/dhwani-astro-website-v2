
"use client";

import { getImageProps } from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export default function BannerCarousel({ slides = [] }) {
  if (!slides.length) return null;

  return (
    <section
      className="w-full slider-banner-home overflow-hidden"
      aria-label="Featured banners"
    >
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        slidesPerView={1}
        spaceBetween={0}
        loop={slides.length > 1}
        pagination={{ clickable: true }}
        navigation={slides.length > 1}
        autoplay={
          slides.length > 1
            ? {
                delay: 5000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }
            : false
        }
        className="w-full"
      >
        {slides.map((slide, index) => {
          const fallbackImage =
            slide.desktopImage ?? slide.mobileImage;

          if (!fallbackImage) return null;

          const priority = index === 0;

          const desktopProps = getImageProps({
            src: fallbackImage,
            alt: slide.heading || "Banner",
            width: 1920,
            height: 600,
            sizes: "100vw",
            quality: 75,
            loading: priority ? "eager" : "lazy",
            fetchPriority: priority ? "high" : "auto",
          });

          const mobileProps = slide.mobileImage
            ? getImageProps({
                src: slide.mobileImage,
                alt: slide.heading || "Banner",
                width: 768,
                height: 432,
                sizes: "100vw",
                quality: 75,
                loading: priority ? "eager" : "lazy",
                fetchPriority: priority ? "high" : "auto",
              })
            : null;

          return (
            <SwiperSlide key={slide.id}>
              <div className="relative w-full aspect-[16/9] sm:aspect-[16/5] min-h-[180px] max-h-[450px] overflow-hidden">
                <picture>
                  {mobileProps && (
                    <source
                      media="(max-width: 767px)"
                      srcSet={mobileProps.props.srcSet}
                      sizes="100vw"
                    />
                  )}

                  <img
                    {...desktopProps.props}
                    alt={slide.heading || "Banner"}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                </picture>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </section>
  );
}
