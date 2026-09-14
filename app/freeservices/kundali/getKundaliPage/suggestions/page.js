export const revalidate = 3600;

import { decodeKundliHash } from "@/utils/kundliHash.server";
import SuggestTabsClient from "./SuggestTabsClient";

export default function Page({ searchParams }) {
  const hash = searchParams.hash;

  if (!hash) {
    return (
      <p className="text-center text-gray-400">
        Missing Kundli data
      </p>
    );
  }

  const formData = decodeKundliHash(hash);

  if (!formData) {
    return (
      <p className="text-center text-gray-400">
        Invalid or expired link
      </p>
    );
  }

  return <SuggestTabsClient formData={formData} />;
}