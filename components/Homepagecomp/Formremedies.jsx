"use client";

import { useState } from "react";
import Image from "next/image";
// import CustomButton from "../Custom/CustomButton";
import CustomInput from "../Custom/CustomInput";
import Kundlioth from "../Smcompo/Kundlioth";
// import Bestsell from "../Smcompo/Bestsell/Bestsell";
// import Sidebanner from "../Smcompo/Sidebanner";
// import Freereport from "../Smcompo/Freereport";
// import Recastro from "../Smcompo/Recastro";
import FAQue from "../FAQue";
import Callchatsec from "../Smcompo/Callchatsec";
import { useLanguage } from "@/app/context/LangContext";
import { createKundliAction } from "@/app/actions/createKundliAction";
import Select from "react-select";
import { useAuth } from "@/app/context/authContext";
import { useRouter } from "next/navigation";
import { ASTRO_CONTENT } from "./remedy-content/index";
import RemedyContent from "./RemedyContent";
import LocationSelector from "@/app/common/LocationSelector";
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
    minHeight: 40,
    borderRadius: 16,
    border: state.isFocused
      ? "1px solid rgba(147, 51, 234, 0.55)"
      : "1px solid rgba(255,255,255,0.75)",
    background: "rgba(255,255,255,0.58)",
    backdropFilter: "blur(14px)",
    WebkitBackdropFilter: "blur(14px)",
    boxShadow: state.isFocused
      ? "0 0 0 4px rgba(147,51,234,0.10), inset 0 1px 3px rgba(255,255,255,.8)"
      : "inset 0 1px 3px rgba(255,255,255,.9), 0 8px 20px rgba(88,45,120,.06)",
    cursor: "pointer",
    transition: "all .25s ease",

    "&:hover": {
      borderColor: "rgba(147,51,234,.45)",
    },
  }),

  menuList: (base) => ({
    ...base,
    maxHeight: 260,
    padding: 6,
  }),

  menu: (base) => ({
    ...base,
    borderRadius: 16,
    overflow: "hidden",
    background: "rgba(255,255,255,.96)",
    backdropFilter: "blur(15px)",
    boxShadow: "0 20px 50px rgba(55,30,80,.15)",
  }),

  placeholder: (base) => ({
    ...base,
    color: "#8b7b96",
  }),

  singleValue: (base) => ({
    ...base,
    color: "#34253d",
    fontWeight: 500,
  }),

  input: (base) => ({
    ...base,
    color: "#34253d",
  }),

  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? "#9333ea"
      : state.isFocused
        ? "#f3e8ff"
        : "#fff",
    color: state.isSelected ? "#fff" : "#34253d",
    cursor: "pointer",
    borderRadius: 10,
    margin: "2px 0",
    padding: "10px 12px",
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

