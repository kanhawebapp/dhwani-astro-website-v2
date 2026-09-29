"use client";
import Image from "next/image";
import { useLanguage } from "../app/context/LangContext";
import useScrollZoom from "@/Hooks/scrollZoom";
export default function AboutUs() {
  const { messages: t } = useLanguage();
  useScrollZoom(".head-wrap");
  return (
    <section className="bg-linear-to-r from-purple-900  to-purple-900  p-5 mb-px flex items-center justify-center">
      <div className="flex flex-col head-wrap items-center justify-between gap-3 about-us-da max-w-7xl lg:gap-10 sm:flex-column lg:flex-row justify-self-center ">
        <div className="image-da hidden md:block justify-self-center">
          <Image
            src="/ds-img/logo.webp"
            alt="about us image"
            className="w-35 h-13 sm:w-60 sm:h-20 justify-self-center"
            unoptimized
            width={200}
            height={200}
          />
        </div>
        <div className="about-con flex flex-col sm:w-[60%] w-full ">
          <h2 className="text-[#ffd70a] text-center sm:text-xl text-lg font-semibold">
            {t?.us?.head || "About us"}
          </h2>
          <h2 className="text-white text-xs sm:text-sm lg:text-base">
            {t?.us?.para ||
              "Dhwani Astro is India's most renowned astrology consultancy"}
          </h2>
        </div>

        <div className="flex flex-col items-center gap-1 subsc-mail sm:gap-2 ">
          <h2 className="text-white text-sm sm:text-base font-bold">
            {t?.us?.subs || "SUBSCRIBE TO OUR NEWSLETTER"}
          </h2>
          <p className="text-white  text-sm sm:text-base">
            {t?.us?.tag || "Get Astrology Updates delivered to your doorstep."}
          </p>
          <div className="flex w-full input-search">
            <input
              className="input-email bg-white py-2 px-5 w-2/3"
              type="mail"
              placeholder="Enter E-mail ID"
            />{" "}
            <button
              aria-label="Submit Email"
              className="submit-email bg-[#ffd70a] text-xs text-black py-2 px-5 w-1/3"
              type="submit"
            >
              {t?.us?.subbtn || "SUBMIT"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
