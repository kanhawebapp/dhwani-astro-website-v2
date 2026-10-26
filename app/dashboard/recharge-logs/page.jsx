
"use client";

import { useEffect, useRef, useState } from "react";
import { useLazyQuery, useApolloClient } from "@apollo/client/react";
import { GET_RECHARGE_PAYMENT_LOGS,GET_RECHARGE_INVOICE } from "@/app/graphql/gqlQuery";
import PaymentInvoice from "../PaymentInvoice";

const money = (value) =>
  `₹${Number(value ?? 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatDate = (value) => {
  if (!value) return "-";

  let date;

  if (typeof value === "number" || /^\d+$/.test(String(value))) {
    let timestamp = Number(value);
    if (timestamp < 1e12) timestamp *= 1000;
    date = new Date(timestamp);
  } else {
    date = new Date(value);
  }

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function RechargePaymentLogs() {
            const client = useApolloClient();

  const [page, setPage] = useState(1);
  const [startDate, setStartDate] = useState("2026-10-01");
  const [endDate, setEndDate] = useState("2026-10-26");
  const [invoiceData, setInvoiceData] = useState(null);
  const [invoiceLoading, setInvoiceLoading] = useState(null);

  const invoiceRef = useRef(null);

  const [getLogs, { data, loading, error }] = useLazyQuery(
    GET_RECHARGE_PAYMENT_LOGS,
    { fetchPolicy: "network-only" }
  );

  const fetchLogs = (currentPage = page) => {
    getLogs({
      variables: {
        page: currentPage,
        limit: 10,
        startDate: startDate || null,
        endDate: endDate || null,
      },
    });
  };

  useEffect(() => {
    fetchLogs(page);
    // Fetch when the page changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const response = data?.getRechargePaymentLogs;
  const logs = response?.data ?? [];
  const pagination = response?.pagination ?? {};

  const applyFilters = () => {
    setPage(1);
    getLogs({
      variables: {
        page: 1,
        limit: 10,
        startDate: startDate || null,
        endDate: endDate || null,
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
         query: GET_RECHARGE_INVOICE,
         variables: {
           transactionId: row.id,
         },
         fetchPolicy: "network-only",
       });
 
    const invoice = invoiceResponse?.getRechargeInvoice;
 
       if (!invoice) {
         throw new Error("Invoice not found");
       }
 
       setInvoiceData(invoice);
 
       // Wait for PaymentInvoice to render.
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

  const statusClass = (status) => {
    const value = String(status || "").toUpperCase();

    if (["SUCCESS", "COMPLETED", "PAID"].includes(value)) {
      return "bg-green-100 text-green-700";
    }

    if (["FAILED", "CANCELLED", "ERROR"].includes(value)) {
      return "bg-red-100 text-red-700";
    }

    return "bg-yellow-100 text-yellow-700";
  };

  return (
    <div className="min-h-screen bg-gray-100 p-3 text-black sm:p-6">
      <div className="rounded-2xl bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Recharge Payment Logs
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Total records: {pagination.totalRecords ?? 0}
            </p>
          </div>

          <button
            type="button"
            onClick={() => fetchLogs(page)}
            disabled={loading}
            className="rounded-lg border px-4 py-2 text-sm disabled:opacity-50"
          >
            Refresh
          </button>
        </div>

        {/* Date filters */}
        <div className="mb-6 flex flex-col gap-3 rounded-xl border bg-gray-50 p-4 sm:flex-row sm:items-end">
          <div className="flex flex-col gap-1">
            <label htmlFor="recharge-start-date" className="text-sm font-medium">
              Start date
            </label>
            <input
              id="recharge-start-date"
              type="date"
              value={startDate}
              max={endDate || undefined}
              onChange={(e) => setStartDate(e.target.value)}
              className="rounded-lg border bg-white px-3 py-2 text-sm"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="recharge-end-date" className="text-sm font-medium">
              End date
            </label>
            <input
              id="recharge-end-date"
              type="date"
              value={endDate}
              min={startDate || undefined}
              onChange={(e) => setEndDate(e.target.value)}
              className="rounded-lg border bg-white px-3 py-2 text-sm"
            />
          </div>

          <button
            type="button"
            onClick={applyFilters}
            disabled={loading}
            className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            Apply Filters
          </button>
        </div>

        {response?.success === false && (
          <p className="mb-4 text-sm text-red-600">
            {response.message || "Unable to fetch recharge logs."}
          </p>
        )}

        {loading ? (
          <div className="py-16 text-center text-gray-500">
            Loading recharge payment logs...
          </div>
        ) : error ? (
          <div className="py-10 text-center text-red-600">
            {error.message}
          </div>
        ) : logs.length === 0 ? (
          <div className="py-16 text-center text-gray-500">
            No recharge payment logs found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="bg-purple-100 text-gray-600">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Invoice No.</th>
                  <th className="px-4 py-3">Recharge Pack</th>
                  <th className="px-4 py-3">Coins</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Status</th>
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
                      {row.rechargePackName || "-"}
                    </td>

                    <td className="px-4 py-3">
                      {Number(row.coins ?? 0).toLocaleString("en-IN")}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 font-semibold">
                      {money(row.amount)}
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-semibold ${statusClass(
                          row.status
                        )}`}
                      >
                        {row.status || "UNKNOWN"}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => downloadInvoice(row)}
                        disabled={invoiceLoading !== null}
                        title="Download invoice PDF"
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
            Showing {logs.length ? (page - 1) * 10 + 1 : 0}–
            {Math.min(page * 10, pagination.totalRecords ?? 0)} of{" "}
            {pagination.totalRecords ?? 0} records
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
                loading || page >= (pagination.totalPages ?? 0)
              }
              onClick={() => setPage(pagination.totalPages)}
              className="rounded-lg border px-3 py-2 disabled:opacity-40"
            >
              {">>"}
            </button>
          </div>
        </div>

          {/* Render invoice off-screen for PDF generation */}
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
                  <PaymentInvoice
                    ref={invoiceRef}
                    data={invoiceData}
                  />
                )}
              </div>
      </div>
    </div>
  );
}
