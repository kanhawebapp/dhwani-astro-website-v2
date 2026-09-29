import { BASE_URL } from "@/utils/siteConfig";

const GRAPHQL_URL =
  process.env.NEXT_PUBLIC_GRAPHQL_URL ||
  `${BASE_URL}/userAuth/graphql`;

const GET_BLOGS = `
  query GetBlogs {
    blogs {
      id
      title
      slug
      featuredImage
      categories {
        id
        name
        slug
      }
    }
  }
`;

async function getBlogs() {
  try {
    const response = await fetch(GRAPHQL_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: GET_BLOGS,
      }),
      next: {
        revalidate: 3600,
      },
    });

    if (!response.ok) {
      console.error(
        `Blog categories GraphQL request failed: ${response.status}`
      );

      return [];
    }

    const result = await response.json();

    if (result?.errors?.length) {
      console.error(
        "Blog categories GraphQL errors:",
        result.errors
      );

      return [];
    }

    return result?.data?.blogs || [];
  } catch (error) {
    console.error(
      "Failed to fetch blogs for category SEO:",
      error
    );

    return [];
  }
}

function getCategoryFromBlogs(blogs, slug) {
  for (const blog of blogs) {
    const category = blog?.categories?.find(
      (item) => item?.slug === slug
    );

    if (category) {
      return category;
    }
  }

  return null;
}

export async function generateMetadata({ params }) {
  const { slug } = await params;

  const blogs = await getBlogs();

  const category = getCategoryFromBlogs(blogs, slug);

  if (!category) {
    return {
      title: "Blog Category Not Found | Dhwani Astro",

      description:
        "The requested astrology blog category could not be found on Dhwani Astro.",

      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const categoryName = category.name;

  const title = `${categoryName} Astrology Blogs | Dhwani Astro`;

  const description = `Read the latest ${categoryName} astrology blogs, articles and insights on Dhwani Astro. Explore expert astrology guidance, predictions and useful information.`;

  const canonicalUrl = `${BASE_URL}/blogs/category/${slug}`;

  return {
    title,

    description,

    keywords: [
      `${categoryName} astrology`,
      `${categoryName} astrology blogs`,
      `${categoryName} astrology articles`,
      `${categoryName} horoscope`,
      "astrology blogs",
      "astrology articles",
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
          url: `${BASE_URL}/og-image.jpg`,
          width: 1200,
          height: 630,
          alt: `${categoryName} Astrology Blogs - Dhwani Astro`,
        },
      ],
    },

    twitter: {
      card: "summary_large_image",

      title,

      description,

      images: [`${BASE_URL}/og-image.jpg`],
    },
  };
}

export default function BlogCategoryLayout({ children }) {
  return children;
}
