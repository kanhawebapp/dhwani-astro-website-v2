"use client";

import { useState } from "react";
import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import Image from "next/image";
import ChatMessagePopUp from "../ChatMessagePopUp";
import RemedyPopUp from "../RemedyPopUp";

const GET_USER_CHAT_HISTORY = gql`
  query GetUserChatHistory($filter: UserChatHistoryFilterInput) {
    getUserChatHistory(filter: $filter) {
      success

      summary {
        totalCoinsDeducted
        totalCoinsEarned
        totalCommission
        totalRecords
      }

      totalCount
      currentPage
      totalPages

      data {
        srNo
        roomId
        sessionId
        status
        source
        durationSec
        durationMinutes
        ratePerMin
        coinsDeducted
        coinsEarned
        commission
        createdAt

        astrologer {
          name
        }

        lastMessage {
          message
          image
        }
      }
    }
  }
`;

export default function ChatHistoryPage() {
  const [page, setPage] = useState(1);
  const [openChatModal, setOpenChatModal] = useState(false);

  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [openRemedyModal, setOpenRemedyModal] = useState(false);

  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    status: "",
    astrologerName: "",
    startDate: "",
    endDate: "",
  });
  const cleanedFilter = Object.fromEntries(
    Object.entries(filters).filter(
      ([_, value]) => value !== "" && value !== null && value !== undefined,
    ),
  );

  const { data, loading, error, refetch } = useQuery(GET_USER_CHAT_HISTORY, {
    variables: {
      filter: cleanedFilter,
    },
    fetchPolicy: "network-only",
  });

  const history = data?.getUserChatHistory;
  const handleSearch = () => {
    const cleanedFilter = Object.fromEntries(
      Object.entries(filters).filter(
        ([_, value]) => value !== "" && value !== null && value !== undefined,
      ),
    );

    refetch({
      filter: {
        ...cleanedFilter,
        page: 1,
      },
    });
  };

  return (
    <div className="min-h-screen text-black p-0 sm:p-5 bg-gray-100">
      <div className="sm:p-5 p-3 bg-white shadow-xl rounded-3xl">
        {/* HEADER */}
        <div className="flex flex-col justify-between gap-4 mb-3 sm:mb-6 md:flex-row md:items-center">
          <div>
            <h1 className="text-base sm:text-3xl font-bold text-purple-900">
              Chat History
            </h1>
          </div>
        </div>

        {/* SUMMARY */}
        <div className="grid grid-cols-2 gap-4 mb-3 sm:mb-6 md:grid-cols-4">
          <div className="p-2 sm:p-4 bg-violet-200 shadow flex items-center justify-between  rounded-2xl">
            <p className="text-xs sm:text-sm text-gray-500">Total Chats</p>

            <h2 className="text-sm sm:text-xl font-bold">
              {history?.summary?.totalRecords || 0}
            </h2>
          </div>

          <div className="p-4 bg-purple-200 shadow  items-center justify-between flex rounded-2xl">
            <p className="text-xs sm:text-sm text-gray-500">Amount Deducted</p>

            <h2 className=" text-sm sm:text-xl  font-bold">
              {history?.summary?.totalCoinsDeducted || 0}
            </h2>
          </div>
        </div>

        {/* FILTERS */}
        <div className="grid grid-cols-1 gap-4 p-4 mb-6 bg-white shadow md:grid-cols-5 rounded-2xl">
          <input
            type="text"
            placeholder="Astrologer Name"
            className="px-4 py-2 border border-gray-300 placeholder:text-gray-300 placeholder:text-xs rounded-full"
            value={filters.astrologerName}
            onChange={(e) =>
              setFilters({
                ...filters,
                astrologerName: e.target.value,
              })
            }
          />

          <select
            className="px-4 py-2 border border-gray-300 text-xs text-gray-400 rounded-full"
            value={filters.status}
            onChange={(e) =>
              setFilters({
                ...filters,
                status: e.target.value,
              })
            }
          >
            <option value="">All Status</option>
            <option value="COMPLETED">Completed</option>
            <option value="ONGOING">Ongoing</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          <input
            type="date"
            className="px-4 py-2 border hidden sm:block border-gray-300 text-xs text-gray-400 rounded-full"
            value={filters.startDate}
            onChange={(e) =>
              setFilters({
                ...filters,
                startDate: e.target.value,
              })
            }
          />

          <input
            type="date"
            className="px-4 py-2 border hidden sm:block border-gray-300 text-xs text-gray-400 rounded-full"
            value={filters.endDate}
            onChange={(e) =>
              setFilters({
                ...filters,
                endDate: e.target.value,
              })
            }
          />

          <button
            onClick={handleSearch}
            className="px-4 py-1 sm:py-2 text-white bg-purple-900 rounded-xl"
          >
            Search
          </button>
        </div>

        {/* LOADING */}
        {loading && <div className="p-10 text-center">Loading chats...</div>}

        {/* ERROR */}
        {error && (
          <div className="p-4 text-red-500 bg-white rounded-xl">
            Something went wrong
          </div>
        )}

        {/* CHAT LIST */}
        <div className="space-y-4 text-black">
          {history?.data?.map((chat, index) => (
            <div
              key={index}
              className="sm:p-3 p-2  bg-purple-50 shadow rounded-2xl"
            >
              <div className="flex flex-col  px-2  justify-between gap-1 sm:gap-4 md:flex-row">
                <div className="flex gap-4">
                  <div>
                    <h2 className="text-xs sm:text-sm font-semibold">
                      {chat?.astrologer?.name}
                    </h2>

                    <p className="mt-1 text-xs sm:text-sm text-gray-500">
                      Session ID: {chat?.sessionId?.slice(0, 8)}
                    </p>

                    <div className="flex flex-wrap gap-1 sm:gap-3 mt-2">
                      <p className="px-3 py-1 text-[10px] bg-violet-200 rounded-full">
                        {chat.durationSec < 60
                          ? `${chat.durationSec} sec`
                          : `${Math.floor(chat.durationSec / 60)} min${
                              chat.durationSec % 60
                                ? ` ${chat.durationSec % 60} sec`
                                : ""
                            }`}
                      </p>

                      <span className="px-3 py-1 text-[10px] bg-purple-300 rounded-full">
                        ₹ {chat?.ratePerMin}/min
                      </span>
                      <span className="px-3 py-1 text-[10px] bg-violet-300 rounded-full">
                        {chat?.source}
                      </span>

                      <span
                        className={`px-3 py-1 text-[10px] rounded-full ${
                          chat?.status === "COMPLETED"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {chat?.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* RIGHT */}
                <div className="flex sm:flex-col items-center justify-between">
                  <div className="text-[8px] sm:text-xs flex gap-1 text-right text-gray-500">
                    <p>
                      {new Date(chat?.createdAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>

                    <p>
                      ,{" "}
                      {new Date(chat?.createdAt).toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </p>
                  </div>
                  <span className="px-3 py-1 text-[10px] bg-red-200  rounded-full">
                    Deduction : ₹{chat?.coinsDeducted}
                  </span>

                  {chat?.status === "COMPLETED" && (
                    <div className="flex bg-black/10 rounded-full px-3 py-1 items-center justify-end gap-4 ">
                      {/* View Chat */}
                      <span
                        title="View Chat"
                        className="flex items-center justify-center transition-all cursor-pointer hover:scale-110"
                        onClick={() => {
                          setSelectedSessionId(chat?.sessionId);
                          setOpenChatModal(true);
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          height={18}
                          width={18}
                          viewBox="0 0 640 640"
                          className="fill-#000 w-3 h-3"
                        >
                          <path d="M320 96C239.2 96 174.5 132.8 127.4 176.6C80.6 220.1 49.3 272 34.4 307.7C31.1 315.6 31.1 324.4 34.4 332.3C49.3 368 80.6 420 127.4 463.4C174.5 507.1 239.2 544 320 544C400.8 544 465.5 507.2 512.6 463.4C559.4 419.9 590.7 368 605.6 332.3C608.9 324.4 608.9 315.6 605.6 307.7C590.7 272 559.4 220 512.6 176.6C465.5 132.9 400.8 96 320 96zM176 320C176 240.5 240.5 176 320 176C399.5 176 464 240.5 464 320C464 399.5 399.5 464 320 464C240.5 464 176 399.5 176 320zM320 256C320 291.3 291.3 320 256 320C244.5 320 233.7 317 224.3 311.6C223.3 322.5 224.2 333.7 227.2 344.8C240.9 396 293.6 426.4 344.8 412.7C396 399 426.4 346.3 412.7 295.1C400.5 249.4 357.2 220.3 311.6 224.3C316.9 233.6 320 244.4 320 256z" />
                        </svg>
                      </span>

                      {/* View Remedy */}
                      <span
                        title="View Remedies"
                        className="flex items-center justify-center transition-all cursor-pointer hover:scale-110"
                        onClick={() => {
                          setSelectedSessionId(chat?.sessionId);
                          setOpenRemedyModal(true);
                        }}
                      >
                        <svg
                          height={18}
                          width={18}
                          viewBox="0 0 640 640"
                          className="fill-#000 w-3 h-3"
                        >
                          <path d="M311.6 95C297.5 75.5 274.9 64 250.9 64C209.5 64 176 97.5 176 138.9L176 141.3C176 205.7 258 274.7 298.2 304.6C311.2 314.3 328.7 314.3 341.7 304.6C381.9 274.6 463.9 205.7 463.9 141.3L463.9 138.9C463.9 97.5 430.4 64 389 64C365 64 342.4 75.5 328.3 95L320 106.7L311.6 95zM141.3 405.5L98.7 448L64 448C46.3 448 32 462.3 32 480L32 544C32 561.7 46.3 576 64 576L384.5 576C413.5 576 441.8 566.7 465.2 549.5L591.8 456.2C609.6 443.1 613.4 418.1 600.3 400.3C587.2 382.5 562.2 378.7 544.4 391.8L424.6 480L312 480C298.7 480 288 469.3 288 456C288 442.7 298.7 432 312 432L384 432C401.7 432 416 417.7 416 400C416 382.3 401.7 368 384 368L231.8 368C197.9 368 165.3 381.5 141.3 405.5z" />
                        </svg>
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* PAGINATION */}
        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            disabled={page === 1}
            onClick={() => {
              const prev = page - 1;

              setPage(prev);

              setFilters({
                ...filters,
                page: prev,
              });
            }}
            className="px-4 py-1 text-[10px] sm:text-sm sm:py-2 bg-white shadow rounded-xl disabled:opacity-50"
          >
            Prev
          </button>

          <span className="text-xs ">
            Page {history?.currentPage || 1} of {history?.totalPages || 1}
          </span>

          <button
            disabled={page === history?.totalPages}
            onClick={() => {
              const next = page + 1;

              setPage(next);

              setFilters({
                ...filters,
                page: next,
              });
            }}
            className="px-4 py-1 text-[10px] sm:text-sm sm:py-2 bg-white shadow rounded-xl disabled:opacity-50"
          >
            Next
          </button>
        </div>
        <ChatMessagePopUp
          open={openChatModal}
          onClose={() => setOpenChatModal(false)}
          sessionId={selectedSessionId}
        />
        <RemedyPopUp
          open={openRemedyModal}
          onClose={() => setOpenRemedyModal(false)}
          sessionId={selectedSessionId}
        />
      </div>
    </div>
  );
}
