"use client";

import {
  FaUser,
  FaPhoneAlt,
  FaBirthdayCake,
  FaBriefcase,
  FaVenusMars,
  FaClock,
  FaMapMarkerAlt,
} from "react-icons/fa";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import EditProfileModal from "./EditProfileModal";
import { UPDATE_USER_PROFILE } from "@/app/graphql/gqlQuery";
import { useMutation } from "@apollo/client/react";
import toast from "react-hot-toast";
const profileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Name must be at least 3 characters.")
    .max(60, "Maximum 60 characters.")
    .regex(/^[A-Za-z ]+$/, "Only alphabets are allowed."),

  gender: z.string().min(1, "Please select gender."),

  birthDate: z.string().min(1, "Birth date is required."),

  birthTime: z.string().min(1, "Birth time is required."),

  occupation: z.string().trim().max(80, "Maximum 80 characters."),

  birthPlace: z.string().trim().max(150, "Maximum 150 characters.").optional(),
});
export default function PersonalInfo({ user, refetch }) {
  const [openEdit, setOpenEdit] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      gender: "",
      birthDate: "",
      birthTime: "",
      occupation: "",
      birthPlace: "",
    },
  });
  const [updateProfile, { loading }] = useMutation(UPDATE_USER_PROFILE);
  const formatBirthDateForInput = (date) => {
  if (!date) return "";

  const value = String(date);

  // Unix timestamp in milliseconds
  if (/^\d+$/.test(value)) {
    return new Date(Number(value)).toISOString().split("T")[0];
  }

  // ISO date
  const parsedDate = new Date(date);

  if (isNaN(parsedDate.getTime())) {
    return "";
  }

  return parsedDate.toISOString().split("T")[0];
};
useEffect(() => {
  if (!openEdit || !user) return;

  reset({
    name: user.name || "",
    gender: user.gender || "",

    birthDate: formatBirthDateForInput(user.birthDate),

    birthTime: user.birthTime || "",
    occupation: user.occupation || "",
    birthPlace: user.birthPlace || "",
  });
}, [openEdit, user, reset]);
const formatBirthDate = (date) => {
  if (!date) return "-";

  const value = String(date);

  const parsedDate = /^\d+$/.test(value)
    ? new Date(Number(value))
    : new Date(value);

  if (isNaN(parsedDate.getTime())) {
    return "-";
  }

  return parsedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const birthDate = formatBirthDate(user?.birthDate);

  const onSubmit = async (data) => {
    try {
      await updateProfile({
        variables: {
          input: {
            name: data.name.trim(),
            gender: data.gender,
            birthDate: data.birthDate,
            birthTime: data.birthTime,
            occupation: data.occupation?.trim() || null,
            birthPlace: data.birthPlace?.trim() || null,
          },
        },
      });

      toast.success("Profile updated successfully.");

      setOpenEdit(false);

      refetch?.();
    } catch (error) {
      toast.error(
        error?.graphQLErrors?.[0]?.message ||
          error?.message ||
          "Failed to update profile.",
      );
    }
  };

  const details = [
    {
      icon: <FaUser />,
      label: "Full Name",
      value: user?.name || "-",
    },
    {
      icon: <FaPhoneAlt />,
      label: "Mobile Number",
      value: `${user?.countryCode || ""} ${user?.mobile || "-"}`,
    },
    {
      icon: <FaVenusMars />,
      label: "Gender",
      value: user?.gender || "-",
    },
    {
      icon: <FaBirthdayCake />,
      label: "Birth Date",
      value: birthDate,
    },

    {
      icon: <FaClock />,
      label: "Birth Time",
      value: user?.birthTime || "-",
    },
    {
      icon: <FaBriefcase />,
      label: "Occupation",
      value: user?.occupation || "-",
    },
    {
      icon: <FaMapMarkerAlt />,
      label: "Birth Place",
      value: user?.birthPlace || "-",
    },
  ];

  return (
    <div className="lg:col-span-2 rounded-3xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}

      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
        <div>
          <h2 className="text-sm sm:text-2xl font-bold text-slate-900">
            Personal Information
          </h2>

          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Manage your personal details.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpenEdit(true)}
          className="rounded-xl bg-violet-600 px-3 sm:px-5 sm:py-2 text-xs py-1 sm:text-sm font-semibold text-white transition hover:bg-violet-700"
        >
          Edit
        </button>
      </div>

      {/* Body */}

      <div className="grid gap-4 p-3 sm:p-6 md:grid-cols-2">
        {details.map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-2 sm:p-4 transition hover:border-violet-200 hover:bg-violet-50"
          >
            <div className="flex h-8 w-8 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white shadow-md">
              {item.icon}
            </div>

            <div>
              <p className="text-xs uppercase tracking-wider text-slate-500">
                {item.label}
              </p>

              <h3 className="mt-1 text-xs  sm:text-base font-semibold text-slate-900">
                {item.value}
              </h3>
            </div>
          </div>
        ))}
      </div>
      <EditProfileModal
        open={openEdit}
        onClose={() => setOpenEdit(false)}
        user={user}
        register={register}
        errors={errors}
        handleSubmit={handleSubmit}
        onSubmit={onSubmit}
        loading={loading}
      />
    </div>
  );
}
