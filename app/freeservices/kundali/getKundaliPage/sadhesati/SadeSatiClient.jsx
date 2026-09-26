"use client";

import {
  useGetSadeSatiLifeDetailsQuery,
  useGetSadeSatiQuery,
  useGetSadeSatiRemediesQuery,
} from "@/app/redux/services/astrologyAPI";
import Sadhesati from "./Sadhesati";

export default function SadeSatiClient({ formData }) {
  const skip = !formData;

  const {
    data: satiData,
    isLoading: satiLoading,
    error: satiError,
  } = useGetSadeSatiQuery(formData, { skip });

  const {
    data: remeData,
    isLoading: remeLoading,
    error: remeError,
  } = useGetSadeSatiRemediesQuery(formData, { skip });

  const {
    data: detailsData,
    isLoading: detailsLoading,
    error: detailsError,
  } = useGetSadeSatiLifeDetailsQuery(formData, { skip });

  const loading = satiLoading || remeLoading || detailsLoading;

  const error = satiError || remeError || detailsError;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <span className="loader-all" />
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-center text-red-500">Failed to load Sade Sati data.</p>
    );
  }

  if (!satiData) {
    return (
      <p className="text-center text-gray-400">No Sade Sati data available.</p>
    );
  }

  return (
    <Sadhesati
      satiData={satiData}
      remeData={remeData}
      detailsData={detailsData}
    />
  );
}
