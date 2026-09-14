import {
  createNumeroHash,
  decodeNumeroHash,
} from "@/utils/kundliHash.server";

import NumerokundliClient from "./NumerokundliClient";

export default async function Page({ searchParams }) {
  console.log("COMING IN NUMERO PAGE");

  const params = await searchParams;

  const hash = params?.hash;

  console.log("NUMERO HASH:", hash);

  let numeroData = null;

  // =====================================================
  // CASE 1
  // ALREADY HASH AVAILABLE
  // =====================================================

  if (hash) {
    console.log(
      "Numero hash already available"
    );

    numeroData = decodeNumeroHash(hash);

    console.log(
      "Decoded Numero Data:",
      numeroData
    );
  }

  // =====================================================
  // CASE 2
  // EXTERNAL DATA
  // CREATE HASH -> DECODE HASH
  // =====================================================

  if (!numeroData) {
    const name = params?.name || "";
    const dob = params?.dob || "";

    console.log(
      "External Numero Params:",
      {
        name,
        dob,
      }
    );

    if (name && dob) {
      const dateOnly = String(dob).split("T")[0];

      const parts = dateOnly.split("-");

      if (parts.length === 3) {
        const year = Number(parts[0]);
        const month = Number(parts[1]);
        const day = Number(parts[2]);

        const externalData = {
          name: String(name).trim(),
          day,
          month,
          year,
        };

        console.log(
          "External Numero Data:",
          externalData
        );

        // =============================================
        // CREATE NUMERO HASH
        // =============================================

        const generatedHash =
          createNumeroHash(
            externalData
          );

        console.log(
          "Generated Numero Hash:",
          generatedHash
        );

        if (generatedHash) {
          // ===========================================
          // DECODE SAME HASH
          // ===========================================

          numeroData =
            decodeNumeroHash(
              generatedHash
            );

          console.log(
            "Decoded Generated Numero Data:",
            numeroData
          );
        }
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
  // RENDER NUMERO CLIENT
  // =====================================================

  return (
    <NumerokundliClient
      formData={numeroData}
    />
  );
}