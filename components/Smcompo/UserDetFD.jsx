"use client";

import React from "react";
import CustomInput from "../Custom/CustomInput";
// import { LocationSelector } from "@/app/common/LocationSelector";
import { useLanguage } from "@/app/context/LangContext";
import Select from "react-select";
const CURRENT_YEAR = new Date().getFullYear();

const DAY_OPTIONS = Array.from({ length: 31 }, (_, i) => ({
  value: String(i + 1).padStart(2, "0"),
  label: String(i + 1),
}));

const MONTH_OPTIONS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
].map((m, i) => ({
  value: String(i + 1).padStart(2, "0"),
  label: m,
}));

const YEAR_OPTIONS = Array.from(
  { length: CURRENT_YEAR - 1960 + 1 },
  (_, i) => ({
    value: String(CURRENT_YEAR - i),
    label: String(CURRENT_YEAR - i),
  }),
);

const HOUR_OPTIONS = Array.from({ length: 24 }, (_, i) => ({
  value: String(i).padStart(2, "0"),
  label: String(i).padStart(2, "0"),
}));

const MINUTE_OPTIONS = Array.from({ length: 60 }, (_, i) => ({
  value: String(i).padStart(2, "0"),
  label: String(i).padStart(2, "0"),
}));
const selectStyles = {
  control: (base, state) => ({
    ...base,
    minHeight: 52,
    borderRadius: 18,
    borderColor: state.isFocused ? "#9333ea" : "#ddd6fe",
    boxShadow: state.isFocused
      ? "0 0 0 4px rgba(147,51,234,.15)"
      : "0 2px 10px rgba(0,0,0,.05)",
    cursor: "pointer",
    "&:hover": {
      borderColor: "#9333ea",
    },
  }),

  placeholder: (base) => ({
    ...base,
    color: "#6b7280",
  }),

  singleValue: (base) => ({
    ...base,
    color: "#111827",
    fontWeight: 500,
  }),

  input: (base) => ({
    ...base,
    color: "#111827",
  }),

  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? "#9333ea"
      : state.isFocused
        ? "#f3e8ff"
        : "#fff",
    color: state.isSelected ? "#fff" : "#111827",
    cursor: "pointer",
       padding: window.innerWidth < 768 ? "6px 10px" : "10px 12px",
  fontSize: window.innerWidth < 768 ? "13px" : "15px",
  }),
menuList: (base) => ({
  ...base,
  maxHeight: window.innerWidth < 768 ? 160 : 260,
}),
  menu: (base) => ({
    ...base,
    borderRadius: 16,
    overflow: "hidden",
  }),

  menuPortal: (base) => ({
    ...base,
    zIndex: 999999,
  }),

  indicatorSeparator: () => ({
    display: "none",
  }),

  dropdownIndicator: (base) => ({
    ...base,
    color: "#9333ea",
  }),
};
const UserDetFD = ({
  title = "Your Details",
  namePlaceholder = "Enter your name...",
  // birthPlacePlaceholder = "Enter Birth Place...",
  formData,
  handleChange,
  handleLocationSelect,
}) => {
  const [year = "", month = "", day = ""] = (formData.dob || "").split("-");

  const [hour = "", minute = ""] = (formData.birthTime || "").split(":");
  const updateDOB = (field, value) => {
    const dob = {
      day,
      month,
      year,
    };

    dob[field] = value;

    handleChange({
      target: {
        name: "dob",
        value: `${dob.year}-${dob.month}-${dob.day}`,
      },
    });
  };

  const updateTime = (field, value) => {
    const time = {
      hour,
      minute,
    };

    time[field] = value;

    handleChange({
      target: {
        name: "birthTime",
        value: `${time.hour}:${time.minute}`,
      },
    });
  };
  const { messages: t } = useLanguage();
  return (
    <div className="w-full p-3 pb-4 bg-purple-200 shadow-lg rounded-lg">
      <h2 className="text-base md:text-lg text-center text-black font-semibold mb-2">
        {title}
      </h2>

      <div className="flex flex-col gap-3">
        <div>
          <CustomInput
            label={t?.kform?.name || "Name"}
            type="text"
            name="name"
            value={formData.name || ""}
            onChange={handleChange}
            required
            placeholder={namePlaceholder}
                  className="rounded-2xl bg-white/90 py-1 placeholder:text-xs placeholder:text-gray-400 sm:py-3 outline-none focus:ring-0 px-4"
          />
        </div>

        <div className="flex flex-col  gap-4">
          <div className="space-y-2">
              <label className="text-xs sm:text-sm text-black font-semibold">Date of Birth</label>
           <div className="grid grid-cols-3 gap-3">
              <Select
                 className="text-xs py-1 placeholder:text-xs sm:py-3 text-black "
                options={DAY_OPTIONS}
                placeholder="Day"
                value={DAY_OPTIONS.find((x) => x.value === day)}
                onChange={(e) => updateDOB("day", e.value)}
                styles={selectStyles}
                menuPortalTarget={
                  typeof window !== "undefined" ? document.body : null
                }
                menuPosition="fixed"
              />

              <Select
                 className="text-xs py-1 placeholder:text-xs sm:py-3 text-black "
                options={MONTH_OPTIONS}
                placeholder="Month"
                value={MONTH_OPTIONS.find((x) => x.value === month)}
                onChange={(e) => updateDOB("month", e.value)}
                styles={selectStyles}
                menuPortalTarget={
                  typeof window !== "undefined" ? document.body : null
                }
                menuPosition="fixed"
              />

              <Select
                 className="text-xs py-1 placeholder:text-xs sm:py-3 text-black "
                options={YEAR_OPTIONS}
                placeholder="Year"
                value={YEAR_OPTIONS.find((x) => x.value === year)}
                onChange={(e) => updateDOB("year", e.value)}
                styles={selectStyles}
                menuPortalTarget={
                  typeof window !== "undefined" ? document.body : null
                }
                menuPosition="fixed"
              />
            </div>
          </div>

          <div className="space-y-2">
              <label className="text-xs sm:text-sm text-black font-semibold">Time of Birth</label>

            <div className="grid grid-cols-2 gap-3">
              <Select
                  className="text-xs py-1 placeholder:text-xs sm:py-3 text-black "
                options={HOUR_OPTIONS}
                placeholder="Hour"
                value={HOUR_OPTIONS.find((x) => x.value === hour)}
                onChange={(e) => updateTime("hour", e.value)}
                styles={selectStyles}
                menuPortalTarget={
                  typeof window !== "undefined" ? document.body : null
                }
                menuPosition="fixed"
              />

              <Select
                  className="text-xs py-1 placeholder:text-xs sm:py-3 text-black "
                options={MINUTE_OPTIONS}
                placeholder="Minute"
                value={MINUTE_OPTIONS.find((x) => x.value === minute)}
                onChange={(e) => updateTime("minute", e.value)}
                styles={selectStyles}
                menuPortalTarget={
                  typeof window !== "undefined" ? document.body : null
                }
                menuPosition="fixed"
              />
            </div>
          </div>
        </div>

        <div>
          {/* <LocationSelector
            placeholder={t?.kform?.placeh || "Your birth place/location"}
            onSelect={handleLocationSelect}
          /> */}
        </div>
      </div>
    </div>
  );
};

export default UserDetFD;
