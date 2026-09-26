import { unstable_cache } from "next/cache";

import {
  fetchMoonBio,
  fetchMyDay,
  fetchNumeroDay,
  fetchNakPrev,
  fetchNakToday,
  fetchNakTomorrow,
  fetchManglik,
  fetchKalSharp,
  fetchPitraDosha,
  fetchSadheSati,
  fetchSadheRemedies,
  fetchSadheDetails,
  fetchLalKitab,
  fetchLalDebt,
  fetchLalHouses,
  fetchLalPlanet,
  fetchGemSuggestion,
  fetchPujaSuggestion,
  fetchRudraSuggestion,
  fetchGenAscRep,
  fetchGenNakRep,
  fetchCharDasha,
  fetchCurrentCharDasha,
  fetchYoginiDasha,
  fetchCurrentYoginiDasha,
  fetchNumeroPred,
  fetchNumeroDet,
  fetchNumeroRepo,
  fetchNumeroFav,
  fetchNumeroPlace,
  fetchNumeroFast,
  fetchNumeroLord,
  fetchNumeroMantra,
  fetchKPPlanets,
  fetchKPHouses,
  fetchKPPlanetSignificators,
  fetchBasicPanchang,
  fetchAstroDetails,
  fetchBirthDetails,
  fetchPlanetPositions,
  fetchVimAll,
} from "@/app/api/astrologySeo";


const CACHE_TIME = 3600;

function createCachedFetcher(key, fetcher) {
  return async (payload) => {
    return unstable_cache(
      () => fetcher(payload),
      [key, JSON.stringify(payload)],
      {
        revalidate: CACHE_TIME,
      }
    )();
  };
}

// Moon
export const getMoonBio = createCachedFetcher(
  "moon_biorhythm",
  fetchMoonBio
);

// My Day
export const getMyDay = createCachedFetcher(
  "daily_prediction",
  fetchMyDay
);

export const getNumeroDay = createCachedFetcher(
  "numero_day",
  fetchNumeroDay
);

// Nakshatra
export const getNakPrev = createCachedFetcher(
  "nak_prev",
  fetchNakPrev
);

export const getNakToday = createCachedFetcher(
  "nak_today",
  fetchNakToday
);

export const getNakTomorrow = createCachedFetcher(
  "nak_tomorrow",
  fetchNakTomorrow
);

// Doshas
export const getManglik = createCachedFetcher(
  "manglik",
  fetchManglik
);

export const getKalSharp = createCachedFetcher(
  "kalsarpa",
  fetchKalSharp
);

export const getPitraDosha = createCachedFetcher(
  "pitra_dosha",
  fetchPitraDosha
);

// Sade Sati
export const getSadheSati = createCachedFetcher(
  "sadesati_status",
  fetchSadheSati
);

export const getSadheRemedies = createCachedFetcher(
  "sadesati_remedies",
  fetchSadheRemedies
);

export const getSadheDetails = createCachedFetcher(
  "sadesati_details",
  fetchSadheDetails
);

// Lal Kitab
export const getLalKitab = createCachedFetcher(
  "lalkitab",
  fetchLalKitab
);

export const getLalDebt = createCachedFetcher(
  "lalkitab_debts",
  fetchLalDebt
);

export const getLalHouses = createCachedFetcher(
  "lalkitab_houses",
  fetchLalHouses
);

export const getLalPlanet = createCachedFetcher(
  "lalkitab_planets",
  fetchLalPlanet
);

// Suggestions
export const getGemSuggestion = createCachedFetcher(
  "gem_suggestion",
  fetchGemSuggestion
);

export const getPujaSuggestion = createCachedFetcher(
  "puja_suggestion",
  fetchPujaSuggestion
);

export const getRudraSuggestion = createCachedFetcher(
  "rudraksha_suggestion",
  fetchRudraSuggestion
);

// Ascendant
export const getGenAscRep = createCachedFetcher(
  "general_ascendant",
  fetchGenAscRep
);

export const getGenNakRep = createCachedFetcher(
  "general_nakshatra",
  fetchGenNakRep
);

// Dasha
export const getCharDasha = createCachedFetcher(
  "char_dasha",
  fetchCharDasha
);

export const getCurrentCharDasha = createCachedFetcher(
  "current_char_dasha",
  fetchCurrentCharDasha
);

export const getYoginiDasha = createCachedFetcher(
  "yogini_dasha",
  fetchYoginiDasha
);

export const getCurrentYoginiDasha = createCachedFetcher(
  "current_yogini_dasha",
  fetchCurrentYoginiDasha
);

// Numerology
export const getNumeroPred = createCachedFetcher(
  "numero_prediction",
  fetchNumeroPred
);

export const getNumeroDet = createCachedFetcher(
  "numero_table",
  fetchNumeroDet
);

export const getNumeroRepo = createCachedFetcher(
  "numero_report",
  fetchNumeroRepo
);

export const getNumeroFav = createCachedFetcher(
  "numero_fav_time",
  fetchNumeroFav
);

export const getNumeroPlace = createCachedFetcher(
  "numero_place",
  fetchNumeroPlace
);

export const getNumeroFast = createCachedFetcher(
  "numero_fast",
  fetchNumeroFast
);

export const getNumeroLord = createCachedFetcher(
  "numero_lord",
  fetchNumeroLord
);

export const getNumeroMantra = createCachedFetcher(
  "numero_mantra",
  fetchNumeroMantra
);

// KP
export const getKPPlanets = createCachedFetcher(
  "kp_planets",
  fetchKPPlanets
);

export const getKPHouses = createCachedFetcher(
  "kp_houses",
  fetchKPHouses
);

export const getKPPlanetSignificators = createCachedFetcher(
  "kp_significators",
  fetchKPPlanetSignificators
);

// Birth
export const getBasicPanchang = createCachedFetcher(
  "basic_panchang",
  fetchBasicPanchang
);

export const getAstroDetails = createCachedFetcher(
  "astro_details",
  fetchAstroDetails
);

export const getBirthDetails = createCachedFetcher(
  "birth_details",
  fetchBirthDetails
);

export const getPlanetPositions = createCachedFetcher(
  "planets",
  fetchPlanetPositions
);

export const getVimAll = createCachedFetcher(
  "major_vdasha",
  fetchVimAll
);