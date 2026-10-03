import { BASE_URL } from "@/utils/siteConfig";

const GRAPHQL_URL =
  process.env.NEXT_PUBLIC_GRAPHQL_URL ||
  `${BASE_URL}/userAuth/graphql`;

const GET_SERVICE_FOR_SEO = `
  query GetService($slug: String!) {
    getService(slug: $slug) {
      id
      name
      slug
      image
      description
      longText
      price

      category {
        id
        name
        slug
      }
    }
  }
`;

async function getService(serviceSlug) {
  try {
    const response = await fetch(GRAPHQL_URL, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        query: GET_SERVICE_FOR_SEO,

        variables: {
          slug: serviceSlug,
        },
      }),

      next: {
        revalidate: 3600,
      },
    });

    if (!response.ok) {
      console.error(
        `Service SEO request failed: ${response.status}`
      );

      return null;
    }

    const result = await response.json();

    if (result?.errors?.length) {
      console.error(
        "Service SEO GraphQL errors:",
        result.errors
      );

      return null;
    }

    return result?.data?.getService || null;
  } catch (error) {
    console.error(
      "Failed to fetch service SEO data:",
      error
    );

    return null;
  }
}

function stripHtml(text = "") {
  return text
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function createServiceDescription(service) {
  const source =
    service?.description ||
    service?.longText ||
    "";

  const cleaned = stripHtml(source);

  if (cleaned) {
    if (cleaned.length <= 160) {
      return cleaned;
    }

    return `${cleaned.substring(0, 157).trim()}...`;
  }

  return `Explore ${
    service?.name || "this astrology service"
  } on Dhwani Astro. Connect with experienced astrologers for personalized astrology guidance and consultation.`;
}

function getImageUrl(image) {
  if (!image) {
    return `${BASE_URL}/og-image.jpg`;
  }

  if (
    image.startsWith("http://") ||
    image.startsWith("https://")
  ) {
    return image;
  }

  return `${BASE_URL}${image.startsWith("/") ? "" : "/"}${image}`;
}

export async function generateMetadata({ params }) {
  const {
    categorySlug,
    serviceSlug,
  } = await params;

  const service = await getService(serviceSlug);

  const canonicalUrl =
    `${BASE_URL}/dhwani-services/` +
    `${categorySlug}/` +
    `${serviceSlug}`;

  if (!service) {
    return {
      title: "Astrology Service Not Found | Dhwani Astro",

      description:
        "The requested astrology service could not be found on Dhwani Astro.",

      alternates: {
        canonical: canonicalUrl,
      },

      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const serviceName =
    service.name || "Astrology Service";

  const categoryName =
    service.category?.name || "Astrology";

  const description =
    createServiceDescription(service);

  const imageUrl =
    getImageUrl(service.image);

  const title =
    `${serviceName} | ${categoryName} | Dhwani Astro`;

  return {
    title,

    description,

    keywords: [
      serviceName,
      `${serviceName} astrology`,
      `${serviceName} consultation`,
      `${serviceName} astrologer`,
      categoryName,
      `${categoryName} astrology`,
      "online astrology",
      "online astrologer",
      "astrology consultation",
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

      title,

      description,

      images: [
        {
          url: imageUrl,

          width: 1200,

          height: 630,

          alt: `${serviceName} - Dhwani Astro`,
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

export default function ServiceLayout({ children }) {
  return children;
}
