import { decodeKundliHash } from "@/utils/kundliHash.server";
import MoonBioClient from "./MoonBioClient";

export const revalidate = 3600;

export default function Page({ searchParams }) {
  const hash = searchParams.hash;

  if (!hash) {
    return <p className="text-center">Missing Kundli data</p>;
  }

  const formData = decodeKundliHash(hash);

  if (!formData) {
    return <p className="text-center">Invalid or expired link</p>;
  }

  return <MoonBioClient formData={formData} />;
}