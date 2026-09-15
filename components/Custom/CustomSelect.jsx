"use client";

import React, { forwardRef } from "react";

const variantClasses = {
  full: "w-full",
  half: "w-full md:w-1/2",
  third: "w-full md:w-1/3",
};

const CustomSelect = forwardRef(
  (
    {
      label,
      options = [],
      error,
      variant = "full",
      className = "",
      placeholder = "Select",
      ...props
    },
    ref
  ) => {
    return (
      <div className={`${variantClasses[variant]} flex flex-col gap-1`}>
        {label && (
          <label className="text-sm font-semibold text-gray-700">
            {label}
          </label>
        )}

        <div className="relative">
          <select
            ref={ref}
            className={`
              appearance-none
              w-full
              rounded-2xl
              border
              bg-white
              px-4
              py-3
              pr-10
              text-sm
              text-gray-700
              shadow-sm
              transition-all
              duration-200
              cursor-pointer
              outline-none

              ${
                error
                  ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                  : "border-purple-200 hover:border-purple-400 focus:border-purple-500 focus:ring-4 focus:ring-purple-100"
              }

              ${className}
            `}
            {...props}
          >
            <option value="" disabled>
              {placeholder}
            </option>

            {options.map((opt, index) => {
              const value =
                typeof opt === "object" ? opt.value : opt;
              const label =
                typeof opt === "object" ? opt.label : opt;

              return (
                <option key={index} value={value}>
                  {label}
                </option>
              );
            })}
          </select>

          {/* Custom Arrow */}
          <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-purple-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>

        {error && (
          <p className="text-xs text-red-500 pl-1">
            {error}
          </p>
        )}
      </div>
    );
  }
);

CustomSelect.displayName = "CustomSelect";

export default CustomSelect;