import CryptoJS from "crypto-js";

const SECRET_KEY =   process.env.NEXT_PUBLIC_KUNDLI_SECRET || "kundli-secret-key";
const NUMERO_SECRET =
  process.env.NEXT_PUBLIC_NUMERO_SECRET || "numero-secret-key";

console.log("keyyyyyyyyyyyyyyyyyyyyyyyyyyxxxxxxxxxxxxxxxxx", SECRET_KEY );


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
  } catch (err) {
    console.error("createKundliHash error:", err);
    return null;
  }
}

export function decodeKundliHash(hash) {
  try {
    console.log("commitng in decodeKundliHash-------------:",SECRET_KEY);
    debugger;
    if (!hash) return null;

    const bytes = CryptoJS.AES.decrypt(
      decodeURIComponent(hash),
      SECRET_KEY
    );

    const decrypted = bytes.toString(CryptoJS.enc.Utf8);

    if (!decrypted) return null;

    return JSON.parse(decrypted);
  } catch (err) {
    console.error("decodeKundliHash error:", err);
    return null;
  }
}

export function createNumeroHash(formData) {
  try {
     console.log("commitng in createNumeroHash-------------:",NUMERO_SECRET);
    debugger;
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

export function decodeNumeroHash(hash) {
  try {
    console.log("commitng in decodeNumeroHash-------------:",NUMERO_SECRET);
    debugger;
    if (!hash) return null;

    const bytes = CryptoJS.AES.decrypt(
      decodeURIComponent(hash),
      NUMERO_SECRET
    );

    const decrypted = bytes.toString(CryptoJS.enc.Utf8);

    if (!decrypted) return null;

    return JSON.parse(decrypted);
  } catch (error) {
    console.error("decodeNumeroHash error:", error);
    return null;
  }
}
