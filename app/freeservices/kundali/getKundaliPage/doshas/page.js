export const revalidate = 3600;

import { decodeKundliHash } from "@/utils/kundliHash.server";
import DoshasClient from "./DoshasClient";
import { astrologySeo } from "@/app/api/astrologySeo";
import { SEO_ENDPOINTS } from "@/app/api/seoEndpoints";

export default async function Page({ searchParams }) {
  const hash = searchParams.hash;

  if (!hash) {
    return <p className="text-center text-gray-400">Missing Kundli data</p>;
  }

  const formData = decodeKundliHash(hash);

  if (!formData) {
    return <p className="text-center text-gray-400">Kundli session expired</p>;
  }

  const [
    manglikData,
    kalSharpData,
    pitraDoshaData,
    satiData,
  ] = await Promise.all([
    astrologySeo(SEO_ENDPOINTS.MANGLIK, formData),
    astrologySeo(SEO_ENDPOINTS.KALSHARP, formData),
    astrologySeo(SEO_ENDPOINTS.PITRA_DOSHA, formData),
    astrologySeo(SEO_ENDPOINTS.SADE_SATI, formData),
  ]);

  return (
    <DoshasClient
      manglikData={manglikData}
      kalSharpData={kalSharpData}
      pitraDoshaData={pitraDoshaData}
      satiData={satiData}
    />
  );
}