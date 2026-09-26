"use client";
import React, { useEffect, useState, useContext, useMemo, useRef } from "react"; //  useRef added
import CustomInput from "@/components/Custom/CustomInput";
import CustomSelect from "@/components/Custom/CustomSelect";
import { useDispatch, useSelector } from "react-redux";
import AlertLoading from "@/app/common/AlertLoading";
import LocationSelector from "@/app/common/LocationSelector";
import SocketContext from "@/app/context/socketContext";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@apollo/client/react";
import { gql } from "@apollo/client";
import metadata from "libphonenumber-js/metadata.min.json";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { requestFormSchema } from "@/lib/userZodIntake";
import Image from "next/image";
import { createRequestAndEmit } from "@/utils/createRequestAndEmit";
import Select from "react-select";

const CREATE_INTAKE = gql`
  mutation CreateIntake($input: IntakeInput!) {
    createIntake(input: $input) {
      intakeId
      roomId
      chatTime
      message
      pricePerMin
      pricingType
    }
  }
`;

const GET_USER_BY_ID = gql`
  query GetUserById($id: String!) {
    getUserById(id: $id) {
      id
      name
      countryCode
      mobile
      gender
      birthDate
      birthTime
      occupation
    }
  }
`;

const GET_ASTROLOGER_BY_ID = gql`
  query GetAstrologerById($id: String!) {
    getAstrologerById(id: $id) {
      id
      name
      profilePic
      rating
      about
      experience
      skills
      languages

      pricing {
        type
        price
        offerPrice
        commissionPercent
        isActive
      }
    }
  }
`;

