"use client";

import Image from "next/image";
import Link from "next/link";
import useScrollZoom from "@/Hooks/scrollZoom";
import { useLanguage } from "@/app/context/LangContext";

export default function DownappClient({ messages }) {
  useScrollZoom(".head-wrap");
  const { messages: t } = useLanguage();

  return (
    <div className="mobile-app flex flex-col items-center justify-center relative">
      <h2
        className="text-[#2f1254] head-wrap text-md sm:text-xl lg:text-2xl text-center font-semibold"
        dangerouslySetInnerHTML={{
          __html: messages?.download?.heading || "• Download Dhwani App •",
        }}
      />

      <div className="app-img-content  flex  flex-col sm:flex-row items-center  justify-around ">
        <div className="content-wrapper-spin-im">
          <div className="spinn-app-img head-wrap overflow-hidden">
            <Image
              className="spin-image-back w-full  h-90 sm:h-120"
              src="/ds-img/image.png"
              alt="spin chakra image"
              unoptimized
              loading="lazy"
              width={50}
              height={50}
            />
            <Image
              className="mob-app-image w-42 h-72 sm:w-53 sm:h-92"
              src="/ds-img/bckmob.jpg"
              alt="app image"
              loading="lazy"
              unoptimized
              width={50}
              height={50}
            />
          </div>
        </div>

        <div className="down-app-scan   rounded-lg p-1 md:p-5  flex flex-col gap-1 items-center justify-between">
          <h3
            dangerouslySetInnerHTML={{
              __html: t?.download?.tagline || "about download",
            }}
            className="text-black head-wrap text-[18px] align-center"
          />

          <div className="grid grid-cols-2 gap-10 z-10">
            <div className="flex flex-col items-center justify-center">
              <div className="scan-image head-wrap">
                <Image
                  className="w-32 h-32 sm:w-48 sm:h-48 rounded-lg"
                  src="/ds-img/scanner-app.webp"
                  alt="scanner image"
                  unoptimized
                  loading="lazy"
                  width={50}
                  height={50}
                />
              </div>
              <Link
                href="https://play.google.com/store/apps/details?id=com.DhwaniAstro.app"
                target="_blank"
                className="download-ios-ps head-wrap cursor-pointer"
              >
                <Image
                  className="w-35  h-17 sm:w-40 sm:h-18 cursor-pointer"
                  src="/ds-img/gply.png"
                  unoptimized
                  alt="playstore image"
                  loading="lazy"
                  width={50}
                  height={50}
                />
              </Link>
            </div>
            <div className="flex flex-col items-center gap-2.5">
              <div className="scan-image head-wrap">
                <Image
                  className="w-32  h-32 sm:w-48 sm:h-48 rounded-lg"
                  src="/ds-img/ios2.png"
                  alt="scanner image"
                  unoptimized
                  loading="lazy"
                  width={50}
                  height={50}
                />
              </div>
              <Link
                href="https://apps.apple.com/in/app/dhwaniastro/id6467093479"
                target="_blank"
                className="download-ios-ps head-wrap cursor-pointer"
              >
                <Image
                  className="w-35 h-11 sm:w-38 sm:h-13"
                  src="/ds-img/apd.webp"
                  unoptimized
                  alt="playstore image"
                  loading="lazy"
                  width={50}
                  height={50}
                />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