const FORM_CONTENT = {
  gemfol: {
    title: "Gemstone Recommendation",
    subtitle: "Discover the right gemstone according to your birth details.",
    sideTitle: "Gemstone Astrology",
    sideDescription:
      "Get personalized gemstone recommendations based on your birth details.",
    heading: "Enter Your Birth Details",
    buttonText: "GET GEMSTONE RECOMMENDATION",
    image: "/ds-img/navratan.png",
  },

  pujafol: {
    title: "Puja & Anusthan",
    subtitle:
      "Discover the right Puja and Anusthan according to your birth details.",
    sideTitle: "Puja & Anusthan",
    sideDescription: "Get personalized Puja and Anusthan recommendations.",
    heading: "Enter Your Birth Details",
    buttonText: "GET PUJA RECOMMENDATION",
    image: "/ds-img/pujanew.png",
  },

  rudrafol: {
    title: "Rudraksha Recommendation",
    subtitle: "Find the right Rudraksha according to your birth details.",
    sideTitle: "Rudraksha",
    sideDescription:
      "Get personalized Rudraksha recommendations based on your birth details.",
    heading: "Enter Your Birth Details",
    buttonText: "GET RUDRAKSHA RECOMMENDATION",
    image: "/ds-img/rudranew.png",
  },

  lalkitab: {
    title: "Lal Kitab",
    subtitle: "Discover Lal Kitab remedies according to your birth details.",
    sideTitle: "Lal Kitab Astrology",
    sideDescription:
      "Get personalized Lal Kitab remedies and astrological guidance.",
    heading: "Lal Kitab Analysis",
    buttonText: "GET LAL KITAB REPORT",
    image: "/ds-img/laal.png",
  },

  kp: {
    title: "KP Astrology",
    subtitle: "Get personalized insights using KP Astrology.",
    sideTitle: "KP Astrology",
    sideDescription:
      "Enter your birth details to generate your KP Astrology analysis.",
    heading: "KP Astrology Analysis",
    buttonText: "GET KP REPORT",
    image: "/ds-img/kp.png",
  },

  manglik: {
    title: "Mangal Dosha",
    subtitle: "Check your Mangal Dosha according to your birth details.",
    sideTitle: "Mangal Dosha",
    sideDescription: "Analyze Mangal Dosha in your birth chart.",
    heading: "Mangal Dosha Analysis",
    buttonText: "CHECK MANGAL DOSHA",
    image: "/ds-img/mangal.png",
  },

  kalsharp: {
    title: "Kaal Sarp Dosha",
    subtitle: "Check your Kaal Sarp Dosha according to your birth details.",
    sideTitle: "Kaal Sarp Dosha",
    sideDescription: "Analyze Kaal Sarp Dosha in your birth chart.",
    heading: "Kaal Sarp Dosha Analysis",
    buttonText: "CHECK KAAL SARP DOSHA",
    image: "/ds-img/kaal sarp.png",
  },

  pitra: {
    title: "Pitra Dosha",
    subtitle: "Check your Pitra Dosha according to your birth details.",
    sideTitle: "Pitra Dosha",
    sideDescription: "Analyze Pitra Dosha in your birth chart.",
    heading: "Pitra Dosha Analysis",
    buttonText: "CHECK PITRA DOSHA",
    image: "/ds-img/pitra dosh.png",
  },

  sadesati: {
    title: "Sadhe Sati",
    subtitle: "Check your Sadhe Sati according to your birth details.",
    sideTitle: "Sadhe Sati",
    sideDescription:
      "Get your Sadhe Sati analysis based on your birth details.",
    heading: "Sadhe Sati Analysis",
    buttonText: "CHECK SADHE SATI",
    image: "/ds-img/sade sati.png",
  },

  numerokundali: {
    title: "Numerology Calculator",
    subtitle: "Discover insights through Numerology based on your details.",
    sideTitle: "Numerology",
    sideDescription:
      "Calculate personalized numerology insights from your details.",
    heading: "Numerology Calculator",
    buttonText: "CALCULATE NUMEROLOGY",
    image: "/ds-img/numerologycal.png",
  },

  nakform: {
    title: "Nakshatra Calculator",
    subtitle: "Discover your birth Nakshatra according to your birth details.",
    sideTitle: "Nakshatra",
    sideDescription:
      "Find your birth Nakshatra and related astrological insights.",
    heading: "Nakshatra Calculator",
    buttonText: "CALCULATE NAKSHATRA",
    image: "/ds-img/nakshatracal.png",
  },

  moonbio: {
    title: "Moon Bio",
    subtitle: "Discover your Moon-related astrological insights.",
    sideTitle: "Moon Bio",
    sideDescription:
      "Generate personalized Moon-related astrological insights.",
    heading: "Moon Bio Calculator",
    buttonText: "GET MOON BIO",
    image: "/ds-img/moonbio.png",
  },
};
const ANALYSIS_CONTENT = {
  gemfol: {
    title: "Analyzing Your Gemstone Profile",
    description:
      "We are studying your birth details to understand planetary influences and identify the gemstone traditionally associated with your chart.",
    steps: [
      "Calculating your birth chart",
      "Analyzing planetary influences",
      "Checking gemstone associations",
      "Preparing your personalized recommendation",
    ],
    icon: "💎",
  },

  rudrafol: {
    title: "Analyzing Your Rudraksha Profile",
    description:
      "We are analyzing your birth details to identify the Rudraksha traditionally associated with your astrological profile.",
    steps: [
      "Calculating your birth chart",
      "Analyzing planetary influences",
      "Checking Mukhi associations",
      "Preparing your personalized Rudraksha recommendation",
    ],
    icon: "📿",
  },

  pujafol: {
    title: "Preparing Your Puja Recommendation",
    description:
      "We are analyzing your birth details to prepare personalized traditional Puja and Anusthan guidance.",
    steps: [
      "Calculating your birth chart",
      "Analyzing planetary influences",
      "Checking traditional associations",
      "Preparing your personalized recommendation",
    ],
    icon: "🪔",
  },

  lalkitab: {
    title: "Analyzing Your Lal Kitab Profile",
    description:
      "We are analyzing your birth details and preparing your Lal Kitab based insights.",
    steps: [
      "Calculating your birth chart",
      "Analyzing planetary placements",
      "Checking house associations",
      "Preparing your personalized Lal Kitab report",
    ],
    icon: "🔮",
  },

  kp: {
    title: "Analyzing Your KP Astrology Profile",
    description:
      "We are processing your birth details to prepare your personalized KP Astrology analysis.",
    steps: [
      "Calculating your birth chart",
      "Analyzing planetary positions",
      "Processing KP indicators",
      "Preparing your personalized report",
    ],
    icon: "✨",
  },

  manglik: {
    title: "Analyzing Your Mangal Dosha",
    description:
      "We are analyzing your birth details to prepare your Mangal Dosha report.",
    steps: [
      "Calculating your birth chart",
      "Checking Mars placement",
      "Analyzing Dosha indicators",
      "Preparing your personalized report",
    ],
    icon: "🔴",
  },

  kalsharp: {
    title: "Analyzing Your Kaal Sarp Profile",
    description:
      "We are analyzing your birth chart to prepare your Kaal Sarp Dosha report.",
    steps: [
      "Calculating your birth chart",
      "Analyzing planetary positions",
      "Checking Rahu and Ketu axis",
      "Preparing your personalized report",
    ],
    icon: "☊",
  },

  pitra: {
    title: "Analyzing Your Pitra Dosha",
    description:
      "We are processing your birth details to prepare your Pitra Dosha analysis.",
    steps: [
      "Calculating your birth chart",
      "Analyzing planetary placements",
      "Checking traditional Dosha indicators",
      "Preparing your personalized report",
    ],
    icon: "🪔",
  },

  sadesati: {
    title: "Analyzing Your Sadhe Sati Profile",
    description:
      "We are analyzing your birth details to prepare your Sadhe Sati analysis.",
    steps: [
      "Calculating your birth chart",
      "Analyzing your Moon placement",
      "Checking Saturn's influence",
      "Preparing your personalized report",
    ],
    icon: "🪐",
  },

  numerokundali: {
    title: "Calculating Your Numerology Profile",
    description:
      "We are processing your details to prepare your personalized numerology insights.",
    steps: [
      "Processing your birth date",
      "Calculating numerological values",
      "Analyzing your numbers",
      "Preparing your personalized insights",
    ],
    icon: "🔢",
  },

  nakform: {
    title: "Calculating Your Nakshatra",
    description:
      "We are analyzing your birth details to determine your birth Nakshatra and related insights.",
    steps: [
      "Calculating your birth details",
      "Analyzing planetary positions",
      "Determining your Nakshatra",
      "Preparing your personalized report",
    ],
    icon: "🌙",
  },

  moonbio: {
    title: "Analyzing Your Moon Profile",
    description:
      "We are analyzing your birth details to prepare your personalized Moon-related insights.",
    steps: [
      "Calculating your birth chart",
      "Analyzing your Moon placement",
      "Processing astrological indicators",
      "Preparing your personalized report",
    ],
    icon: "🌙",
  },
};
export default function Formremedies({ slug }) {
  const { messages: t } = useLanguage();
  const router = useRouter();

  const { isLoggedIn, setShowLogin, setPendingRoute } = useAuth();
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [progress, setProgress] = useState(0);
  const content = FORM_CONTENT[slug] || FORM_CONTENT.gemfol;

  const pageContent = ASTRO_CONTENT[slug] || ASTRO_CONTENT.gemfol;
  const analysisContent = ANALYSIS_CONTENT[slug] || ANALYSIS_CONTENT.gemfol;
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
    if (!formData.name || !formData.day || !formData.month || !formData.year) {
      alert("Please enter your name and date of birth.");
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

    // -----------------------------
    // SHOW ANALYSIS MODAL
    // -----------------------------

    setProgress(0);
    setShowAnalysisModal(true);

    try {
      const startTime = Date.now();

      // Start actual calculation
      const resultPromise = createKundliAction(fd);

      // Random duration between 5 and 6 seconds
      const targetDuration = 5000 + Math.random() * 1000;

      // Progress animation
      await new Promise((resolve) => {
        const start = Date.now();

        const interval = setInterval(() => {
          const elapsed = Date.now() - start;
          const percentage = Math.min(
            Math.floor((elapsed / targetDuration) * 100),
            100,
          );

          setProgress(percentage);

          if (percentage >= 100) {
            clearInterval(interval);
            resolve();
          }
        }, 80);
      });

      // Make sure actual API calculation has finished
      await resultPromise;

      setProgress(100);

      // Small finishing delay
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (error) {
      console.error("Recommendation generation error:", error);

      setShowAnalysisModal(false);
      setProgress(0);

      // alert("Something went wrong while generating your report.");
    }
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
    <section className="relative w-full overflow-hidden bg-white text-[#24152d]">
      {showAnalysisModal && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/40 px-4 backdrop-blur-md">
          <div
            className="
        relative
        w-full
        max-w-[520px]
        overflow-hidden
        rounded-[30px]
        border
        border-white/80
        bg-white/95
        p-7
        shadow-[0_30px_100px_rgba(50,20,80,.25)]
        sm:p-10
      "
          >
            {/* Ambient glow */}
            <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-purple-300/30 blur-3xl" />

            <div className="pointer-events-none absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-pink-300/30 blur-3xl" />

            <div className="relative">
              <h2 className="mt-6 text-center text-2xl font-bold text-[#32143f] sm:text-3xl">
                {analysisContent.title}
              </h2>

              <p className="mx-auto mt-3 max-w-[420px] text-center text-sm leading-6 text-[#75677c] sm:text-base">
                Wait while we are analyzing your details and preparing your
                personalized recommendation.
              </p>

              <p className="mx-auto mt-3 max-w-[420px] text-center text-xs leading-5 text-[#95879d]">
                {analysisContent.description}
              </p>

              <div className="mt-8">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#6b5874]">
                    Analyzing your details
                  </span>

                  <span className="text-sm font-bold text-purple-600">
                    {progress}%
                  </span>
                </div>

                {/* Track */}
                <div className="h-3 w-full overflow-hidden rounded-full bg-purple-100">
                  <div
                    className="
                h-full
                rounded-full
                bg-gradient-to-r
                from-purple-600
                via-pink-500
                to-yellow-400
                transition-[width]
                duration-100
                ease-linear
              "
                    style={{
                      width: `${progress}%`,
                    }}
                  />
                </div>
              </div>

              {/* Processing steps */}
              <div className="mt-7 space-y-3">
                {analysisContent.steps.map((step, index) => {
                  const stepProgress =
                    ((index + 1) / analysisContent.steps.length) * 100;

                  const completed = progress >= stepProgress;

                  return (
                    <div key={step} className="flex items-center gap-3 text-sm">
                      <div
                        className={`
                    flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all duration-300
                    ${
                      completed
                        ? "bg-purple-600 text-white"
                        : "bg-purple-100 text-purple-400"
                    }
                  `}
                      >
                        {completed ? "✓" : index + 1}
                      </div>

                      <span
                        className={
                          completed ? "text-[#4c3157]" : "text-[#a395aa]"
                        }
                      >
                        {step}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Bottom text */}
              <div className="mt-8 rounded-2xl bg-purple-50/70 px-4 py-3 text-center">
                <p className="text-xs font-medium text-purple-700">
                  ✦ Please don't close this window
                </p>

                <p className="mt-1 text-[11px] text-purple-500/80">
                  Your personalized report is being prepared.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="
          absolute -left-32 top-20
          h-80 w-80
          rounded-full
          bg-pink-200/40
          blur-3xl
        "
        />

        <div
          className="
          absolute right-[-120px] top-40
          h-96 w-96
          rounded-full
          bg-yellow-200/45
          blur-3xl
        "
        />

        <div
          className="
          absolute left-[40%] top-[45%]
          h-72 w-72
          rounded-full
          bg-purple-200/25
          blur-3xl
        "
        />

        <div
          className="
          absolute left-[8%] top-[18%]
          h-3 w-3 rounded-full
          bg-purple-400/50
          shadow-[0_0_20px_rgba(147,51,234,.4)]
        "
        />

        <div
          className="
          absolute right-[12%] top-[18%]
          h-2 w-2 rounded-full
          bg-pink-400
          shadow-[0_0_20px_rgba(236,72,153,.5)]
        "
        />

        <div
          className="
          absolute right-[28%] bottom-[20%]
          h-3 w-3 rounded-full
          bg-yellow-400/60
        "
        />
      </div>

      <div className="relative mx-auto max-w-[1400px] px-4  sm:px-6 lg:px-10">
        <div
          className="
          relative
          overflow-hidden
          rounded-[30px]
          border border-white/70
          bg-gradient-to-br
          from-pink-100/85
          via-white/75
          to-yellow-100/90
          shadow-[0_25px_70px_rgba(80,40,100,.12)]
          backdrop-blur-xl
        "
        >
          {/* Decorative gradient */}
          <div
            className="
            absolute -right-20 -top-24
            h-72 w-72
            rounded-full
            bg-purple-300/20
            blur-3xl
          "
          />

          <div
            className="
            absolute -bottom-32 -left-20
            h-72 w-72
            rounded-full
            bg-yellow-300/25
            blur-3xl
          "
          />

          <div className="relative grid items-center gap-10 px-6 py-10 sm:px-10 lg:grid-cols-2 lg:px-14 lg:py-14">
            <div className="relative z-10">
              <div
                className="
                mb-5
                inline-flex
                items-center
                gap-2
                rounded-full
                border border-purple-200/70
                bg-white/60
                px-4 py-2
                text-xs font-semibold
                text-purple-700
                shadow-[inset_0_1px_2px_white,0_8px_20px_rgba(80,40,100,.06)]
                backdrop-blur-md
              "
              >
                <span
                  className="
                  h-2 w-2
                  rounded-full
                  bg-purple-500
                  shadow-[0_0_10px_rgba(147,51,234,.6)]
                "
                />
                Personalized Astrology
              </div>

              <h1
                className="
                max-w-[650px]
                text-xl
                font-bold
                leading-[1.08]
                tracking-tight
                text-[#2b1735]
                sm:text-4xl
              
              "
              >
                {content.title}
              </h1>

              <div
                className="
                mt-5
                h-1
                w-24
                rounded-full
                bg-gradient-to-r
                from-purple-800
                via-pink-800
                to-yellow-400
              "
              />

              <p
                className="
                mt-6
                max-w-[600px]
                text-base
                leading-7
                text-[#66576d]
                sm:text-lg
              "
              >
                {content.subtitle}
              </p>

              <p
                className="
                mt-4
                max-w-[570px]
                text-sm
                leading-6
                text-[#7b6d82]
              "
              >
                Enter your birth details to receive personalized astrological
                insights based on your date, time and place of birth.
              </p>

              <div
                className="
                mt-8
                grid
                max-w-[620px]
                grid-cols-3
                overflow-hidden
                rounded-2xl
                border border-white/70
                bg-white/45
                shadow-[inset_0_1px_4px_rgba(255,255,255,.9),0_15px_35px_rgba(70,35,90,.06)]
                backdrop-blur-xl
              "
              >
                <div className="px-3 py-4 text-center sm:px-5">
                  <div className="text-xl font-bold text-purple-700 sm:text-2xl">
                    7,000+
                  </div>

                  <div className="mt-1 text-[10px] text-[#75677c] sm:text-xs">
                    Calculations
                  </div>
                </div>

                <div
                  className="
                  border-x
                  border-purple-200/50
                  px-3 py-4
                  text-center
                  sm:px-5
                "
                >
                  <div className="text-xl font-bold text-purple-700 sm:text-2xl">
                    4.8/5
                  </div>

                  <div className="mt-1 text-[10px] text-[#75677c] sm:text-xs">
                    User Rating
                  </div>
                </div>

                <div className="px-3 py-4 text-center sm:px-5">
                  <div className="text-xl font-bold text-purple-700 sm:text-2xl">
                    100%
                  </div>

                  <div className="mt-1 text-[10px] text-[#75677c] sm:text-xs">
                    Personalized
                  </div>
                </div>
              </div>
            </div>

            <div className="relative z-10">
              <div
                className="
                absolute
                inset-4
                rounded-[32px]
                bg-purple-400/30
                blur-2xl
              "
              />

              <div
                className="
                relative
                overflow-hidden
                rounded-[30px]
                border-2 
                border-purple-200
                bg-white/45
                p-5
                shadow-[0_25px_70px_rgba(74,38,95,.16),inset_0_1px_2px_rgba(255,255,255,.95)]
                backdrop-blur-2xl
                sm:p-7
              "
              >
                <div
                  className="
                  pointer-events-none
                  absolute
                  left-0
                  right-0
                  top-0
                  h-24
                  bg-gradient-to-b
                  from-white/55
                  to-transparent
                "
                />

                <div className="relative mb-5 text-center">
                  <h2
                    className="
                    text-base
                    font-bold
                    text-[#3a1b4b]
                    sm:text-xl
                  "
                  >
                    {content.heading}
                  </h2>

                  <p className="mt-2 text-xs text-[#817187]">
                    Your details remain secure and are used only for your
                    personalized calculation.
                  </p>
                </div>

                <form
                  onSubmit={handleSubmit}
                  className="relative flex flex-col gap-5"
                 >
                  <div className="space-y-2">
                    <label className="ml-1 text-sm font-semibold text-[#38243f]">
                      Name
                    </label>

                    <CustomInput
                      name="name"
                      placeholder="Enter your name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="
                      rounded-2xl
                      border border-white/80
                      bg-white/60
                      py-2
                      px-4
                      text-[#38243f]
                      shadow-[inset_0_2px_5px_rgba(80,40,100,.04),0_8px_20px_rgba(80,40,100,.04)]
                      backdrop-blur-md
                      outline-none
                      transition-all
                      placeholder:text-[#9a8da0]
                      focus:border-purple-300
                      focus:ring-4
                      focus:ring-purple-300/15
                    "
                    />
                  </div>

                  {/* DATE OF BIRTH */}

                  <div className="space-y-2">
                    <label className="ml-1 text-sm font-semibold text-[#38243f]">
                      Date of Birth
                    </label>

                    <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
                      <Select
                        options={DAY_OPTIONS}
                        placeholder="Day"
                        styles={selectStyles}
                        menuPortalTarget={
                          typeof window !== "undefined" ? document.body : null
                        }
                        menuPosition="fixed"
                        value={DAY_OPTIONS.find(
                          (x) => x.value === formData.day,
                        )}
                        onChange={(option) =>
                          updateField("day", option?.value || "")
                        }
                      />

                      <Select
                        options={MONTH_OPTIONS}
                        placeholder="Month"
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
                        options={YEAR_OPTIONS}
                        placeholder="Year"
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

                  {/* TIME OF BIRTH */}

                  <div className="space-y-2">
                    <label className="ml-1 text-sm font-semibold text-[#38243f]">
                      Time of Birth
                    </label>

                    <div className="grid grid-cols-2 gap-3">
                      <Select
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

                  <div className="space-y-2">
                    <label className="ml-1 text-sm font-semibold text-[#38243f]">
                      Birth Place
                    </label>

                    <div
                      className="
                   
                      rounded-2xl
                      border
                      border-white/80
                      bg-white/55
                      shadow-[inset_0_2px_5px_rgba(80,40,100,.04),0_8px_20px_rgba(80,40,100,.04)]
                      backdrop-blur-md
                    "
                    >
                      <LocationSelector
                        placeholder="Search your birth place"
                        onSelect={handleLocationSelect}
                      />
                    </div>
                  </div>

                  {/* SUBMIT BUTTON */}

                  <button
                    type="submit"
                    className="
                    group                    
                    mt-2
                    w-full
                    overflow-hidden
                    rounded-full
                    cursor-pointer
                    border
                    border-white/50
                    bg-gradient-to-r
                    from-purple-600
                    via-purple-500
                    to-pink-500
                    px-6
                    py-4
                    text-sm
                    font-bold
                    tracking-wide
                    text-white
                    shadow-[0_14px_30px_rgba(126,34,206,.25),inset_0_1px_1px_rgba(255,255,255,.35)]
                    transition-all
                    duration-300
                    hover:-translate-y-0.5
                    hover:shadow-[0_18px_40px_rgba(126,34,206,.32)]
                    active:translate-y-0
                    sm:text-sm
                  "
                  >
                    <span
                      className="
                      absolute
                      inset-y-0
                      -left-full
                      w-1/2
                      skew-x-[-20deg]
                      bg-white/20
                      transition-all
                      duration-700
                      group-hover:left-[120%]
                    "
                    />

                    <span className="relative">{content.buttonText}</span>
                  </button>

                  <p className="text-center text-[11px] text-[#8a7a91]">
                    ✦ Personalized based on your birth details
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>

        <RemedyContent content={pageContent} />
        <div className="mt-10">
          <Kundlioth />
        </div>

        <div className="mt-10">
          <FAQue />
        </div>

        <Callchatsec />
      </div>
    </section>
  );
}
