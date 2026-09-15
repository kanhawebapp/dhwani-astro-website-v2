import { decodeNumeroHash } from "@/utils/kundliHash.server";
import NumerokundliClient from "./NumerokundliClient";

export default async function Page({ searchParams }) {
  console.log("COMING IN NUMERO PAGE");

  const params = await searchParams;
  const hash = params?.hash;

  console.log("NUMERO HASH:", hash);

  if (!hash) {
    console.error("NUMERO HASH MISSING");

    return (
      <div>
        Invalid or expired numerology link.
      </div>
    );
  }

  const numeroData = decodeNumeroHash(hash);

  console.log("DECODED NUMERO DATA:", numeroData);

  if (
    !numeroData ||
    !numeroData.name ||
    !Number.isInteger(Number(numeroData.day)) ||
    !Number.isInteger(Number(numeroData.month)) ||
    !Number.isInteger(Number(numeroData.year))
  ) {
    console.error("INVALID NUMERO DATA:", numeroData);

    return (
      <div>
        Invalid or expired numerology link.
      </div>
    );
  }

  const formData = {
    name: numeroData.name,
    day: Number(numeroData.day),
    month: Number(numeroData.month),
    year: Number(numeroData.year),
  };

  console.log("FINAL NUMERO FORM DATA:", formData);

  return (
    <NumerokundliClient
      formData={formData}
    />
  );
}