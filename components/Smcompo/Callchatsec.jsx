"use client";
import Link from "next/link";
import CustomButton from "../Custom/CustomButton";
import { useLanguage } from "@/app/context/LangContext";
import useScrollZoom from "@/Hooks/scrollZoom";
import { useRouter } from "next/navigation";

export default function Callchatsec() {
  const router = useRouter();
  const { messages: t } = useLanguage();
  useScrollZoom(".head-wrap");
  return (
    <div className="head-wrap call-chat-nw w-full rounded-lg p-3 flex flex-col gap-5 py-5 ">
      <div className="cc-top-con">
        <h3 className=" text-center text-black text-xs sm:text-base">
          {t?.comfree?.cach ||
            "Connect with an Astrologer on Call or Chat for more personalised"}
          <br />{" "}
          <span className="text-rose-600">
            {t?.comfree?.red || "detailed predictions"}.
          </span>
        </h3>
      </div>
      <div className="flex items-center justify-center gap-5">
        <button
          onClick={() => router.push("/astrologer/chat")}
          aria-label="Chat With Astrologers"
          type="button"
          variant={"red"}
          className=" flex items-center cursor-pointer gap-4 text-[10px] py-1 rounded-full bg-green-500 px-4 sm:py-2 text-md hover:scale-104 "
        >
          <svg width={18}
            height={18} viewBox="0 0 16 16" version="1.1">
            <path
              fill="#fff"
              d="M14 14.2c0 0 0 0 0 0 0-0.6 2-1.8 2-3.1 0-1.5-1.4-2.7-3.1-3.2 0.7-0.8 1.1-1.7 1.1-2.8 0-2.8-2.9-5.1-6.6-5.1-3.5 0-7.4 2.1-7.4 5.1 0 2.1 1.6 3.6 2.3 4.2-0.1 1.2-0.6 1.7-0.6 1.7l-1.2 1h1.5c1.6 0 2.9-0.5 3.7-1.1 0 0.1 0 0.1 0 0.2 0 2 2.2 3.6 5 3.6 0.2 0 0.4 0 0.6 0 0.4 0.5 1.7 1.4 3.4 1.4 0.1-0.1-0.7-0.5-0.7-1.9zM7.4 1c3.1 0 5.6 1.9 5.6 4.1s-2.6 4.1-5.8 4.1c-0.2 0-0.6 0-0.8 0h-0.3l-0.1 0.2c-0.3 0.4-1.5 1.2-3.1 1.5 0.1-0.4 0.1-1 0.1-1.8v-0.3c-1-0.8-2.1-2.2-2.1-3.6 0-2.2 3.2-4.2 6.5-4.2z"
            ></path>
          </svg>
          <span className="text-xs sm:text-md text-white">
            {" "}
            {t?.comfree?.btn1 || "Chat With Astrologers"}
          </span>
        </button>

        <button
          onClick={() => router.push("/astrologer/call")}
          aria-label="Talk To Astrologers"
          type="button"
          variant={"red"}
          className="flex items-center cursor-pointer gap-4 rounded-full bg-rose-500 hover:scale-104 px-4 text-[10px] py-1 text-md sm:py-2 "
        >
          <svg
            width={18}
            height={18}
            viewBox="0 0 16 16"
            version="1.1"
            className="si-glyph si-glyph-call"
          >
            <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
              <path
                d="M14.031,11.852 C13.603,11.313 12.908,10.532 12.313,10.458 C11.951,10.413 11.535,10.713 11.125,10.996 C11.045,11.036 10.427,11.404 10.352,11.426 C9.956,11.539 9.111,11.572 8.6,11.106 C8.108,10.656 7.33,9.823 6.702,9.06 C6.102,8.274 5.473,7.329 5.151,6.749 C4.815,6.148 5.057,5.353 5.265,5.003 C5.303,4.94 5.763,4.467 5.866,4.357 L5.881,4.375 C6.262,4.055 6.661,3.73 6.706,3.378 C6.78,2.792 6.181,1.939 5.753,1.399 C5.325,0.858 4.662,-0.089 3.759,0.045 C3.419,0.095 3.126,0.214 2.837,0.385 L2.829,0.376 C2.823,0.38 2.795,0.402 2.781,0.413 C2.772,0.418 2.764,0.421 2.756,0.426 L2.759,0.43 C2.593,0.558 2.119,0.912 2.065,0.96 C1.479,1.481 0.597,2.708 1.279,4.915 C1.785,6.555 2.864,8.481 4.334,10.429 L4.326,10.436 C4.398,10.53 4.472,10.615 4.547,10.706 C4.617,10.799 4.686,10.891 4.758,10.983 L4.768,10.976 C6.328,12.855 7.964,14.357 9.457,15.243 C11.467,16.435 12.896,15.898 13.556,15.471 C13.618,15.43 14.09,15.063 14.25,14.942 L14.254,14.946 C14.26,14.94 14.264,14.932 14.272,14.926 C14.284,14.917 14.31,14.897 14.315,14.893 L14.309,14.885 C14.551,14.651 14.745,14.401 14.879,14.086 C15.23,13.257 14.459,12.393 14.031,11.852 L14.031,11.852 Z"
                fill="#fff"
                className="si-glyph-fill"
              ></path>
            </g>
          </svg>
          <span className="text-xs sm:text-md text-white">
          
            {t?.comfree?.btn2 || "Talk To Astrologers"}
          </span>
        </button>
      </div>
    </div>
  );
}
