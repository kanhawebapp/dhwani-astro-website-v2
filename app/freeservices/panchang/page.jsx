import { astrologySeo } from "@/app/api/astrologySeo";
import PanchangPage from "./PanchangPage";
import { SEO_ENDPOINTS } from "@/app/api/seoEndpoints";
import JsonLd from "@/components/seo/JsonLd";
import { createBreadcrumbSchema } from "@/utils/schema";

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || "https://dhwaniastro.com";

const PAGE_URL = `${BASE_URL}/freeservices/panchang`;

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
      error?.message || error,
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
    params,
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
      "Panchang Today",
      "Hindu Panchang",
      "Hindu Calendar",
      "Vedic Panchang",
      "Panchang timings",
      "Tithi",
      "Nakshatra",
      "Yoga",
      "Hora",
      "Chaughadiya",
      "Rahu Kaal",
      tithi,
      nakshatra,
      yoga,
    ].filter(Boolean),

    alternates: {
      canonical: PAGE_URL,
    },

    openGraph: {
      title: `${tithi} Panchang - ${formattedDate}`,
      description: `Today's Panchang including ${nakshatra}, ${yoga}, Hora and Chaughadiya.`,
      url: PAGE_URL,
      siteName: "Dhwani Astro",
      type: "website",
      locale: "en_IN",

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

    robots: {
      index: true,
      follow: true,

      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
  };
}

/*
 * Breadcrumb structured data
 */
const breadcrumbSchema = createBreadcrumbSchema([
  {
    name: "Home",
    url: `${BASE_URL}/`,
  },
  {
    name: "Free Services",
    url: `${BASE_URL}/freeservices`,
  },
  {
    name: "Panchang",
    url: PAGE_URL,
  },
]);

/*
 * WebPage structured data
 *
 * Keep this generic because the actual
 * Tithi/Nakshatra/Yoga values are dynamic.
 */
const panchangPageSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": `${PAGE_URL}#webpage`,

  name: "Today's Panchang | Hindu Panchang | Dhwani Astro",

  url: PAGE_URL,

  description:
    "Check today's Hindu Panchang including Tithi, Nakshatra, Yoga, sunrise, sunset, Hora, Chaughadiya and Rahu Kaal timings.",

  inLanguage: "en-IN",

  isPartOf: {
    "@type": "WebSite",
    "@id": `${BASE_URL}/#website`,
    name: "Dhwani Astro",
    url: `${BASE_URL}/`,
  },

  about: {
    "@type": "Thing",
    name: "Hindu Panchang",
  },
};

export default async function Panchang() {
  const params = getTodayParams();

  const [
    panchangResult,
    chaughadiyaResult,
    horaResult,
  ] = await Promise.all([
    safeAstrologySeo(
      SEO_ENDPOINTS.ADV_PANCHANG,
      params,
    ),

    safeAstrologySeo(
      SEO_ENDPOINTS.CHAUGHADIYA,
      params,
    ),

    safeAstrologySeo(
      SEO_ENDPOINTS.HORA,
      params,
    ),
  ]);

  return (
    <>
      <JsonLd data={panchangPageSchema} />

      <JsonLd data={breadcrumbSchema} />

      <PanchangPage
        initialPanchang={
          panchangResult?.data ||
          panchangResult ||
          null
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
    </>
  );
}
