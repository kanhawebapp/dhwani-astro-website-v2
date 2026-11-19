"use client";

import HoroscopeClient from "@/components/navbarcomp/Horoscope/Horoscope";
import Zodhoro from "@/components/navbarcomp/Horoscope/Zodhoro/Zodhoro";
import ZodiacServer from "@/app/zodiac/ZodiacServer";
// import Freereport from "@/components/Smcompo/Freereport";
import { useEffect } from "react";

export default function HoroscopePage({
  horoscopezod,
  zodiac,
  today,
  tomorrow,
  yesterday,
}) {
useEffect(() => {
  const timer = setTimeout(() => {
    const el = document.getElementById("zodhoro");

    if (el) {
      el.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, 50);

  return () => clearTimeout(timer);
}, [zodiac]);
  return (
    <div className="flex flex-col max-w-7xl gap-8 justify-center">
      <HoroscopeClient horoscopezod={horoscopezod} selectedZodiac={zodiac} />

     <div id="zodhoro" className="scroll-mt-20">
        <Zodhoro
          zodiac={zodiac}
          today={today}
          tomorrow={tomorrow}
          yesterday={yesterday}
        />
      </div>

      <ZodiacServer />

      {/* <Freereport /> */}
    </div>
  );
}
