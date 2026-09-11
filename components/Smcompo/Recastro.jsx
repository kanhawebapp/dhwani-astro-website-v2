"use client";

import Image from "next/image";
import Link from "next/link";

import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { useRouter } from "next/navigation";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import CustomButton from "../Custom/CustomButton";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { AlertLoading } from "@/app/common";
import SocketContext from "@/app/context/socketContext";
import toast from "react-hot-toast";
import React, { useContext } from "react";
import { useLanguage } from "@/app/context/LangContext";

export default function Recastro({ astrologers = [] }) {
    const { messages: t } = useLanguage();
    const [alert, setAlert] = useState(false);
    const router = useRouter();

    const astrologerlist = astrologers || [];
console.log("xxxxxxxxxxxxxxxx",astrologerlist);

    const chatredirect = (astroid) => {
        setAlert(true);
        setTimeout(() => {
            setAlert(false);
            router.push(`/chatrequest/${astroid}`);
        }, 1000);
    };

    const callredirect = (astroid) => {
        setAlert(true);
        setTimeout(() => {
            setAlert(false);
            router.push(`/callrequest/${astroid}`);
        }, 1000);
    };

    return (
        <section className="flex flex-col w-full items-center self-center sm:max-w-7xl my-2">
            <div className="py-3">
                <h1
                    dangerouslySetInnerHTML={{
                        __html: t?.comfree?.recastro || "Recommended Astrologers",
                    }}
                    className="relative text-[#2f1254] text-md sm:text-2xl text-center font-semibold"
                />
            </div>

            <div className="slider-recastro w-full relative">
                <div className="absolute top-1/2 -left-0.5 md:-left-2.5 lg:-left-12 transform -translate-y-1/2 z-10">
                    <button
                        aria-label="Previous Slide"
                        className="swiper-button-prev-rec"
                    >
                        ‹
                    </button>
                </div>

                <div className="absolute top-1/2 -right-0.5 md:-right-2.5 lg:-right-12 transform -translate-y-1/2 z-10">
                    <button
                        aria-label="Next Slide"
                        className="swiper-button-next-rec"
                    >
                        ›
                    </button>
                </div>

                <Swiper
                    modules={[Navigation, Pagination, Autoplay]}
                    spaceBetween={20}
                    slidesPerView={2}
                    navigation={{
                        nextEl: ".swiper-button-next-rec",
                        prevEl: ".swiper-button-prev-rec",
                    }}
                    autoplay={false}
                    loop={astrologerlist.length > 1}
                    className="mySiperrecastro w-88 md:w-full"
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
                            slidesPerView: 4,
                            spaceBetween: 20,
                        },
                        1280: {
                            slidesPerView: 4,
                            spaceBetween: 20,
                        },
                    }}
                >
                    {astrologerlist.map((reca) => (
                        <SwiperSlide key={reca.id} style={{ width: "100%" }}>
                            <div className="border border-purple-200 shadow-lg rounded-lg p-2 flex flex-col gap-3">
                                <div className="flex flex-col md:flex-row items-center justify-center gap-3">
                                    <Image
                                        className="md:w-16 md:h-16 w-12 h-12 rounded-full object-cover"
                                        width={50}
                                        height={50}
                                        src={
                                            reca?.profilePic
                                                ? `https://www.dhwaniastro.com${reca.profilePic}`
                                                : "/man.png"
                                        }
                                        alt={
                                            reca?.displayName ||
                                            reca?.name ||
                                            "Astrologer"
                                        }
                                    />

                                    <div className="flex flex-col gap-1 justify-center items-center">
                                        <h5 className="text-center text-black">
                                            {reca?.displayName || reca?.name}
                                        </h5>

                                        <span className="flex items-center gap-2 text-black text-xs">
                                            {Array.isArray(reca?.languages)
                                                ? reca.languages.join(", ")
                                                : reca?.languages || ""}
                                        </span>

                                        <span className="flex items-center gap-2 text-black text-xs">
                                            Experience : {reca?.experience || 0} years
                                        </span>
                                    </div>
                                </div>

                                <div className="w-full md:px-10 flex items-center justify-between">
                                    <CustomButton
                                        aria-label={`Chat with ${reca?.displayName || reca?.name}`}
                                        type="button"
                                        variant="green"
                                        onClick={() => chatredirect(reca?.id)}
                                    >
                                        Chat
                                    </CustomButton>

                                    <CustomButton
                                        aria-label={`Call ${reca?.displayName || reca?.name}`}
                                        type="button"
                                        variant="green"
                                        onClick={() => callredirect(reca?.id)}
                                    >
                                        Call
                                    </CustomButton>
                                </div>
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>

                <AlertLoading show={alert} title="Please Wait .." />
            </div>
        </section>
    );
}