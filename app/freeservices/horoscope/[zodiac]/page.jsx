import { notFound } from "next/navigation";

import { SEO_ENDPOINTS } from "@/app/api/seoEndpoints";
import { astrologySeo } from "@/app/api/astrologySeo";
import HoroscopePage from "../horoscopePage";

const SITE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || "https://dhwaniastro.com";

const VALID_SIGNS = [
  "aries",
  "taurus",
  "gemini",
  "cancer",
  "leo",
  "virgo",
  "libra",
  "scorpio",
  "sagittarius",
  "capricorn",
  "aquarius",
  "pisces",
];

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
    indate: "Oct 24 - Nov 21",
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

/**
 * Get properly formatted zodiac name.
 */
function formatZodiac(zodiac) {
  return zodiac.charAt(0).toUpperCase() + zodiac.slice(1);
}

/**
 * Get zodiac metadata/image.
 */
function getZodiacInfo(zodiac) {
  return horoscopezod.find(
    (item) => item.name.toLowerCase() === zodiac,
  );
}

/**
 * Generate dynamic SEO metadata for each zodiac page.
 */
export async function generateMetadata({ params }) {
  const zodiac = params.zodiac?.toLowerCase();

  if (!zodiac || !VALID_SIGNS.includes(zodiac)) {
    return {
      title: "Horoscope Today | DhwaniAstro",
      description:
        "Read daily horoscope predictions for all zodiac signs on DhwaniAstro.",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const zodiacName = formatZodiac(zodiac);
  const zodiacInfo = getZodiacInfo(zodiac);

  const title = `${zodiacName} Horoscope Today - Daily ${zodiacName} Horoscope`;

  const description = `Read ${zodiacName} horoscope today with daily predictions for love, career, health, finance and relationships. Check today's ${zodiacName} horoscope on DhwaniAstro.`;

  const canonicalUrl = `${SITE_URL}/freeservices/horoscope/${zodiac}`;

  const imageUrl = zodiacInfo?.img
    ? `${SITE_URL}${zodiacInfo.img}`
    : `${SITE_URL}/ds-img/horoscope.webp`;

  return {
    title,

    description,

    keywords: [
      `${zodiacName.toLowerCase()} horoscope`,
      `${zodiacName.toLowerCase()} horoscope today`,
      `today ${zodiacName.toLowerCase()} horoscope`,
      `daily ${zodiacName.toLowerCase()} horoscope`,
      `${zodiacName.toLowerCase()} daily horoscope`,
      `${zodiacName.toLowerCase()} love horoscope`,
      `${zodiacName.toLowerCase()} career horoscope`,
      `${zodiacName.toLowerCase()} health horoscope`,
      `${zodiacName.toLowerCase()} finance horoscope`,
      "daily horoscope",
      "horoscope today",
      "zodiac horoscope",
      "rashifal",
      "daily rashifal",
    ],

    alternates: {
      canonical: canonicalUrl,
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

    openGraph: {
      type: "website",
      url: canonicalUrl,
      title,
      description,
      siteName: "DhwaniAstro",
      locale: "en_IN",

      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `${zodiacName} Horoscope Today`,
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title,
      description,

      images: [imageUrl],
    },
  };
}

/**
 * Generate static paths for all zodiac signs.
 *
 * This helps Next.js know the valid zodiac routes ahead of time.
 */
export function generateStaticParams() {
  return VALID_SIGNS.map((zodiac) => ({
    zodiac,
  }));
}

export default async function ZodiacPage({ params }) {
  const zodiac = params.zodiac?.toLowerCase();

  /**
   * Never render an invalid zodiac page.
   */
  if (!zodiac || !VALID_SIGNS.includes(zodiac)) {
    notFound();
  }

  const zodiacName = formatZodiac(zodiac);

  const zodiacInfo = getZodiacInfo(zodiac);

  /**
   * API timezone.
   *
   * India Standard Time = UTC + 5:30
   */
  const body = {
    timezone: 5.5,
  };

  /**
   * Fetch all horoscope data on the server.
   *
   * This means the initial horoscope content can be rendered
   * into the HTML instead of waiting for the browser.
   */
  const [today, tomorrow, yesterday] = await Promise.all([
    astrologySeo(
      `${SEO_ENDPOINTS.HOROSCOPE_TODAY}/${zodiac}`,
      body,
    ),

    astrologySeo(
      `${SEO_ENDPOINTS.HOROSCOPE_NEXT}/${zodiac}`,
      body,
    ),

    astrologySeo(
      `${SEO_ENDPOINTS.HOROSCOPE_PREVIOUS}/${zodiac}`,
      body,
    ),
  ]);

  const canonicalUrl =
    `${SITE_URL}/freeservices/horoscope/${zodiac}`;

  /**
   * Structured data.
   *
   * This describes the individual zodiac horoscope page
   * to search engines.
   */
  const horoscopeStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",

    name: `${zodiacName} Horoscope Today`,

    url: canonicalUrl,

    description: `Read today's ${zodiacName} horoscope with daily predictions for love, career, health, finance and relationships.`,

    inLanguage: "en-IN",

    isPartOf: {
      "@type": "WebSite",
      name: "DhwaniAstro",
      url: SITE_URL,
    },

    about: {
      "@type": "Thing",
      name: `${zodiacName} Zodiac Sign`,
    },

    primaryImageOfPage: zodiacInfo?.img
      ? {
          "@type": "ImageObject",
          url: `${SITE_URL}${zodiacInfo.img}`,
        }
      : undefined,

    breadcrumb: {
      "@type": "BreadcrumbList",

      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: SITE_URL,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Free Services",
          item: `${SITE_URL}/freeservices`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: "Horoscope",
          item: `${SITE_URL}/freeservices/horoscope`,
        },
        {
          "@type": "ListItem",
          position: 4,
          name: `${zodiacName} Horoscope`,
          item: canonicalUrl,
        },
      ],
    },
  };

  return (
    <>
      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(horoscopeStructuredData),
        }}
      />

      <HoroscopePage
        horoscopezod={horoscopezod}
        zodiac={zodiacName}
        today={today}
        tomorrow={tomorrow}
        yesterday={yesterday}
      />
    </>
  );
}
