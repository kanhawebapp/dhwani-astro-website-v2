"use client";

import { useState, useMemo, useEffect } from "react";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import metadata from "libphonenumber-js/metadata.min.json";
import ReactCountryFlag from "react-country-flag";
import Select from "react-select";

function getCountries() {
  const displayNames = new Intl.DisplayNames(["en"], { type: "region" });
  const countryCodes = Object.keys(metadata.countries);

  return countryCodes.map((iso) => {
    const dialCode = `+${metadata.countries[iso][0]}`;
    return {
      iso,
      name: displayNames.of(iso),
      dialCode,
    };
  });
}

export default function PhoneInput({ onChange, handleKeyEnter, resetTrigger }) {
  const countries = useMemo(() => getCountries(), []);

  const defaultCountry = countries.find((c) => c.iso === "IN") || countries[0];

  const [country, setCountry] = useState(defaultCountry);
  const [number, setNumber] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setNumber("");
    setError("");
  }, [resetTrigger, defaultCountry]);

  const updatePhoneData = (value, selectedCountry = country) => {
    const cleanNumber = value.replace(/^0+/, "");

    const phone = parsePhoneNumberFromString(
      `${selectedCountry.dialCode}${value}`,
    );

    const isValid = value.length ==10 && (phone?.isValid() || false);

    onChange({
      countryCode: selectedCountry.dialCode,
      mobile: cleanNumber,
      iso: selectedCountry.iso,
      e164: phone?.number || "",
      isValid,
    });
  };

  return (
    <div>
      <div className="flex gap-0.5 rounded">
        <div className="flex w-20 sm:w-25 items-center bg-white/60 gap-0.5 h-full px-1 py-1 sm:px-3 sm:py-2 border border-gray-400 rounded-2xl shadow-lg">
          <Select
            className="text-black  "
            value={country}
            onChange={(selected) => {
              setCountry(selected);
              updatePhoneData(number, selected);
            }}
            options={countries}
            getOptionValue={(option) => option.iso}
            getOptionLabel={(option) => option.name}
            isSearchable
            menuPortalTarget={
              typeof window !== "undefined" ? document.body : null
            }
            menuPosition="fixed"
            styles={{
              control: (base) => ({
                ...base,
                border: "none",
                boxShadow: "none",
                minHeight: "auto",
                background: "transparent",
              }),
              menu: (base) => ({
                ...base,
                width: 240,
                minWidth: 240,
              }),
              menuPortal: (base) => ({
                ...base,
                zIndex: 99999,
              }),
              indicatorSeparator: () => ({
                display: "none",
              }),
              dropdownIndicator: (base) => ({
                ...base,
                padding: 2,
              }),
              valueContainer: (base) => ({
                ...base,
                padding: 0,
              }),
            }}
            formatOptionLabel={(option, { context }) => {
              if (context === "value") {
                return (
                  <div className="flex text-black items-center gap-1">
                    <ReactCountryFlag
                      countryCode={option.iso}
                      svg
                      style={{ width: "1.1em", height: "1.1em" }}
                    />
                    <span className="text-xs text-black sm:text-sm">
                      {option.dialCode}
                    </span>
                  </div>
                );
              }

              return (
                <span className="w-15 text-black text-xs sm:text-sm">
                  {option.dialCode} {option.name}
                </span>
              );
            }}
          />
        </div>

        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          className={`flex-1 px-3 w-50 sm:w-full py-2 border ${
            error ? "border-red-500" : "border-gray-400"
          } text-gray-800 text-sm sm:text-base rounded-2xl placeholder:text-xs bg-white/60 shadow-lg outline-none`}
          placeholder="Mobile number"
          value={number}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();

           if (number.length !== 10) {
  setError("Please enter valid number");
  return;
}

              setError("");
              handleKeyEnter?.(e);
            }
          }}
          onChange={(e) => {
            const val = e.target.value.replace(/\D/g, "");

            if (val.length <= 15) {
              setNumber(val);
              setError("");
              updatePhoneData(val);
            }
          }}
        />
      </div>

      {error && (
        <p className="text-red-400 text-center text-xs mt-1">{error}</p>
      )}
    </div>
  );
}
