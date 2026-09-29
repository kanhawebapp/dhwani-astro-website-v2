import { BASE_URL } from "@/utils/siteConfig";

export const metadata = {
  title: "Abhijit Muhurta Today | Auspicious Time Calculator",

  description:
    "Check today's Abhijit Muhurta and find the auspicious midday time for starting important work, rituals and new ventures based on your location.",

  keywords: [
    "Abhijit Muhurta",
    "Abhijit Muhurat today",
    "Abhijit Muhurta today",
    "auspicious time today",
    "Abhijit Muhurat calculator",
    "today muhurat",
    "auspicious time",
    "Vedic astrology",
    "Dhwani Astro",
  ],

  alternates: {
    canonical: `${BASE_URL}/freeservices/abhijeet`,
  },

  openGraph: {
    title: "Abhijit Muhurta Today | Dhwani Astro",

    description:
      "Find today's Abhijit Muhurta and check the auspicious midday time for your location.",

    url: `${BASE_URL}/freeservices/abhijeet`,

    siteName: "Dhwani Astro",

    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title: "Abhijit Muhurta Today | Dhwani Astro",

    description:
      "Check today's Abhijit Muhurta and find an auspicious time based on your location.",
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

export default function AbhijitLayout({ children }) {
  return children;
}
