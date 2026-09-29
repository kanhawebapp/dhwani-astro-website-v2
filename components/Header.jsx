"use client";

import { useState, useEffect, useContext } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useMutation } from "@apollo/client/react";
import { gql } from "@apollo/client";

import client from "@/utils/apolloClient";
import LanguageSwitcher from "../components/Custom/LangSwitcher";
import { useLanguage } from "../app/context/LangContext";
import { AuthContext } from "@/app/context/authContext";

const LOGOUT_MUTATION = gql`
  mutation Logout {
    logout
  }
`;

export default function Header({ openSignInModal }) {
  const { user, setUser, isLoggedIn } = useContext(AuthContext);
  const { messages: t } = useLanguage();

  const router = useRouter();

  const [isUserOpen, setIsUserOpen] = useState(false);

  const [logoutMutation, { loading: logoutLoading }] =
    useMutation(LOGOUT_MUTATION);

  const LogOut = async () => {
    const storedUser = localStorage.getItem("user");

    // If user is not stored locally, clear state and redirect
    if (!storedUser) {
      setUser(null);
      router.replace("/");
      return;
    }

    try {
      const result = await logoutMutation();

      if (result?.data?.logout) {
        toast.success("Logged out successfully");
      } else {
        toast.error("Logout failed");
      }
    } catch (err) {
      if (
        err?.message?.includes("Unauthorized") ||
        err?.graphQLErrors?.[0]?.message === "Unauthorized"
      ) {
        toast.error("Session expired. Please login again.");
      } else {
        toast.error("Logout failed");
      }
    } finally {
      localStorage.removeItem("user");
      setUser(null);

      await client.clearStore();

      router.replace("/");
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      const dropdown = document.querySelector(".user-container");

      if (dropdown && !dropdown.contains(event.target)) {
        setIsUserOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  return (
    <header
      className="
        z-50
        flex
        items-center
        justify-between
        w-full
        p-1
        px-2
        shadow-lg
        head-top
        bg-gradient-to-r
        from-purple-900
        via-purple-800
        to-purple-900
        md:px-18
      "
    >
      {/* Logo */}
      <div className="w-1/3 ml-8 dslogo sm:w-1/2 sm:ml-0">
        <Link
          href="/"
          aria-label="Dhwani Astro - Online Astrology Consultation"
        >
          <Image
            src="/ds-img/logo.webp"
            width={160}
            height={40}
            alt="Dhwani Astro - Online Astrology Consultation"
            className="w-25 sm:w-37"
            sizes="(max-width: 640px) 100px, 160px"
          />
        </Link>
      </div>

      {/* Main Navigation */}
      <nav
        aria-label="Main navigation"
        className="flex items-center justify-end gap-2 sm:gap-4"
      >
        {/* Language */}
        <LanguageSwitcher />

        {/* Blog */}
        <Link
          href="/blogs"
          className="
            flex
            items-center
            text-[9px]
            sm:text-[10px]
            px-2
            sm:px-3
            sm:py-1
            sm:text-sm
            bg-[#f5f5a8]
            text-black
            rounded-full
            cursor-pointer
            transition-all
            hover:bg-[#f5e78a]
          "
        >
          Blog
        </Link>

        {/* Login */}
        {!isLoggedIn && (
          <button
            type="button"
            onClick={openSignInModal}
            aria-label="Sign in to Dhwani Astro"
            className="
              px-2
              py-1
              cursor-pointer
              text-[10px]
              sm:text-sm
              sm:font-medium
              rounded-full
              bg-[#b92c3a]
              text-[#FFD70a]
            "
          >
            {t?.header?.signIn || "Sign In"}
          </button>
        )}

        {/* Logged-in User */}
        {isLoggedIn && (
          <div
            className="relative user-container"
            onMouseEnter={() => setIsUserOpen(true)}
            onMouseLeave={() => setIsUserOpen(false)}
          >
            <button
              type="button"
              onClick={() => setIsUserOpen((prev) => !prev)}
              aria-label="Open user account menu"
              aria-expanded={isUserOpen}
              aria-haspopup="menu"
              className="flex items-center gap-2 pe-1"
            >
              <Image
                className="w-7 h-auto rounded-full sm:w-10"
                src={user?.profileImage || "/ds-img/user2.webp"}
                alt={
                  user?.name
                    ? `${user.name} profile`
                    : "Dhwani Astro user profile"
                }
                width={40}
                height={40}
                sizes="40px"
              />
            </button>

            {isUserOpen && (
              <div
                className="
                  absolute
                  -right-2
                  sm:-right-15
                  top-full
                  p-2
                  bg-purple-800
                  w-40
                  sm:w-55
                  rounded-2xl
                  shadow-2xl
                  border
                  border-gray-600
                  z-50
                  overflow-hidden
                "
                role="menu"
                aria-label="User account menu"
              >
                {/* User Information */}
                <div
                  className="
                    flex
                    items-center
                    gap-3
                    sm:px-3
                    sm:py-2
                    shadow-2xl
                    bg-purple-500
                    rounded-full
                  "
                >
                  <Image
                    className="w-7 h-auto rounded-full sm:w-10"
                    src={user?.profileImage || "/ds-img/user2.webp"}
                    alt={
                      user?.name
                        ? `${user.name} profile`
                        : "Dhwani Astro user profile"
                    }
                    width={40}
                    height={40}
                    sizes="40px"
                  />

                  <div>
                    <h3 className="sm:font-semibold text-xs sm:text-sm text-white">
                      {user?.name || "User"}
                    </h3>
                  </div>
                </div>

                {/* Dashboard Menu */}
                <div className="py-2 space-y-2">
                  <div
                    className="
                      flex
                      bg-violet-300
                      rounded-xl
                      sm:px-2
                      sm:py-2
                      gap-1
                      flex-col
                      sm:gap-2
                    "
                  >
                    <Link
                      href="/dashboard/profile"
                      onClick={() => setIsUserOpen(false)}
                      role="menuitem"
                      className="
                        flex
                        items-center
                        text-xs
                        sm:text-sm
                        sm:font-medium
                        gap-3
                        px-4
                        py-1
                        text-gray-700
                        hover:bg-gray-100
                        rounded-full
                      "
                    >
                      👤 Profile
                    </Link>

                    <Link
                      href="/dashboard/chat-history"
                      onClick={() => setIsUserOpen(false)}
                      role="menuitem"
                      className="
                        flex
                        items-center
                        text-xs
                        sm:text-sm
                        sm:font-medium
                        gap-3
                        px-4
                        py-1
                        text-gray-700
                        hover:bg-gray-100
                        rounded-full
                      "
                    >
                      💬 Chat History
                    </Link>

                    <Link
                      href="/dashboard/call-history"
                      onClick={() => setIsUserOpen(false)}
                      role="menuitem"
                      className="
                        flex
                        items-center
                        text-xs
                        sm:text-sm
                        sm:font-medium
                        gap-3
                        px-4
                        py-1
                        text-gray-700
                        hover:bg-gray-100
                        rounded-full
                      "
                    >
                      📞 Call History
                    </Link>

                    <Link
                      href="/dashboard/myfollowing"
                      onClick={() => setIsUserOpen(false)}
                      role="menuitem"
                      className="
                        flex
                        items-center
                        text-xs
                        sm:text-sm
                        sm:font-medium
                        gap-3
                        px-4
                        py-1
                        text-gray-700
                        hover:bg-gray-100
                        rounded-full
                      "
                    >
                      ✨ My Following
                    </Link>

                    <Link
                      href="/dashboard/transaction"
                      onClick={() => setIsUserOpen(false)}
                      role="menuitem"
                      className="
                        flex
                        items-center
                        text-xs
                        sm:text-sm
                        sm:font-medium
                        gap-3
                        px-4
                        py-1
                        text-gray-700
                        hover:bg-gray-100
                        rounded-full
                      "
                    >
                      🛒 Transaction
                    </Link>

                    <Link
                      href="/dashboard/my-services"
                      onClick={() => setIsUserOpen(false)}
                      role="menuitem"
                      className="
                        flex
                        items-center
                        text-xs
                        sm:text-sm
                        sm:font-medium
                        gap-3
                        px-4
                        py-1
                        text-gray-700
                        hover:bg-gray-100
                        rounded-full
                      "
                    >
                      ✨ My Services
                    </Link>
                  </div>

                  {/* Logout */}
                  <button
                    type="button"
                    onClick={LogOut}
                    disabled={logoutLoading}
                    aria-label={
                      logoutLoading
                        ? "Signing out"
                        : "Sign out from Dhwani Astro"
                    }
                    className="
                      px-6
                      py-1
                      w-fit
                      cursor-pointer
                      justify-self-center
                      text-xs
                      sm:text-sm
                      hover:scale-105
                      bg-red-500
                      text-center
                      flex
                      justify-center
                      rounded-full
                      text-white
                      hover:bg-red-400
                      disabled:opacity-50
                      disabled:cursor-not-allowed
                    "
                  >
                    {logoutLoading
                      ? "Signing Out..."
                      : t?.header?.signOut || "Sign Out"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}