"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useDispatch } from "react-redux";
import { setdaUserForm } from "@/app/redux/services/daUserFormSlice";
import dynamic from "next/dynamic";
import Link from "next/link";
import Kundlioth from "../Smcompo/Kundlioth";
import { useGetBirthDetailsMutation } from "@/app/redux/services/astrologyAPI";

// LAZY LOADED COMPONENTS
const Callchatsec = dynamic(() => import("@/components/Smcompo/Callchatsec"), {
  ssr: false,
});
const FAQue = dynamic(() => import("@/components/FAQue"), { ssr: false });
const Kuninterimg = dynamic(
  () => import("@/components/Kundli/Kundliinter/Kunfreeimg"),
  { ssr: false },
);
const Bestsell = dynamic(
  () => import("@/components/Smcompo/Bestsell/Bestsell"),
  { ssr: false },
);
const Freereport = dynamic(() => import("@/components/Smcompo/Freereport"), {
  ssr: false,
});
const Recastro = dynamic(() => import("@/components/Smcompo/Recastro"), {
  ssr: false,
});
const Sidebanner = dynamic(() => import("@/components/Smcompo/Sidebanner"), {
  ssr: false,
});
export default function KundliLayout({ children }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const [getBirthDetails, { isLoading: birthLoading }] =
    useGetBirthDetailsMutation();

  const [isExternalAccess, setIsExternalAccess] = useState(false);
  const [paramsProcessed, setParamsProcessed] = useState(false);

  const fullLayoutRoutes = ["/freeservices/kundali/getKundaliPage"];
  const isFullLayoutRoute = fullLayoutRoutes.some((route) =>
    pathname.startsWith(route),
  );

  const source = searchParams.get("source");
  const isFromForm = source === "form";

  useEffect(() => {
    try {
      const referrer = document.referrer || "";
      const sameOrigin = referrer && referrer.includes(window.location.origin);
      const sourceParam = searchParams.get("source");

      if (referrer && !sameOrigin) {
        setIsExternalAccess(true);
      }

      if (sourceParam === "dashboard") {
        setIsExternalAccess(true);
      }
    } catch (err) {
      console.warn("referrer check failed", err);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!isExternalAccess || paramsProcessed) return;

    const name = searchParams.get("name") || "";
    const dob = searchParams.get("dob") || "";
    const time = searchParams.get("time") || "";
    const place = searchParams.get("place") || "";
    const lat = searchParams.get("lat");
    const lon = searchParams.get("lon");
    const tzoneParam = searchParams.get("tzone");

    if (!dob || !time) {
    }

 let day, month, year, hour, min;

if (dob) {
  const dateOnly = dob.split("T")[0];
  const parts = dateOnly.split("-");

  if (parts.length === 3) {
    year = Number(parts[0]);
    month = Number(parts[1]);
    day = Number(parts[2]);
  }
}
    if (time) {
      const tparts = time.split(":");
      if (tparts.length >= 2) {
        hour = Number(tparts[0]);
        min = Number(tparts[1]);
      }
    }

    const tzone = tzoneParam ? Number(tzoneParam) : 5.5;

    const payload = {
      name: name || "",
      day: day ?? null,
      month: month ?? null,
      year: year ?? null,
      hour: hour ?? null,
      min: min ?? null,
      lat: lat ? Number(lat) : null,
      lon: lon ? Number(lon) : null,
      tzone,
      birthplace: place || "",
    };

    dispatch(setdaUserForm(payload));

    (async () => {
      try {
        if (
          payload.day &&
          payload.month &&
          payload.year &&
          payload.hour != null &&
          payload.min != null
        ) {
          await getBirthDetails(payload).unwrap();
        }
      } catch (err) {
        console.warn("getBirthDetails failed on external entry:", err);
      } finally {
        setParamsProcessed(true);
      }
    })();
  }, [
    isExternalAccess,
    paramsProcessed,
    searchParams,
    dispatch,
    getBirthDetails,
  ]);

  if (isExternalAccess) {
    return (
      <section className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-md z-9999 p-5">
        <div className="bg-white/80 backdrop-blur-xl h-[95vh] overflow-y-scroll shadow-2xl rounded-2xl max-w-5xl w-full px-5 py-2 border border-white/30">
          <Link
            href={"/freeservices/kundali/getKundaliPage"}
            className="text-2xl mb-2 flex items-center gap-2 font-bold text-[#2f1254]"
          >
            <svg
              width={18}
              height={18}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 640 640"
            >
              <path d="M236.3 107.1C247.9 96 265 92.9 279.7 99.2C294.4 105.5 304 120 304 136L304 272.3L476.3 107.2C487.9 96 505 92.9 519.7 99.2C534.4 105.5 544 120 544 136L544 504C544 520 534.4 534.5 519.7 540.8C505 547.1 487.9 544 476.3 532.9L304 367.7L304 504C304 520 294.4 534.5 279.7 540.8C265 547.1 247.9 544 236.3 532.9L44.3 348.9C36.5 341.3 32 330.9 32 320C32 309.1 36.5 298.7 44.3 291.1L236.3 107.1z" />
            </svg>
            <small className="text-xs font-extralight">Go to main page</small>
          </Link>{" "}
          {children}
        </div>
      </section>
    );
  }

  if (isFullLayoutRoute) {
    return (
      <section className="kundli-inter-page w-full flex flex-col items-center justify-center md:p-5 p-2">
        <div className="kundli-top-sec w-full">
          <Kuninterimg />
        </div>

        <div className="kundli-items-box-side flex flex-col md:grid grid-cols-4 md:px-0 lg:px-20 gap-2 lg:gap-5 py-5">
          <div className="kundli-items-main col-span-3 flex flex-col gap-4 sm:gap-10">
            <Link
              href={isFromForm ? "/" : "/freeservices/kundali/getKundaliPage/"}
              className="text-2xl flex items-center gap-2 font-bold text-[#2f1254]"
            >
              <svg width={16} height={16} viewBox="0 0 640 640">
                <path d="M236.3 107.1C247.9 96 265 92.9 279.7 99.2C294.4 105.5 304 120 304 136L304 272.3L476.3 107.2C487.9 96 505 92.9 519.7 99.2C534.4 105.5 544 120 544 136L544 504C544 520 534.4 534.5 519.7 540.8C505 547.1 487.9 544 476.3 532.9L304 367.7L304 504C304 520 294.4 534.5 279.7 540.8C265 547.1 247.9 544 236.3 532.9L44.3 348.9C36.5 341.3 32 330.9 32 320C32 309.1 36.5 298.7 44.3 291.1L236.3 107.1z" />
              </svg>
              <small className="text-[10px] font-extralight">Go to main page</small>
            </Link>
            {children}
            {/* <Kundlioth /> */}
          </div>

          <div className="kundli-side flex flex-col gap-10 items-center justify-start ">
            {/* <Ytvideo /> */}
            <Bestsell />
            <Sidebanner />
          </div>
        </div>

        <Freereport />
        <Recastro />
        <FAQue />
        <Callchatsec />
      </section>
    );
  }

  return <section className="minimal-layout p-5">{children}</section>;
}
