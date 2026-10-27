
"use client";

import { useEffect, useRef, useState } from "react";
import { useApolloClient, useLazyQuery } from "@apollo/client/react";

import PaymentInvoice from "../PaymentInvoice";
import {
  GET_SERVICES_BANK_PAYMENT_LOGS,
  GET_SERVICES_INVOICE,
} from "@/app/graphql/gqlQuery";

const PAGE_LIMIT = 10;

const EMPTY_FILTERS = {
  serviceType: "",
  startDate: "",
  endDate: "",
};

const money = (value) =>
  `₹${Number(value ?? 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatDate = (value) => {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  let date;

  if (typeof value === "number" || /^\d+$/.test(String(value))) {
    let timestamp = Number(value);

    if (timestamp < 1e12) {
      timestamp *= 1000;
    }

    date = new Date(timestamp);
  } else {
    date = new Date(value);
  }

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function ServicesBankPaymentLogs() {
  const client = useApolloClient();

  const [page, setPage] = useState(1);

  // Values currently displayed in the filter form.
  const [filters, setFilters] = useState(EMPTY_FILTERS);

  // Filters currently applied to the API request.
  const [appliedFilters, setAppliedFilters] = useState(EMPTY_FILTERS);

  const [invoiceData, setInvoiceData] = useState(null);
  const [invoiceLoading, setInvoiceLoading] = useState(null);
  const [filterError, setFilterError] = useState("");

  const invoiceRef = useRef(null);

  const [getLogs, { data, loading, error }] = useLazyQuery(
    GET_SERVICES_BANK_PAYMENT_LOGS,
    {
      fetchPolicy: "network-only",
    }
  );

  // Fetch logs whenever the page or applied filters change.
  useEffect(() => {
    getLogs({
      variables: {
        page,
        limit: PAGE_LIMIT,
        serviceType: appliedFilters.serviceType || undefined,
        startDate: appliedFilters.startDate || undefined,
        endDate: appliedFilters.endDate || undefined,
      },
    });
  }, [page, appliedFilters, getLogs]);

  const response = data?.getServicesBankPaymentLogs;
  const logs = response?.data ?? [];
  const pagination = response?.pagination ?? {};

  const handleFilterChange = (event) => {
    const { name, value } = event.target;

    setFilters((previous) => ({
      ...previous,
      [name]: value,
    }));

    setFilterError("");
  };

  // Validate and apply filters.
  const handleApplyFilters = (event) => {
    event.preventDefault();

    if (
      filters.startDate &&
      filters.endDate &&
      filters.startDate > filters.endDate
    ) {
      setFilterError("Start date cannot be later than end date.");
      return;
    }

    setFilterError("");

    setPage(1);

    setAppliedFilters({
      serviceType: filters.serviceType,
      startDate: filters.startDate,
      endDate: filters.endDate,
    });
  };

  // Clear all filters and fetch all payment logs.
  const handleResetFilters = () => {
    setFilters({ ...EMPTY_FILTERS });
    setAppliedFilters({ ...EMPTY_FILTERS });
    setFilterError("");
    setPage(1);
  };

  const handleRefresh = () => {
    getLogs({
      variables: {
        page,
        limit: PAGE_LIMIT,
        serviceType: appliedFilters.serviceType || undefined,
        startDate: appliedFilters.startDate || undefined,
        endDate: appliedFilters.endDate || undefined,
      },
    });
  };

  const downloadInvoice = async (row) => {
    if (!row?.id) {
      alert("Invoice download is unavailable: payment log ID is missing.");
      return;
    }

    try {
      setInvoiceLoading(row.id);

      const { data: invoiceResponse } = await client.query({
        query: GET_SERVICES_INVOICE,
        variables: {
          transactionId: row.id,
        },
        fetchPolicy: "network-only",
      });

      const invoice = invoiceResponse?.getServicesInvoice;

      if (!invoice) {
        throw new Error("Invoice not found");
      }

      setInvoiceData(invoice);

      // Wait for PaymentInvoice to render before generating the PDF.
      await new Promise((resolve) => setTimeout(resolve, 300));

      if (!invoiceRef.current) {
        throw new Error("Invoice element not found");
      }

      const html2pdf = (await import("html2pdf.js")).default;

      await html2pdf()
        .set({
          margin: 0,
          filename: `Invoice-${invoice.invoiceNo || row.invoiceNo || row.id}.pdf`,
          image: {
            type: "jpeg",
            quality: 0.98,
          },
          html2canvas: {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: "#ffffff",
          },
          jsPDF: {
            unit: "mm",
            format: "a4",
            orientation: "portrait",
          },
        })
        .from(invoiceRef.current)
        .save();
    } catch (err) {
      console.error("Invoice download error:", err);
      alert(err.message || "Unable to download invoice");
    } finally {
      setInvoiceLoading(null);
      setInvoiceData(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-3 text-black sm:p-6">
      <div className="rounded-2xl bg-white p-4 shadow-sm sm:p-6">
        {/* Page heading */}
        <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Services Payment Logs
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Total records: {pagination.totalRecords ?? 0}
            </p>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={loading}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm transition hover:bg-gray-50 disabled:opacity-50"
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {/* Filters */}
        <form
          onSubmit={handleApplyFilters}
          className="mb-6 rounded-xl border border-gray-200 bg-gray-50 p-4"
        >
          <div className="mb-4">
            
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Service type */}
            <div>
              <label
                htmlFor="serviceType"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Service Type
              </label>

              <select
                id="serviceType"
                name="serviceType"
                value={filters.serviceType}
                onChange={handleFilterChange}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
              >
                <option value="">All Services</option>
                <option value="SERVICE">Service</option>
                <option value="PUJA">Puja</option>
              </select>
            </div>

            {/* Start date */}
            <div>
              <label
                htmlFor="startDate"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Start Date
              </label>

              <input
                id="startDate"
                name="startDate"
                type="date"
                value={filters.startDate}
                max={filters.endDate || undefined}
                onChange={handleFilterChange}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
              />
            </div>

            {/* End date */}
            <div>
              <label
                htmlFor="endDate"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                End Date
              </label>

              <input
                id="endDate"
                name="endDate"
                type="date"
                value={filters.endDate}
                min={filters.startDate || undefined}
                onChange={handleFilterChange}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
              />
            </div>

            {/* Actions */}
            <div className="flex items-end gap-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-purple-700 disabled:opacity-50"
              >
                Apply Filters
              </button>

              <button
                type="button"
                onClick={handleResetFilters}
                disabled={
                  loading &&
                  !filters.serviceType &&
                  !filters.startDate &&
                  !filters.endDate
                }
                className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:opacity-50"
              >
                Reset
              </button>
            </div>
          </div>

          {filterError && (
            <p className="mt-3 text-sm text-red-600">{filterError}</p>
          )}

          {(appliedFilters.serviceType ||
            appliedFilters.startDate ||
            appliedFilters.endDate) && (
            <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
              <span className="font-medium text-gray-600">
                Active filters:
              </span>

              {appliedFilters.serviceType && (
                <span className="rounded-full bg-purple-100 px-3 py-1 text-purple-700">
                  {appliedFilters.serviceType === "PUJA" ? "Puja" : "Service"}
                </span>
              )}

              {appliedFilters.startDate && (
                <span className="rounded-full bg-blue-100 px-3 py-1 text-blue-700">
                  From: {appliedFilters.startDate}
                </span>
              )}

              {appliedFilters.endDate && (
                <span className="rounded-full bg-blue-100 px-3 py-1 text-blue-700">
                  To: {appliedFilters.endDate}
                </span>
              )}
            </div>
          )}
        </form>

        {/* API response message */}
        {response?.success === false && (
          <p className="mb-4 text-sm text-red-600">
            {response.message || "Unable to fetch payment logs."}
          </p>
        )}

        {/* Error */}
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {error.message}
          </div>
        )}

        {/* Payment logs table */}
        {loading ? (
          <div className="py-16 text-center text-gray-500">
            Loading payment logs...
          </div>
        ) : logs.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 py-16 text-center text-gray-500">
            <p className="font-medium">No payment logs found.</p>
            <p className="mt-1 text-sm">
              Try changing the selected filters or resetting them.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="rounded-xl bg-purple-100 text-gray-600">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Invoice No.</th>
                  <th className="px-4 py-3">Service Type</th>
                  <th className="px-4 py-3">Service Name</th>
                  <th className="px-4 py-3">Taxable Amount</th>
                  <th className="px-4 py-3">Total Tax</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Invoice</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {logs.map((row, index) => (
                  <tr
                    key={row.id || `${row.invoiceNo}-${index}`}
                    className="text-sm hover:bg-gray-50"
                  >
                    <td className="whitespace-nowrap px-4 py-3">
                      {formatDate(row.createdAt)}
                    </td>

                    <td className="px-4 py-3 font-medium">
                      {row.invoiceNo || "-"}
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-semibold ${
                          row.serviceType === "PUJA"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {row.serviceType || "-"}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      {row.serviceName || "-"}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3">
                      {money(row.taxableAmount)}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3">
                      {money(row.totalTax)}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 font-semibold">
                      {money(row.amount)}
                    </td>

                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => downloadInvoice(row)}
                        disabled={invoiceLoading !== null}
                        title="Download invoice PDF"
                        aria-label={`Download invoice ${
                          row.invoiceNo || ""
                        }`}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 transition hover:bg-gray-200 disabled:opacity-50"
                      >
                        {invoiceLoading === row.id ? (
                          <span className="text-xs">...</span>
                        ) : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <path d="m7 10 5 5 5-5" />
                            <path d="M12 15V3" />
                          </svg>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            Showing{" "}
            {logs.length ? (page - 1) * PAGE_LIMIT + 1 : 0}–
            {" "}
            {Math.min(
              (page - 1) * PAGE_LIMIT + logs.length,
              pagination.totalRecords ?? 0
            )}{" "}
            of {pagination.totalRecords ?? 0} records
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() => setPage(1)}
              className="rounded-lg border px-3 py-2 disabled:opacity-40"
            >
              {"<<"}
            </button>

            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() => setPage((current) => current - 1)}
              className="rounded-lg border px-3 py-2 disabled:opacity-40"
            >
              Previous
            </button>

            <span className="px-2 text-sm">
              Page {pagination.currentPage ?? page} of{" "}
              {pagination.totalPages ?? 0}
            </span>

            <button
              type="button"
              disabled={
                loading || page >= (pagination.totalPages ?? 0)
              }
              onClick={() => setPage((current) => current + 1)}
              className="rounded-lg border px-3 py-2 disabled:opacity-40"
            >
              Next
            </button>

            <button
              type="button"
              disabled={
                loading ||
                page >= (pagination.totalPages ?? 0) ||
                !pagination.totalPages
              }
              onClick={() => setPage(pagination.totalPages)}
              className="rounded-lg border px-3 py-2 disabled:opacity-40"
            >
              {">>"}
            </button>
          </div>
        </div>

        {/* Hidden invoice component for PDF generation */}
        <div
          aria-hidden="true"
          style={{
            position: "fixed",
            left: "-10000px",
            top: 0,
            width: "210mm",
            background: "#ffffff",
          }}
        >
          {invoiceData && (
            <PaymentInvoice ref={invoiceRef} data={invoiceData} />
          )}
        </div>
      </div>
    </div>
  );
}
