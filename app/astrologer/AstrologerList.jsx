"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
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

  const [allAstrologers, setAllAstrologers] = useState(
    serverdata?.data || []
  );

  const [selectedCategory, setSelectedCategory] = useState({
    id: "all",
    name: "All",
  });

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loadingMore, setLoadingMore] = useState(false);

  const totalPages = serverdata?.totalPages || 1;

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  const searchInput = useMemo(
    () => ({
      limit: 12,
      query: debouncedSearch || null,
      category:
        selectedCategory.id === "all" ? null : selectedCategory.name,
      sortField: "RATING",
      sortOrder: "DESC",
      type: mode?.toUpperCase(),
    }),
    [debouncedSearch, selectedCategory, mode]
  );

  /*
   * Initial / Refetched data
   */
  useEffect(() => {
    if (!serverdata?.data) return;

    /*
     * Sirf page 1 ka data directly set karo.
     * Page 2 ke baad Apollo ke cache update ki wajah se
     * existing list reset nahi hogi.
     */
    if (page === 1) {
      setAllAstrologers(serverdata.data);
    }
  }, [serverdata?.data, page]);

  /*
   * Search / Category change
   */
  useEffect(() => {
    if (!refetch) return;

    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    setPage(1);
    setLoadingMore(false);
    isFetchingMore.current = false;
    loadedPages.current = new Set([1]);

    refetch({
      searchInput: {
        ...searchInput,
        page: 1,
      },
    });
  }, [searchInput, refetch]);

  /*
   * Load next page
   */
  const loadNextPage = useCallback(async () => {
    if (!fetchMore) return;

    if (isFetchingMore.current) return;

    if (page >= totalPages) return;

    const nextPage = page + 1;

    if (loadedPages.current.has(nextPage)) return;

    isFetchingMore.current = true;
    setLoadingMore(true);

    try {
      const result = await fetchMore({
        variables: {
          searchInput: {
            ...searchInput,
            page: nextPage,
          },
        },
      });

      const resultData =
        result?.data?.getAstrologerListForUser ||
        result?.data?.getAstrologerListBySearch;

      const newAstrologers = resultData?.data || [];

      if (newAstrologers.length > 0) {
        setAllAstrologers((prev) => {
          const existingIds = new Set(prev.map((astro) => astro?.id));

          const uniqueAstrologers = newAstrologers.filter(
            (astro) => astro?.id && !existingIds.has(astro.id)
          );

          return [...prev, ...uniqueAstrologers];
        });
      }

      loadedPages.current.add(nextPage);
      setPage(nextPage);
    } catch (error) {
      console.error("Error loading next astrologer page:", error);
    } finally {
      isFetchingMore.current = false;
      setLoadingMore(false);
    }
  }, [fetchMore, page, totalPages, searchInput]);

  /*
   * Scroll based pagination
   *
   * Cards ke end se 600px pehle next page load hoga.
   */
  useEffect(() => {
    const handleScroll = () => {
      if (isFetchingMore.current) return;

      if (page >= totalPages) return;

      const scrollPosition =
        window.innerHeight + window.scrollY;

      const documentHeight =
        document.documentElement.scrollHeight;

      const distanceFromBottom =
        documentHeight - scrollPosition;

      /*
       * 600px before actual bottom
       */
      if (distanceFromBottom <= 600) {
        loadNextPage();
      }
    };

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [loadNextPage, page, totalPages]);

  /*
   * Sorting
   */
  const filteredAstrologers = useMemo(() => {
    const filtered = allAstrologers.filter(
      (item) => item && typeof item === "object"
    );

    const sortMap = {
      expHigh: (a, b) =>
        (b?.experience ?? 0) - (a?.experience ?? 0),

      expLow: (a, b) =>
        (a?.experience ?? 0) - (b?.experience ?? 0),

      priceHigh: (a, b) =>
        (b?.price ?? 0) - (a?.price ?? 0),

      priceLow: (a, b) =>
        (a?.price ?? 0) - (b?.price ?? 0),

      ratingHigh: (a, b) =>
        (b?.rating ?? 0) - (a?.rating ?? 0),

      ratingLow: (a, b) =>
        (a?.rating ?? 0) - (b?.rating ?? 0),
    };

    if (sortMap[sortType]) {
      filtered.sort(sortMap[sortType]);
    }

    return filtered;
  }, [allAstrologers, sortType]);

  return (
    <section className="flex w-full flex-col items-center sm:p-5">
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

      <AstroCCard
        mode={mode}
        data={filteredAstrologers}
        loading={false}
      />

      {loadingMore && page < totalPages && (
        <div className="flex w-full items-center justify-center py-6">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-purple-600" />
            Loading more astrologers...
          </div>
        </div>
      )}
    </section>
  );
}