import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// const encodedAuth = 'NjE4NzQyOjdjMjA1OTllYjIzYmUyNzZlOGM4YWNlOGJlZjg4MGMy';
const USER_ID = process.env.NEXT_PUBLIC_ASTROLOGY_USER_ID || "618742";
const API_KEY = process.env.NEXT_PUBLIC_ASTROLOGY_API_KEY ||  "7c20599eb23be276e8c8ace8bef880c2";
const sanitizeBody = (body = {}) => ({
  day: Number(body.day),
  month: Number(body.month),
  year: Number(body.year),
  hour: Number(body.hour),
  min: Number(body.min),
  lat: Number(body.lat),
  lon: Number(body.lon),
  tzone: Number(body.tzone),
});

const ASTRO_ENDPOINTS = {
  DAILY_PRED: "daily_nakshatra_prediction",
  // Birth
  BIRTH_DETAILS: "birth_details",
  PLANETS: "planets",
  MAJOR_VDASHA: "major_vdasha",
  BASIC_PANCHANG: "basic_panchang",
  ASTRO_DETAILS: "astro_details",
  MOON_BIORHYTHM: "moon_biorhythm",

  // Numerology
  NUMERO_DAILY: "numero_prediction/daily",
  NUMERO_TABLE: "numero_table",
  NUMERO_REPORT: "numero_report",
  NUMERO_FAV_TIME: "numero_fav_time",
  NUMERO_PLACE: "numero_place_vastu",
  NUMERO_FAST: "numero_fasts_report",
  NUMERO_LORD: "numero_fav_lord",
  NUMERO_MANTRA: "numero_fav_mantra",

  // Nakshatra
  NAKSHATRA_TODAY: "daily_nakshatra_prediction",
  NAKSHATRA_PREVIOUS: "daily_nakshatra_prediction/previous",
  NAKSHATRA_NEXT: "daily_nakshatra_prediction/next",
  // General
  GENERAL_NAKSHATRA: "general_nakshatra_report",
  GENERAL_ASCENDANT: "general_ascendant_report",

  // Dosha
  MANGLIK: "manglik",
  KALSHARP: "kalsarpa_details",
  PITRA_DOSHA: "pitra_dosha_report",
  SADE_SATI: "sadhesati_current_status",
  SADE_SATI_REMEDIES: "sadhesati_remedies",
  SADE_SATI_DETAILS: "sadhesati_life_details",

  // Lal Kitab
  LAL_KITAB: "lalkitab_horoscope",
  LAL_DEBTS: "lalkitab_debts",
  LAL_HOUSES: "lalkitab_houses",
  LAL_PLANETS: "lalkitab_planets",

  // Suggestions
  GEM: "basic_gem_suggestion",
  PUJA: "puja_suggestion",
  RUDRAKSHA: "rudraksha_suggestion",

  // KP
  KP_PLANETS: "kp_planets",
  KP_HOUSES: "kp_house_significator",

  // Dasha
  CHAR_DASHA: "major_chardasha",
  CURRENT_CHAR_DASHA: "current_chardasha",
  YOGINI_DASHA: "major_yogini_dasha",
  CURRENT_YOGINI_DASHA: "current_yogini_dasha",

  // Match
  MATCH_POINTS: "match_ashtakoot_points",
  MATCH_OBSTRUCTION: "match_obstructions",
  MATCH_ASTRO: "match_astro_details",
  MATCH_MANGLIK: "match_manglik_report",
  MATCH_REPORT: "match_making_report",

  // Panchang
  ADV_PANCHANG: "advanced_panchang",
  CHAUGHADIYA: "chaughadiya_muhurta",
  HORA: "hora_muhurta",
};

const createPostQuery = (url, tag) => ({
  query: (body) => ({
    url,
    method: "POST",
    body: sanitizeBody(body),
  }),
  providesTags: [tag],
});

