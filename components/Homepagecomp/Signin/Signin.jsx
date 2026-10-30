"use client";

import Image from "next/image";
import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import PhoneInput from "./PhoneInput";

import { useOTP } from "@/Hooks/useOTP";
import { gql } from "@apollo/client";
import { useMutation } from "@apollo/client/react";
import { useAuth } from "@/app/context/authContext";
import { UPDATE_USER_PROFILE } from "@/app/graphql/gqlQuery";

const loadrx = (name) =>
  dynamic(() => import("react-icons/rx").then((mod) => mod[name]));

const RxCrossCircled = loadrx("RxCrossCircled");

const SignInModal = ({ onClose }) => {
  const { setUser } = useAuth();
  const router = useRouter();

  const {
    step,
    otp,
    setOtp,
    timer,
    otpLoading,
    verifyLoading,
    sendOtp,
    confirmOtp,
    resetOTP,
    setStep,
  } = useOTP();

  const [phoneData, setPhoneData] = useState({
    countryCode: "",
    mobile: "",
    isValid: false,
  });
  const [resetPhoneInput, setResetPhoneInput] = useState(0);
  const [existingUserName, setExistingUserName] = useState("");
  const [userName, setUserName] = useState("");

  const [updateProfile] = useMutation(UPDATE_USER_PROFILE);

  const { pendingRoute, setPendingRoute } = useAuth();

  useEffect(() => {
    const scrollY = window.scrollY;

    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";

    return () => {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      window.scrollTo(0, scrollY);
      resetOTP();
    };
  }, []);

  /* =============================
     SEND OTP
  ============================= */

  const handleGetOTP = async () => {
    try {
      if (!phoneData.mobile || !phoneData.countryCode || !phoneData.isValid) {
        return;
      }

      setOtp(["", "", "", ""]);
      await sendOtp(phoneData.countryCode, phoneData.mobile);

      setResetPhoneInput((prev) => prev + 1);

      toast.success("OTP sent successfully");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleVerifyOTP = async () => {
    try {
      const result = await confirmOtp(phoneData.countryCode, phoneData.mobile);
      localStorage.setItem("user", JSON.stringify(result.user));

      setUser(result.user);
      // setIsLoggedIn(true);

      if (result.hasName) {
        setExistingUserName(result.user.name);

        if (pendingRoute) {
          onClose();
          router.push(pendingRoute);
          setPendingRoute(null);
          return;
        }

        setStep("WELCOME");
      } else {
        setStep("NAME");
      }
    } catch (err) {
      toast.error(err.message);
      setOtp(["", "", "", ""]);
    }
  };

  /* =============================
     SAVE NAME
  ============================= */

  const handleSaveName = async () => {
    if (!userName.trim()) {
      toast.error("Please enter your name");
      return;
    }

    try {
      await updateProfile({
        variables: { input: { name: userName } },
      });

      // ✅ Update name in localStorage
      const updatedUser = {
        ...JSON.parse(localStorage.getItem("user") || "{}"),
        name: userName,
      };

      localStorage.setItem("user", JSON.stringify(updatedUser));

      setUser(updatedUser);

      if (pendingRoute) {
        onClose();
        router.push(pendingRoute);
        setPendingRoute(null);
        return;
      }

      onClose();
      router.refresh();
    } catch (err) {
      toast.error(err.message);
    }
  };

  /* =============================
     Auto close welcome popup
  ============================= */

  useEffect(() => {
    if (step === "WELCOME") {
      const t = setTimeout(() => {
        onClose();
        router.refresh();
      }, 3000);

      return () => clearTimeout(t);
    }
  }, [step]);

  /* =============================
     OTP INPUT HANDLING
  ============================= */

  const handleOtpChange = (e, index) => {
    const value = e.target.value.replace(/\D/g, "");

    const updated = [...otp];
    updated[index] = value;
    setOtp(updated);

    if (value && index < otp.length - 1) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        const prevInput = document.getElementById(`otp-${index - 1}`);
        prevInput?.focus();
      }
    }
    if (e.key === "Enter") {
      e.preventDefault();
      handleVerifyOTP();
    }
  };

  useEffect(() => {
    if (step === "OTP") {
      setTimeout(() => {
        document.getElementById("otp-0")?.focus();
      }, 100);
    }
  }, [step]);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center overflow-hidden justify-center z-[9999]">
      <div className="flex flex-col sm:w-full w-[90%] max-w-2xl overflow-hidden  text-black rounded-2xl shadow-lg ">
        <div className="relative sm:py-4 md:flex  items-center   justify-center bg-[#3f1069]">
          <span className="text-xl hidden sm:flex font-semibold text-white">
            Continue With Mobile
          </span>
          <RxCrossCircled
            onClick={onClose}
            className="text-white absolute right-1 sm:right-7 top-1 cursor-pointer text-xl"
          />
        </div>

        <div className="flex flex-col bg-white md:flex-row side-div">
          <div
            className="relative overflow-hidden text-white w-full sm:w-3/6 
  flex items-center justify-center px-6 py-6 sm:p-6
  bg-[#3f1069]"
          >
            <div className="absolute w-48 h-48 bg-purple-400/20 rounded-full blur-3xl -top-16 -left-16" />

            <div className="absolute w-48 h-48 bg-yellow-400/10 rounded-full blur-3xl -bottom-16 -right-16" />

            <div
              className="relative w-full flex flex-col items-center text-center
    px-5 py-8 sm:px-6 sm:py-8
    rounded-3xl
    bg-white/[0.10]
    backdrop-blur-xl
    border border-white/20
    shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),0_15px_40px_rgba(0,0,0,0.25)]"
            >
              <div
                className="w-30 h-15 flex items-center justify-center
      rounded-2xl mb-7
     
    "
              >
                <Image
                  src="/ds-img/logo.webp"
                  alt="Dhwani Astro Logo"
                  width={100}
                  height={100}
                  className="object-contain"
                />
              </div>

              <h2 className="text-xl sm:text-sm font-bold tracking-wide">
                Welcome to Dhwani Astro
              </h2>

              <div className="w-12 h-[2px] bg-yellow-400 rounded-full my-4" />

              <p className="text-sm text-yellow-300 font-serif italic tracking-wide">
                Unlock your destiny with Dhwani Astro
              </p>
              {/* 
              <p className="text-xs text-white/60 mt-5 leading-relaxed">
                Discover guidance, clarity and cosmic wisdom
              </p> */}
            </div>
          </div>
          <div
            className="relative overflow-hidden text-white  sm:w-3/6 
  flex items-center justify-center
  bg-[#3f1069]"
          >
            <div className="absolute w-48 h-48 bg-purple-400/20 rounded-full blur-3xl -top-16 -left-16" />

            <div className="absolute w-48 h-48 bg-yellow-400/10 rounded-full blur-3xl -bottom-16 -right-16" />
            <div
              className="w-full h-full flex flex-col items-center justify-center  gap-4     bg-white/20
    backdrop-blur-xl
    border border-white/20
    shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),0_15px_40px_rgba(0,0,0,0.25)]"
            >
              {step === "PHONE" && (
                <>
                  <PhoneInput
                    onChange={setPhoneData}
                    resetTrigger={resetPhoneInput}
                    handleKeyEnter={(e) => {
                      if (e.key === "Enter") {
                        handleGetOTP();
                      }
                    }}
                  />
                  <button
                    onClick={handleGetOTP}
                    disabled={otpLoading || !phoneData.isValid}
                    className="sm:w-[50%] w-[40%] py-1 text-sm sm:text-md font-semibold cursor-pointer hover:scale-103 bg-yellow-400 text-black sm:py-2 rounded-full disabled:cursor-not-allowed disabled:opacity-50 "
                  >
                    {otpLoading ? "Sending OTP..." : "GET OTP"}
                  </button>
                </>
              )}

              {step === "OTP" && (
                <>
                  <div className="flex gap-3">
                    {otp.map((digit, index) => (
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        autoComplete="one-time-code"
                        disabled={timer === 0}
                        id={`otp-${index}`}
                        key={index}
                        maxLength="1"
                        value={digit}
                        onChange={(e) => handleOtpChange(e, index)}
                        onKeyDown={(e) => handleOtpKeyDown(e, index)}
                        className="w-12 h-12 rounded-xl  text-center border bg-white/60 border-gray-400"
                      />
                    ))}
                  </div>

                  <button
                    onClick={handleVerifyOTP}
                    disabled={verifyLoading || timer === 0}
                    className="w-[40%] sm:w-[70%] bg-yellow-400 text-xs sm:text-base py-2 rounded-full"
                  >
                    {verifyLoading ? "Verifying..." : "Verify OTP"}
                  </button>

                  {timer > 0 ? (
                    <p className="text-xs sm:text-sm text-gray-500">
                      Resend OTP in {timer}s
                    </p>
                  ) : (
                    <button
                      className="text-sm text-purple-700 underline cursor-pointer"
                      onClick={handleGetOTP}
                    >
                      Resend OTP
                    </button>
                  )}
                </>
              )}

              {step === "NAME" && (
                <>
                  <h2 className="text-xl font-bold mb-4">
                    Welcome ✨ Please Enter Your Name
                  </h2>

                  <input
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full border p-2 rounded"
                    placeholder="Your Name"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleSaveName();
                      }
                    }}
                  />

                  <button
                    onClick={handleSaveName}
                    className="w-[70%] bg-yellow-400 py-2 rounded-full"
                  >
                    Continue
                  </button>
                </>
              )}

              {step === "WELCOME" && (
                <>
                  <h2 className="text-xl font-bold text-purple-700">
                    Welcome Back ✨
                  </h2>
                  <p className="text-lg mt-2">{existingUserName}</p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignInModal;
