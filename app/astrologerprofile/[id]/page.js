import ProfileAstro from "./ProfileAstro";

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || "https://dhwaniastro.com";

const GRAPHQL_URL =
  process.env.NEXT_PUBLIC_GRAPHQL_URL ||
  `${BASE_URL}/userAuth/graphql`;

const GET_ASTROLOGER_BY_ID_QUERY = `
  query GetAstrologerById($id: String!) {
    getAstrologerById(id: $id) {
      id
      name
      displayName
      profilePic
      about
      experience
      rating
      tags
      languages
      skills
      problems
    }
  }
`;

async function getAstrologer(id) {
  try {
    const response = await fetch(GRAPHQL_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: GET_ASTROLOGER_BY_ID_QUERY,
        variables: {
          id,
        },
      }),

      // Profile information can be cached and revalidated.
      next: {
        revalidate: 3600,
      },
    });

    if (!response.ok) {
      console.error(
        "Astrologer metadata request failed:",
        response.status,
      );

      return null;
    }

    const result = await response.json();

    if (result.errors?.length) {
      console.error(
        "Astrologer metadata GraphQL error:",
        result.errors,
      );

      return null;
    }

    return result?.data?.getAstrologerById || null;
  } catch (error) {
    console.error("Failed to fetch astrologer metadata:", error);

    return null;
  }
}

function stripHtml(value = "") {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function truncate(value = "", maxLength = 160) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.substring(0, maxLength - 3).trim()}...`;
}

export async function generateMetadata({ params }) {
  const { id } = await params;

  const astrologer = await getAstrologer(id);

  const profileUrl = `${BASE_URL}/astrologerprofile/${id}`;

  // If astrologer does not exist, return generic metadata.
  if (!astrologer) {
    return {
      title: "Astrologer Profile",
      description:
        "View astrologer profiles and connect with astrologers online on Dhwani Astro.",

      alternates: {
        canonical: profileUrl,
      },

      openGraph: {
        title: "Astrologer Profile | Dhwani Astro",
        description:
          "View astrologer profiles and connect with astrologers online on Dhwani Astro.",
        url: profileUrl,
        siteName: "Dhwani Astro",
        type: "profile",
      },

      twitter: {
        card: "summary_large_image",
        title: "Astrologer Profile | Dhwani Astro",
        description:
          "View astrologer profiles and connect with astrologers online on Dhwani Astro.",
      },

      robots: {
        index: false,
        follow: true,
      },
    };
  }

  const astrologerName =
    astrologer.displayName || astrologer.name || "Astrologer";

  const skills = Array.isArray(astrologer.skills)
    ? astrologer.skills.filter(Boolean)
    : [];

  const problems = Array.isArray(astrologer.problems)
    ? astrologer.problems.filter(Boolean)
    : [];

  const languages = Array.isArray(astrologer.languages)
    ? astrologer.languages.filter(Boolean)
    : [];

  const expertise = [...skills, ...problems]
    .filter(Boolean)
    .filter((value, index, array) => array.indexOf(value) === index);

  const cleanAbout = stripHtml(astrologer.about || "");

  let description;

  if (cleanAbout) {
    description = cleanAbout;
  } else if (expertise.length > 0) {
    description = `Consult ${astrologerName}, an experienced astrologer specializing in ${expertise
      .slice(0, 4)
      .join(", ")}. Connect with ${astrologerName} online on Dhwani Astro.`;
  } else {
    description = `Consult ${astrologerName} online on Dhwani Astro for personalized astrology guidance and consultation.`;
  }

  description = truncate(description);

  const title = `${astrologerName} | Astrologer | Dhwani Astro`;

  const imageUrl = astrologer.profilePic
    ? `${BASE_URL}${astrologer.profilePic}`
    : `${BASE_URL}/man.png`;

  return {
    title,

    description,

    keywords: [
      astrologerName,
      `${astrologerName} astrologer`,
      "online astrologer",
      "astrology consultation",
      "Dhwani Astro",
      ...skills.slice(0, 5),
      ...problems.slice(0, 5),
      ...languages.slice(0, 3),
    ].filter(Boolean),

    alternates: {
      canonical: profileUrl,
    },

    openGraph: {
      title,
      description,
      url: profileUrl,
      siteName: "Dhwani Astro",
      type: "profile",

      images: [
        {
          url: imageUrl,
          width: 800,
          height: 800,
          alt: `${astrologerName} - Astrologer`,
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title,
      description,

      images: [imageUrl],
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
}

export default async function Page({ params }) {
  const { id } = await params;

  return <ProfileAstro astrologerId={id} />;
}
