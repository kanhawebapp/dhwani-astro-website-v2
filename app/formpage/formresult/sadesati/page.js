import SadeSatiClient from "@/app/freeservices/kundali/getKundaliPage/sadhesati/SadeSatiClient";
import { decodeKundliHash } from "@/utils/kundliHash.server";

export default function Page({ searchParams }) {
  const hash = searchParams.hash;

  if (!hash) {
    return <p className="text-center">Missing Sadesati data</p>;
  }

  const formData = decodeKundliHash(hash);

  if (!formData) {
    return <p className="text-center">Invalid or expired link</p>;
  }

  return <SadeSatiClient formData={formData} />;
}