"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import dayjs from "dayjs";
import { SEO_ENDPOINTS } from "../../api/seoEndpoints";


import usePanchHook from "../../../Hooks/usePanchHook";
import { astrologySeo } from "@/app/api/astrologySeo";

export default function AbhijitPage({ initialPanchang = null, inputParams = null }) {
  const {
    today,
    date,
    setDate,
    coords,
    setCoords,
    searchText,
    setSearchText,
    locationName,
    setLocationName,
    suggestions,
    showSuggestions,
    setShowSuggestions,
    userTyped,
    setUserTyped,
    handleInputChange,
    handleSuggestionClick,
    getParams,
  } = usePanchHook();


  const initialAbhijit =
    (initialPanchang && (initialPanchang.abhijit_muhurta || initialPanchang.data?.abhijit_muhurta)) ||
    null;

  const [abhijitData, setAbhijitData] = useState(initialAbhijit);
  const [loading, setLoading] = useState(false);

  const getAbhijitData = useCallback(async (params) => {
    setLoading(true);
    try {
     const res = await astrologySeo(
    SEO_ENDPOINTS.ADV_PANCHANG,
    params
);
      const normalized =
    res?.abhijit_muhurta ??
    res?.data?.abhijit_muhurta;
      setAbhijitData(normalized);
    } catch (err) {
      console.error("Client fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);


  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setCoords({ lat: latitude, lon: longitude });
          if (!userTyped && !initialAbhijit) {
            getAbhijitData({ ...getParams(today), lat: latitude, lon: longitude });
          }
        },
        () => { }
      );
    }

  }, []);


  useEffect(() => {
    if (!initialAbhijit && date && coords.lat) {
      getAbhijitData(getParams(date));
    }
  }, [date, coords, getParams, initialAbhijit, getAbhijitData]);

  const changeDate = (offset) => {
    setDate((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() + offset);
      return d.toISOString().split("T")[0];
    });
  };
  const setToday = () => setDate(today);
  const formatSelectedDate = (selectedDate) => {
  if (selectedDate === today) {
    return "Today's Abhijit Muhurat";
  }

  return `${dayjs(selectedDate).format("DD MMMM YYYY")} Abhijit Muhurat`;
};

  const calcDuration = (start, end) => {
    try {
      const s = new Date(`1970-01-01T${start}`);
      const e = new Date(`1970-01-01T${end}`);
      const diff = e - s;
      const hrs = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      return `${hrs} hr ${mins} min`;
    } catch {
      return "—";
    }
  };

  const getStatus = () => {
    if (!abhijitData?.start || !abhijitData?.end) return "—";
    const now = dayjs();
    const startTime = dayjs(`${date} ${abhijitData.start}`, "YYYY-MM-DD hh:mm A");
    const endTime = dayjs(`${date} ${abhijitData.end}`, "YYYY-MM-DD hh:mm A");
    if (now.isBefore(startTime)) return "Pending";
    if (now.isAfter(endTime)) return "Over";
    if (now.isAfter(startTime) && now.isBefore(endTime)) return "Running";
    return "—";
  };

  return (
    <div className="kundli-page w-full md:max-w-7xl flex flex-col sm:p-5 px-2 gap-5 rounded-2xl shadow-lg items-center my-2 text-black">
      <div className="flex flex-col gap-3 sm:gap-5 bg-linear-to-r from-pink-100 to-yellow-100 shadow-lg rounded-2xl p-5 w-full text-center">
        <h5 className="text-lg md:text-xl font-semibold text-black">
          <span className="text-red-500">ABHIJIT MUHURTA:</span><br/> (AAJ KA ABHIJIT MUHURTA)
        </h5>
        <p className="text-xs sm:text-sm">The most auspicious time during midday — ideal for starting new ventures or rituals.</p>
      </div>

      <div className="h-40 rounded-2xl flex flex-col sm:flex-row items-center justify-between relative w-full py-10 px-6 bg-cover bg-center" style={{ backgroundImage: "url('/ds-img/cho.jpg')" }}>
        <div className="flex sm:flex-col w-full justify-between text-sm font-semibold text-white">
          <span className="text-xs sm:text-base">{locationName}</span>
          <span className="text-xs sm:text-base">{new Date(date).toLocaleDateString("en-GB")}</span>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); getAbhijitData(getParams()); }} className="flex sm:flex-col gap-4 bg-[#0000007b] p-3 rounded-xl z-10">
          <input type="date" value={date} max={today} onChange={(e) => setDate(e.target.value)} className="border-gray-200 p-1 bg-white px-3 text-xs sm:text-sm rounded-full" />

          <div className="relative">
            <input type="text" value={searchText} onChange={handleInputChange} placeholder="Enter city name" className="border-gray-200 p-1 px-3  text-xs sm:text-sm w-full rounded-full" onFocus={() => setShowSuggestions(true)} onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} />
            {showSuggestions && suggestions?.length > 0 && (
              <ul className="absolute z-50 bg-white border max-h-48 overflow-auto w-full rounded shadow-md mt-1 text-black">
                {suggestions.map((item) => (
                  <li key={item.place_id} onClick={() => handleSuggestionClick(item)} className="p-2 hover:bg-gray-200 cursor-pointer text-sm">{item.display_name}</li>
                ))}
              </ul>
            )}
          </div>

          <button aria-label="Search Abhijit Muhurat" type="submit" className="bg-purple-500 text-white px-4 text-xs sm:text-sm py-1 sm:py-2 rounded-full">Search</button>
        </form>
      </div>

      <div className="flex flex-col items-center gap-3 md:flex-row bg-green-200 py-6 px-5 rounded-2xl shadow-lg w-full justify-between">
        <div className="flex items-center gap-3">
          <Image src="/ds-img/candles.png" width={40} height={40} alt="Abhijit" />
          <h3 className="text-sm font-semibold">Abhijit Muhurta Status:</h3>
          <p className="bg-yellow-300 rounded-xl px-4 text-xs py-1 sm:text-sm sm:py-2 font-bold shadow">{getStatus()}</p>
        </div>

        <div className="flex text-[10px] sm:text-sm items-center gap-2">
          <div onClick={() => changeDate(-1)} className="bg-yellow-300 px-4 py-2 rounded-l-2xl cursor-pointer flex items-center gap-1">
            <svg width={18} height={18} viewBox="0 0 640 640"><path d="M169.4 297.4C156.9 309.9 156.9 330.2 169.4 342.7L361.4 534.7C373.9 547.2 394.2 547.2 406.7 534.7C419.2 522.2 419.2 501.9 406.7 489.4L237.3 320L406.6 150.6C419.1 138.1 419.1 117.8 406.6 105.3C394.1 92.8 373.8 92.8 361.3 105.3L169.3 297.3z" /></svg>
            Prev</div>
          <div onClick={setToday} className="bg-yellow-300 px-4 py-2 rounded-lg cursor-pointer">Current</div>
          <div onClick={() => changeDate(1)} className="bg-yellow-300 px-4 py-2 rounded-r-2xl cursor-pointer flex items-center gap-1">Next
            <svg width={18} height={18} viewBox="0 0 640 640"><path d="M471.1 297.4C483.6 309.9 483.6 330.2 471.1 342.7L279.1 534.7C266.6 547.2 246.3 547.2 233.8 534.7C221.3 522.2 221.3 501.9 233.8 489.4L403.2 320L233.9 150.6C221.4 138.1 221.4 117.8 233.9 105.3C246.4 92.8 266.7 92.8 279.2 105.3L471.2 297.3z" /></svg>
          </div>
        </div>
      </div>

      {loading ? (
        <p className="text-center py-5">Loading Abhijit Muhurat...</p>
      ) : abhijitData ? (
        <div className="flex flex-col items-center gap-4 bg-yellow-100 p-5 rounded-2xl shadow-md w-full md:w-[60%] text-center">
       <h4 className="text-red-500 font-semibold text-lg">
  {formatSelectedDate(date)}
</h4>
          <Image src="/ds-img/d2.png" width={100} height={100} alt="muhurta" />
          <div className="flex flex-col gap-2">
            <p className="text-lg font-bold text-purple-700">{abhijitData.start} - {abhijitData.end}</p>
            <p className="text-sm font-semibold">Duration: {calcDuration(abhijitData.start, abhijitData.end)}</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
