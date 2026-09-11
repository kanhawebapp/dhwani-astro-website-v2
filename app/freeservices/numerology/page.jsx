"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import CustomButton from "@/components/Custom/CustomButton";
import useScrollZoom from "@/Hooks/scrollZoom";
import CustomInput from "@/components/Custom/CustomInput";
// import Freereport from "@/components/Smcompo/Freereport";
// import Recastro from "@/components/Smcompo/Recastro";
import FAQue from "@/components/FAQue";
import Callchatsec from "@/components/Smcompo/Callchatsec";
import Select from "react-select";
import { useAuth } from "@/app/context/authContext";
import { createKundliHash } from "@/utils/kundliHash";

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

const selectStyles = {
  control: (base, state) => ({
    ...base,
    minHeight: 54,
    borderRadius: 18,
    borderColor: state.isFocused ? "#9333ea" : "#ddd6fe",
    boxShadow: state.isFocused
      ? "0 0 0 4px rgba(147,51,234,.15)"
      : "0 4px 14px rgba(0,0,0,.06)",
    cursor: "pointer",
    paddingLeft: 6,
    transition: "all .2s ease",
    "&:hover": {
      borderColor: "#9333ea",
    },
  }),

  menu: (base) => ({
    ...base,
    borderRadius: 16,
    overflow: "hidden",
    zIndex: 9999,
  }),

  option: (base, state) => ({
    ...base,
    padding: 12,
    cursor: "pointer",
    backgroundColor: state.isSelected
      ? "#9333ea"
      : state.isFocused
        ? "#f3e8ff"
        : "#fff",
    color: state.isSelected ? "#fff" : "#374151",
  }),

  indicatorSeparator: () => ({
    display: "none",
  }),

  dropdownIndicator: (base) => ({
    ...base,
    color: "#9333ea",
  }),
};

export default function Numerohome() {
  useScrollZoom(".head-wrap");
  const [formData, setFormData] = useState({
    name: "",
    day: "",
    month: "",
    year: "",
  });
  const { isLoggedIn, setShowLogin, setPendingRoute } = useAuth();
  const updateField = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleReset = () => {
    setFormData({
      name: "",
      day: "",
      month: "",
      year: "",
      type: "Cheiro / Chaldean",
    });
  };

  const router = useRouter();
  const handleSubmit = (e) => {
    e.preventDefault();

    const hash = createKundliHash(formData);

    const route = `/freeservices/kundali/getKundaliPage/numerokundli?hash=${hash}`;

    if (!isLoggedIn) {
      setPendingRoute(route);
      setShowLogin(true);
      return;
    }

    router.push(route);
  };

  return (
    <section className="kundli-main-page py-5">
      <div className="kundli-page w-full md:max-w-7xl  justify-self-center flex flex-col gap-5 items-center justify-center ">
        <div className="text-black md:p-5 head-wrap bg-linear-to-r from-pink-100 to-yellow-100 shadow-lg rounded-lg p-5">
          <h5 className="text-[#2f1254] text-xl sm:text-2xl text-center font-semibold">
            • About <strong>Numerology</strong> •
          </h5>
          <p className="horo-p-mob text-black text-sm">
            The divine technique of evaluating many parts of one's life and
            predicting the future using numbers is known as numerology. It
            basically builds a link between the frequency of these numbers and
            certain events that happen to a person. It also correlates numbers
            with English alphabets in order to decipher their numerological
            meaning and the impact of one's name, address, and other personal
            information on one's life.
          </p>
          <p className="horo-p-mob text-black text-sm">
            Everything in the Universe that occupies space has a frequency that
            can be measured in numbers. Finding out your governing number,
            destiny number, and life path number are all powerful numbers that
            can help you determine your fate. With the best Numerology
            predictions and expert counsel of our renowned Numerologists, you
            may eliminate the negative effects of any impediment in your path
            and live a beautiful life.
          </p>
        </div>

        <div className="kundli-sec-side-item w-full  flex flex-col">
          <div className="text-black w-[60%] head-wrap mx-auto mt-2 p-4 bg-purple-100 border-1 border-purple-300 shadow-xl rounded-2xl">
            <h2 className="text-xl md:text-2xl text-center font-semibold mb-6">
              Get Ruling Number Predictions 2
            </h2>
            <form onSubmit={handleSubmit}>
              <CustomInput
                label="Name"
                type="text"
                name="name"
                placeholder="Enter Your Name "
                value={formData.name}
                onChange={handleChange}
                bgredcolor="bg-purple-50"
                className="border border-gray-300 py-2 px-5 bg-white/90 placeholder:text-gray-600 rounded-full focus:outline-none focus:ring focus:border-purple-100 "
                required
                // error={formData.name === '' ? 'Name is required' : ''}
              />

              <div className="my-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Date of Birth
                </label>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Select
                    className="z-500"
                    options={DAY_OPTIONS}
                    placeholder="📅 Day"
                    styles={selectStyles}
                    value={DAY_OPTIONS.find((x) => x.value === formData.day)}
                    onChange={(option) =>
                      updateField("day", option?.value || "")
                    }
                    menuPortalTarget={
                      typeof document !== "undefined"
                        ? document.body
                        : undefined
                    }
                    menuPosition="fixed"
                    menuPlacement="auto"
                  />

                  <Select
                    className="z-11"
                    options={MONTH_OPTIONS}
                    placeholder="🗓 Month"
                    styles={selectStyles}
                    value={MONTH_OPTIONS.find(
                      (x) => x.value === formData.month,
                    )}
                    onChange={(option) =>
                      updateField("month", option?.value || "")
                    }
                    menuPortalTarget={
                      typeof document !== "undefined"
                        ? document.body
                        : undefined
                    }
                    menuPosition="fixed"
                    menuPlacement="auto"
                  />

                  <Select
                    className="z-11"
                    options={YEAR_OPTIONS}
                    placeholder="📆 Year"
                    styles={selectStyles}
                    value={YEAR_OPTIONS.find((x) => x.value === formData.year)}
                    onChange={(option) =>
                      updateField("year", option?.value || "")
                    }
                    menuPortalTarget={
                      typeof document !== "undefined"
                        ? document.body
                        : undefined
                    }
                    menuPosition="fixed"
                    menuPlacement="auto"
                  />
                </div>
              </div>

              <div className="flex space-x-4 justify-center">
                <CustomButton
                  aria-label="Submit Ruling Number Predictions"
                  type="submit"
                  variant={"purple"}
                  className="p-2"
                >
                  SUBMIT
                </CustomButton>
                <CustomButton
                  aria-label="Reset Ruling Number Predictions"
                  type="button"
                  onClick={handleReset}
                  variant={"purple"}
                  className="p-2"
                >
                  RESET
                </CustomButton>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* <Freereport /> */}
      {/* <Recastro /> */}
      <FAQue />
      <Callchatsec />
    </section>
  );
}
