import { decodeNumeroHash } from "@/utils/kundliHash.server";
import NumerokundliClient from "./NumerokundliClient";

export default async function Page({ searchParams }) {
  console.log("COMING IN NUMERO PAGE");

  const params = await searchParams;

  const hash = params?.hash;
  const source = params?.source;

  console.log("NUMERO HASH:", hash);
  console.log("NUMERO SOURCE:", source);

  let numeroData = null;


  if (hash) {
    console.log("INTERNAL NUMERO FLOW - HASH FOUND");

    numeroData = decodeNumeroHash(hash);

    console.log("DECODED NUMERO DATA:", numeroData);
  }

  if (!numeroData && source === "dashboard") {
    console.log("EXTERNAL NUMERO FLOW - NO HASH");

    const name = params?.name || "";
    const dob = params?.dob || "";

    let day = null;
    let month = null;
    let year = null;

    if (dob) {
      const dateOnly = dob.split("T")[0];

      // YYYY-MM-DD
      if (dateOnly.includes("-")) {
        const parts = dateOnly.split("-");

        if (parts.length === 3) {
          year = Number(parts[0]);
          month = Number(parts[1]);
          day = Number(parts[2]);
        }
      }

      // DD/MM/YYYY
      else if (dateOnly.includes("/")) {
        const parts = dateOnly.split("/");

        if (parts.length === 3) {
          day = Number(parts[0]);
          month = Number(parts[1]);
          year = Number(parts[2]);
        }
      }
    }

    numeroData = {
      name,
      day,
      month,
      year,
    };

    console.log("EXTERNAL NUMERO DATA:", numeroData);
  }

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

  return <NumerokundliClient formData={formData} />;
}