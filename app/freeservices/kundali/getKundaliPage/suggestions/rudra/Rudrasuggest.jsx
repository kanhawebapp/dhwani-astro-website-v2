"use client";

import { useGetRudrakshaSuggestionQuery } from "@/app/redux/services/astrologyAPI";
import Image from "next/image";


export default function RudrasuggestClient({ formData }) {
  const skip = !formData;

  const {
    data: rudraData,
    isLoading,
    error,
  } = useGetRudrakshaSuggestionQuery(formData, {
    skip,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center flex-col gap-4 items-center h-32">
        <span className="loader-all" />
        <span className="text-purple-600 font-medium">
          Loading Rudraksha Suggestions...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-center text-red-500">
        Failed to load Rudraksha suggestions.
      </p>
    );
  }

  if (!rudraData) {
    return (
      <p className="text-center text-red-500">
        No Rudraksha suggestions available.
      </p>
    );
  }
  return (
    <section className="basic-details-main w-full flex flex-col gap-5">
      <div className="flex flex-col gap-5 text-black border border-purple-200 rounded-lg shadow-lg md:px-5 px-2 py-3 bg-purple-100">
          <span className="text-center font-semibold  sm:text-2xl text-purple-700">
          Rudraksha Suggestion
        </span>

        <div className="flex flex-col gap-3 text-sm">
          {/* <div className="flex justify-center">
            <Image
              src={`https://json.astrologyapi.com/v1/rudraksha_suggestion${rudraData.img_url}`}
              width={120}
              height={120}
              alt="Rudraksha image"
              className="rounded"
              unoptimized
            />
          </div> */}

          <Info label="Rudraksha Name" value={rudraData.name} />
          <Info label="Rudraksha Key" value={rudraData.rudraksha_key} />
          <Info label="Recommendation" value={rudraData.recommend} />
          <Info label="Details" value={rudraData.detail} />
        </div>
      </div>
    </section>
  );
}


function Info({ label, value }) {
  return (
    <div className="flex flex-col bg-purple-100 rounded-lg px-4 py-1">
      <h5 className="font-semibold">{label}:</h5>
      <span className="sm:text-sm text-xs text-gray-700 ">{value || "—"}</span>
    </div>
  );
}
