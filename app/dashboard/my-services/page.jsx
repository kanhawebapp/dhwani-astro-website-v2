"use client";

import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { useMemo, useState } from "react";

const GET_MY_SERVICE_BOOKINGS = gql`
  query GetMyServiceBookings($page: Int, $limit: Int) {
    getMyServiceBookings(page: $page, limit: $limit) {
      data {
        id
        bookingStatus
        paymentStatus
        amount
        createdAt

        service {
          id
          name
        }

        astrologer {
          id
          name
        }
      }

      totalCount
      currentPage
      totalPages
    }
  }
`;

export default function ServiceBookingHistory() {
  const [page, setPage] = useState(1);

  const limit = 10;

  const { data, loading, error } = useQuery(
    GET_MY_SERVICE_BOOKINGS,
    {
      variables: {
        page,
        limit,
      },
      fetchPolicy: "network-only",
    },
  );

  /*
   * All records received from backend
   */
  const allBookings =
    data?.getMyServiceBookings?.data || [];

  /*
   * FRONTEND ONLY FILTER
   *
   * Show ONLY:
   * bookingStatus = ASSIGNED
   * paymentStatus = SUCCESS
   */
  const bookings = useMemo(() => {
    return allBookings.filter(
      (booking) =>
        booking?.bookingStatus === "ASSIGNED" &&
        booking?.paymentStatus === "SUCCESS",
    );
  }, [allBookings]);

  /*
   * Backend pagination information
   */
  const currentPage =
    data?.getMyServiceBookings?.currentPage || 1;

  const totalPages =
    data?.getMyServiceBookings?.totalPages || 1;

  /*
   * Filtered summary
   */
  const totalFilteredBookings = bookings.length;

  const assignedCount = bookings.filter(
    (booking) => booking.bookingStatus === "ASSIGNED",
  ).length;

  const successfulPaymentCount = bookings.filter(
    (booking) => booking.paymentStatus === "SUCCESS",
  ).length;

  const totalAmount = bookings.reduce(
    (sum, booking) =>
      sum + Number(booking?.amount || 0),
    0,
  );

  return (
    <div className="min-h-screen p-3 sm:p-4 bg-gray-100 md:p-6">
      {/* Header */}
      <div className="mb-3 sm:mb-6">
        <h1 className="text-xl sm:text-3xl font-bold text-purple-900">
          Healing Service Bookings
        </h1>

        <p className="text-gray-500 text-[10px] sm:text-xs">
          View your assigned and successful service bookings
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 mb-3 bg-white px-2 py-2 rounded-xl shadow-xl sm:mb-6 md:grid-cols-4">
        {/* Total Bookings */}
        <div className="p-2 sm:p-4 bg-white shadow rounded-2xl">
          <p className="text-xs sm:text-sm text-gray-500">
            Total Bookings
          </p>

          <h2 className="mt-1 sm:mt-2 text-xs sm:text-2xl text-black font-bold">
            {totalFilteredBookings}
          </h2>
        </div>

        {/* Assigned */}
        <div className="p-2 sm:p-4 bg-white shadow rounded-2xl">
          <p className="text-xs sm:text-sm text-gray-500">
            Assigned
          </p>

          <h2 className="mt-1 sm:mt-2 text-xs sm:text-2xl text-black font-bold">
            {assignedCount}
          </h2>
        </div>

        {/* Successful Payment */}
        <div className="p-2 sm:p-4 bg-white shadow rounded-2xl">
          <p className="text-xs sm:text-sm text-gray-500">
            Payment Success
          </p>

          <h2 className="mt-1 sm:mt-2 text-xs sm:text-2xl text-black font-bold">
            {successfulPaymentCount}
          </h2>
        </div>

        {/* Total Amount */}
        <div className="p-2 sm:p-4 bg-white shadow rounded-2xl">
          <p className="text-xs sm:text-sm text-gray-500">
            Total Amount
          </p>

          <h2 className="mt-1 sm:mt-2 text-black text-xs sm:text-2xl font-bold">
            ₹{totalAmount}
          </h2>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="p-10 text-center">
          Loading bookings...
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="p-4 text-red-500 bg-white rounded-xl">
          Something went wrong
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && bookings.length === 0 && (
        <div className="p-10 text-center bg-white shadow rounded-2xl">
          No assigned successful bookings found
        </div>
      )}

      {/* Booking Cards */}
      {!loading && bookings.length > 0 && (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="p-3 sm:p-5 bg-white shadow rounded-2xl"
            >
              <div className="flex flex-col justify-between gap-2 sm:gap-4 md:flex-row">
                {/* Left Content */}
                <div>
                  {/* Service Name */}
                  <h2 className="text-xs sm:text-xl font-semibold text-black">
                    {booking?.service?.name ||
                      "Service"}
                  </h2>

                  {/* Booking ID */}
                  <p className="mt-1 text-xs sm:text-sm text-gray-500">
                    Booking ID: {booking.id}
                  </p>

                  {/* Astrologer */}
                  <p className="mt-1 text-xs sm:text-sm text-gray-500">
                    Astrologer:{" "}
                    {booking?.astrologer?.name ||
                      "Not Assigned"}
                  </p>

                  {/* Booking Information */}
                  <div className="flex flex-wrap gap-3 mt-2 sm:mt-4">
                    {/* Amount */}
                    <span className="px-3 py-1 text-[10px] sm:text-sm bg-gray-100 text-black rounded-full">
                      ₹ {booking.amount}
                    </span>

                    {/* Payment Status */}
                    <span className="px-3 py-1 text-[10px] sm:text-sm rounded-full bg-green-100 text-green-700">
                      Payment: {booking.paymentStatus}
                    </span>

                    {/* Booking Status */}
                    <span className="px-3 py-1 text-[10px] sm:text-sm rounded-full bg-blue-100 text-blue-700">
                      {booking.bookingStatus}
                    </span>
                  </div>
                </div>

                {/* Date & Time */}
                <div className="text-right flex gap-1">
                  <p className="text-[10px] sm:text-sm text-gray-500">
                    {new Date(
                      Number(booking.createdAt),
                    ).toLocaleDateString("en-IN")}
                  </p>

                  <p className="text-[10px] sm:text-sm text-gray-500">
                    {new Date(
                      Number(booking.createdAt),
                    ).toLocaleTimeString("en-IN")}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col items-center justify-between gap-4 mt-6 md:flex-row">
          {/* Page Information */}
          <div className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </div>

          {/* Pagination Buttons */}
          <div className="flex items-center gap-2">
            {/* Previous */}
            <button
              disabled={currentPage === 1}
              onClick={() =>
                setPage((prev) => prev - 1)
              }
              className={`px-4 py-1 text-[10px] sm:text-sm sm:py-2 rounded-lg border ${
                currentPage === 1
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white hover:bg-gray-50"
              }`}
            >
              Previous
            </button>

            {/* Page Numbers */}
            {Array.from(
              { length: totalPages },
              (_, i) => i + 1,
            )
              .slice(
                Math.max(0, currentPage - 3),
                Math.min(
                  totalPages,
                  currentPage + 2,
                ),
              )
              .map((pageNumber) => (
                <button
                  key={pageNumber}
                  onClick={() =>
                    setPage(pageNumber)
                  }
                  className={`w-10 h-10 rounded-lg border ${
                    currentPage === pageNumber
                      ? "bg-purple-900 text-white"
                      : "bg-white hover:bg-gray-50"
                  }`}
                >
                  {pageNumber}
                </button>
              ))}

            {/* Next */}
            <button
              disabled={currentPage === totalPages}
              onClick={() =>
                setPage((prev) => prev + 1)
              }
              className={`px-4 py-1 text-[10px] sm:text-sm sm:py-2 rounded-lg border ${
                currentPage === totalPages
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white hover:bg-gray-50"
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}