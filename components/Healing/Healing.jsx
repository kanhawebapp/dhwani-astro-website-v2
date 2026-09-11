"use client";

import Image from "next/image";
import Link from "next/link";

import Searchtop from "../Smcompo/Searchtop";
import { useState } from "react";
// import Freereport from "../Smcompo/Freereport";
import { useLanguage } from "@/app/context/LangContext";
import useScrollZoom from "@/Hooks/scrollZoom";
import { useQuery } from "@apollo/client/react";
import { GET_CATEGORY } from "@/app/graphql/gqlQuery";

export default function Healing() {
  const [search, setSearch] = useState("");
  const { messages: t } = useLanguage();
  useScrollZoom(".head-wrap");

  const { data, loading, error } = useQuery(GET_CATEGORY, {
    variables: {
      slug: "healing",
    },
  });

  const filteredData =
    data?.getCategory?.services?.filter((item) =>
      item.name.toLowerCase().includes(search.toLowerCase()),
    ) || [];
  if (loading) {
    return (
      <section className="relative p-2 sm:p-5 flex w-full flex-col items-center">
        <div className="w-full xl:w-[90%] mb-5">
          <div className="h-12 w-full rounded-full bg-gray-200 animate-pulse" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 w-full xl:w-[90%]">
          {[...Array(4)].map((_, index) => (
            <div
              key={index}
              className="rounded-3xl overflow-hidden shadow bg-white"
            >
              <div className="h-35 sm:h-50 bg-gray-200 animate-pulse" />

              <div className="p-3">
                <div className="h-5 w-3/4 mx-auto rounded bg-gray-200 animate-pulse mb-4" />

                <div className="h-9 w-[60%] mx-auto rounded-full bg-gray-200 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return <p>Error loading services</p>;
  }

  return (
    <section className="relative flex flex-col items-center self-center p-2 sm:p-5 w-full xl:w-[90%]">
      <Searchtop
        searchPlaceholder
        searchValue={search}
        onSearchChange={(e) => setSearch(e.target.value)}
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 w-full py-5">
        {filteredData.length > 0 ? (
          filteredData.map((heal) => (
            <div
              key={heal.id}
              className="element-item head-wrap cat-Service rounded-4xl overflow-hidden bg-[#892be226] shadow-xl text-center"
            >
              <div className="relative w-full overflow-hidden sm:h-50 h-35">
                <Image
                  src={`https://dhwaniastro.com${heal.image}`}
                  alt="heal image"
                  width={300}
                  height={160}
                  className="object-cover w-full h-full"
                />
              </div>

              <div className="p-1 sm:p-2">
                <h3 className="text-[#8a2be2] font-bold text-base sm:text-lg mb-1">
                  {heal.name}
                </h3>

                <p className="hidden text-xs text-gray-500 sm:block">
                  {heal.description?.slice(0, 75)}
                </p>

                <div className="flex flex-col items-center justify-around w-full gap-2 mt-1 mb-1 sm:mt-3 lg:flex-row sm:gap-3">
                  <div className="flex flex-col items-center  w-full ">
                    <h3 className="text-[10px] text-black justify-self-start text-start">
                      Starting
                    </h3>
                    <span className="inline-block text-[#8a2be2] bg-purple-50 px-2 py-1 rounded-full font-bold text-xs sm:text-base shadow-md">
                      ₹ {heal.price}
                      <span className="text-[10px] sm:text-xs">
                        {t?.healing?.per || "Per Session"}
                      </span>
                    </span>
                  </div>
                  <Link
                    href={`/dhwani-services/healing/${heal.slug}`}
                    className="bg-[#8a2be2] w-[80%] text-white px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-base font-medium hover:bg-[#7325c0] transition"
                  >
                    {t?.healing?.book || "Book Noww"}
                  </Link>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No results found...</p>
        )}
      </div>

      {/* <Freereport /> */}
    </section>
  );
}
