"use client";

import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { useState } from "react";

const GET_MY_BOOKED_PUJA_SERVICE = gql`
  query GetMyBookedPujaService(
    $page: Int!
    $limit: Int!
    $startDate: String!
    $endDate: String!
  ) {
    getMyBookedPujaService(
      page: $page
      limit: $limit
      startDate: $startDate
      endDate: $endDate
    ) {
      success
      message
      total
      currentPage
      totalPages
      limit

      data {
        id
        pujaId
        pujaName
        mantraOptionName
        quantity
        unitPrice
        totalAmount
        paymentStatus
        bookingStatus
        bookingDate
      }
    }
  }
`;

const formatDate = (value) => {
  if (!value) return "N/A";

  const date = new Date(
    typeof value === "string" && /^\d+$/.test(value)
      ? Number(value)
      : value,
  );

  if (Number.isNaN(date.getTime())) return "N/A";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatCurrency = (amount) =>
  `₹${Number(amount || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const getStatusClass = (status) => {
  const value = String(status || "").toUpperCase();

  if (["SUCCESS", "PAID", "CONFIRMED", "COMPLETED"].includes(value)) {
    return "bg-green-100 text-green-700";
  }

  if (["PENDING", "PROCESSING"].includes(value)) {
    return "bg-yellow-100 text-yellow-700";
  }

  if (["FAILED", "CANCELLED", "REJECTED"].includes(value)) {
    return "bg-red-100 text-red-700";
  }

  return "bg-blue-100 text-blue-700";
};

export default function PujaBookingHistory() {
  const [page, setPage] = useState(1);

  const [startDate, setStartDate] = useState("2026-10-01");
  const [endDate, setEndDate] = useState("2026-10-27");

  const limit = 10;

  const { data, loading, error } = useQuery(
    GET_MY_BOOKED_PUJA_SERVICE,
    {
      variables: {
        page,
        limit,
        startDate,
        endDate,
      },
      fetchPolicy: "network-only",
      skip: !startDate || !endDate || startDate > endDate,
    },
  );

  const result = data?.getMyBookedPujaService;

  const bookings = result?.data || [];

  const currentPage = result?.currentPage || page;
  const totalPages = result?.totalPages || 1;
  const totalBookings = result?.total || 0;

  const totalAmount = bookings.reduce(
    (sum, booking) =>
      sum + Number(booking?.totalAmount || 0),
    0,
  );

  const successfulPayments = bookings.filter(
    (booking) =>
      String(booking?.paymentStatus).toUpperCase() === "SUCCESS",
  ).length;

  const pendingBookings = bookings.filter(
    (booking) =>
      ["PENDING", "PROCESSING"].includes(
        String(booking?.bookingStatus).toUpperCase(),
      ),
  ).length;

  const handleDateFilter = () => {
    if (!startDate || !endDate || startDate > endDate) return;
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-3 sm:p-4 md:p-6">
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl font-bold text-purple-900 sm:text-3xl">
          Puja Booking History
        </h1>

        <p className="mt-1 text-xs text-gray-500 sm:text-sm">
          View your booked puja services, mantra options and payment details.
        </p>
      </div>

      {/* Date Filter */}
      <div className="mb-4 rounded-xl bg-white p-3 shadow sm:mb-6 sm:p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:items-end">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600 sm:text-sm">
              Start Date
            </label>

            <input
              type="date"
              value={startDate}
              max={endDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-lg border border-gray-300 p-2 text-sm text-black outline-none focus:border-purple-700"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600 sm:text-sm">
              End Date
            </label>

            <input
              type="date"
              value={endDate}
              min={startDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full rounded-lg border border-gray-300 p-2 text-sm text-black outline-none focus:border-purple-700"
            />
          </div>

          <button
            type="button"
            onClick={handleDateFilter}
            disabled={
              !startDate ||
              !endDate ||
              startDate > endDate ||
              loading
            }
            className="rounded-lg bg-purple-900 px-4 py-2 text-sm font-medium text-white hover:bg-purple-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Apply Filter
          </button>
        </div>

        {startDate && endDate && startDate > endDate && (
          <p className="mt-2 text-xs text-red-600">
            End date must be on or after the start date.
          </p>
        )}
      </div>

      {/* Summary Cards */}
      <div className="mb-4 grid grid-cols-2 gap-3 sm:mb-6 sm:gap-4 md:grid-cols-4">
        <div className="rounded-2xl bg-white p-3 shadow sm:p-4">
          <p className="text-xs text-gray-500 sm:text-sm">
            Total Bookings
          </p>
          <h2 className="mt-2 text-lg font-bold text-black sm:text-2xl">
            {totalBookings}
          </h2>
        </div>

        <div className="rounded-2xl bg-white p-3 shadow sm:p-4">
          <p className="text-xs text-gray-500 sm:text-sm">
            Successful Payments
          </p>
          <h2 className="mt-2 text-lg font-bold text-green-700 sm:text-2xl">
            {successfulPayments}
          </h2>
        </div>

        <div className="rounded-2xl bg-white p-3 shadow sm:p-4">
          <p className="text-xs text-gray-500 sm:text-sm">
            Pending Bookings
          </p>
          <h2 className="mt-2 text-lg font-bold text-yellow-600 sm:text-2xl">
            {pendingBookings}
          </h2>
        </div>

        <div className="rounded-2xl bg-white p-3 shadow sm:p-4">
          <p className="text-xs text-gray-500 sm:text-sm">
            Page Amount
          </p>
          <h2 className="mt-2 break-words text-lg font-bold text-black sm:text-2xl">
            {formatCurrency(totalAmount)}
          </h2>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="rounded-xl bg-white p-10 text-center text-gray-600 shadow">
          Loading puja bookings...
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="rounded-xl bg-white p-5 text-sm text-red-600 shadow">
          Failed to load puja bookings: {error.message}
        </div>
      )}

      {/* Backend Message */}
      {!loading && !error && result?.success === false && (
        <div className="rounded-xl bg-white p-5 text-sm text-red-600 shadow">
          {result?.message || "Unable to fetch puja bookings."}
        </div>
      )}

      {/* Empty State */}
      {!loading &&
        !error &&
        result?.success !== false &&
        bookings.length === 0 && (
          <div className="rounded-2xl bg-white p-10 text-center shadow">
            <h2 className="font-semibold text-gray-800">
              No Puja Bookings Found
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              No bookings were found for the selected date range.
            </p>
          </div>
        )}

      {/* Booking Cards */}
      {!loading && !error && bookings.length > 0 && (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="rounded-2xl bg-white p-3 shadow sm:p-5"
            >
              <div className="flex flex-col justify-between gap-3 md:flex-row md:gap-5">
                {/* Booking Details */}
                <div className="min-w-0 flex-1">
                  <h2 className="text-base font-semibold text-gray-900 sm:text-xl">
                    {booking.pujaName || "Puja Service"}
                  </h2>

                  <p className="mt-1 break-all text-xs text-gray-500 sm:text-sm">
                    Booking ID: {booking.id}
                  </p>

                  <p className="mt-2 text-sm text-gray-700">
                    Mantra Option:{" "}
                    <span className="font-medium">
                      {booking.mantraOptionName || "N/A"}
                    </span>
                  </p>

                  <p className="mt-1 break-all text-xs text-gray-500 sm:text-sm">
                    Puja ID: {booking.pujaId || "N/A"}
                  </p>

                  {/* Status Badges */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusClass(
                        booking.paymentStatus,
                      )}`}
                    >
                      Payment: {booking.paymentStatus || "N/A"}
                    </span>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusClass(
                        booking.bookingStatus,
                      )}`}
                    >
                      Booking: {booking.bookingStatus || "N/A"}
                    </span>
                  </div>
                </div>

                {/* Amount and Date */}
                <div className="flex flex-row justify-between gap-4 border-t pt-3 md:min-w-48 md:flex-col md:items-end md:border-l md:border-t-0 md:pl-5 md:pt-0">
                  <div>
                    <p className="text-xs text-gray-500 sm:text-sm">
                      Total Amount
                    </p>
                    <p className="mt-1 text-lg font-bold text-purple-900 sm:text-2xl">
                      {formatCurrency(booking.totalAmount)}
                    </p>
                  </div>

                  <div className="text-right md:text-right">
                    <p className="text-xs text-gray-500 sm:text-sm">
                      Booking Date
                    </p>
                    <p className="mt-1 text-sm font-medium text-gray-700">
                      {formatDate(booking.bookingDate)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-gray-50 p-3 sm:grid-cols-3">
                <div>
                  <p className="text-xs text-gray-500">Quantity</p>
                  <p className="mt-1 text-sm font-semibold text-gray-800">
                    {booking.quantity ?? 0}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">Unit Price</p>
                  <p className="mt-1 text-sm font-semibold text-gray-800">
                    {formatCurrency(booking.unitPrice)}
                  </p>
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <p className="text-xs text-gray-500">Total</p>
                  <p className="mt-1 text-sm font-semibold text-gray-800">
                    {formatCurrency(booking.totalAmount)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && !error && totalPages > 1 && (
        <div className="mt-6 flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-sm text-gray-600">
            Page {currentPage} of {totalPages} · {totalBookings} bookings
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              disabled={currentPage <= 1 || loading}
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              className="rounded-lg border bg-white px-3 py-2 text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 sm:px-4"
            >
              Previous
            </button>

            {Array.from(
              { length: totalPages },
              (_, index) => index + 1,
            )
              .slice(
                Math.max(0, currentPage - 3),
                Math.min(totalPages, currentPage + 2),
              )
              .map((pageNumber) => (
                <button
                  type="button"
                  key={pageNumber}
                  onClick={() => setPage(pageNumber)}
                  className={`h-9 w-9 rounded-lg border text-sm ${
                    currentPage === pageNumber
                      ? "border-purple-900 bg-purple-900 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {pageNumber}
                </button>
              ))}

            <button
              type="button"
              disabled={currentPage >= totalPages || loading}
              onClick={() =>
                setPage((prev) => Math.min(totalPages, prev + 1))
              }
              className="rounded-lg border bg-white px-3 py-2 text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 sm:px-4"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}