"use client";

import { useGetGeneralNakshatraQuery } from "@/app/redux/services/astrologyAPI";
import GeneralUI from "./GeneralUI";

export default function GeneralClient({ formData }) {
  const skip = !formData;

  const {
    data: gendata,
    isLoading,
    error,
  } = useGetGeneralNakshatraQuery(formData, {
    skip,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center flex-col gap-4 items-center h-32">
        <span className="loader-all"></span>
        <span className="text-purple-600 font-medium">Loading Reports...</span>
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-center text-red-500">
        Failed to fetch General Prediction data...
      </p>
    );
  }

  if (!gendata || typeof gendata !== "object") {
    return (
      <p className="text-center text-red-500">
        Failed to fetch General Prediction data...
      </p>
    );
  }

  return <GeneralUI gendata={gendata} />;
}
