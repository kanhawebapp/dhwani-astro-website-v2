"use client";

import { useState } from "react";
import { useDispatch } from "react-redux";
import Image from "next/image";
import { setdaUserForm } from "@/app/redux/services/daUserFormSlice";
import Kundlioth from "../Smcompo/Kundlioth";
import Bestsell from "../Smcompo/Bestsell/Bestsell";
import Sidebanner from "../Smcompo/Sidebanner";
// import Freereport from "../Smcompo/Freereport";
// import Recastro from "../Smcompo/Recastro";
import FAQue from "../FAQue";
import Callchatsec from "../Smcompo/Callchatsec";

import CustomInput from "../Custom/CustomInput";
import CustomButton from "../Custom/CustomButton";
import { AlertLoading, LocationSelector } from "@/app/common";
import { useLanguage } from "@/app/context/LangContext";

import { createKundliFromMain } from "../../app/actions/createKundliFromMain";
import { useAuth } from "@/app/context/authContext";
import Select from "react-select";
import { useGetBirthDetailsMutation } from "@/app/redux/services/astrologyAPI";

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
  { length: CURRENT_YEAR - 1950 + 1 },
  (_, i) => ({
    value: String(CURRENT_YEAR - i),
    label: String(CURRENT_YEAR - i),
  }),
);

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
const HOUR_OPTIONS = Array.from({ length: 24 }, (_, i) => ({
  value: String(i).padStart(2, "0"),
  label: String(i).padStart(2, "0"),
}));

const MINUTE_OPTIONS = Array.from({ length: 60 }, (_, i) => ({
  value: String(i).padStart(2, "0"),
  label: String(i).padStart(2, "0"),
}));
const Kundlimain = () => {
  const { isLoggedIn, setShowLogin } = useAuth();
  const { messages: t } = useLanguage();
  const dispatch = useDispatch();
  const [getBirthDetails, { isLoading: birthLoading }] =
    useGetBirthDetailsMutation();
  const [alert, setAlert] = useState(false);
  const [errors, setErrors] = useState({});

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
  const validateForm = () => {
    const err = {};
    if (!formData.name) err.name = "Name is required";
    if (!formData.day || !formData.month || !formData.year) {
      err.dob = "Date of Birth is required";
    }

    if (!formData.hour || !formData.min) {
      err.birthTime = "Birth Time is required";
    }
    if (!formData.birthplace) err.birthplace = "Birth Place is required";
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLocationSelect = (location) => {
    setFormData((prev) => ({
      ...prev,
      birthplace: `${location.city}, ${location.state}, ${location.country}`,
      lat: Number(location.latitude),
      lon: Number(location.longitude),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert(true);

    if (!validateForm()) {
      setAlert(false);
      return;
    }
    const payload = {
      name: formData.name,
      day: Number(formData.day),
      month: Number(formData.month),
      year: Number(formData.year),
      hour: Number(formData.hour),
      min: Number(formData.min),
      lat: formData.lat,
      lon: formData.lon,
      tzone: formData.tzone,
      birthplace: formData.birthplace,
    };
    if (!isLoggedIn) {
      setPendingRoute({
        type: "kundli",
        payload,
      });
      setShowLogin(true);
      return;
    }
    try {
      dispatch(setdaUserForm(payload));

      const birthDetails = await getBirthDetails(payload).unwrap();

      if (!birthDetails) {
        throw new Error("Failed to fetch birth details");
      }

      const fd = new FormData();
      Object.entries(payload).forEach(([key, value]) => fd.append(key, value));

      await createKundliFromMain(fd);
    } catch (err) {
      console.error("Kundli submit failed:", err);
    } finally {
      setAlert(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <section className="kundli-main-page sm:py-5">
      <div className="kundli-img-txt flex justify-center bg-linear-to-r from-pink-100 to-yellow-100 shadow-xl rounded-b-2xl p-5">
        <div className="text-black text-center">
          <h4 className="text-sm md:text-xl uppercase font-bold">
            {t?.kform?.top || "Discover Your Future with a Free Online Kundli"}
          </h4>
          <p className="text-xs sm:text-sm">
            Kundli is an astrological chart showing planetary positions at
            birth.
          </p>
        </div>
      </div>

         <div className="kundli-page mt-5 flex flex-col gap-4 md:max-w-7xl sm:grid sm:grid-cols-7 gap-5 p-2">
         <div className="col-span-5 flex flex-col gap-6">
          <div className="grid grid-cols-6 gap-5 text-black">
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
                  <label className="text-xs sm:text-sm font-semibold">
                    Date of Birth
                  </label>

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
                  <label className="text-xs sm:text-sm font-semibold">
                    Time of Birth
                  </label>

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

        <div className="col-span-2">
          <Bestsell />
          <Sidebanner />
        </div>
      </div>

      <AlertLoading show={alert} title="Generating Kundli..." />

      {/* <Freereport /> */}
      {/* <Recastro /> */}
      <FAQue />
      <Callchatsec />
    </section>
  );
};

export default Kundlimain;
