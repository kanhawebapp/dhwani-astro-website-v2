"use client";

import { useState, useEffect, useContext } from "react";
import Image from "next/image";
import Link from "next/link";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { persistor } from "../app/redux/store";
import { resetPaymentStatus } from "../app/redux/reducer/auth/userSlice";
import toast from "react-hot-toast";
import { useQuery, useMutation } from "@apollo/client/react";
import { gql } from "@apollo/client";
import client from "@/utils/apolloClient";
import LanguageSwitcher from "../components/Custom/LangSwitcher";
import { useLanguage } from "../app/context/LangContext";
import { AuthContext } from "@/app/context/authContext";
import CustomButton from "./Custom/CustomButton";
const LOGOUT_MUTATION = gql`
  mutation Logout {
    logout
  }
`;

export default function Header({ openSignInModal }) {
  const { user, setUser, isLoggedIn, setIsLoggedIn } = useContext(AuthContext);
  const { messages: t } = useLanguage();

  const router = useRouter();
  const dispatch = useDispatch();
  const [isUserOpen, setIsUserOpen] = useState(false);

  const [logoutMutation, { loading: logoutLoading }] =
    useMutation(LOGOUT_MUTATION);
  const LogOut = async () => {
    const storedUser = localStorage.getItem("user");

    // Agar user hi nahi hai to seedha logout state clear
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
      // Agar cookie expire ho gayi hai to backend Unauthorized dega
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
      await persistor.purge();

      router.replace("/");
    }
  };
// console.log("xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", user)
  useEffect(() => {
    const handleClickOutside = (event) => {
      const dropdown = document.querySelector(".user-container");
      if (dropdown && !dropdown.contains(event.target)) setIsUserOpen(false);
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <header className="z-50 flex items-center justify-between w-full p-1 px-2 shadow-lg head-top bg-gradient-to-r from-purple-900 via-purple-800 to-purple-900 md:px-18">
      <div className="w-1/3 ml-8 dslogo sm:w-1/2 sm:ml-0">
        <Link href="/">
          <Image
            src="/ds-img/logo.webp"
            width={160}
            height={40}
            alt="Logo"
            className="w-25  sm:w-37"
            priority
          />
        </Link>
      </div>

      <div className="items-center    justify-end sm:gap-4 flex gap-2 sm:gap-2 ">
        <LanguageSwitcher />

        <Link
          href="/blogs"
          className="flex items-center text-[9px] sm:text-[10px] px-2 blog-btn sm:px-3 sm:py-1 bg-[#f5f5a8] cursor-pointer sm:text-sm text-black rounded-full transition-all hover:bg-[#f5e78a]"
        >
          Blog
        </Link>

        {!isLoggedIn && (
          <button
            onClick={openSignInModal}
            className="px-2 py-1 cursor-pointer text-[10px] sm:text-sm sm:font-medium rounded-full bg-[#b92c3a] text-[#FFD70a]"
          >
            {t?.header?.signIn || "Sign In"}
          </button>
        )}
        {isLoggedIn && (
          <div
            className="relative user-container"
            onMouseEnter={() => setIsUserOpen(true)}
            onMouseLeave={() => setIsUserOpen(false)}
          >
            <button className="flex pe-1 items-center gap-2">
              <Image
                className="w-7 h-auto rounded-full sm:w-10"
                src={user?.profileImage || "/ds-img/user2.webp"}
                alt="Profile"
                width={40}
                height={40}
              />

              {/* <span className="text-white">{user?.name}</span> */}
            </button>

            {isUserOpen && (
              <div className="absolute -right-2 sm:-right-15 top-full p-2 bg-purple-800 w-40  sm:w-55 rounded-2xl  shadow-2xl border border-gray-600 z-50 overflow-hidden">
                <div className="flex items-center gap-3 sm:px-3 sm:py-2 shadow-2xl bg-purple-500 rounded-full ">
               <Image
                className="w-7 h-auto rounded-full sm:w-10"
                src={user?.profileImage || "/ds-img/user2.webp"}
                alt="Profile"
                width={40}
                height={40}
              />

                  <div>
                    <h3 className="sm:font-semibold text-xs sm:text-sm  text-white">
                      {user?.name || "User"}
                    </h3>
                  </div>
                </div>

                {/* MENU */}
                <div className="py-2 space-y-2">
                  <div className="flex bg-violet-300 rounded-xl sm:px-2 sm:py-2 gap-1 flex-col sm:gap-2">
                    <Link
                      onClick={() => setIsUserOpen(false)}
                      href="/dashboard/profile"
                      className="flex items-center text-xs sm:text-sm sm:font-medium gap-3 px-4 py-1 text-gray-700 hover:bg-gray-100 rounded-full"
                    >
                      👤 Profile
                    </Link>
                    {/* 
                    <Link
                      href="/dashboard/account"
                      className="flex items-center text-xs sm:text-sm sm:font-medium gap-3 px-4 py-1 text-gray-700 hover:bg-gray-100 rounded-full"
                    >
                      🪪 Account
                    </Link> */}

                    <Link
                      onClick={() => setIsUserOpen(false)}
                      href="/dashboard/chat-history"
                      className="flex items-center  text-xs sm:text-sm sm:font-medium gap-3 px-4 py-1 text-gray-700 hover:bg-gray-100 rounded-full"
                    >
                      💬 Chat History
                    </Link>

                    <Link
                      onClick={() => setIsUserOpen(false)}
                      href="/dashboard/call-history"
                      className="flex items-center text-xs sm:text-sm sm:font-medium gap-3 px-4 py-1 text-gray-700 hover:bg-gray-100 rounded-full"
                    >
                      📞 Call History
                    </Link>
                    <Link
                      onClick={() => setIsUserOpen(false)}
                      href="/dashboard/myfollowing"
                      className="flex items-center text-xs sm:text-sm sm:font-medium gap-3 px-4 py-1 text-gray-700 hover:bg-gray-100 rounded-full"
                    >
                      ✨ My Following
                    </Link>

                    <Link
                      onClick={() => setIsUserOpen(false)}
                      href="/dashboard/transaction"
                      className="flex items-center text-xs sm:text-sm sm:font-medium gap-3 px-4 py-1 text-gray-700 hover:bg-gray-100 rounded-full"
                    >
                      🛒 Transaction
                    </Link>

                    <Link
                      onClick={() => setIsUserOpen(false)}
                      href="/dashboard/my-services"
                      className="flex items-center text-xs sm:text-sm sm:font-medium gap-3 px-4 py-1 text-gray-700 hover:bg-gray-100 rounded-full"
                    >
                      ✨ My Services
                    </Link>
                  </div>

                  <button
                    onClick={LogOut}
                    disabled={logoutLoading}
                    className=" px-6 py-1 w-fit cursor-pointer justify-self-center text-xs sm:text-sm hover:scale-104 bg-red-500 text-center flex justify-center rounded-full  text-white hover:bg-red-400"
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
      </div>
    </header>
  );
}
