export const metadata = {
  title: "Astrology Blogs",
  description:
    "Read astrology blogs on horoscope, Kundli, numerology, relationships, astrology tips, Vedic astrology, and spiritual guidance from Dhwani Astro.",

  alternates: {
    canonical: "/blogs",
  },

  openGraph: {
    type: "website",
    url: "https://dhwaniastro.com/blogs",
    siteName: "Dhwani Astro",
    title: "Astrology Blogs | Dhwani Astro",
    description:
      "Read astrology blogs on horoscope, Kundli, numerology, relationships, astrology tips, Vedic astrology, and spiritual guidance from Dhwani Astro.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Dhwani Astro Astrology Blogs",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Astrology Blogs | Dhwani Astro",
    description:
      "Read astrology blogs on horoscope, Kundli, numerology, relationships, astrology tips, Vedic astrology, and spiritual guidance from Dhwani Astro.",
    images: ["/og-image.jpg"],
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

export default function BlogsLayout({ children }) {
  return children;
}
