"use client";

import React, { useEffect, useState } from "react";
import CustomInput from "@/components/Custom/CustomInput";
import { useLanguage } from "../context/LangContext";

const SearchLocation = ({ placeholder, onSelect }) => {
  const { messages: t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [allCities, setAllCities] = useState([]);
  const [show, setShow] = useState(false);
  const [selectedCity, setSelectedCity] = useState(null);

  useEffect(() => {
    if (searchTerm.length < 2 || allCities.length > 0) return;

    const loadCities = async () => {
      setIsLoading(true);
      try {
        const res = await fetch("/api/cities", { cache: "force-cache" }); 
        if (!res.ok) throw new Error("Failed to fetch cities");
        const data = await res.json();
        setAllCities(data);
      } catch (err) {
        console.error("Error fetching cities:", err);
      } finally {
        setIsLoading(false);
      }
    };

    const timeout = setTimeout(loadCities, 0);
    return () => clearTimeout(timeout);
  }, [searchTerm, allCities.length]);

  // 🔍 Handle user input search
  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(e.target.value);

    if (term.length < 2) {
      setResults([]);
      setShow(false);
      return;
    }

    const matchedCities = allCities
      .filter((city) => city.name.toLowerCase().includes(term))
      .slice(0, 10);

    setResults(matchedCities);
    setShow(true);
  };

  const SelectLocation = (city) => {
    setSelectedCity(city);
    setSearchTerm(`${city.name}, ${city.stateCode}, ${city.countryCode}`);

    const dataToSend = {
      city: `${city.name}, ${city.stateCode}, ${city.countryCode}`,
      latitude: parseFloat(city.latitude),
      longitude: parseFloat(city.longitude),
    };

    onSelect(dataToSend);
    setShow(false);
  };

  return (
    <div className="relative">
      <CustomInput
        label={t?.kform?.place || "Birth Place"}
        value={searchTerm}
        placeholder={placeholder}
        className="w-full text-black  border rounded-2xl bg-white/90   px-3 py-1 placeholder:text-xs sm:py-3 focus:ring-purple-100 focus:ring-1 focus:outline-0 border-gray-300"
        required
        autofill="birthplace"
        onChange={handleSearch}
      />

      {isLoading && <p className="text-sm text-gray-500 mt-2">Loading cities...</p>}

      {show && results.length > 0 && (
        <ul
          role="listbox"
          className="absolute z-50 w-full border border-gray-200 bg-white rounded-2xl p-2 mt-2  max-h-60 overflow-y-auto shadow-lg"
        >
          {results.map((city) => (
            <li
              key={`${city.name}-${city.stateCode}-${city.countryCode}`}
              role="option"
              tabIndex={0}
              aria-selected={
                selectedCity?.name === city.name &&
                selectedCity?.stateCode === city.stateCode
              }
              className={`text-black mt-1 cursor-pointer px-2 py-1 rounded-lg ${selectedCity?.name === city.name &&
                  selectedCity?.stateCode === city.stateCode
                  ? "bg-blue-100"
                  : "bg-gray-50 hover:bg-gray-100"
                }`}
              onClick={() => SelectLocation(city)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  SelectLocation(city);
                }
              }}
            >
              {city.name} ({city.stateCode}, {city.countryCode})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchLocation;
