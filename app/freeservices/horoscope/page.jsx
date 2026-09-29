import { astrologySeo } from "@/app/api/astrologySeo";
import { SEO_ENDPOINTS } from "@/app/api/seoEndpoints";
import HoroscopePage from "./horoscopePage";

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || "https://dhwaniastro.com";

export const metadata = {
  title: "Daily Horoscope | Free Zodiac Predictions | Dhwani Astro",

  description:
    "Read your free daily horoscope based on Vedic Astrology. Explore daily zodiac predictions, astrology insights and guidance on Dhwani Astro.",

  alternates: {
    canonical: `${BASE_URL}/freeservices/horoscope`,
  },

  openGraph: {
    title: "Daily Horoscope | Free Zodiac Predictions | Dhwani Astro",
    description:
      "Read your free daily horoscope based on Vedic Astrology. Explore daily zodiac predictions and astrology insights.",
    url: `${BASE_URL}/freeservices/horoscope`,
    siteName: "Dhwani Astro",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Daily Horoscope | Free Zodiac Predictions",
    description:
      "Read your free daily horoscope based on Vedic Astrology on Dhwani Astro.",
  },

  robots: {
    index: true,
    follow: true,
  },
};

const horoscopezod = [
  {
    name: "Aries",
    img: "/ds-img/ARIESn.webp",
    indate: "Mar 21 - Apr 19",
  },
  {
    name: "Taurus",
    img: "/ds-img/Taurusn.webp",
    indate: "Apr 20 - May 20",
  },
  {
    name: "Gemini",
    img: "/ds-img/GEMINIn.webp",
    indate: "May 21 - Jun 20",
  },
  {
    name: "Cancer",
    img: "/ds-img/cancern.webp",
    indate: "Jun 21 - Jul 22",
  },
  {
    name: "Leo",
    img: "/ds-img/LEO.webp",
    indate: "Jul 23 - Aug 22",
  },
  {
    name: "Virgo",
    img: "/ds-img/virgon.webp",
    indate: "Aug 23 - Sep 22",
  },
  {
    name: "Libra",
    img: "/ds-img/LIBRAn.webp",
    indate: "Sep 23 - Oct 22",
  },
  {
    name: "Scorpio",
    img: "/ds-img/Scorpio.webp",
    indate: "Oct 23 - Nov 21",
  },
  {
    name: "Sagittarius",
    img: "/ds-img/SAGITTARIUSn.webp",
    indate: "Nov 22 - Dec 21",
  },
  {
    name: "Capricorn",
    img: "/ds-img/CAPRICORNn.webp",
    indate: "Dec 22 - Jan 19",
  },
  {
    name: "Aquarius",
    img: "/ds-img/Aquariusn.webp",
    indate: "Jan 20 - Feb 18",
  },
  {
    name: "Pisces",
    img: "/ds-img/PISCESn.webp",
    indate: "Feb 19 - Mar 20",
  },
];

async function safeAstrologySeo(endpoint, body) {
  try {
    return await astrologySeo(endpoint, body);
  } catch (error) {
    console.error(
      `Horoscope Astrology API failed for endpoint ${endpoint}:`,
      error?.message || error
    );

    return null;
  }
}

export default async function Page() {
  const zodiac = "Aries";

  const body = {
    timezone: 5.5,
  };

  const [today, tomorrow, yesterday] = await Promise.all([
    safeAstrologySeo(
      `${SEO_ENDPOINTS.HOROSCOPE_TODAY}/aries`,
      body
    ),

    safeAstrologySeo(
      `${SEO_ENDPOINTS.HOROSCOPE_NEXT}/aries`,
      body
    ),

    safeAstrologySeo(
      `${SEO_ENDPOINTS.HOROSCOPE_PREVIOUS}/aries`,
      body
    ),
  ]);

  return (
    <HoroscopePage
      horoscopezod={horoscopezod}
      zodiac={zodiac}
      today={today}
      tomorrow={tomorrow}
      yesterday={yesterday}
    />
  );
}
