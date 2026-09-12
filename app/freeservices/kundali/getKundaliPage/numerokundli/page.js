import { decodeKundliHash, decodeNumeroHash } from "@/utils/kundliHash";
import NumerokundliClient from "./NumerokundliClient";

export const revalidate = 3600;

export default async function Page({ searchParams }) {
  console.log("comming in Page FUNCTION");
  debugger;
  const hash = searchParams.hash;
   console.log("comming in Page FUNCTION hash",hash);

  if (!hash) {
    return (
      <p className="text-center text-gray-400">
        Missing Kundli data
      </p>
    );
  }

  const formData = decodeNumeroHash(hash);

  if (!formData) {
    return (
      <p className="text-center text-gray-400">
        Kundli session expiredddddddddddddddddddddddd
      </p>
    );
  }

  return (
    <NumerokundliClient
      formData={formData}
    />
  );
}