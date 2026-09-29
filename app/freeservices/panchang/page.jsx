import { astrologySeo } from "@/app/api/astrologySeo";
import PanchangPage from "./PanchangPage";
import { SEO_ENDPOINTS } from "@/app/api/seoEndpoints";

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || "https://dhwaniastro.com";

function getTodayParams() {
  const now = new Date();

  return {
    day: now.getDate(),
    month: now.getMonth() + 1,
    year: now.getFullYear(),
    lat: 28.6139,
    lon: 77.209,
    tzone: 5.5,
    hour: now.getHours(),
    min: now.getMinutes(),
  };
}

async function safeAstrologySeo(endpoint, params) {
  try {
    return await astrologySeo(endpoint, params);
  } catch (error) {
    console.error(
      `Astrology API failed for endpoint ${endpoint}:`,
      error?.message || error
    );

    return null;
  }
}

export async function generateMetadata() {
  const now = new Date();

  const formattedDate = now.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const params = {
    day: now.getDate(),
    month: now.getMonth() + 1,
    year: now.getFullYear(),
    lat: 28.6139,
    lon: 77.209,
    tzone: 5.5,
    hour: now.getHours(),
    min: now.getMinutes(),
  };

  const data = await safeAstrologySeo(
    SEO_ENDPOINTS.ADV_PANCHANG,
    params
  );

  const tithi =
    data?.tithi?.details?.tithi_name ??
    data?.tithi?.details?.name ??
    "Today's";

  const nakshatra =
    data?.nakshatra?.details?.nak_name ??
    data?.nakshatra?.details?.name ??
    "Panchang";

  const yoga =
    data?.yoga?.details?.yoga_name ??
    data?.yoga?.details?.name ??
    "Vedic Astrology";

  const title = `${tithi} Panchang Today (${formattedDate}) | ${nakshatra} | Dhwani Astro`;

  const description = `Today's Panchang for ${formattedDate}. Check ${tithi}, ${nakshatra}, ${yoga}, sunrise, sunset, Hora, Chaughadiya, Rahu Kaal and other Hindu calendar timings.`;

  return {
    title,

    description,

    keywords: [
      "Today's Panchang",
      "Aaj Ka Panchang",
      tithi,
      nakshatra,
      yoga,
      "Hora",
      "Chaughadiya",
      "Rahu Kaal",
      "Hindu Calendar",
      "Vedic Panchang",
    ].filter(Boolean),

    openGraph: {
      title: `${tithi} Panchang - ${formattedDate}`,
      description: `Today's Panchang including ${nakshatra}, ${yoga}, Hora and Chaughadiya.`,
      url: `${BASE_URL}/freeservices/panchang`,
      siteName: "Dhwani Astro",
      type: "website",

      images: [
        {
          url: `${BASE_URL}/ds-img/panchang-banner.webp`,
          width: 1200,
          height: 630,
          alt: "Today's Panchang",
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title: `${tithi} Panchang Today`,
      description: `Today's Panchang with ${nakshatra}.`,
      images: [`${BASE_URL}/ds-img/panchang-banner.webp`],
    },

    alternates: {
      canonical: `${BASE_URL}/freeservices/panchang`,
    },

    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function Panchang() {
  const params = getTodayParams();

  const [panchangResult, chaughadiyaResult, horaResult] =
    await Promise.all([
      safeAstrologySeo(
        SEO_ENDPOINTS.ADV_PANCHANG,
        params
      ),

      safeAstrologySeo(
        SEO_ENDPOINTS.CHAUGHADIYA,
        params
      ),

      safeAstrologySeo(
        SEO_ENDPOINTS.HORA,
        params
      ),
    ]);

  return (
    <PanchangPage
      initialPanchang={
        panchangResult?.data || panchangResult || null
      }
      initialChaughadiya={
        chaughadiyaResult?.data ||
        chaughadiyaResult ||
        null
      }
      initialHora={
        horaResult?.data ||
        horaResult ||
        null
      }
    />
  );
}
