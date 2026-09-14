
import { decodeNumeroHash } from "@/utils/kundliHash.server";
import NumerokundliClient from "./NumerokundliClient";

export default async function Page({ searchParams }) {
  console.log("COMING IN NUMERO PAGE");

  const params = await searchParams;

  const hash = params?.hash;

  console.log("NUMERO HASH:", hash);

  let numeroData = null;

  // =====================================================
  // CASE 1: HASH BASED REQUEST
  // =====================================================

  if (hash) {
    console.log("Numero hash found");

    numeroData = decodeNumeroHash(hash);

    console.log(
      "Decoded Numero Data:",
      numeroData
    );
  }

  // =====================================================
  // CASE 2: DIRECT EXTERNAL PARAMETERS
  // =====================================================

  if (!numeroData) {
    const name = params?.name || "";

    const dob = params?.dob || "";

    if (name && dob) {
      const dateOnly = dob.split("T")[0];
      const parts = dateOnly.split("-");

      if (parts.length === 3) {
        const year = Number(parts[0]);
        const month = Number(parts[1]);
        const day = Number(parts[2]);

        numeroData = {
          name,
          day,
          month,
          year,
        };

        console.log(
          "External Numero Data:",
          numeroData
        );
      }
    }
  }

  // =====================================================
  // INVALID REQUEST
  // =====================================================

  if (!numeroData) {
    return (
      <div>
        Invalid or expired numerology link.
      </div>
    );
  }

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <NumerokundliClient
      formData={numeroData}
    />
  );
}

