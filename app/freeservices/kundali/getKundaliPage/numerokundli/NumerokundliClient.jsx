"use client";

import {
  useGetNumeroDailyQuery,
  useGetNumeroDetQuery,
  useGetNumeroReportQuery,
  useGetNumeroFavQuery,
  useGetNumeroPlaceQuery,
  useGetNumeroFastQuery,
  useGetNumeroLordQuery,
  useGetNumeroMantraQuery,
} from "@/app/redux/services/astrologyAPI";

import NumerokundliUI from "./NumerokundliUI";

export default function NumerokundliClient({ formData }) {
  const skip = !formData;

  const {
    data: main,
    isLoading: loadingMain,
    error: errorMain,
  } = useGetNumeroDailyQuery(formData, { skip });

  const {
    data: det,
    isLoading: loadingDet,
    error: errorDet,
  } = useGetNumeroDetQuery(formData, { skip });

  const {
    data: repo,
    isLoading: loadingRepo,
    error: errorRepo,
  } = useGetNumeroReportQuery(formData, { skip });

  const {
    data: fav,
    isLoading: loadingFav,
    error: errorFav,
  } = useGetNumeroFavQuery(formData, { skip });

  const {
    data: place,
    isLoading: loadingPlace,
    error: errorPlace,
  } = useGetNumeroPlaceQuery(formData, { skip });

  const {
    data: fast,
    isLoading: loadingFast,
    error: errorFast,
  } = useGetNumeroFastQuery(formData, { skip });

  const {
    data: lord,
    isLoading: loadingLord,
    error: errorLord,
  } = useGetNumeroLordQuery(formData, { skip });

  const {
    data: mantra,
    isLoading: loadingMantra,
    error: errorMantra,
  } = useGetNumeroMantraQuery(formData, { skip });

  const loading =
    loadingMain ||
    loadingDet ||
    loadingRepo ||
    loadingFav ||
    loadingPlace ||
    loadingFast ||
    loadingLord ||
    loadingMantra;

  const error =
    errorMain ||
    errorDet ||
    errorRepo ||
    errorFav ||
    errorPlace ||
    errorFast ||
    errorLord ||
    errorMantra;

  if (loading) {
    return (
      <div className="flex justify-center flex-col gap-4 items-center h-32">
        <span className="loader-all"></span>
        <span className="ml-3 text-purple-600 font-medium">
          Loading Numerology...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-center text-red-500">
        Failed to load Numerology data.
      </p>
    );
  }

  if (!main) {
    return (
      <p className="text-center text-gray-400">
        No Numerology data available.
      </p>
    );
  }

  return (
    <NumerokundliUI
      data={{
        main,
        det,
        repo,
        fav,
        place,
        fast,
        lord,
        mantra, 
      }}
    />
  );
}