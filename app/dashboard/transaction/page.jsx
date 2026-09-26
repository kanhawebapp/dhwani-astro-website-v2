"use client";

import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { useMemo, useState } from "react";
import { useRef } from "react";
import PaymentInvoice from "../PaymentInvoice";
// import { Download } from "lucide-react";
import { useApolloClient } from "@apollo/client/react";
import { GET_PAYMENT_INVOICE } from "@/app/graphql/gqlQuery";
const GET_USER_WALLET_TRANSACTIONS = gql`
  query GetUserWalletTransactions($filter: WalletTransactionFilter) {
    getUserWalletTransactions(filter: $filter) {
      totalCount
      currentPage
      totalPages

      data {
        id
        userWalletId
        astrologerWalletId
        rechargePackId
        sessionId
        type
        coins
        amount
        description
        astrologerName
        createdAt
      }
    }
  }
`;

export default function UserWalletTransactions() {
  const client = useApolloClient();
  const [page, setPage] = useState(1);
  const [invoiceData, setInvoiceData] = useState(null);
  const [invoiceLoading, setInvoiceLoading] = useState(null);
  const invoiceRef = useRef(null);
  const [filters, setFilters] = useState({
    type: "",
    fromDate: "",
    toDate: "",
    search: "",
  });

  const queryFilter = useMemo(() => {
    return {
      page,
      limit: 10,

      ...(filters?.type && {
        type: [filters.type],
      }),

      ...(filters?.fromDate && {
        fromDate: filters.fromDate,
      }),

      ...(filters?.toDate && {
        toDate: filters.toDate,
      }),
    };
  }, [filters, page]);

  const { data, loading, error, refetch } = useQuery(
    GET_USER_WALLET_TRANSACTIONS,
    {
      variables: {
        filter: queryFilter,
      },
      fetchPolicy: "network-only",
    },
  );

  const response = data?.getUserWalletTransactions;

  const transactions = response?.data || [];

  const filteredTransactions = transactions?.filter((item) => {
    if (!filters?.search) return true;

    const search = filters.search.toLowerCase();

    return (
      item?.description?.toLowerCase()?.includes(search) ||
      item?.astrologerName?.toLowerCase()?.includes(search) ||
      item?.type?.toLowerCase()?.includes(search) ||
      item?.sessionId?.toLowerCase()?.includes(search)
    );
  });
  const downloadInvoice = async (transactionId) => {
    try {
      setInvoiceLoading(transactionId);

      const { data } = await client.query({
        query: GET_PAYMENT_INVOICE,
        variables: {
          transactionId,
        },
        fetchPolicy: "network-only",
      });

      const invoice = data?.getPaymentInvoice;

      if (!invoice) {
        throw new Error("Invoice not found");
      }

      setInvoiceData(invoice);

      // React ko DOM update karne ka time
      await new Promise((resolve) => setTimeout(resolve, 300));

      if (!invoiceRef.current) {
        throw new Error("Invoice element not found");
      }

      const html2pdf = (await import("html2pdf.js")).default;

      await html2pdf()
        .set({
          margin: 0,
          filename: `Invoice-${invoice.invoiceNo || transactionId}.pdf`,
          image: {
            type: "jpeg",
            quality: 0.98,
          },
          html2canvas: {
            scale: 2,
            useCORS: true,
            logging: false,
          },
          jsPDF: {
            unit: "mm",
            format: "a4",
            orientation: "portrait",
          },
        })
        .from(invoiceRef.current)
        .save();
    } catch (error) {
      console.error("Invoice download error:", error);
      alert("Unable to download invoice");
    } finally {
      setInvoiceLoading(null);
    }
  };
  // FIX INVALID DATE
  const formatDate = (timestamp) => {
    if (!timestamp) return "-";

    const date = new Date(Number(timestamp));

    if (isNaN(date.getTime())) return "Invalid Date";

    return `${date.toLocaleDateString("en-IN")} • ${date.toLocaleTimeString(
      "en-IN",
    )}`;
  };

  return (
    <div className="min-h-screen sm:p-5 bg-gray-100">
      <div className="sm:p-5 p-3 bg-white shadow-xl rounded-3xl">
        <div className="flex flex-col gap-4 mb-6 md:flex-row md:items-center md:justify-between">
          <h2 className="text-xl sm:text-2xl font-bold text-black">
            Wallet Transactions
          </h2>
        </div>

        <div className="grid gap-4 mb-3 sm:mb-6 md:grid-cols-4">
          <input
            type="text"
            placeholder="Search astrologer, type..."
            value={filters.search}
            onChange={(e) =>
              setFilters({
                ...filters,
                search: e.target.value,
              })
            }
            className="px-4 py-1 sm:py-2 border border-gray-300 placeholder:text-gray-300 placeholder:text-xs rounded-full"
          />

          <select
            value={filters.type}
            onChange={(e) => {
              setPage(1);

              setFilters({
                ...filters,
                type: e.target.value,
              });
            }}
            className="px-4 py-1 sm:py-2 text-xs border border-gray-300 placeholder:text-gray-300 placeholder:text-xs rounded-full"
          >
            <option value="">All Types</option>

            <option value="DEBIT">Debit</option>

            <option value="CREDIT">Credit</option>
          </select>

          {/* FROM DATE */}
          <input
            type="date"
            value={filters.fromDate}
            onChange={(e) => {
              setPage(1);

              setFilters({
                ...filters,
                fromDate: e.target.value,
              });
            }}
            className="px-4 py-2 border hidden sm:block border-gray-300 placeholder:text-gray-300 placeholder:text-xs rounded-full"
          />

          {/* TO DATE */}
          <input
            type="date"
            value={filters.toDate}
            onChange={(e) => {
              setPage(1);

              setFilters({
                ...filters,
                toDate: e.target.value,
              });
            }}
            className="px-4 py-2 border hidden sm:block border-gray-300 placeholder:text-gray-300 placeholder:text-xs rounded-full"
          />
        </div>

        <div className="space-y-4 text-black">
          {loading ? (
            <div className="p-10 text-center">Loading transactions...</div>
          ) : error ? (
            <div className="p-5 text-center text-red-500 bg-white rounded-2xl">
              Failed to load transactions
            </div>
          ) : filteredTransactions?.length === 0 ? (
            <div className="p-10 text-center text-gray-500 bg-white rounded-2xl">
              No transactions found
            </div>
          ) : (
            filteredTransactions.map((item) => {
              const isRecharge = item?.description === "Recharge successful";

              const isDebit = item?.type === "DEBIT";

              return (
                <div
                  key={item.id}
                  className="p-2 bg-purple-50 shadow rounded-2xl"
                >
                  <div className="flex px-2 flex-col justify-between gap-2 sm:gap-4 md:flex-row">
                    {/* LEFT */}
                    <div>
                      <h2 className="text-xs sm:text-base font-semibold">
                        {item?.description === "Recharge successful"
                          ? "Wallet Recharge"
                          : item?.astrologerName?.trim()
                            ? item.astrologerName
                            : "Admin Transaction"}
                      </h2>
                      <p className="mt-1 text-[10px] sm:text-sm text-gray-500">
                        {item?.sessionId
                          ? `Session ID: ${item.sessionId.slice(0, 8)}`
                          : `TXN ID: ${item?.id?.slice(0, 8) || "-"}`}
                      </p>

                      <div className="flex flex-wrap gap-3 mt-1 sm:mt-3">
                        <span className="px-3 py-1 text-[10px] sm:text-xs bg-violet-200 rounded-full">
                          ₹ {item?.coins}
                        </span>

                        <span
                          className={`px-3 py-1 text-[10px] sm:text-xs rounded-full font-medium ${
                            isDebit
                              ? "bg-red-100 text-red-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {isDebit ? "Debit" : "Credit"}
                        </span>
                        {item?.description && (
                          <span className="text-[10px] sm:text-xs text-gray-600 bg-purple-300 px-3 py-1 rounded-full">
                            {isRecharge ? "Wallet Recharge" : item.description}
                          </span>
                        )}

                        {isRecharge && (
                          <button
                            type="button"
                            onClick={() => downloadInvoice(item.id)}
                            disabled={invoiceLoading === item.id}
                            title="Download Invoice"
                            aria-label="Download Invoice"
                            className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 transition disabled:opacity-50"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width={18}
                              height={18}
                              viewBox="0 0 640 640"
                            >
                              <path
                                fill="rgb(30, 48, 80)"
                                d="M352 96C352 78.3 337.7 64 320 64C302.3 64 288 78.3 288 96L288 306.7L246.6 265.3C234.1 252.8 213.8 252.8 201.3 265.3C188.8 277.8 188.8 298.1 201.3 310.6L297.3 406.6C309.8 419.1 330.1 419.1 342.6 406.6L438.6 310.6C451.1 298.1 451.1 277.8 438.6 265.3C426.1 252.8 405.8 252.8 393.3 265.3L352 306.7L352 96zM160 384C124.7 384 96 412.7 96 448L96 480C96 515.3 124.7 544 160 544L480 544C515.3 544 544 515.3 544 480L544 448C544 412.7 515.3 384 480 384L433.1 384L376.5 440.6C345.3 471.8 294.6 471.8 263.4 440.6L206.9 384L160 384zM464 440C477.3 440 488 450.7 488 464C488 477.3 477.3 488 464 488C450.7 488 440 477.3 440 464C440 450.7 450.7 440 464 440z"
                              />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* RIGHT */}
                    <div className="flex flex-col justify-between">
                      <div className="text-[10px] flex gap-1 sm:text-xs text-right text-gray-500">
                        <p>
                          {new Date(Number(item.createdAt)).toLocaleDateString(
                            "en-GB",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            },
                          )}
                        </p>

                        <p>
                          ,
                          {new Date(Number(item.createdAt)).toLocaleTimeString(
                            "en-US",
                            {
                              hour: "numeric",
                              minute: "2-digit",
                              hour12: true,
                            },
                          )}
                        </p>
                      </div>

                      <div className="sm:flex hidden justify-end mt-4">
                        <span
                          className={`px-4 py-1 rounded-full text-xs font-medium ${
                            isDebit
                              ? "bg-red-100 text-red-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {isDebit ? "Debit Transaction" : "Credit Transaction"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* PAGINATION */}
        <div className="flex items-center justify-center mt-6">
          {/* <div className="text-sm text-gray-600">
            Total Transactions:{" "}
            <span className="font-bold text-black">
              {response?.totalCount || 0}
            </span>
          </div> */}

          <div className="flex items-center gap-3">
            <button
              disabled={page === 1}
              onClick={() => setPage((prev) => prev - 1)}
              className="px-4 py-1 text-[10px] sm:text-sm sm:py-2 text-black border rounded-xl disabled:opacity-50"
            >
              Prev
            </button>

            <span className="font-semibold text-xs text-black">
              Page {page} / {response?.totalPages || 1}
            </span>

            <button
              disabled={page === response?.totalPages}
              onClick={() => setPage((prev) => prev + 1)}
              className="px-4 py-1 text-[10px] sm:text-sm sm:py-2 text-black border rounded-xl disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>

        <div
          style={{
            position: "fixed",
            left: "-10000px",
            top: 0,
            width: "210mm",
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
