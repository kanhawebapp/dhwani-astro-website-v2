"use client";

import { useState } from "react";
import Image from "next/image";
import CustomButton from "../Custom/CustomButton";
import CustomInput from "../Custom/CustomInput";
import Kundlioth from "../Smcompo/Kundlioth";
import Bestsell from "../Smcompo/Bestsell/Bestsell";
import Sidebanner from "../Smcompo/Sidebanner";
// import Freereport from "../Smcompo/Freereport";
// import Recastro from "../Smcompo/Recastro";
import FAQue from "../FAQue";
import Callchatsec from "../Smcompo/Callchatsec";
import { LocationSelector } from "@/app/common";
import { useLanguage } from "@/app/context/LangContext";
import { createKundliAction } from "@/app/actions/createKundliAction";
import Select from "react-select";
import { useAuth } from "@/app/context/authContext";
import { useRouter } from "next/navigation";

const CURRENT_YEAR = new Date().getFullYear();

const DAY_OPTIONS = Array.from({ length: 31 }, (_, i) => ({
  value: String(i + 1),
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
].map((month, index) => ({
  value: String(index + 1),
  label: month,
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
menuList: (base) => ({
  ...base,
  maxHeight: window.innerWidth < 768 ? 160 : 260,
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
export default function Formremedies({ slug }) {
  const { messages: t } = useLanguage();
  const router = useRouter();

  const { isLoggedIn, setShowLogin, setPendingRoute } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    day: "",
    month: "",
    year: "",
    hour: "",
    min: "",
    birthplace: "",
    lat: "",
    lon: "",
    tzone: 5.5,
  });
  const updateField = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    // login check
    if (!isLoggedIn) {
      setPendingRoute({
        type: "remedies",
        payload: {
          slug,
          ...formData,
        },
      });

      setShowLogin(true);
      return;
    }

    // validation
    if (
      !formData.name ||
      !formData.day ||
      !formData.month ||
      !formData.year ||
      !formData.hour ||
      !formData.min ||
      !formData.birthplace
    ) {
      alert("Please fill all fields.");
      return;
    }

    const fd = new FormData();

    fd.append("slug", slug);
    fd.append("name", formData.name);
    fd.append("day", formData.day);
    fd.append("month", formData.month);
    fd.append("year", formData.year);
    fd.append("hour", formData.hour);
    fd.append("min", formData.min);
    fd.append("lat", String(formData.lat));
    fd.append("lon", String(formData.lon));
    fd.append("tzone", String(formData.tzone));
    fd.append("birthplace", formData.birthplace);

    await createKundliAction(fd);
  };

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleLocationSelect = (data) => {
    setFormData((prev) => ({
      ...prev,
      birthplace: `${data.city}, ${data.state}, ${data.country}`,
      lat: Number(data.latitude),
      lon: Number(data.longitude),
    }));
  };

  return (
    <section className="kundli-main-page ">
      <div className="kundli-img-txt flex justify-center bg-linear-to-r from-pink-100 to-yellow-100 shadow-xl rounded-b-2xl p-5">
        <div className="text-center flex flex-col gap-1 text-black">
          <h4 className="text-md sm:text-2xl font-bold uppercase">
            {t?.kform?.top || "Discover Your Future with a Free Online Kundli"}
          </h4>
          <p className="text-xs sm:text-md">
            Kundli is an astrological chart that shows planetary positions.
          </p>
        </div>
      </div>

      <div className="kundli-page mt-5 flex flex-col gap-4 md:max-w-7xl sm:grid sm:grid-cols-7 gap-5 p-2">
        <div className="col-span-5 flex flex-col gap-6">
          <div className="grid grid-cols-6 gap-5">
            <div className="sm:col-span-2 bg-linear-to-r from-pink-100 to-yellow-100 shadow-lg hidden md:block rounded-2xl p-5 text-center text-black">
              <Image
                src="/ds-img/ganeshji.png"
                width={100}
                height={100}
                alt="ganesh ji"
                className="mx-auto hidden md:block"
              />
              <h4 className="text-xl font-semibold mt-2">KUNDLI FREE ONLINE</h4>
              <p className="text-sm">Get accurate birth chart analysis.</p>
            </div>

            <div className="col-span-6 sm:col-span-4 bg-[#dfc7fd6e] shadow-lg rounded-2xl p-6 text-black">
              <h2 className="text-mdsm:text-xl font-semibold text-center text-purple-700 mb-5">
                {t?.kform?.head || "Enter Your Details"}
              </h2>

              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <CustomInput
                  name="name"
                  label="Name"
                  placeholder="Enter your name"
                  className="rounded-2xl bg-white/90 py-1 placeholder:text-xs sm:py-3 outline-none focus:ring-0 px-4"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  autofill="name"
                />

                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-semibold">Date of Birth</label>

                  <div className="grid grid-cols-3 text-black gap-3">
                    <Select
                      className="text-xs py-1 placeholder:text-xs sm:py-3 text-black "
                      options={DAY_OPTIONS}
                      placeholder=" Day"
                      styles={selectStyles}
                      menuPortalTarget={
                        typeof window !== "undefined" ? document.body : null
                      }
                      menuPosition="fixed"
                      value={DAY_OPTIONS.find((x) => x.value === formData.day)}
                      onChange={(option) =>
                        updateField("day", option?.value || "")
                      }
                    />

                    <Select
                      className=" text-xs"
                      options={MONTH_OPTIONS}
                      placeholder=" Month"
                      styles={selectStyles}
                      menuPortalTarget={
                        typeof window !== "undefined" ? document.body : null
                      }
                      menuPosition="fixed"
                      value={MONTH_OPTIONS.find(
                        (x) => x.value === formData.month,
                      )}
                      onChange={(option) =>
                        updateField("month", option?.value || "")
                      }
                    />

                    <Select
                      className=" text-xs"
                      options={YEAR_OPTIONS}
                      placeholder=" Year"
                      styles={selectStyles}
                      menuPortalTarget={
                        typeof window !== "undefined" ? document.body : null
                      }
                      menuPosition="fixed"
                      value={YEAR_OPTIONS.find(
                        (x) => x.value === formData.year,
                      )}
                      onChange={(option) =>
                        updateField("year", option?.value || "")
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-semibold">Time of Birth</label>

                  <div className="grid grid-cols-2 gap-3">
                    <Select
                      className=" text-xs"
                      options={HOUR_OPTIONS}
                      placeholder="🕐 Hour"
                      styles={selectStyles}
                      menuPortalTarget={
                        typeof window !== "undefined" ? document.body : null
                      }
                      menuPosition="fixed"
                      value={HOUR_OPTIONS.find(
                        (x) => x.value === formData.hour,
                      )}
                      onChange={(option) =>
                        updateField("hour", option?.value || "")
                      }
                    />

                    <Select
                      className="text-xs"
                      options={MINUTE_OPTIONS}
                      placeholder="🕑 Minute"
                      styles={selectStyles}
                      menuPortalTarget={
                        typeof window !== "undefined" ? document.body : null
                      }
                      menuPosition="fixed"
                      value={MINUTE_OPTIONS.find(
                        (x) => x.value === formData.min,
                      )}
                      onChange={(option) =>
                        updateField("min", option?.value || "")
                      }
                    />
                  </div>
                </div>

                <LocationSelector
                  placeholder="Birth place"
                  onSelect={handleLocationSelect}
                />

                <CustomButton
                  variant={"purple"}
                  type="submit"
                  className="mt-4 w-[50%] sm:w-full  hover:scale-104 py-2 text-sm sm:text-md flex align-self-center justify-center place-self-center sm:py-3"
                >
                  SUBMIT
                </CustomButton>
              </form>
            </div>
          </div>

          <Kundlioth />
        </div>

        <div className="col-span-2 flex flex-col gap-5">
          <Bestsell />
          <Sidebanner />
        </div>
      </div>

      {/* <Freereport /> */}
      {/* <Recastro /> */}
      <FAQue />
      <Callchatsec />
    </section>
  );
}
