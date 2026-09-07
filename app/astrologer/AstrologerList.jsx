"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useLanguage } from "../context/LangContext";
import FilterBar from "@/components/Smcompo/Filter";
import AstroCCard from "@/components/navbarcomp/AstroCCard";

export default function AstrologerList({
  serverdata,
  fetchMore,
  refetch,
  mode,
}) {
  const { messages: t } = useLanguage();
  const isFirstRender = useRef(true);
  const isFetchingMore = useRef(false);
const loadedPages = useRef(new Set([1]));

  const [sortType, setSortType] = useState("ratingHigh");
  const [page, setPage] = useState(1);

  const [selectedCategory, setSelectedCategory] = useState({
    id: "all",
    name: "All",
  });

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  const searchInput = useMemo(
    () => ({
      limit: 8,
      query: debouncedSearch || null,
      category: selectedCategory.id === "all" ? null : selectedCategory.name,
      sortField: "RATING",
      sortOrder: "DESC",
      type: mode?.toUpperCase(),
    }),
    [debouncedSearch, selectedCategory, mode],
  );

  const allAstrologers = useMemo(
    () => serverdata?.data || [],
    [serverdata?.data],
  );

  const totalPages = serverdata?.totalPages || 1;

  const filteredAstrologers = useMemo(() => {
    const filtered = allAstrologers.filter(
      (item) => item && typeof item === "object",
    );

    const sortMap = {
      expHigh: (a, b) => (b?.experience ?? 0) - (a?.experience ?? 0),
      expLow: (a, b) => (a?.experience ?? 0) - (b?.experience ?? 0),
      priceHigh: (a, b) => (b?.price ?? 0) - (a?.price ?? 0),
      priceLow: (a, b) => (a?.price ?? 0) - (b?.price ?? 0),
      ratingHigh: (a, b) => (b?.rating ?? 0) - (a?.rating ?? 0),
      ratingLow: (a, b) => (a?.rating ?? 0) - (b?.rating ?? 0),
    };

    sortMap[sortType]?.(filtered);

    if (sortMap[sortType]) {
      filtered.sort(sortMap[sortType]);
    }

    return filtered;
  }, [allAstrologers, sortType]);

  // Search / Category Change
  useEffect(() => {
    if (!refetch) return;

    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    setPage(1);
loadedPages.current = new Set([1]);
    refetch({
      searchInput: {
        ...searchInput,
        page: 1,
      },
    });
  }, [searchInput, refetch]);

 // Infinite Scroll
useEffect(() => {
  if (!fetchMore) return;

  const handleScroll = async () => {
    const nearBottom =
      window.innerHeight + window.scrollY >=
      document.documentElement.scrollHeight - 100;

    if (!nearBottom) return;

    if (isFetchingMore.current) return;

    if (page >= totalPages) return;

    const nextPage = page + 1;

    // Same page dobara fetch mat karo
    if (loadedPages.current.has(nextPage)) return;

    isFetchingMore.current = true;

    try {
      const result = await fetchMore({
        variables: {
          searchInput: {
            ...searchInput,
            page: nextPage,
          },
        },

        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult) return prev;

          const key = prev.getAstrologerListForUser
            ? "getAstrologerListForUser"
            : "getAstrologerListBySearch";

          const oldData = prev[key]?.data ?? [];
          const newData = fetchMoreResult[key]?.data ?? [];

          // ID ke basis par duplicate remove
          const uniqueData = [
            ...oldData,
            ...newData.filter(
              (newAstro) =>
                !oldData.some(
                  (oldAstro) => oldAstro?.id === newAstro?.id
                )
            ),
          ];

          return {
            [key]: {
              ...fetchMoreResult[key],
              data: uniqueData,
            },
          };
        },
      });

      // Page successfully fetch hone ke baad mark karo
      loadedPages.current.add(nextPage);

      setPage(nextPage);
    } catch (error) {
      console.error("Error loading astrologers:", error);
    } finally {
      isFetchingMore.current = false;
    }
  };

  window.addEventListener("scroll", handleScroll);

  return () => {
    window.removeEventListener("scroll", handleScroll);
  };
}, [fetchMore, searchInput, page, totalPages]);

  return (
    <section className="flex flex-col items-center w-full sm:p-5">
      <FilterBar
        title={
          mode === "chat"
            ? t?.astrocard?.headchat || "Chat With Astrologer"
            : t?.astrocard?.headcall || "Talk To Astrologer"
        }
        searchValue={search}
        onSearchChange={(e) => setSearch(e.target.value)}
        onSortChnage={setSortType}
        onFilter={setSelectedCategory}
        mode={mode}
      />

      <AstroCCard mode={mode} data={filteredAstrologers} loading={false} />
    </section>
  );
}
