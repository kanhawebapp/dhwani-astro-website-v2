"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import ChaughadiyaPage from "../chaughadiya/ChaughadiyaPage";
import { SEO_ENDPOINTS } from "@/app/api/seoEndpoints";
import { astrologySeo } from "@/app/api/astrologySeo";

const HoraPage = dynamic(() => import("./HoraPage"), { ssr: false });

const pad = (n) => String(n ?? 0).padStart(2, "0");

const formatTimeObj = (t) => {
  if (!t) return "—";
  if (typeof t === "string") return t;
  const { hour, minute, second } = t;
  return `${pad(hour)}:${pad(minute ?? 0)}:${pad(second ?? 0)}`;
};

const formatMs = (ms) => {
  if (!ms) return "—";
  try {
    const d = new Date(ms);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  } catch {
    return "—";
  }
};

const debounce = (fn, delay = 350) => {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), delay);
  };
};


function SectionBlock({ title, obj }) {
  if (!obj) return null;

  const entries = Object.entries(obj);

  return (
    <div className="w-full shadow-lg border-gray-300 rounded-lg px-5 py-3 bg-purple-50">
      <h2 className="font-semibold text-center text-lg text-purple-700 mb-2">{title}</h2>
      <div className="space-y-2">
        {entries.map(([k, v]) => {
          let display;
          if (k === "end_time" || k === "start" || /time/i.test(k) && typeof v === "object") {
            display = formatTimeObj(v);
          } else if (k === "end_time_ms" || k === "start_time_ms" || /_ms$/.test(k)) {
            display = formatMs(v);
          } else if (typeof v === "object" && v !== null) {

            display = Object.entries(v)
              .map(([kk, vv]) => {
                if (typeof vv === "object") {
                  if ("hour" in vv || "minute" in vv) return `${kk}: ${formatTimeObj(vv)}`;
                  return `${kk}: ${JSON.stringify(vv)}`;
                }
                return `${kk}: ${String(vv)}`;
              })
              .join(" • ");
          } else {
            display = String(v ?? "—");
          }

          return (
            <div key={k} className="grid grid-cols-2 text-sm bg-purple-100 rounded px-2 py-1">
              <div className="font-semibold text-purple-600 text-center capitalize">
                {k.replace(/_/g, " ")}
              </div>
              <div className="text-center wrap-break-word">{display}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function PanchangPage({ initialPanchang, initialChaughadiya, initialHora }) {
  const today = useMemo(() => new Date().toISOString().split("T")[0], []);
  const [date, setDate] = useState(today);
  const [coords, setCoords] = useState({ lat: 28.6139, lon: 77.209 });
  const [locationName, setLocationName] = useState("New Delhi");
  const [searchText, setSearchText] = useState("New Delhi");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  const [panchangData, setPanchangData] = useState(initialPanchang || null);

  const getParams = useCallback(
    (d = date, c = coords) => {
      const D = new Date(d);
      const now = new Date();
      return {
        day: D.getDate(),
        month: D.getMonth() + 1,
        year: D.getFullYear(),
        lat: c.lat,
        lon: c.lon,
        tzone: 5.5,
        hour: now.getHours(),
        min: now.getMinutes(),
      };
    },
    [date, coords]
  );

  const fetchData = useCallback(
    async (params) => {
      setLoading(true);
      try {
     const res = await astrologySeo(
    SEO_ENDPOINTS.ADV_PANCHANG,
    params
);


        setPanchangData(res?.data || res);
      } catch (e) {
        console.error("Fetch error:", e);
      } finally {
        setLoading(false);
      }
    },
    []
  );


  const debouncedSuggestion = useMemo(
    () =>
      debounce(async (query) => {
        if (!query || query.length < 2) return setSuggestions([]);
        try {
          const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            query
          )}&limit=5`;
          const r = await fetch(url);
          const j = await r.json();
          setSuggestions(j);
        } catch {
          setSuggestions([]);
        }
      }, 350),
    []
  );

  const handleInputChange = (e) => {
    const v = e.target.value;
    setSearchText(v);
    setShowSuggestions(true);
    debouncedSuggestion(v);
  };

  const handleSuggestionClick = (item) => {
    const lat = parseFloat(item.lat);
    const lon = parseFloat(item.lon);
    setCoords({ lat, lon });
    setLocationName(item.display_name);
    setSearchText(item.display_name);
    setShowSuggestions(false);

    fetchData(getParams(date, { lat, lon }));
  };

  const handleSearch = (e) => {
    e?.preventDefault?.();
    fetchData(getParams());
    setLocationName(searchText);
    setShowSuggestions(false);
  };


  useEffect(() => {
    setDate(today);
  }, [today]);


  useEffect(() => {
    if (!("geolocation" in navigator)) return;
    const id = navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        setCoords({ lat, lon });

        if (!initialPanchang) fetchData(getParams(today, { lat, lon }));
      },
      () => {

      }
    );
    return () => {

    };
  }, [initialPanchang, fetchData, getParams, today]);


  useEffect(() => {
    if (!initialPanchang) {
      fetchData(getParams());
    }
  }, [date, coords, initialPanchang, fetchData, getParams]);


  const [activeTab, setActiveTab] = useState("chaughadiya");


  const safe = (k) => (panchangData && panchangData[k] ? panchangData[k] : null);

  return (
    <div className="w-full md:max-w-7xl flex flex-col gap-5 items-center my-5">

      <div className="w-full bg-linear-to-r from-pink-100 to-yellow-100 shadow-md p-5 rounded-lg">
        <div className="flex flex-col md:flex-row items-center justify-between gap-5">
          <Image src="/ds-img/ganeshji.png" alt="ganesh ji" width={100} height={100} className="hidden md:block w-40 h-40 object-contain" />
          <div className="flex flex-col text-sm text-gray-800 gap-2 text-center md:text-left">
            <h5 className="text-xl font-semibold">
              <span className="text-red-500">Today's Panchang:</span>
              <br/> (Aaj Ka Panchang)
            </h5>
            <p className="text-xs sm:text-sm">Panchang is the Hindu calendar followed by Vedic astrology, providing details on Tithis, auspicious and inauspicious timings.</p>
          </div>
        </div>
      </div>


      <div className="relative md:w-[90%] w-[95%] bg-cover bg-center rounded-2xl p-6 shadow-lg text-white" style={{ backgroundImage: "url('/ds-img/cho.jpg')" }}>
        <div className="flex flex-row text-xs sm:text-sm justify-between items-start gap-3">
          <span className="flex items-center gap-2">{locationName}</span>
          <span className="flex items-center gap-2">
            <svg width={18} height={18} viewBox="0 0 640 640"><path d="M224 64C241.7 64 256 78.3 256 96L256 128L384 128L384 96C384 78.3 398.3 64 416 64C433.7 64 448 78.3 448 96L448 128L480 128C515.3 128 544 156.7 544 192L544 480C544 515.3 515.3 544 480 544L160 544C124.7 544 96 515.3 96 480L96 192C96 156.7 124.7 128 160 128L192 128L192 96C192 78.3 206.3 64 224 64zM160 304L160 336C160 344.8 167.2 352 176 352L208 352C216.8 352 224 344.8 224 336L224 304C224 295.2 216.8 288 208 288L176 288C167.2 288 160 295.2 160 304zM288 304L288 336C288 344.8 295.2 352 304 352L336 352C344.8 352 352 344.8 352 336L352 304C352 295.2 344.8 288 336 288L304 288C295.2 288 288 295.2 288 304zM432 288C423.2 288 416 295.2 416 304L416 336C416 344.8 423.2 352 432 352L464 352C472.8 352 480 344.8 480 336L480 304C480 295.2 472.8 288 464 288L432 288zM160 432L160 464C160 472.8 167.2 480 176 480L208 480C216.8 480 224 472.8 224 464L224 432C224 423.2 216.8 416 208 416L176 416C167.2 416 160 423.2 160 432zM304 416C295.2 416 288 423.2 288 432L288 464C288 472.8 295.2 480 304 480L336 480C344.8 480 352 472.8 352 464L352 432C352 423.2 344.8 416 336 416L304 416zM416 432L416 464C416 472.8 423.2 480 432 480L464 480C472.8 480 480 472.8 480 464L480 432C480 423.2 472.8 416 464 416L432 416C423.2 416 416 423.2 416 432z" /></svg>          {new Date(date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</span>
        </div>

        <form onSubmit={handleSearch} className="mt-5 flex flex-col sm:flex-row items-center gap-4">
          <input type="date" value={date} max={today} onChange={(e) => setDate(e.target.value)} className="rounded-full px-4 text-xs sm:text-sm py-1 sm:py-2 text-black bg-white focus:outline-none focus:ring-2 focus:ring-purple-400" />
          <div className="relative w-full flex  sm:w-64">
            <input type="text" value={searchText} onChange={handleInputChange} onFocus={() => setShowSuggestions(true)} placeholder="Enter city name" className="rounded-full px-4 text-xs sm:text-sm py-1 sm:py-2 text-black w-full bg-white focus:outline-none focus:ring-2 focus:ring-purple-400" />
            {showSuggestions && suggestions.length > 0 && (
              <ul className="absolute z-50 bg-white text-black border rounded-md mt-1 max-h-48 overflow-auto shadow-md ">
                {suggestions.map((item) => (
                  <li key={item.place_id} className="px-3 py-2 hover:bg-gray-200 cursor-pointer text-sm" onClick={() => handleSuggestionClick(item)}>
                    {item.display_name}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <button aria-label="Get Panchang" type="submit" className="flex items-center gap-2 bg-purple-500 hover:bg-purple-600 px-4 text-xs sm:text-sm py-1 sm:py-2 rounded-full text-white transition-all">Get Panchang</button>
        </form>
      </div>


      {!loading && panchangData && (
        <div className="bg-white rounded-2xl text-black shadow-lg p-5 md:w-[90%] w-[95%] mt-4">

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center text-black">
            {["sunrise", "sunset", "moonrise", "moonset"].map((k) => (
              <div key={k} className="bg-purple-100 rounded-lg py-3 shadow">
                <p className="font-semibold capitalize">{k}</p>
                <p className="text-purple-700 font-bold">{panchangData[k] || "—"}</p>
              </div>
            ))}
          </div>


          <div className="grid sm:grid-cols-2 gap-4 mt-5 text-sm">
            <div className="bg-purple-50 border-gray-300 rounded-lg p-3 shadow-lg">
              <h3 className="font-semibold text-center text-lg text-purple-700 mb-2">Day Information</h3>
              <div className="space-y-1">
                <div className="grid grid-cols-2 text-sm bg-purple-100 rounded px-2 py-1"><strong className="font-semibold text-purple-600 text-center capitalize">Day:</strong><div className="text-center">{panchangData.day || "—"}</div></div>
                <div className="grid grid-cols-2 text-sm bg-purple-100 rounded px-2 py-1"><strong className="font-semibold text-purple-600 text-center capitalize">Ayana:</strong><div className="text-center">{panchangData.ayana || "—"}</div></div>
                <div className="grid grid-cols-2 text-sm bg-purple-100 rounded px-2 py-1"><strong className="font-semibold text-purple-600 text-center capitalize">Ritu:</strong><div className="text-center">{panchangData.ritu || "—"}</div></div>
                <div className="grid grid-cols-2 text-sm bg-purple-100 rounded px-2 py-1"><strong className="font-semibold text-purple-600 text-center capitalize">Sun Sign:</strong><div className="text-center">{panchangData.sun_sign || "—"}</div></div>
                <div className="grid grid-cols-2 text-sm bg-purple-100 rounded px-2 py-1"><strong className="font-semibold text-purple-600 text-center capitalize">Moon Sign:</strong><div className="text-center">{panchangData.moon_sign || "—"}</div></div>
                <div className="grid grid-cols-2 text-sm bg-purple-100 rounded px-2 py-1"><strong className="font-semibold text-purple-600 text-center capitalize">Paksha:</strong><div className="text-center">{panchangData.paksha || "—"}</div></div>
              </div>
            </div>

            <div className="bg-purple-50 border-gray-300 rounded-lg p-3 shadow-lg">
              <h3 className="font-semibold text-center text-lg text-purple-700 mb-2">Calendar Info</h3>
              <div className="space-y-1">
                <div className="grid grid-cols-2 text-sm bg-purple-100 rounded px-2 py-1"><strong className="font-semibold text-purple-600 text-center capitalize">Shaka Samvat:</strong><div className="text-center">{panchangData.shaka_samvat ?? "—"} ({panchangData.shaka_samvat_name ?? "—"})</div></div>
                <div className="grid grid-cols-2 text-sm bg-purple-100 rounded px-2 py-1"><strong className="font-semibold text-purple-600 text-center capitalize">Vikram Samvat:</strong><div className="text-center">{panchangData.vikram_samvat ?? "—"} ({panchangData.vikram_samvat_name ?? "—"})</div></div>
                <div className="grid grid-cols-2 text-sm bg-purple-100 rounded px-2 py-1"><strong className="font-semibold text-purple-600 text-center capitalize">Disha Shool:</strong><div className="text-center">{panchangData.disha_shool ?? "—"}</div></div>
                <div className="grid grid-cols-2 text-sm bg-purple-100 rounded px-2 py-1"><strong className="font-semibold text-purple-600 text-center capitalize">Disha Shool Remedies:</strong><div className="text-center">{panchangData.disha_shool_remedies ?? "—"}</div></div>
              </div>
            </div>
          </div>

        
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            {panchangData.rahukaal && <SectionBlock title="Rahukaal" obj={panchangData.rahukaal} />}
            {panchangData.yamghant_kaal && <SectionBlock title="Yamghant Kaal" obj={panchangData.yamghant_kaal} />}
            {panchangData.guliKaal && <SectionBlock title="Gulikaal" obj={panchangData.guliKaal} />}
            {panchangData.abhijit_muhurta && <SectionBlock title="Abhijit Muhurta" obj={panchangData.abhijit_muhurta} />}
          </div>


          <div className="grid sm:grid-cols-2 gap-6 mt-6">
            {panchangData.tithi?.details && <SectionBlock title="Tithi Details" obj={{ ...panchangData.tithi.details, end_time: panchangData.tithi.end_time, end_time_ms: panchangData.tithi.end_time_ms }} />}
            {panchangData.nakshatra?.details && <SectionBlock title="Nakshatra Details" obj={{ ...panchangData.nakshatra.details, end_time: panchangData.nakshatra.end_time, end_time_ms: panchangData.nakshatra.end_time_ms }} />}
            {panchangData.yog?.details && <SectionBlock title="Yog Details" obj={{ ...panchangData.yog.details, end_time: panchangData.yog.end_time, end_time_ms: panchangData.yog.end_time_ms }} />}
            {panchangData.karan?.details && <SectionBlock title="Karan Details" obj={{ ...panchangData.karan.details, end_time: panchangData.karan.end_time, end_time_ms: panchangData.karan.end_time_ms }} />}
          </div>
        </div>
      )}

      {/* tabs */}
      <div className="mt-8 w-[95%] md:w-[90%]">
        <h5 className="text-center text-xl font-semibold text-black mb-4"><span className="text-red-500">"Get to know about:</span> Best Muhurata"</h5>

        <div className="flex items-center bg-purple-200 justify-center rounded-2xl py-4 px-2 gap-4">
          {[
            { id: "chaughadiya", label: "Chaughadiya Muhurata", src: "/ds-img/kundli.webp", comp: <ChaughadiyaPage inputParams={getParams()} initialChaughadiya={initialChaughadiya} initialPanchang={initialPanchang} /> },
            { id: "hora", label: "Hora Muhurata", src: "/ds-img/compass.png", comp: <HoraPage inputParams={getParams()} initialHora={initialHora} /> },
          ].map((p) => (
            <div key={p.id} onClick={() => setActiveTab(p.id)} className={`cursor-pointer flex flex-col w-100 items-center justify-center p-3 rounded-xl text-xs md:text-base transition-all ${activeTab === p.id ? "bg-purple-500 text-white shadow-xl" : "text-black"}`}>
              <Image className={`tab-img-c transition-all duration-300 ${activeTab === p.id ? "filter brightness-0 invert" : ""}`} src={p.src} alt={p.label} height={40} width={40} />
              <span className="text-center">{p.label}</span>
            </div>
          ))}
        </div>

        <div className="mt-3">
          {activeTab === "chaughadiya" && <ChaughadiyaPage inputParams={getParams()} initialChaughadiya={initialChaughadiya} initialPanchang={initialPanchang} />}
          {activeTab === "hora" && <HoraPage inputParams={getParams()} initialHora={initialHora} />}
        </div>
      </div>
    </div>
  );
}
