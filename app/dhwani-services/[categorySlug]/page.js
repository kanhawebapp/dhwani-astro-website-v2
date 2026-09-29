import CategoryServices from "../../../components/navbarcomp/CategoriesServices";

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || "https://dhwaniastro.com";

const GRAPHQL_URL =
  process.env.NEXT_PUBLIC_GRAPHQL_URL ||
  `${BASE_URL}/userAuth/graphql`;

const GET_CATEGORY_FOR_SEO = `
  query GetCategory($slug: String!) {
    getCategory(slug: $slug) {
      id
      name
      slug

      services {
        id
        name
        slug
        image
        description
        price
      }
    }
  }
`;

async function getCategory(categorySlug) {
  try {
    const response = await fetch(GRAPHQL_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: GET_CATEGORY_FOR_SEO,
        variables: {
          slug: categorySlug,
        },
      }),
      next: {
        revalidate: 3600,
      },
    });

    if (!response.ok) {
      console.error(
        `Category SEO request failed: ${response.status}`
      );
      return null;
    }

    const result = await response.json();

    if (result.errors?.length) {
      console.error("Category SEO GraphQL errors:", result.errors);
      return null;
    }

    return result?.data?.getCategory || null;
  } catch (error) {
    console.error("Failed to fetch category SEO data:", error);
    return null;
  }
}

function createCategoryDescription(category) {
  const categoryName = category?.name || "Astrology";

  const serviceNames =
    category?.services
      ?.map((service) => service.name)
      .filter(Boolean)
      .slice(0, 5) || [];

  if (serviceNames.length > 0) {
    return `Explore ${categoryName} astrology services on Dhwani Astro, including ${serviceNames.join(
      ", "
    )}. Connect with experienced astrologers for personalized guidance.`;
  }

  return `Explore ${categoryName} astrology services on Dhwani Astro and connect with experienced astrologers for personalized guidance and consultation.`;
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
  const { categorySlug } = await params;

  const category = await getCategory(categorySlug);

  if (!category) {
    return {
      title: "Astrology Services | Dhwani Astro",
      description:
        "Explore online astrology services and consultations on Dhwani Astro.",

      alternates: {
        canonical: `${BASE_URL}/dhwani-services/${encodeURIComponent(
          categorySlug
        )}`,
      },

      robots: {
        index: false,
        follow: true,
      },
    };
  }

  const categoryName = category.name || "Astrology Services";
  const description = createCategoryDescription(category);

  const canonicalUrl =
    `${BASE_URL}/dhwani-services/` +
    encodeURIComponent(category.slug || categorySlug);

  const imageUrl = getImageUrl(category.image);

  const serviceKeywords =
    category.services
      ?.map((service) => service.name)
      .filter(Boolean)
      .slice(0, 10) || [];

  return {
    title: `${categoryName} Astrology Services`,

    description,

    keywords: [
      categoryName,
      `${categoryName} astrology`,
      `${categoryName} astrologer`,
      `${categoryName} consultation`,
      "online astrology",
      "astrology services",
      "Dhwani Astro",
      ...serviceKeywords,
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
      title: `${categoryName} Astrology Services | Dhwani Astro`,
      description,
      images: [
        {
          url: imageUrl,
          alt: `${categoryName} Astrology Services - Dhwani Astro`,
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title: `${categoryName} Astrology Services | Dhwani Astro`,
      description,
      images: [imageUrl],
    },
  };
}

export default async function Page({ params }) {
  const { categorySlug } = await params;

  return <CategoryServices categorySlug={categorySlug} />;
}
