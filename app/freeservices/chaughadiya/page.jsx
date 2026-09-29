import ChaughadiyaPage from "./ChaughadiyaPage";
import { SEO_ENDPOINTS } from "../../api/seoEndpoints";
import { astrologySeo } from "@/app/api/astrologySeo";

const SITE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || "https://dhwaniastro.com";

const PAGE_URL = `${SITE_URL}/freeservices/chaughadiya`;

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const fallbackTitle =
    "Chaughadiya Today - Choghadiya Timings | DhwaniAstro";

  const fallbackDescription =
    "Check today's Chaughadiya and Choghadiya timings for your city. Get Day and Night Chaughadiya including Amrit, Labh, Char, Kaal, Rog and Udveg with local Panchang timings.";

  try {
    const response = await astrologySeo(
      SEO_ENDPOINTS.CHAUGHADIYA,
      {},
    );

    const seo = response?.data?.seo || response?.seo || {};

    const title =
      seo?.metaTitle ||
      seo?.title ||
      fallbackTitle;

    const description =
      seo?.metaDescription ||
      seo?.description ||
      fallbackDescription;

    const canonical =
      seo?.canonicalUrl ||
      PAGE_URL;

    return {
      title,
      description,

      keywords: [
        "chaughadiya",
        "choghadiya",
        "chaughadiya today",
        "choghadiya today",
        "aaj ka chaughadiya",
        "chaughadiya timings",
        "choghadiya timings",
        "today chaughadiya",
        "day chaughadiya",
        "night chaughadiya",
        "shubh chaughadiya",
        "panchang chaughadiya",
      ],

      alternates: {
        canonical,
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
        url: canonical,
        title,
        description,
        siteName: "DhwaniAstro",
        locale: "en_IN",
        images: [
          {
            url: `${SITE_URL}/ds-img/cho.jpg`,
            width: 1200,
            height: 630,
            alt: "Chaughadiya and Choghadiya timings",
          },
        ],
      },

      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [`${SITE_URL}/ds-img/cho.jpg`],
      },
    };
  } catch (error) {
    console.error(
      "Error generating Chaughadiya metadata:",
      error,
    );

    return {
      title: fallbackTitle,
      description: fallbackDescription,

      alternates: {
        canonical: PAGE_URL,
      },

      robots: {
        index: true,
        follow: true,
      },

      openGraph: {
        type: "website",
        url: PAGE_URL,
        title: fallbackTitle,
        description: fallbackDescription,
        siteName: "DhwaniAstro",
        locale: "en_IN",
      },

      twitter: {
        card: "summary_large_image",
        title: fallbackTitle,
        description: fallbackDescription,
      },
    };
  }
}

const chaughadiyaStructuredData = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Chaughadiya Today - Choghadiya Timings",
  url: PAGE_URL,
  description:
    "Check today's Chaughadiya and Choghadiya timings for your selected city, including Day and Night Muhurta timings.",
  inLanguage: "en-IN",
  isPartOf: {
    "@type": "WebSite",
    name: "DhwaniAstro",
    url: SITE_URL,
  },
  about: {
    "@type": "Thing",
    name: "Chaughadiya",
  },
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
        name: "Chaughadiya",
        item: PAGE_URL,
      },
    ],
  },
};

const faqStructuredData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is Chaughadiya?",
      acceptedAnswer: {
        "@type": "Answer",
        text:
          "Chaughadiya, also known as Choghadiya, is a traditional Hindu Panchang system that divides the day and night into different time periods called Muhurtas.",
      },
    },
    {
      "@type": "Question",
      name: "What are the different Chaughadiya Muhurtas?",
      acceptedAnswer: {
        "@type": "Answer",
        text:
          "Common Chaughadiya periods include Amrit, Labh, Char, Kaal, Rog and Udveg.",
      },
    },
    {
      "@type": "Question",
      name: "Does Chaughadiya change according to location?",
      acceptedAnswer: {
        "@type": "Answer",
        text:
          "Yes. Chaughadiya timings depend on local sunrise and sunset, so the timings can vary according to the selected city and date.",
      },
    },
    {
      "@type": "Question",
      name: "Can I check Chaughadiya for another date?",
      acceptedAnswer: {
        "@type": "Answer",
        text:
          "Yes. Select a date from the date selector to view the Chaughadiya timings calculated for that date.",
      },
    },
  ],
};

export default async function Page() {
  let initialChaughadiya = null;
  let initialPanchang = null;

  try {
    const response = await astrologySeo(
      SEO_ENDPOINTS.CHAUGHADIYA,
      {},
    );

    initialChaughadiya =
      response?.data?.chaughadiya ||
      response?.chaughadiya ||
      response?.data ||
      null;
  } catch (error) {
    console.error(
      "Error fetching initial Chaughadiya data:",
      error,
    );
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(chaughadiyaStructuredData),
        }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqStructuredData),
        }}
      />

      <ChaughadiyaPage
        initialPanchang={initialPanchang}
        initialChaughadiya={initialChaughadiya}
      />
    </>
  );
}
