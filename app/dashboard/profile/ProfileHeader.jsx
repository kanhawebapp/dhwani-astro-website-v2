"use client";

import Image from "next/image";
import { FaCamera, FaPhoneAlt } from "react-icons/fa";
import { MdVerified } from "react-icons/md";
import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { gql } from "@apollo/client";
import { useMutation } from "@apollo/client/react";

const UPLOAD_PROFILE_IMAGE = gql`
  mutation UploadProfileImage($file: Upload!) {
    uploadProfileImage(file: $file) {
      success
      message
      url
      filename
      user {
        id
        profileImage
      }
    }
  }
`;

export default function ProfileHeader({ user, refetch }) {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const [uploadProfileImage] = useMutation(UPLOAD_PROFILE_IMAGE);

  const handleProfileImageChange = async (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    // ================= SIZE =================

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be less than 2MB.");
      e.target.value = "";
      return;
    }

    // ================= TYPE =================

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      toast.error("Only JPG, JPEG, PNG and WEBP images are allowed.");
      e.target.value = "";
      return;
    }

try {
  setUploading(true);

  const { data } = await uploadProfileImage({
    variables: {
      file,
    },
  });

  const result = data?.uploadProfileImage;

  if (!result?.success || !result?.url) {
    throw new Error(result?.message || "Profile image upload failed");
  }

  // ================= UPDATE LOCAL STORAGE =================

  const storedUser = localStorage.getItem("user");

  if (storedUser) {
    try {
      const parsedUser = JSON.parse(storedUser);

      const updatedUser = {
        ...parsedUser,
        profileImage: result.url,
      };

      localStorage.setItem("user", JSON.stringify(updatedUser));
    } catch (error) {
      console.error("Failed to update user in localStorage:", error);
    }
  }

  toast.success("Profile image updated successfully.");

  // Refresh user data
  if (refetch) {
    await refetch();
  } else {
    window.location.reload();
  }
} catch (error) {
  console.error("Profile image upload error:", error);

  toast.error(
    error?.graphQLErrors?.[0]?.message ||
      error?.message ||
      "Failed to update profile image.",
  );
}
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-violet-700 via-purple-700 to-fuchsia-600 p-px shadow-2xl">
      <div className="rounded-3xl bg-white/60">
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#d8b4fe55,transparent_35%),radial-gradient(circle_at_bottom_left,#c4b5fd55,transparent_35%)]" />

          <div className="relative flex flex-col gap-4 sm:gap-8 p-4 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="flex h-18 w-18 sm:h-28 sm:w-28 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-violet-100 shadow-xl">
                   <Image width={100} height={100} 
                  
                    src={user?.profileImage || "/ds-img/user2.webp"}
                    alt="Profile"
                  
                    className="object-cover"
                  />
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  className="hidden"
                  onChange={handleProfileImageChange}
                />
                <button
                  type="button"
                  disabled={uploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-1 right-1 flex h-5 w-5 cursor-pointer sm:h-9 sm:w-9 items-center justify-center rounded-full bg-violet-600 text-white shadow-lg hover:bg-violet-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? (
                    <span className="text-[10px] sm:text-sm">...</span>
                  ) : (
                    <FaCamera size={14} />
                  )}
                </button>
              </div>

              {/* ================= USER INFO ================= */}

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-3xl font-bold text-slate-900">
                    {user?.name || "User"}
                  </h1>

                  <MdVerified className="text-sky-500" size={24} />
                </div>

                <div className="mt-3 flex items-center gap-2 text-slate-600">
                  <FaPhoneAlt size={13} />

                  <span className="text-sm">
                    {user?.countryCode} {user?.mobile}
                  </span>
                </div>

                <p className="mt-2 text-xs text-slate-800">
                  Member since:{" "}
                  {user?.createdAt
                    ? new Date(Number(user.createdAt)).toLocaleDateString(
                        "en-IN",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        },
                      )
                    : "-"}
                </p>
              </div>
            </div>

            {/* ================= WALLET ================= */}

            <div className="flex w-full flex-wrap items-center gap-4">
              <div className="rounded-full w-full sm:rounded-2xl flex items-center justify-between gap-5 bg-violet-200 px-6 py-2 sm:py-4">
                <p className="text-xs uppercase tracking-widest text-slate-500">
                  Wallet Balance
                </p>

                <h2 className="mt-1 text-xl sm:text-3xl font-bold text-violet-700">
                  {user?.stats?.walletBalance || 0}
                </h2>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
