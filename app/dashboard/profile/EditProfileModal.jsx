"use client";

import { useEffect } from "react";
import {
  FaUser,
  FaPhoneAlt,
  FaVenusMars,
  FaBirthdayCake,
  FaClock,
  FaBriefcase,
  FaTimes,
} from "react-icons/fa";

export default function EditProfileModal({
  open,
  onClose,
  user,
  register,
  errors,
  handleSubmit,
  onSubmit,
  loading,
}) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-2 sm:p-4">
      <div className="w-full text-black max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}

        <div className="flex items-center justify-between border-b border-slate-200 px-7 py-5">
          <div>
            <h2 className="sm:text-2xl text-sm font-bold text-slate-900">
              Edit Profile
            </h2>

            <p className="mt-1 text-xs sm:text-sm text-slate-500">
              Update your personal information.
            </p>
          </div>

          <button
            onClick={onClose}
            className="flex sm:h-10 sm:w-10 h-8 w-8 items-center justify-center rounded-xl bg-slate-100 transition hover:bg-red-50 hover:text-red-600"
          >
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-5 sm:p-7 p-3 md:grid-cols-2">
            {/* Name */}

            <Input
              icon={<FaUser />}
              label="Full Name"
              placeholder="Enter full name"
              register={register("name")}
              error={errors.name?.message}
            />

            {/* Mobile */}

            <div>
              <label className="sm:mb-2 block sm:text-sm text-xs font-semibold text-slate-700">
                Mobile Number
              </label>

              <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-100 px-4 py-1 sm:py-3">
                <FaPhoneAlt className="text-slate-400" />

                <input
                  disabled
                  value={`${user?.countryCode || ""} ${user?.mobile || ""}`}
                  className="w-full bg-transparent text-slate-500 outline-none cursor-not-allowed"
                />
              </div>
            </div>

            {/* Gender */}

            <div>
              <label className="mb-1 sm:mb-2 block text-xs sm:text-sm font-semibold text-slate-700">
                Gender
              </label>

              <div className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-1 sm:py-3">
                <FaVenusMars className="text-violet-600" />

                <select
                  {...register("gender")}
                  className="w-full bg-transparent outline-none"
                >
                  <option value="">Select Gender</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              {errors.gender && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.gender.message}
                </p>
              )}
            </div>

            {/* Occupation */}

            <Input
              icon={<FaBriefcase />}
              label="Occupation"
              placeholder="Software Engineer"
              register={register("occupation")}
              error={errors.occupation?.message}
            />

            {/* Birth Date */}

            <Input
              type="date"
              max={new Date().toISOString().split("T")[0]}
              icon={<FaBirthdayCake />}
              label="Birth Date"
              register={register("birthDate")}
              error={errors.birthDate?.message}
            />

            {/* Birth Time */}

            <Input
              type="time"
              icon={<FaClock />}
              label="Birth Time"
              register={register("birthTime")}
              error={errors.birthTime?.message}
            />
          </div>

          {/* Footer */}

          <div className="flex justify-center gap-3 px-7 py-2 sm:py-5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border text-xs sm:text-sm border-slate-300 px-5 py-1 sm:py-2.5 font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Cancel
            </button>

            <button
              disabled={loading}
              className="rounded-xl bg-violet-600 px-6 text-xs sm:text-sm py-1 sm:py-2.5 font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Input({
  icon,
  label,
  register,
  error,
  type = "text",
  placeholder,
  max,
}) {
  return (
    <div>
      <label className="sm:mb-2 mb-1 block text-xs sm:text-sm font-semibold text-slate-700">
        {label}
      </label>

      <div className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-1 sm:py-3 transition focus-within:border-violet-500 focus-within:ring-4 focus-within:ring-violet-100">
        <span className="text-violet-600">{icon}</span>

        <input
          type={type}
          placeholder={placeholder}
          {...register}
          className="w-full bg-transparent outline-none"
        />
      </div>

      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}
