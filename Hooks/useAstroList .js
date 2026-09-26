import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
//import { fetchAstrologers } from "@/app/redux/reducer/astrologer/astrlogerSlice";

export const useAstroList = () => {
  const dispatch = useDispatch();

  const [search, setSearch] = useState("");
  const [sortType, setSortType] = useState("");
  const [page, setPage] = useState(1);
  const limit = 12;
  const debounceTimeout = useRef(null);

  const { data = {}, loading } = useSelector((state) => state.astrologerReducer);

  const allAstrologers = useMemo(() => {
    return Array.isArray(data.sortedAstrologers) ? data.sortedAstrologers : [];
  }, [data.sortedAstrologers]);

  const filteredAstrologers = useMemo(() => {
    let filtered = allAstrologers.filter((astro) =>
      astro.full_name?.toLowerCase().includes(search.toLowerCase())
    );

    const sortMap = {
      expHigh: (a, b) => b.experience - a.experience,
      expLow: (a, b) => a.experience - b.experience,
      priceHigh: (a, b) => b.price_per_min - a.price_per_min,
      priceLow: (a, b) => a.price_per_min - b.price_per_min,
      ratingHigh: (a, b) => b.rating - a.rating,
      ratingLow: (a, b) => a.rating - b.rating,
    };

    if (sortType && sortMap[sortType]) {
      filtered = [...filtered].sort(sortMap[sortType]);
    }

    return filtered;
  }, [allAstrologers, search, sortType]);

  const loadAstrologers = useCallback(() => {
    //dispatch(fetchAstrologers({ page, limit }));
  }, [dispatch, page]);

  useEffect(() => {
    loadAstrologers();
  }, [loadAstrologers]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  useEffect(() => {
    const handleScroll = () => {
      if (debounceTimeout.current) return;

      debounceTimeout.current = setTimeout(() => {
        debounceTimeout.current = null;

        const nearBottom =
          window.innerHeight + window.scrollY >=
          document.documentElement.scrollHeight - 100;

        const hasMore = allAstrologers.length < (data.total || 0);

        if (nearBottom && !loading && hasMore) {
          setPage((prev) => prev + 1);
        }
      }, 200);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [allAstrologers.length, data.total, loading]);

  const handleSortChange = (id) => {
    setSortType(id);
  };

  return {
    search,
    setSearch,
    sortType,
    handleSortChange,
    filteredAstrologers,
    loading,
  };
};
