import { BASE_URL } from "@/utils/siteConfig";
export const metadata = {
  title: "Numerology | Free Numerology Predictions Online",

  description:
    "Discover your ruling number, destiny number and life path number with free numerology predictions on Dhwani Astro. Explore numerology insights based on your name and date of birth.",

  keywords: [
    "numerology",
    "free numerology",
    "numerology predictions",
    "ruling number",
    "destiny number",
    "life path number",
    "numerology by date of birth",
    "numerology by name",
    "Chaldean numerology",
    "Dhwani Astro",
  ],

  alternates: {
    canonical: `${BASE_URL}/freeservices/numerology`,
  },

  openGraph: {
    title: "Numerology | Free Numerology Predictions | Dhwani Astro",

    description:
      "Discover your ruling number, destiny number and life path number with free numerology predictions on Dhwani Astro.",

    url: `${BASE_URL}/freeservices/numerology`,

    siteName: "Dhwani Astro",

    type: "website",

    images: [
      {
        url: `${BASE_URL}/ds-img/numerology-banner.webp`,
        width: 1200,
        height: 630,
        alt: "Dhwani Astro Numerology",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",

    title: "Numerology | Free Numerology Predictions",

    description:
      "Discover numerology insights based on your name and date of birth with Dhwani Astro.",

    images: [
      `${BASE_URL}/ds-img/numerology-banner.webp`,
    ],
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

export default function NumerologyLayout({ children }) {
  return children;
}