const createRawPostQuery = (url, tag) => ({
  query: (body) => ({
    url,
    method: "POST",
    body,
  }),
  providesTags: [tag],
});
export const astrologyApi = createApi({
  reducerPath: "astrologyApi",

  baseQuery: fetchBaseQuery({
    baseUrl: "https://json.astrologyapi.com/v1/",
    prepareHeaders: (headers) => {
      headers.set("Authorization", "Basic " + btoa(`${USER_ID}:${API_KEY}`));
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),

  keepUnusedDataFor: 60 * 60, // 1 hour

  refetchOnFocus: false,
  refetchOnReconnect: false,
  refetchOnMountOrArgChange: false,

  tagTypes: [
    "Planet",
    "Birth",
    "General",
    "Dosha",
    "Numerology",
    "Horoscope",
    "Panchang",
    "Suggestion",
    "Match",
    "CharDasha",
    "Nakshatra",
  ],

  endpoints: (builder) => ({
    // birth details apis
    getBirthDetails: builder.mutation({
      query: (body) => ({
        url: "birth_details",
        method: "POST",
        body,
      }),
    }),
        getDailyPred: builder.query(
      createPostQuery(ASTRO_ENDPOINTS.DAILY_PRED, "Daily"),
    ),
    getPlanetPositions: builder.query(
      createPostQuery(ASTRO_ENDPOINTS.PLANETS, "Planet"),
    ),
    getVimAll: builder.query(
      createPostQuery(ASTRO_ENDPOINTS.MAJOR_VDASHA, "Planet"),
    ),
    getBasicPanchang: builder.query(
      createPostQuery(ASTRO_ENDPOINTS.BASIC_PANCHANG, "Birth"),
    ),
    getAstroDetails: builder.query(
      createPostQuery(ASTRO_ENDPOINTS.ASTRO_DETAILS, "Birth"),
    ),
    getMoonBio: builder.query(
      createPostQuery(ASTRO_ENDPOINTS.MOON_BIORHYTHM, "General"),
    ),
    // Numerolo apis
    getNumeroDaily: builder.query(
      createPostQuery(ASTRO_ENDPOINTS.NUMERO_DAILY, "Numerology"),
    ),
    getNumeroDet: builder.query(
      createPostQuery(ASTRO_ENDPOINTS.NUMERO_TABLE, "Numerology"),
    ),
    getNumeroReport: builder.query(
      createPostQuery(ASTRO_ENDPOINTS.NUMERO_REPORT, "Numerology"),
    ),
    getNumeroFav: builder.query(
      createPostQuery(ASTRO_ENDPOINTS.NUMERO_FAV_TIME, "Numerology"),
    ),
    getNumeroPlace: builder.query(
      createPostQuery(ASTRO_ENDPOINTS.NUMERO_PLACE, "Numerology"),
    ),
    getNumeroFast: builder.query(
      createPostQuery(ASTRO_ENDPOINTS.NUMERO_FAST, "Numerology"),
    ),
    getNumeroLord: builder.query(
      createPostQuery(ASTRO_ENDPOINTS.NUMERO_LORD, "Numerology"),
    ),
    getNumeroMantra: builder.query(
      createPostQuery(ASTRO_ENDPOINTS.NUMERO_MANTRA, "Numerology"),
    ),
    // nakshatar apis
    getDailyNakshatra: builder.query(
      createPostQuery(ASTRO_ENDPOINTS.NAKSHATRA_TODAY, "Nakshatra"),
    ),
    getPrevNakshatra: builder.query(
      createPostQuery(ASTRO_ENDPOINTS.NAKSHATRA_PREVIOUS, "Nakshatra"),
    ),
    getNextNakshatra: builder.query(
      createPostQuery(ASTRO_ENDPOINTS.NAKSHATRA_NEXT, "Nakshatra"),
    ),
    // general apis
    getGeneralNakshatra: builder.query(
      createPostQuery(ASTRO_ENDPOINTS.GENERAL_NAKSHATRA, "General"),
    ),
    getGeneralAscendant: builder.query(
      createPostQuery(ASTRO_ENDPOINTS.GENERAL_ASCENDANT, "General"),
    ),
    getManglik: builder.query(
      createPostQuery(ASTRO_ENDPOINTS.MANGLIK, "Dosha"),
    ),
    getKalsharp: builder.query(
      createPostQuery(ASTRO_ENDPOINTS.KALSHARP, "Dosha"),
    ),
    getPitraDosha: builder.query(
      createPostQuery(ASTRO_ENDPOINTS.PITRA_DOSHA, "Dosha"),
    ),
    getSadeSati: builder.query(
      createPostQuery(ASTRO_ENDPOINTS.SADE_SATI, "Dosha"),
    ),
    getSadeSatiLifeDetails: builder.query(
      createPostQuery(ASTRO_ENDPOINTS.SADE_SATI_DETAILS, "Dosha"),
    ),
    getSadeSatiRemedies: builder.query(
      createPostQuery(ASTRO_ENDPOINTS.SADE_SATI_REMEDIES, "Dosha"),
    ),
    getLalKitab: builder.query(
      createPostQuery(ASTRO_ENDPOINTS.LAL_KITAB, "General"),
    ),
    getLalKitabDebts: builder.query(
      createPostQuery(ASTRO_ENDPOINTS.LAL_DEBTS, "General"),
    ),
    getLalKitabhouses: builder.query(
      createPostQuery(ASTRO_ENDPOINTS.LAL_HOUSES, "General"),
    ),
    getLalKitabPlanets: builder.query(
      createPostQuery(ASTRO_ENDPOINTS.LAL_PLANETS, "General"),
    ),
    getGemSuggestion: builder.query(
      createPostQuery(ASTRO_ENDPOINTS.GEM, "Suggestion"),
    ),
    getPujaSuggestion: builder.query(
      createPostQuery(ASTRO_ENDPOINTS.PUJA, "Suggestion"),
    ),
    getRudrakshaSuggestion: builder.query(
      createPostQuery(ASTRO_ENDPOINTS.RUDRAKSHA, "Suggestion"),
    ),
    getKPPlanets: builder.query(
      createPostQuery(ASTRO_ENDPOINTS.KP_PLANETS, "Planet"),
    ),
    getKPHouses: builder.query(
      createPostQuery(ASTRO_ENDPOINTS.KP_HOUSES, "Planet"),
    ),
    // major dasha apis
    getCharDasha: builder.query(
      createPostQuery(ASTRO_ENDPOINTS.CHAR_DASHA, "CharDasha"),
    ),
    getCurrentCharDasha: builder.query(
      createPostQuery(ASTRO_ENDPOINTS.CURRENT_CHAR_DASHA, "CharDasha"),
    ),
    getYoginiDasha: builder.query(
      createPostQuery(ASTRO_ENDPOINTS.YOGINI_DASHA, "CharDasha"),
    ),
    getCurrentYoginiDasha: builder.query(
      createPostQuery(ASTRO_ENDPOINTS.CURRENT_YOGINI_DASHA, "CharDasha"),
    ),
    // kundali match apis  -------------------------------
    getMatchAsktP: builder.mutation(
      createRawPostQuery(ASTRO_ENDPOINTS.MATCH_POINTS, "Match"),
    ),
    getMatchObst: builder.mutation(
      createRawPostQuery(ASTRO_ENDPOINTS.MATCH_OBSTRUCTION, "Match"),
    ),
    getMatchAstro: builder.mutation(
      createRawPostQuery(ASTRO_ENDPOINTS.MATCH_ASTRO, "Match"),
    ),
    getMatchManglik: builder.mutation(
      createRawPostQuery(ASTRO_ENDPOINTS.MATCH_MANGLIK, "Match"),
    ),
    getMatchMrepo: builder.mutation(
      createRawPostQuery(ASTRO_ENDPOINTS.MATCH_REPORT, "Match"),
    ),
    // kundali match apis end  -------------------------------
    getAdvPanchang: builder.query(
      createPostQuery(ASTRO_ENDPOINTS.ADV_PANCHANG, "Panchang"),
    ),
    getChaugadiya: builder.query(
      createPostQuery(ASTRO_ENDPOINTS.CHAUGHADIYA, "Panchang"),
    ),
    getHoraChart: builder.query(
      createPostQuery(ASTRO_ENDPOINTS.HORA, "Panchang"),
    ),
    // horoscope apis -----------------------------------------------------------------------
    getSunSignPredToday: builder.query({
      query: ({ zodiacName, body }) => ({
        url: `sun_sign_prediction/daily/${encodeURIComponent(zodiacName)}`,
        method: "POST",
        body,
      }),
      providesTags: ["Horoscope"],
    }),
    getSunSignPredNxt: builder.query({
      query: ({ zodiacName, body }) => ({
        url: `sun_sign_prediction/daily/next/${encodeURIComponent(zodiacName)}`,
        method: "POST",
        body,
      }),
      providesTags: ["Horoscope"],
    }),
    getSunSignPredPrev: builder.query({
      query: ({ zodiacName, body }) => ({
        url: `sun_sign_prediction/daily/previous/${encodeURIComponent(zodiacName)}`,
        method: "POST",
        body,
      }),
      providesTags: ["Horoscope"],
    }),
    getSunSignPredMonth: builder.query({
      query: ({ zodiacName, body }) => ({
        url: `horoscope_prediction/monthly/${encodeURIComponent(zodiacName)}`,
        method: "POST",
        body,
      }),
      providesTags: ["Horoscope"],
    }),
    // ------------------------------------------------------------------------------------------------------------
    getChartKundli: builder.mutation({
      query: ({ chartType, body }) => {
        const finalType = chartType === "chalit" ? ":chalit" : chartType;

        return {
          url: `horo_chart_image/${encodeURIComponent(finalType)}`,
          method: "POST",
          body,
        };
      },
    }),
  }),
});

export const {
  useGetDailyPredQuery,
  // Birth
  useGetBirthDetailsMutation,
  useGetPlanetPositionsQuery,
  useGetVimAllQuery,
  useGetBasicPanchangQuery,
  useGetAstroDetailsQuery,
  // Moon
  useGetMoonBioQuery,
  // Numerology
  useGetNumeroDailyQuery,
  useGetNumeroDetQuery,
  useGetNumeroReportQuery,
  useGetNumeroFavQuery,
  useGetNumeroPlaceQuery,
  useGetNumeroFastQuery,
  useGetNumeroLordQuery,
  useGetNumeroMantraQuery,
  // Nakshatra
  useGetDailyNakshatraQuery,
  useGetPrevNakshatraQuery,
  useGetNextNakshatraQuery,
  // General
  useGetGeneralNakshatraQuery,
  useGetGeneralAscendantQuery,
  // Dosha
  useGetManglikQuery,
  useGetKalsharpQuery,
  useGetPitraDoshaQuery,
  useGetSadeSatiQuery,
  useGetSadeSatiLifeDetailsQuery,
  useGetSadeSatiRemediesQuery,
  // Lal Kitab
  useGetLalKitabQuery,
  useGetLalKitabDebtsQuery,
  useGetLalKitabhousesQuery,
  useGetLalKitabPlanetsQuery,
  // KP
  useGetKPPlanetsQuery,
  useGetKPHousesQuery,
  // Suggestions
  useGetGemSuggestionQuery,
  useGetPujaSuggestionQuery,
  useGetRudrakshaSuggestionQuery,
  // Dasha
  useGetCharDashaQuery,
  useGetCurrentCharDashaQuery,
  useGetYoginiDashaQuery,
  useGetCurrentYoginiDashaQuery,
  // Match
  useGetMatchAsktPMutation,
  useGetMatchObstMutation,
  useGetMatchAstroMutation,
  useGetMatchManglikMutation,
  useGetMatchMrepoMutation,
  // Panchang
  useGetAdvPanchangQuery,
  useGetChaugadiyaQuery,
  useGetHoraChartQuery,
  // Horoscope
  useGetSunSignPredTodayQuery,
  useGetSunSignPredNxtQuery,
  useGetSunSignPredPrevQuery,
  useGetSunSignPredMonthQuery,
  // Charts
  useGetChartKundliMutation,
} = astrologyApi;
