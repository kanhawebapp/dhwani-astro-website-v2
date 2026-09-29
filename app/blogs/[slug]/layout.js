import { BASE_URL } from "@/utils/siteConfig";

const GRAPHQL_URL =
  process.env.NEXT_PUBLIC_GRAPHQL_URL ||
  `${BASE_URL}/userAuth/graphql`;

const GET_BLOG_BY_SLUG = `
  query GetBlogBySlug($slug: String!) {
    blogBySlug(slug: $slug) {
      id
      title
      content
      featuredImage
      createdAt
      updatedAt
      categories {
        id
        name
        slug
      }
    }
  }
`;

async function getBlog(slug) {
  try {
    const response = await fetch(GRAPHQL_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: GET_BLOG_BY_SLUG,
        variables: {
          slug,
        },
      }),
      next: {
        revalidate: 3600,
      },
    });

    if (!response.ok) {
      console.error(
        `Blog GraphQL request failed: ${response.status}`
      );

      return null;
    }

    const result = await response.json();

    if (result?.errors?.length) {
      console.error("Blog GraphQL errors:", result.errors);

      return null;
    }

    return result?.data?.blogBySlug || null;
  } catch (error) {
    console.error("Failed to fetch blog for SEO:", error);

    return null;
  }
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

function stripHtml(html = "") {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function createDescription(blog) {
  const text = stripHtml(blog?.content || "");

  if (!text) {
    return `Read ${
      blog?.title || "this astrology article"
    } on Dhwani Astro. Explore astrology insights, Kundli, horoscope, numerology and more.`;
  }

  return text.length > 160
    ? `${text.substring(0, 157).trim()}...`
    : text;
}

function formatDate(dateValue) {
  if (!dateValue) {
    return undefined;
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return undefined;
  }

  return date.toISOString();
}

export async function generateMetadata({ params }) {
  const { slug } = await params;

  const blog = await getBlog(slug);

  if (!blog) {
    return {
      title: "Blog Not Found | Dhwani Astro",
      description:
        "The requested astrology blog could not be found on Dhwani Astro.",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const title = blog.title || "Astrology Blog | Dhwani Astro";

  const description = createDescription(blog);

  const canonicalUrl = `${BASE_URL}/blogs/${slug}`;

  const imageUrl = getImageUrl(blog.featuredImage);

  const categories =
    blog.categories
      ?.map((category) => category?.name)
      .filter(Boolean) || [];

  const publishedTime = formatDate(blog.createdAt);
  const modifiedTime = formatDate(blog.updatedAt);

  return {
    title,

    description,

    keywords: [
      "Dhwani Astro",
      "astrology blog",
      "astrology",
      "Jyotish",
      "horoscope",
      "Kundli",
      "numerology",
      ...categories,
    ],

    authors: [
      {
        name: "Dhwani Astro",
        url: BASE_URL,
      },
    ],

    creator: "Dhwani Astro",

    publisher: "Dhwani Astro",

    alternates: {
      canonical: canonicalUrl,
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
      type: "article",
      url: canonicalUrl,
      siteName: "Dhwani Astro",
      title,
      description,

      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],

      ...(publishedTime && {
        publishedTime,
      }),

      ...(modifiedTime && {
        modifiedTime,
      }),

      authors: ["Dhwani Astro"],

      section: categories[0] || "Astrology",

      tags: categories,
    },

    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
      creator: "@DhwaniAstro",
    },
  };
}

export default function BlogSlugLayout({ children }) {
  return children;
}
