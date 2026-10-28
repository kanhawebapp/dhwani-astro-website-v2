
import { print } from "graphql";
import { GET_ASTROLOGERS_GUEST } from "@/app/graphql/gqlQuery";

const GRAPHQL_URL = process.env.NEXT_PUBLIC_GRAPHQL_URL;

export async function getPublicAstrologers() {
  if (!GRAPHQL_URL) {
    throw new Error("GraphQL URL is not configured");
  }

  const startedAt = performance.now();

  const response = await fetch(GRAPHQL_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: print(GET_ASTROLOGERS_GUEST),
      variables: {
        searchInput: {
          limit: 12,
          page: 1,
          sortField: "RATING",
          sortOrder: "DESC",
        },
      },
    }),
    next: { revalidate: 15 },
  });

  const result = await response.json();

//   console.log("[Astrologers]", {
//     status: response.status,
//     durationMs: Math.round(performance.now() - startedAt),
//   });

  if (!response.ok) {
    throw new Error(`Failed to fetch astrologers: ${response.status}`);
  }

  if (result.errors?.length) {
    throw new Error("GraphQL astrologer query failed");
  }

  return result.data?.getAstrologerListBySearch?.data ?? [];
}