export default function RequestForm({ mode, astroId }) {
  const debounceRef = useRef(null); 

  const [createIntake] = useMutation(CREATE_INTAKE);
  const astro_id = astroId;

  const router = useRouter();
  const { socket, connectSocket } = useContext(SocketContext);
  const dispatch = useDispatch();

  const [astrologer, setAstrologer] = useState(null);
  const [country, setCountry] = useState(null);
  const [id, setId] = useState(null);
  const [chatTime, setChatTime] = useState(0);
  const countries = useMemo(() => getCountries(), []);
  const [roomId, setRoomId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  useEffect(() => {
    if (!socket) return;

    const originalEmit = socket.emit;

    socket.emit = function (...args) {
      return originalEmit.apply(this, args);
    };

    return () => {
      socket.emit = originalEmit;
    };
  }, [socket]);

  //  RHF
  const {
    control,
    handleSubmit,
    setValue,
    trigger,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(requestFormSchema),
    mode: "onSubmit",
    defaultValues: {
      name: "",
      phone: "",
      countryCode: "",
      usergender: "",
      dob: "",
      time: "",
      occupation: "Private Job",
      place: "",
      latitude: "",
      longitude: "",
      source: "WEB",
    },
  });

  //  DEBOUNCE WRAPPER (NO LOGIC CHANGE)
  const handleDebouncedSubmit = (data) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      onSubmit(data);
    }, 400);
  };

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsed = JSON.parse(userData);
      setId(parsed?.id);
    }
  }, []);

  const { data: userInfo } = useQuery(GET_USER_BY_ID, {
    variables: { id },
    skip: !id,
  });

  const { data: astrologerInfo, loading } = useQuery(GET_ASTROLOGER_BY_ID, {
    variables: { id: astro_id },
    skip: !astro_id,
  });

  useEffect(() => {
    if (astrologerInfo?.getAstrologerById) {
      const astroData = astrologerInfo.getAstrologerById;

      // Find active pricing according to mode
      const selectedPricing = astroData?.pricing?.find(
        (item) =>
          item?.type?.toUpperCase() === mode?.toUpperCase() && item?.isActive,
      );

      setAstrologer({
        ...astroData,

        // Backward compatibility
        price: selectedPricing?.offerPrice || selectedPricing?.price || 0,

        // Extra fields
        pricePerMin: selectedPricing?.offerPrice || selectedPricing?.price || 0,

        pricingType: selectedPricing?.type || mode,

        activePricing: selectedPricing || null,
      });
    }
  }, [astrologerInfo, mode]);

  useEffect(() => {
    if (userInfo?.getUserById) {
      const user = userInfo.getUserById;

      setValue("name", user?.name || "");
      setValue("phone", user?.mobile || "");
      setValue("countryCode", user?.countryCode || "");
      setValue("usergender", user?.gender || "");
      setValue("dob", user?.birthDate ? user.birthDate.split("T")[0] : "");
      setValue("time", user?.birthTime || "");
      setValue("occupation", user?.occupation || "");
      setValue("source", "WEB");

      if (user?.countryCode && countries.length > 0) {
        const matched = countries.find((c) => c.dialCode === user.countryCode);
        if (matched) setCountry(matched);
      }
    }
  }, [userInfo, countries, setValue]);

  const onSubmit = async (data) => {
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      await createRequestAndEmit({
        createIntake,
        mode,
        astro_id,
        profileData: data,
        socket,
        connectSocket,
        astrologer,
        pricePerMin: astrologer?.pricePerMin || 0,
        dispatch,
        router,
        userId: id,
        source: "WEB",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
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
  ].map((month, index) => ({
    value: String(index + 1).padStart(2, "0"),
    label: month,
  }));

  const YEAR_OPTIONS = Array.from(
    { length: CURRENT_YEAR - 1950 + 1 },
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
  const occupation_list = [
    "Student",
    "Engineer",
    "Doctor",
    "Business",
    "Teacher",
    "Government Job",
    "Private Job",
    "Self Employed",
    "Unemployed",
    "Other",
  ];

  function getCountries() {
    const displayNames = new Intl.DisplayNames(["en"], { type: "region" });
    const codes = Object.keys(metadata.countries);

    return codes.map((iso) => ({
      iso,
      name: displayNames.of(iso),
      dialCode: `+${metadata.countries[iso][0]}`,
    }));
  }

  const users = [
    { id: 1, img: "/ds-img/a.jpg" },
    { id: 2, img: "/ds-img/ak.jpg" },
    { id: 3, img: "/ds-img/anvi.svg" },
    { id: 4, img: "/ds-img/neel.jpg" },
    { id: 5, img: "/ds-img/sachin.svg" },
    { id: 6, img: "/ds-img/ser1.webp" },
    { id: 7, img: "/ds-img/s7.png" },
    { id: 8, img: "/ds-img/anvi.svg" },
  ];
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
      maxHeight:
        typeof window !== "undefined" && window.innerWidth < 768 ? 160 : 260,
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
  const genderOptions = [
    {
      value: "MALE",
      label: "Male",
    },
    {
      value: "FEMALE",
      label: "Female",
    },
    {
      value: "OTHER",
      label: "Other",
    },
  ];
  const occupationOptions = occupation_list.map((item) => ({
    value: item,
    label: item,
  }));
  return (
    <div className="w-full">
      {/*  IMPORTANT CHANGE HERE */}
      <form onSubmit={handleSubmit(handleDebouncedSubmit)}>
        <div className="flex items-start justify-center gap-5 px-2 sm:px-10 my-3 sm:my-10 text-black">
          <div className="w-full  sm:max-w-5xl bg-white shadow-lg rounded-2xl">
            <div className="bg-linear-to-r from-purple-900 via-purple-800 to-purple-900 gap-2 items-center justify-center py-3 rounded-2xl sm:rounded-full flex flex-col text-white">
              <h1 className="text-xl smtext-2xl font-semibold">
                Consultation Form
              </h1>
              <div className="flex flex-wrap items-center justify-between sm:gap-15 gap-1 px-4 text-xs font-extralight">
                <span className="border text-[10px] sm:text-base border-purple-700 bg-black/20 shadow-2xl px-4 py-1 rounded-full">
                  ✨Answers in 2 minutes
                </span>
                <span className="border text-[10px] sm:text-base border-purple-700 bg-black/20 shadow-2xl px-4 py-1 rounded-full">
                  🔒Your data is secure
                </span>
                <span className="border text-[10px] sm:text-base border-purple-700 bg-black/20 shadow-2xl px-4 py-1 rounded-full">
                  👨‍🔬Verified astrologers only
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 bg-purple-100 md:grid-cols-3 gap-4 p-6">
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <CustomInput
                    {...field}
                    label="Name"
                    placeholder="Enter your name here"
                    className="rounded-full text-sm border-gray-200 border bg-white focus:ring-purple-100  focus:ring-1 focus:outline-0 px-4 py-2"
                    error={errors.name?.message}
                    maxLength={150}
                    onChange={(e) => {
                      if (e.target.value.length <= 150) {
                        field.onChange(e);
                      }
                    }}
                  />
                )}
              />

              <div className="flex flex-col space-y-1">
                <label className="text-xs sm:text-sm font-semibold">
                  Contact Number
                </label>
                <div className="flex items-center gap-1">
                  <Controller
                    name="countryCode"
                    control={control}
                    render={({ field }) => <input type="hidden" {...field} />}
                  />
                  <Select
                    readOnly
                    className="w-28 sm:w-32 text-xs p-0 cursor-not-allowed opacity-70"
                    styles={selectStyles}
                    options={countries}
                    menuPortalTarget={
                      typeof window !== "undefined" ? document.body : null
                    }
                    menuPosition="fixed"
                    value={country}
                    getOptionValue={(option) => option.iso}
                    getOptionLabel={(option) => option.dialCode}
                  />

                  <Controller
                    name="phone"
                    control={control}
                    render={({ field }) => (
                      <CustomInput
                        {...field}
                        type="tel"
                        readOnly
                        placeholder="Enter your contact number here"
                        className="rounded-full text-sm border-gray-200 border bg-gray-100 px-4 py-2 cursor-not-allowed opacity-70"
                        error={errors.phone?.message}
                        maxLength={15}
                      />
                    )}
                  />
                </div>
              </div>

              <Controller
                name="usergender"
                control={control}
                render={({ field }) => (
                  <div className="space-y-1">
                    <label className="text-xs sm:text-sm font-semibold">
                      Gender
                    </label>

                    <Select
                      className="text-xs"
                      styles={selectStyles}
                      options={genderOptions}
                      menuPortalTarget={
                        typeof window !== "undefined" ? document.body : null
                      }
                      menuPosition="fixed"
                      value={
                        genderOptions.find((x) => x.value === field.value) ||
                        null
                      }
                      onChange={(option) => field.onChange(option.value)}
                    />

                    {errors.usergender && (
                      <p className="text-xs text-red-500">
                        {errors.usergender.message}
                      </p>
                    )}
                  </div>
                )}
              />

              <Controller
                name="dob"
                control={control}
                render={({ field }) => (
                  <div className="space-y-2">
                    <label className="text-xs sm:text-sm font-semibold">
                      Date of Birth
                    </label>

                    <div className="grid grid-cols-3 gap-3">
                      <Select
                        className="text-xs"
                        styles={selectStyles}
                        options={DAY_OPTIONS}
                        placeholder="Day"
                        menuPortalTarget={
                          typeof window !== "undefined" ? document.body : null
                        }
                        menuPosition="fixed"
                        value={DAY_OPTIONS.find(
                          (x) => x.value === field.value?.split("-")[2],
                        )}
                        onChange={(option) => {
                          const [, month, year] = (field.value || "--").split(
                            "-",
                          );

                          field.onChange(
                            `${year || ""}-${month || ""}-${option.value}`,
                          );
                        }}
                      />

                      <Select
                        className="text-xs"
                        styles={selectStyles}
                        options={MONTH_OPTIONS}
                        placeholder="Month"
                        menuPortalTarget={
                          typeof window !== "undefined" ? document.body : null
                        }
                        menuPosition="fixed"
                        value={MONTH_OPTIONS.find(
                          (x) => x.value === field.value?.split("-")[1],
                        )}
                        onChange={(option) => {
                          const [year, , day] = (field.value || "--").split(
                            "-",
                          );

                          field.onChange(
                            `${year || ""}-${option.value}-${day || ""}`,
                          );
                        }}
                      />

                      <Select
                        className="text-xs"
                        styles={selectStyles}
                        options={YEAR_OPTIONS}
                        placeholder="Year"
                        menuPortalTarget={
                          typeof window !== "undefined" ? document.body : null
                        }
                        menuPosition="fixed"
                        value={YEAR_OPTIONS.find(
                          (x) => x.value === field.value?.split("-")[0],
                        )}
                        onChange={(option) => {
                          const [, month, day] = (field.value || "--").split(
                            "-",
                          );

                          field.onChange(
                            `${option.value}-${month || ""}-${day || ""}`,
                          );
                        }}
                      />
                    </div>
                  </div>
                )}
              />

              {/* TIME */}
              <Controller
                name="time"
                control={control}
                render={({ field }) => (
                  <div className="space-y-2">
                    <label className="text-xs sm:text-sm font-semibold">
                      Time of Birth
                    </label>

                    <div className="grid grid-cols-2 gap-3">
                      <Select
                        className="text-xs"
                        styles={selectStyles}
                        options={HOUR_OPTIONS}
                        placeholder="Hour"
                        menuPortalTarget={
                          typeof window !== "undefined" ? document.body : null
                        }
                        menuPosition="fixed"
                        value={HOUR_OPTIONS.find(
                          (x) => x.value === field.value?.split(":")[0],
                        )}
                        onChange={(option) => {
                          const [, min] = (field.value || ":").split(":");

                          field.onChange(`${option.value}:${min || "00"}`);
                        }}
                      />

                      <Select
                        className="text-xs"
                        styles={selectStyles}
                        options={MINUTE_OPTIONS}
                        placeholder="Minute"
                        menuPortalTarget={
                          typeof window !== "undefined" ? document.body : null
                        }
                        menuPosition="fixed"
                        value={MINUTE_OPTIONS.find(
                          (x) => x.value === field.value?.split(":")[1],
                        )}
                        onChange={(option) => {
                          const [hour] = (field.value || ":").split(":");

                          field.onChange(`${hour || "00"}:${option.value}`);
                        }}
                      />
                    </div>
                  </div>
                )}
              />

              <Controller
                name="occupation"
                control={control}
                render={({ field }) => (
                  <div className="space-y-2">
                    <label className="text-xs sm:text-sm font-semibold">
                      Occupation
                    </label>
                    <Select
                      className="text-xs"
                      styles={selectStyles}
                      options={occupationOptions}
                      menuPortalTarget={
                        typeof window !== "undefined" ? document.body : null
                      }
                      menuPosition="fixed"
                      value={
                        occupationOptions.find(
                          (x) => x.value === field.value,
                        ) || null
                      }
                      onChange={(option) => field.onChange(option.value)}
                    />
                  </div>
                )}
              />

              <div className="md:col-span-2 ">
                <Controller
                  name="place"
                  control={control}
                  render={({ field }) => <input type="hidden" {...field} />}
                />

                <LocationSelector
                  onSelect={(loc) => {
                    setValue("place", loc?.city || "", {
                      shouldValidate: true,
                    });

                    setValue("latitude", loc?.latitude || "");
                    setValue("longitude", loc?.longitude || "");
                  }}
                />
                <Controller
                  name="latitude"
                  control={control}
                  render={({ field }) => <input type="hidden" {...field} />}
                />

                <Controller
                  name="longitude"
                  control={control}
                  render={({ field }) => <input type="hidden" {...field} />}
                />

                {errors.place && (
                  <p className="text-red-500 text-[10px]">
                    {errors.place.message}
                  </p>
                )}
              </div>

              <div className="md:col-span-3 text-center">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="sm:px-6 sm:py-2 px-3 py-1 text-xs sm:text-base bg-yellow-400 rounded-full disabled:opacity-50"
                >
                  {isSubmitting
                    ? "Please wait..."
                    : mode === "call"
                      ? "Start Call Now"
                      : "Start Chat Now"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>

      <div className="bg-linear-to-r from-purple-300 via-violet-400 to-purple-200 gap-2 items-center justify-center py-3 flex flex-col text-white">
        <div className="flex flex-col sm:flex-row  items-center text-black justify-between gap-1 sm:gap-15 text-sm font-semibold">
          <div className="flex items-center gap-3">
            {/* Avatar Stack */}
            <div className="flex  items-center">
              {users.map((user, index) => (
                <div
                  key={user.id}
                  className={`w-10 h-10 rounded-full border-2 border-white overflow-hidden 
                ${index !== 0 ? "-ml-3" : ""}`}
                >
                  <Image
                    src={user.img}
                    width={100}
                    height={100}
                    alt="user"
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}

              {/* Extra count */}
              <div className="-ml-3 w-10 h-10 flex items-center justify-center text-white rounded-full bg-gray-800 text-sm font-medium border-2 border-white">
                +500
              </div>
            </div>
          </div>
          <span className="  px-4 py-1 ">⭐⭐⭐⭐⭐ 4.9 (50k+ reviews)</span>
        </div>
      </div>

      <AlertLoading show={loading} title="Fetch Astrologer..." />
    </div>
  );
}
