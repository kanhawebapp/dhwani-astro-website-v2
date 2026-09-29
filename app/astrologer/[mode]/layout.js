const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || "https://dhwaniastro.com";

const MODE_METADATA = {
  chat: {
    title: "Chat with Astrologers Online",
    description:
      "Chat with experienced astrologers online on Dhwani Astro for personalized astrology, relationship, career, Kundli and life guidance.",
  },

  call: {
    title: "Talk to Astrologers Online",
    description:
      "Talk to experienced astrologers online on Dhwani Astro for personalized astrology, Kundli, relationship, career and life guidance.",
  },
};

export async function generateMetadata({ params }) {
  const { mode } = await params;

  const normalizedMode = String(mode || "").toLowerCase();

  const metadata =
    MODE_METADATA[normalizedMode] || {
      title: "Online Astrologers",
      description:
        "Connect with experienced astrologers on Dhwani Astro for personalized online astrology consultation and guidance.",
    };

  const canonicalUrl = `${BASE_URL}/astrologer/${encodeURIComponent(
    normalizedMode
  )}`;

  return {
    title: metadata.title,

    description: metadata.description,

    keywords: [
      "online astrologer",
      "astrology consultation",
      "talk to astrologer",
      "chat with astrologer",
      "online astrology",
      "Jyotish consultation",
      "Dhwani Astro",
    ],

    alternates: {
      canonical: canonicalUrl,
    },

    authors: [
      {
        name: "Dhwani Astro",
        url: BASE_URL,
      },
    ],

    creator: "Dhwani Astro",
    publisher: "Dhwani Astro",

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
      siteName: "Dhwani Astro",
      title: metadata.title,
      description: metadata.description,

      images: [
        {
          url: `${BASE_URL}/og-image.jpg`,
          width: 1200,
          height: 630,
          alt: metadata.title,
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title: metadata.title,
      description: metadata.description,
      images: [`${BASE_URL}/og-image.jpg`],
    },
  };
}

export default function AstrologerModeLayout({ children }) {
  return children;
}
