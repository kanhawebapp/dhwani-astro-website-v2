"use client";

import ProfileHeader from "./ProfileHeader";
import PersonalInfo from "./PersonalInfo";
import { GET_USER_DASHBOARD } from "@/app/graphql/gqlQuery";
import { useMutation, useQuery } from "@apollo/client/react";
import StatsCards from "./StatsCard";
import { gql } from "@apollo/client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { persistor } from "@/app/redux/store";
import { resetPaymentStatus } from "@/app/redux/reducer/auth/userSlice";
import toast from "react-hot-toast";
import client from "@/utils/apolloClient";

const SOFT_DELETE_USER = gql`
  mutation SoftDeleteUser {
    softDeleteUser {
      success
      message
    }
  }
`;

const LOGOUT_MUTATION = gql`
  mutation Logout {
    logout
  }
`;

export default function UserProfilePage() {
  const router = useRouter();
  const dispatch = useDispatch();

  const { data, loading, error, refetch } =
    useQuery(GET_USER_DASHBOARD);

  const [softDeleteUser, { loading: deleting }] =
    useMutation(SOFT_DELETE_USER);

  const [logoutMutation, { loading: logoutLoading }] =
    useMutation(LOGOUT_MUTATION);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const user = data?.getUserDashboard;

  // ---------------- LOGOUT ----------------
  const handleLogout = async () => {
    try {
      const result = await logoutMutation();

      if (result?.data?.logout) {
        toast.success("Logged out successfully");
      }
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      localStorage.removeItem("user");

      dispatch(resetPaymentStatus());

      await client.clearStore();
      await persistor.purge();

      router.replace("/");
    }
  };

  // ---------------- DELETE ACCOUNT ----------------
  const handleDeleteAccount = async () => {
    try {
      setDeleteError("");

      const result = await softDeleteUser();

      if (result?.data?.softDeleteUser?.success) {
        toast.success(
          result?.data?.softDeleteUser?.message ||
            "Account deleted successfully"
        );

        setShowDeleteModal(false);

        // Logout after successful account deletion
        await handleLogout();
      } else {
        setDeleteError(
          result?.data?.softDeleteUser?.message ||
            "Failed to delete account"
        );
      }
    } catch (err) {
      console.error("Delete account error:", err);

      setDeleteError(
        err?.message ||
          "Something went wrong while deleting account"
      );
    }
  };

  if (error) {
    return (
      <p className="p-10 text-red-500">
        Failed to load user profile
      </p>
    );
  }

  return (
    <div className="max-w-7xl mx-auto sm:p-6 space-y-6">
      <ProfileHeader user={user} />

      <StatsCards stats={user?.stats} />

      <div className="grid lg:grid-cols-3 gap-6">
        <PersonalInfo user={user} refetch={refetch} />
      </div>

      {/* DELETE ACCOUNT */}
      <div className="bg-white rounded-xl border border-red-200 shadow-sm p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              Delete Account
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Delete this account permanently.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setDeleteError("");
              setShowDeleteModal(true);
            }}
            className="bg-red-600 hover:bg-red-700 text-white font-medium px-5 py-2 rounded-lg transition"
          >
            Delete Account
          </button>
        </div>
      </div>

      {/* DELETE MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v4m0 4h.01M10.29 3.86l-7.82 13.5A2 2 0 004.2 20h15.6a2 2 0 001.73-2.64l-7.82-13.5a2 2 0 00-3.42 0z"
                />
              </svg>
            </div>

            <h3 className="text-xl font-bold text-gray-800 text-center mt-4">
              Delete Account?
            </h3>

            <p className="text-sm text-gray-500 text-center mt-2">
              Are you sure you want to delete this account?
            </p>

            {deleteError && (
              <div className="mt-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">
                {deleteError}
              </div>
            )}

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                disabled={deleting}
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteError("");
                }}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={deleting || logoutLoading}
                onClick={handleDeleteAccount}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting || logoutLoading
                  ? "Deleting..."
                  : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}