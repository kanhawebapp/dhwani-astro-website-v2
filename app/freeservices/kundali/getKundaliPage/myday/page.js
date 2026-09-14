export const revalidate = 3600;

import { Suspense } from "react";
import { decodeKundliHash } from "@/utils/kundliHash.server";
import MydayClient from "@/components/Kundli/Kundliinter/Myday/MydayClient";

export default async function Page({ searchParams }) {
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

  return (
    <Suspense
      fallback={
        <p className="text-center text-purple-600">
          Loading daily predictions...
        </p>
      }
    >
      <MydayClient formData={formData} />
    </Suspense>
  );
}