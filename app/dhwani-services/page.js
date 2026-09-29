import Dhservices from "../../components/navbarcomp/Dhservices";

export const metadata = {
  title: "Astrology Services | Online Astrology Consultation",
  description:
    "Explore astrology services on Dhwani Astro including Kundli, horoscope, numerology, relationship guidance, career guidance and personalized astrology consultations.",

  keywords: [
    "astrology services",
    "online astrology services",
    "astrology consultation",
    "Kundli consultation",
    "horoscope consultation",
    "numerology consultation",
    "online astrologer",
    "Jyotish consultation",
    "Dhwani Astro",
  ],

  alternates: {
    canonical: "https://dhwaniastro.com/dhwani-services",
  },

  openGraph: {
    title: "Astrology Services | Online Astrology Consultation",
    description:
      "Explore astrology services on Dhwani Astro including Kundli, horoscope, numerology and personalized astrology consultations.",
    url: "https://dhwaniastro.com/dhwani-services",
    siteName: "Dhwani Astro",
    type: "website",
    images: [
      {
        url: "https://dhwaniastro.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Dhwani Astro Astrology Services",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Astrology Services | Dhwani Astro",
    description:
      "Explore online astrology services, Kundli, horoscope, numerology and personalized astrology consultations.",
    images: ["https://dhwaniastro.com/og-image.jpg"],
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

export default function Page() {
  return <Dhservices />;
}
