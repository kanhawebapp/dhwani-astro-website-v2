import Kundlimain from "@/components/Kundli/Kundlimain";

export const metadata = {
  title: "Free Kundli Online | Janam Kundali by Date of Birth",
  description:
    "Generate your free Janam Kundli online using your date, time and place of birth. Get detailed Vedic astrology insights about your career, relationships, marriage, finances and life.",
  keywords: [
    "free kundli",
    "free kundli online",
    "janam kundli",
    "janam kundali",
    "birth chart",
    "vedic kundli",
    "kundli by date of birth",
    "kundli by date and time of birth",
    "online kundli",
    "free birth chart",
    "Dhwani Astro",
  ],

  alternates: {
    canonical: "https://dhwaniastro.com/freeservices/kundali",
  },

  openGraph: {
    title: "Free Kundli Online | Janam Kundali | Dhwani Astro",
    description:
      "Generate your free Janam Kundli online using your date, time and place of birth and explore detailed Vedic astrology insights.",
    url: "https://dhwaniastro.com/freeservices/kundali",
    siteName: "Dhwani Astro",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Free Kundli Online | Janam Kundali",
    description:
      "Generate your free Janam Kundli online and explore Vedic astrology insights based on your birth details.",
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

export default function KundliPage() {
  return <Kundlimain />;
}
