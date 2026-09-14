
import { decodeNumeroHash } from "@/utils/kundliHash.server";
import NumerokundliClient from "./NumerokundliClient";
export default async function Page({ searchParams }) {
  console.log("comming in Page FUNCTION");

  const params = await searchParams;

  const hash = params?.hash;

  console.log(
    "comming in Page FUNCTION hash",
    hash
  );

  const numeroData = decodeNumeroHash(hash);

  console.log(
    "NUMERO DATA:",
    numeroData
  );

  if (!numeroData) {
    return (
      <div>
        Invalid or expired numerology link.
      </div>
    );
  }

  return (
    <NumerokundliClient
      formData={numeroData}
    />
  );
}

