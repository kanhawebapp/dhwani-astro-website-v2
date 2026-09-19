"use client";

import { useGetPujaSuggestionQuery } from "@/app/redux/services/astrologyAPI";
import CustomButton from "@/components/Custom/CustomButton";
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export default function PujasuggestClient({ formData }) {
  const skip = !formData;

  const {
    data: pujaData,
    isLoading,
    error,
  } = useGetPujaSuggestionQuery(formData, {
    skip,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center flex-col gap-4 items-center h-32">
        <span className="loader-all" />
        <span className="text-purple-600 font-medium">
          Loading Puja Suggestions...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-center text-red-500">
        Failed to load Puja suggestions.
      </p>
    );
  }

  if (!pujaData) {
    return (
      <p className="text-center text-red-500">
        No Puja suggestions available.
      </p>
    );
  }

  const suggestions = pujaData?.suggestions || [];

  return (
    <div className="basic-kundli-charts flex flex-col gap-2 md:col-span-4 items-center ">
      <section className="text-black w-full flex flex-col gap-4 border border-purple-100 rounded-2xl px-4 py-3 shadow-md">
        <span className="text-center font-semibold  sm:text-2xl text-purple-700">
          Puja Suggestions
        </span>

            <p className="text-center text-[12px] sm:text-sm text-gray-700">
          {pujaData.summary || "No summary available"}
        </p>

        <div className="flex flex-col gap-4">
          {suggestions.length > 0 ? (
            suggestions.map((sug, index) => (
              <div
                key={index}
                className="flex flex-col gap-1 border border-purple-200 rounded-2xl shadow-lg px-5 py-4 bg-purple-100"
              >
                <h3 className="sm:text-xl text-sm font-semibold text-purple-600">
                  {sug.title}
                </h3>

                <div className="text-sm">
                  <b>Present in your Kundli:</b>{" "}
                  {sug.status ? "Yes" : "No"}
                </div>

                <div className="text-sm">
                  <b>Description:</b>
                  <p className="text-gray-700 sm:text-sm text-xs">{sug.summary}</p>
                </div>

                <div className="sm:text-sm text-xs  text-gray-700">
                  {sug.one_line}
                </div>

                <div className="mt-2 flex justify-center">
                  <CustomButton
                    className="bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-full text-xs sm:text-sm px-4 py-2"
                    onClick={() => {
                      let url = null;
                      if (sug.title === "Kal Sarpa Dosha Shanti Pujan") {
                        url =
                          `${BASE_URL}/product-details/kaalsarp-dosha-nivaran-pooja`;
                      } else if (
                        sug.title === "Pitri Dosha Shanti Pujan"
                      ) {
                        url =
                          "${BASE_URL}/product-details/pitra-dosha-nivaran";
                      }

                      if (url) window.location.href = url;
                      else alert(`Booking ${sug.title}`);
                    }}
                  >
                    Book Now
                  </CustomButton>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-400 text-center">
              No puja suggestions available.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
