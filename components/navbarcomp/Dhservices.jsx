"use client";

import Image from "next/image";
import Link from "next/link";
import Searchtop from "../Smcompo/Searchtop";
import { useLanguage } from "@/app/context/LangContext";
import useScrollZoom from "@/Hooks/scrollZoom";
import { useState } from "react";
import { useQuery } from "@apollo/client/react";
import { GET_CATEGORIES, GET_SERVICES } from "@/app/graphql/gqlQuery";

const ServiceCardSkeleton = () => {
  return (
    <div className="overflow-hidden rounded-4xl bg-white shadow-xl animate-pulse">
      <div className="h-35 w-full bg-gray-200 sm:h-50" />

      <div className="p-2">
        <div className="mx-auto mb-3 h-5 w-32 rounded-full bg-gray-200" />

        <div className="mx-auto h-8 w-[60%] rounded-full bg-gray-200" />
      </div>
    </div>
  );
};

export default function Dhservices() {
  const { messages: t } = useLanguage();
  const [search, setSearch] = useState("");

  const {
    data: servicesData,
    loading: servicesLoading,
    error: servicesError,
    refetch: refetchServices,
  } = useQuery(GET_SERVICES);

  const {
    data: categoriesData,
    loading: categoriesLoading,
    error: categoriesError,
    refetch: refetchCategories,
  } = useQuery(GET_CATEGORIES);

  const categories = categoriesData?.getCategories || [];

  const nullCategoryServices =
    servicesData?.getServices?.filter(
      (service) => service.category === null
    ) || [];

  const cards = [
    ...categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      image: cat.image,
      slug: cat.slug,
      href: `/dhwani-services/${cat.slug}`,
      type: "category",
    })),

    ...nullCategoryServices.map((service) => ({
      id: service.id,
      name: service.name,
      image: service.image,
      href: service.slug,
      type: "service",
    })),
  ].filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  useScrollZoom(".head-wrap");

  const isLoading = servicesLoading || categoriesLoading;
  const hasError = servicesError || categoriesError;

  if (isLoading) {
    return (
      <section className="relative flex w-full flex-col items-center p-2 sm:p-5">
        <div className="mb-5 w-full xl:w-[90%]">
          <div className="h-12 w-full animate-pulse rounded-full bg-gray-200" />
        </div>

        <div className="grid w-full grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4 xl:w-[90%]">
          {Array.from({ length: 8 }).map((_, index) => (
            <ServiceCardSkeleton key={index} />
          ))}
        </div>
      </section>
    );
  }

  if (hasError) {
    return (
      <section className="flex min-h-[400px] w-full items-center justify-center p-5">
        <div className="flex max-w-md flex-col items-center rounded-3xl border border-red-100 bg-white px-6 py-10 text-center shadow-lg">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-2xl">
            ⚠️
          </div>

          <h2 className="text-xl font-bold text-gray-800">
            Unable to Load Services
          </h2>

          <p className="mt-2 text-sm leading-6 text-gray-500">
            Something went wrong while loading our astrology services.
            Please try again in a moment.
          </p>

          <button
            type="button"
            onClick={() => {
              refetchServices();
              refetchCategories();
            }}
            className="mt-5 rounded-full bg-[#8a2be2] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#7325c0]"
          >
            Try Again
          </button>
        </div>
      </section>
    );
  }

  if (cards.length === 0) {
    return (
      <section className="flex min-h-[450px] w-full items-center justify-center p-5">
        <div className="relative flex max-w-2xl flex-col items-center overflow-hidden rounded-4xl border border-purple-100 bg-gradient-to-br from-purple-50 via-white to-yellow-50 px-6 py-14 text-center shadow-xl sm:px-12">
          <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-purple-200/30 blur-3xl" />
          <div className="absolute -bottom-16 -left-16 h-40 w-40 rounded-full bg-yellow-200/30 blur-3xl" />

          <div className="relative mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-purple-100 text-4xl">
            ✨
          </div>

          <p className="relative text-sm font-semibold uppercase tracking-[0.2em] text-[#8a2be2]">
            Coming Soon
          </p>

          <h2 className="relative mt-2 text-xl font-bold text-gray-800 sm:text-2xl">
            Something Amazing Is On Its Way
          </h2>

          <p className="relative mt-3 max-w-lg text-xs leading-6 text-gray-500 sm:text-base">
            We are preparing some wonderful astrology and healing services
            for you. Stay tuned — your journey towards deeper guidance and
            self-discovery is about to begin.
          </p>

          <div className="relative mt-6 h-1 w-24 rounded-full bg-gradient-to-r from-[#8a2be2] to-yellow-400" />
        </div>
      </section>
    );
  }

  return (
    <section
      aria-label="Healing Services List"
      className="relative flex w-full flex-col items-center self-center p-2 sm:p-5"
    >
      <Searchtop
        searchValue={search}
        onSearchChange={(e) => setSearch(e.target.value)}
      />

      {cards.length === 0 && search ? (
        <div className="flex min-h-[300px] w-full flex-col items-center justify-center text-center">
          <div className="mb-4 text-5xl">🔍</div>

          <h2 className="text-xl font-bold text-gray-800">
            No Services Found
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            We couldn't find any service matching "{search}".
          </p>
        </div>
      ) : (
        <div className="healing-card-main grid w-full grid-cols-2 gap-5 py-5 sm:grid-cols-3 lg:grid-cols-4 xl:w-[90%] xl:p-5">
          {cards.map((item) => (
            <div
              key={`${item.type}-${item.id}`}
              className="element-item head-wrap cat-Service overflow-hidden rounded-4xl bg-[#892be226] text-center shadow-xl"
            >
              <div className="block">
                <div className="relative h-35 w-full overflow-hidden sm:h-50">
                  <Image
                    src={
                      `https://www.dhwaniastro.com${item.image}` ||
                      "/placeholder.webp"
                    }
                    alt={item.name}
                    width={300}
                    height={160}
                    className="h-full w-full object-cover"
                    style={{
                      WebkitMaskImage:
                        "linear-gradient(to bottom, black 90%, transparent 100%)",
                      maskImage:
                        "linear-gradient(to bottom, black 90%, transparent 100%)",
                    }}
                  />
                </div>

                <div className="p-1 sm:p-2">
                  <h3 className="mb-1 text-base font-bold text-[#8a2be2] sm:text-lg">
                    {item.name}
                  </h3>

                  <div className="mt-1 mb-1 flex w-full flex-col items-center justify-around gap-2 sm:gap-3 lg:flex-row">
                    <Link
                      href={item.href}
                      className="w-[60%] rounded-full bg-[#8a2be2] px-2 py-1 text-xs text-white transition hover:bg-[#7325c0] sm:w-[60%] sm:px-4 sm:py-1.5 sm:text-base"
                    >
                      {t?.healing?.exp || "Explore Now"}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}