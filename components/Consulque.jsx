"use client";

import useScrollZoom from "@/Hooks/scrollZoom";
import Image from "next/image";
import Link from "next/link";
// import styles from "./NavBar.module.css"

export default function Consulque() {
  useScrollZoom(".head-wrap");
  const consult = [
    {
      id: 1,
      ulname: "Astrology Consultaion",
      src: "/ds-img/horoscope.webp",
      pri: "₹ 800",
      href: "/astrology"
    },
    {
      id: 2,
      ulname: "Medical Astrology Consultaion",
      src: "/ds-img/om.webp",
      pri: "₹ 7800",
      href: "/medical"
    },
    {
      id: 3,
      ulname: "Premium Healing",
      src: "/ds-img/heal2.webp",
      pri: "₹ 1200",
      href: "/premium"
    },
    {
      id: 4,
      ulname: "Business Growth Consultation",
      src: "/ds-img/heal2.webp",
      pri: "₹ 1200",
      href: "/businesscon"
    },
    {
      id: 5,
      ulname: "Past Life Karma Analysis",
      src: "/ds-img/heal2.webp",
      pri: "₹ 1200",
      href: "/pastlife"
    },
    {
      id: 6,
      ulname: "Devotional & Bhakti-Based Consultations",
      src: "/ds-img/mandala.webp",
      pri: "₹ 1800",
      href: "/devotional"
    },
  ];

  const query = [
    { id: 1, ulname: "Career" },
    { id: 2, ulname: " Marriage" },
    { id: 3, ulname: "Relationship" },
    { id: 4, ulname: " Mental Health" },
    { id: 5, ulname: "Job" },
    { id: 6, ulname: " Couple" },
  ];
  return (
    <div className="astro-paid-dis-exp flex flex-col sm:flex-row gap-10 sm:w-[90%] self-center">
      <div className="astro-paid-consultation flex flex-col items-center justify-center w-full">
        <h1 className="relative head-wrap text-[#2f1254] text-md sm:text-xl lg:text-2xl  py-1 sm:py-5 text-center font-semibold">
          • Book Session <strong>/ Get your Consultaion Call</strong> •
        </h1>
        <div className="relative py-3  items-center justify-center w-full grid grid-cols-2 sm:grid-cols-3 gap-6 z-10">
          {consult.map((conque) => (
            <Link href={conque.href}
              key={conque.id}
              className="relative head-wrap consul-card-top bg-violet-200  rounded-lg sm:rounded-lg lg:rounded-full shadow-lg p-3 text-center flex  items-center justify-center"
            >
              <h2 className=" absolute text-sm sm:text-base lg:text-lg text-[#2f1254] font-semibold">
                {conque.ulname}
              </h2>
              <div className="consul-box absolute z-40 sm:left-4 left-[-5px] lg:left-32">
                <span className="font-semibold md:text-sm text-[.7rem] text-black"> Session Starts :  {conque.pri}</span>
              </div>
               <Image width={100} height={100} 
                className=" w-15 sm:w-25 opacity-40"
                src={conque.src}
                alt="consultation image"
                loading="lazy"
               
              />
            </Link>
          ))}

        </div>
      </div>

      <div className="discuss-expert hidden">
        <div className="astro-paid-consultation flex flex-col items-center justify-center">
          <h1 className="relative text-[#2f1254] text-md sm:text-2xl  py-1 sm:py-5 text-center font-semibold">
            • Ask your queries with our
            <strong>Experts / Therapists / Counsellors / Psychologists</strong>
            •
          </h1>
          <div className="relative py-3 grid max-w-7xl items-center justify-center grid-cols-3 sm:grid-cols-2 lg:grid-cols-2 gap-3 sm:gap-6 z-10">
            {query.map((querr) => (
              <div
                key={querr.id}
                className=" exp-card-top bg-violet-200 w-30 sm:w-30 rounded-full shadow-lg p-3 text-center flex flex-col items-center justify-center">
                <h3 className="  text-xs sm:text-[16px]  text-[#2f1254] ">
                  {querr.ulname}
                </h3>
              </div>
            ))}

          </div>
        </div>
      </div>
    </div>
  );
}
