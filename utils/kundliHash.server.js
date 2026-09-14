
import crypto from "crypto";

const SECRET_KEY =
  process.env.NEXT_PUBLIC_KUNDLI_SECRET || "kundli-secret-key";

const NUMERO_SECRET =
  process.env.NEXT_PUBLIC_NUMERO_SECRET || "numero-secret-key";

// =====================================================
// CRYPTOJS EVP KEY DERIVATION
// Compatible with:
// CryptoJS.AES.encrypt(data, password)
// =====================================================

function evpBytesToKey(
  password,
  salt,
  keyLen = 32,
  ivLen = 16
) {
  const passwordBuffer = Buffer.from(password, "utf8");

  let derived = Buffer.alloc(0);
  let previous = Buffer.alloc(0);

  while (derived.length < keyLen + ivLen) {
    previous = crypto
      .createHash("md5")
      .update(
        Buffer.concat([
          previous,
          passwordBuffer,
          salt,
        ])
      )
      .digest();

    derived = Buffer.concat([
      derived,
      previous,
    ]);
  }

  return {
    key: derived.subarray(0, keyLen),
    iv: derived.subarray(
      keyLen,
      keyLen + ivLen
    ),
  };
}

// =====================================================
// DECRYPT CRYPTOJS AES
// =====================================================

function decryptCryptoJS(encrypted, password) {
  if (!encrypted) {
    throw new Error("Encrypted value is empty");
  }

  const data = Buffer.from(encrypted, "base64");

  if (data.length < 16) {
    throw new Error("Invalid encrypted data");
  }

  const prefix = data
    .subarray(0, 8)
    .toString("utf8");

  if (prefix !== "Salted__") {
    throw new Error(
      `Invalid CryptoJS encrypted data prefix: ${prefix}`
    );
  }

  const salt = data.subarray(8, 16);
  const ciphertext = data.subarray(16);

  if (!ciphertext.length) {
    throw new Error("Ciphertext is empty");
  }

  const { key, iv } = evpBytesToKey(
    password,
    salt
  );

  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    key,
    iv
  );

  let decrypted = decipher.update(ciphertext);

  decrypted = Buffer.concat([
    decrypted,
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}

// =====================================================
// COMMON HASH NORMALIZATION
// =====================================================

function normalizeHash(hash) {
  if (!hash) {
    throw new Error("Hash is missing");
  }

  // URL query parameters may already be decoded by Next.js.
  // Therefore try the value directly first.
  let encrypted = hash;

  try {
    encrypted = decodeURIComponent(hash);
  } catch {
    encrypted = hash;
  }

  return encrypted;
}

// =====================================================
// KUNDLI
// =====================================================

export function decodeKundliHash(hash) {
  try {

    const encrypted = normalizeHash(hash);

    const decrypted = decryptCryptoJS(
      encrypted,
      SECRET_KEY
    );

    if (!decrypted) {
      throw new Error(
        "Kundli decrypted value is empty"
      );
    }

    const result = JSON.parse(decrypted);
   

    return result;
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

export function decodeNumeroHash(hash) {
  try {

    const encrypted = normalizeHash(hash);

    const decrypted = decryptCryptoJS(
      encrypted,
      NUMERO_SECRET
    );

    if (!decrypted) {
      throw new Error(
        "Numero decrypted value is empty"
      );
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

