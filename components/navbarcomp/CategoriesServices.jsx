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
import CategorySkeleton from "../Custom/categorySkeleton";

export default function CategoryServices({ categorySlug }) {
  const [search, setSearch] = useState("");
  const { messages: t } = useLanguage();
  useScrollZoom(".head-wrap");

  const { data, loading, error } = useQuery(GET_CATEGORY, {
    variables: {
      slug: categorySlug,
    },
  });

  const filteredData =
    data?.getCategory?.services?.filter((item) =>
      item.name.toLowerCase().includes(search.toLowerCase()),
    ) || [];
  if (loading) {
    return (
      <section className="relative flex flex-col items-center self-center p-2 sm:p-5 w-full xl:w-[90%]">
        <Searchtop searchPlaceholder searchValue="" onSearchChange={() => {}} />

        <CategorySkeleton />
      </section>
    );
  }

  if (error) {
    return <p>Error loading services</p>;
  }

  return (
    <section className="relative flex flex-col items-center self-center p-2 sm:p-5 w-full xl:w-[90%]">
      {/* <Searchtop
        searchPlaceholder
        searchValue={search}
        onSearchChange={(e) => setSearch(e.target.value)}
      /> */}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 py-5">
        {filteredData.length > 0 ? (
          filteredData.map((heal) => (
            <div
              key={heal.id}
              className="element-item head-wrap cat-Service rounded-4xl overflow-hidden bg-[#892be226] shadow-xl text-center"
            >
              <div className="relative w-full sm:h-50 h-35 overflow-hidden">
                <Image
                  src={`https://dhwaniastro.com${heal.image}`}
                  alt="heal image"
                  width={300}
                  height={160}
                  className="w-full bg-no-repeat h-full object-cover"
                  style={{
                    WebkitMaskImage:
                      "linear-gradient(to bottom, black 90%, transparent 100%)",
                    maskImage:
                      "linear-gradient(to bottom, black 90%, transparent 100%)",
                  }}
                />
              </div>

              <div className="p-1 sm:p-2">
                <h3 className="text-[#8a2be2] font-bold text-base sm:text-lg sm:mb-1">
                  {heal.name}
                </h3>

                <p className="hidden text-xs text-gray-500 sm:block">
                  {heal.description?.slice(0, 75)}
                </p>

                <div className="flex flex-col items-center justify-around w-full gap-1  sm:mb-1 sm:mt-3 lg:flex-row sm:gap-3">
                  <div className="flex flex-col items-center w-full gap-1">
                    <span className="inline-block text-[#8a2be2] sm:bg-white px-2 sm:rounded-full font-bold text-xs sm:text-base sm:shadow-md">
                      Starting : ₹ {heal.price ?? "--"}
                      <span className="text-[8px] sm:text-xs">
                        {" /"}
                        {t?.healing?.per || " Session"}
                      </span>
                    </span>
                  </div>
                  <Link
                    href={`/dhwani-services/${categorySlug}/${heal.slug}`}
                    className="bg-[#8a2be2] sm:w-[80%] text-white px-2 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-base font-medium hover:bg-[#7325c0] transition"
                  >
                    {t?.healing?.book || "Book Now"}
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
