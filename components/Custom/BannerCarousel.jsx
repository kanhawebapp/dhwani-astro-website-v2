
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
      className="w-full overflow-hidden slider-banner-home"
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
          const desktopImage =
            slide.desktopImage || slide.mobileImage;

          if (!desktopImage) return null;

          const isFirstSlide = index === 0;

          const desktopProps = getImageProps({
            src: desktopImage,
            alt: slide.heading || "Featured banner",
            width: 1600,
            height: 600,
            sizes: "100vw",
            quality: 90,
            loading: isFirstSlide ? "eager" : "lazy",
            fetchPriority: isFirstSlide ? "high" : "auto",
          });

          const mobileProps = slide.mobileImage
            ? getImageProps({
                src: slide.mobileImage,
                alt: slide.heading || "Featured banner",
                width: 768,
                height: 432,
                sizes: "100vw",
                quality: 90,
                loading: isFirstSlide ? "eager" : "lazy",
                fetchPriority: isFirstSlide ? "high" : "auto",
              })
            : null;

          const bannerContent = (
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
                alt={slide.heading || "Featured banner"}
                className="absolute inset-0 block w-full h-full object-cover"
                decoding="async"
              />
            </picture>
          );

          return (
            <SwiperSlide key={slide.id}>
              <div
                className="
                  relative w-full overflow-hidden
                  aspect-[7/2]
                  max-md:aspect-[16/9]
                  bg-[#fff5f2]
                "
              >
                {slide.bannerlink ? (
                  <a
                    href={slide.bannerlink}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Open ${slide.heading || "banner"}`}
                    className="absolute inset-0 z-10 block cursor-pointer"
                  >
                    {bannerContent}
                  </a>
                ) : (
                  bannerContent
                )}
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </section>
  );
}
