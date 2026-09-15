import AES from "crypto-js/aes";
import Utf8 from "crypto-js/enc-utf8";

const SECRET_KEY =
  process.env.NEXT_PUBLIC_KUNDLI_SECRET || "kundli-secret-key";

const NUMERO_SECRET =
  process.env.NEXT_PUBLIC_NUMERO_SECRET || "numero-secret-key";

// =====================================================
// KUNDLI
// =====================================================

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

    const encrypted = AES.encrypt(
      JSON.stringify(stablePayload),
      SECRET_KEY
    ).toString();

    return encodeURIComponent(encrypted);
  } catch (error) {
    console.error("createKundliHash error:", error);
    return null;
  }
}

export function decodeKundliHash(hash) {
  try {
    if (!hash) {
      console.error("decodeKundliHash: hash missing");
      return null;
    }

    const encrypted = decodeURIComponent(hash);

    const bytes = AES.decrypt(
      encrypted,
      SECRET_KEY
    );

    const decrypted = bytes.toString(Utf8);

    if (!decrypted) {
      console.error(
        "decodeKundliHash: empty decrypted value"
      );
      return null;
    }

    return JSON.parse(decrypted);
  } catch (error) {
    console.error(
      "decodeKundliHash error:",
      error
    );
    return null;
  }
}

// =====================================================
// NUMEROLOGY
// =====================================================

export function createNumeroHash(formData) {
  try {

    const payload = {
      name: String(formData.name || "").trim(),
      day: Number(formData.day),
      month: Number(formData.month),
      year: Number(formData.year),
    };

    const encrypted = AES.encrypt(
      JSON.stringify(payload),
      NUMERO_SECRET
    ).toString();

    

    return encodeURIComponent(encrypted);
  } catch (error) {
    console.error(
      "createNumeroHash error:",
      error
    );
    return null;
  }
}

export function decodeNumeroHash(hash) {
  try {

    if (!hash) {
      console.error(
        "decodeNumeroHash: hash missing"
      );
      return null;
    }

    const encrypted = decodeURIComponent(hash);


    const bytes = AES.decrypt(
      encrypted,
      NUMERO_SECRET
    );

    const decrypted = bytes.toString(Utf8);

    if (!decrypted) {
      console.error(
        "decodeNumeroHash: empty decrypted value"
      );
      return null;
    }

    const result = JSON.parse(decrypted);

    return result;
  } catch (error) {
    console.error(
      "decodeNumeroHash error:",
      error
    );
    return null;
  }
}