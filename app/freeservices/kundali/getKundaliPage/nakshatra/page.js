export const revalidate = 3600;

import { Suspense } from "react";
import { decodeKundliHash } from "@/utils/kundliHash.server";
import NakshatraTabsClient from "./NakshatraTabsClient";

export default async function Page({ searchParams }) {
  const hash = searchParams.hash;
  const defaultTab = searchParams.tab || "naktoday";

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

  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center h-32">
          <span className="loader-all"></span>
        </div>
      }
    >
      <NakshatraTabsClient
        formData={formData}
        defaultTab={defaultTab}
      />
    </Suspense>
  );
}