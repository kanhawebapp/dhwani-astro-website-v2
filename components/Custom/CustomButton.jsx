"use client";
import React, { useState, memo } from "react";
import { createPortal } from "react-dom";
import SignInModal from "../Homepagecomp/Signin/Signin";
import { useAuth } from "@/app/context/authContext";

const variantClasses = {
  purple:
    "bg-gradient-to-r from-purple-900 via-purple-800 to-purple-900 hover:bg-purple-600 text-white rounded-full ",
  green:
    "text-xs justify-end items-end bg-green-600 text-white md:px-4 md:py-2 px-3 py-2 rounded-full",
  redo: "text-xs justify-end items-end bg-red-500 text-white md:px-4 md:py-2 px-2 py-1 rounded-full",
  yellow:
    "text-xs justify-end items-end bg-yellow-500 text-white md:px-4 md:py-2 px-2 py-1 rounded-full",
};

function CustomButton({
  type = "button",
  onClick,
  className = "",
  children,
  variant,
  ...props
}) {
  const [showLogin, setShowLogin] = useState(false);

  const handleAuthClick = () => {
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    if (!storedUser?.id) {
      setShowLogin(true);
      return;
    }

    console.log("Calling original onClick");
    onClick?.();
  };

  return (
    <>
      <button
        type={type}
        onClick={handleAuthClick}
        {...props}
        className={` shadow ${variantClasses[variant]} ${className}`}
      >
        {children}
      </button>

      {showLogin &&
        createPortal(
          <div className="fixed inset-0 z-[99999999] flex items-center justify-center bg-black/40">
            <SignInModal onClose={() => setShowLogin(false)} />
          </div>,
          document.body,
        )}
    </>
  );
}

export default memo(CustomButton);
