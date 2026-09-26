import CryptoJS from "crypto-js";

const SECRET_KEY =
  process.env.NEXT_PUBLIC_KUNDLI_SECRET || "kundli-secret-key";

const NUMERO_SECRET =
  process.env.NEXT_PUBLIC_NUMERO_SECRET || "numero-secret-key";

export function createKundliHash(formData) {
  try {
    const stablePayload = {
      day: Number(formData.day),
      month: Number(formData.month),
      year: Number(formData.year),
      hour: Number(formData.hour),
      min: Number(formData.min),
      lat: Number(formData.lat).toFixed(2),
      lon: Number(formData.lon).toFixed(2),
      tzone: Number(formData.tzone),
    };

    const encrypted = CryptoJS.AES.encrypt(
      JSON.stringify(stablePayload),
      SECRET_KEY
    ).toString();

    return encodeURIComponent(encrypted);
  } catch (error) {
    console.error("createKundliHash error:", error);
    return null;
  }
}

export function createNumeroHash(formData) {
  try {
    const payload = {
      name: String(formData.name || "").trim(),
      day: Number(formData.day),
      month: Number(formData.month),
      year: Number(formData.year),
    };

    const encrypted = CryptoJS.AES.encrypt(
      JSON.stringify(payload),
      NUMERO_SECRET
    ).toString();

    return encodeURIComponent(encrypted);
  } catch (error) {
    console.error("createNumeroHash error:", error);
    return null;
  }
}
