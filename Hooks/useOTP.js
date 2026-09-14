"use client";

import { gql } from "@apollo/client";
import { useMutation } from "@apollo/client/react";
import { useState, useRef, useEffect } from "react";

const REQUEST_OTP = gql`
  mutation RequestOtp($countryCode: String!, $mobile: String!) {
    requestOtp(countryCode: $countryCode, mobile: $mobile) {
      message
    }
  }
`;

const AUTHWITH_OTP = gql`
  mutation AuthWithOtp($countryCode: String!, $mobile: String!, $otp: String!,$source: String!) {
    authWithOtp(
      countryCode: $countryCode
      mobile: $mobile
      otp: $otp
      source: $source
    ) {
      accessToken
      refreshToken
      hasName
      user {
        id
        name
      }
    }
  }
`;

export const useOTP = () => {
  const [step, setStep] = useState("PHONE"); 
  const [otp, setOtp] = useState(["", "", "", ""]);
  // const [countryCode, setCountryCode] = useState("+91");
  const [timer, setTimer] = useState(0);

  const timerRef = useRef(null);

  const [requestOtp, { loading: otpLoading }] = useMutation(REQUEST_OTP);

  const [verifyOtp, { loading: verifyLoading }] = useMutation(AUTHWITH_OTP);

  // Cosmetic timer only
  const startTimer = (seconds = 60) => {
    setTimer(seconds);

    clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const sendOtp = async (countryCode, mobile) => {
  try {

    const res = await requestOtp({
      variables: { countryCode, mobile },
    });


    if (res.data.requestOtp.message === "OTP sent successfully") {

      setStep("OTP");
      startTimer(60);

    } else {
      alert("Failed to send OTP");
    }
  } catch (err) {
    console.error("OTP Error:", err);
  }
};

  const confirmOtp = async (countryCode, mobile) => {
    const otpValue = otp.join("");

    if (!/^\d{4}$/.test(otpValue)) {
      throw new Error("Invalid OTP");
    }

    const res = await verifyOtp({
      variables: { countryCode, mobile, otp: otpValue, source: "WEB" },
    });

    clearInterval(timerRef.current);
    setTimer(0);
    setOtp(["", "", "", ""]);
    setStep("PHONE");

    return res.data.authWithOtp;
  };

  const resetOTP = () => {
    clearInterval(timerRef.current);
    setTimer(0);
    setOtp(["", "", "", ""]);
    setStep("PHONE");
  };

  // Safety cleanup
  useEffect(() => {
    return () => clearInterval(timerRef.current);
  }, []);

  return {
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
  };
};
