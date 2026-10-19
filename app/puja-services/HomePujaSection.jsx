
"use client";

import Image from "next/image";

const services = [
  {
    title: "Online Puja",
    image: "/ds-img/onpooja.webp",
  },
  {
    title: "Online Chadhawa",
    image: "/ds-img/chdwa-rem.webp",
  },
  {
    title: "Authentic Temple Prasad",
    image: "/ds-img/ladoo.webp",
  },
];

const pujaImages = [
  "/ds-img/puja2.webp",
  "/ds-img/puja1.webp",
  "/ds-img/puja3.webp",
  "/ds-img/puja4.webp",
  "/ds-img/puja5.webp",
  "/ds-img/puja6.webp",
];

export default function HomePujaSection() {
  return (
    <section className="relative mx-auto flex w-full flex-col items-center justify-center overflow-hidden py-10">
      {/* Background image */}
      <div className="absolute inset-0 flex items-center justify-center shadow-lg">
        <Image
          src="/ds-img/dspuja.webp"
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-center opacity-80"
        />
      </div>

      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black/20" />

      {/* Main content */}
      <div className="relative z-10 flex w-full flex-col items-center justify-center">
        <h1 className="relative mx-4 rounded-lg bg-[#00000880] p-3 text-center text-base font-semibold text-white md:mx-0 md:text-4xl">
          <span aria-hidden="true">• </span>
          <strong>
            Experience Hindu Pujas &amp; Rituals with Dhwani Astro 🛕🕉️
          </strong>
          <span aria-hidden="true"> •</span>
        </h1>

        {/* Service cards */}
        <div className="relative z-10 grid max-w-7xl grid-cols-3 items-center justify-center gap-3 px-3 py-3 md:gap-6">
          {services.map((service) => (
            <div
              key={service.title}
              className="flex h-32 w-full flex-col items-center justify-between gap-2 rounded-xl bg-[#00000095] p-3 text-center shadow-lg sm:w-48 md:h-32 md:w-60 md:p-4"
            >
              <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white p-2 md:h-15 md:w-15">
                <Image
                  src={service.image}
                  alt={service.title}
                  fill
                  sizes="60px"
                  className="rounded-full object-contain p-2"
                />
              </div>

              <h3 className="text-[10px] font-semibold leading-tight text-white sm:text-xs md:text-base">
                {service.title}
              </h3>
            </div>
          ))}
        </div>

        {/* Image marquee */}
        <div className="relative flex w-full items-center overflow-hidden bg-[#2724247b]">
          {/* Left gradient */}
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 block w-[10%] bg-gradient-to-r from-[#000000df] to-transparent" />

          {/* Scrolling images */}
          <div className="flex w-max animate-puja-marquee gap-[15px] px-5 py-5 hover:[animation-play-state:paused]">
            {[...pujaImages, ...pujaImages].map((image, index) => (
              <div
                key={`${image}-${index}`}
                className="relative h-32 w-36 shrink-0 overflow-hidden rounded-[10px] sm:h-40 sm:w-64 md:h-48 md:w-[22rem]"
              >
                <Image
                  src={image}
                  alt={`Hindu puja and rituals ${(index % pujaImages.length) + 1}`}
                  fill
                  sizes="(max-width: 640px) 144px, (max-width: 768px) 256px, 352px"
                  className="object-cover"
                />
              </div>
            ))}
          </div>

          {/* Right gradient */}
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 block w-[10%] bg-gradient-to-l from-[#000000df] to-transparent" />
        </div>
      </div>
    </section>
  );
}
