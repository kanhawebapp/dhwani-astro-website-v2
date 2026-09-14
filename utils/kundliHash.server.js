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
  const passwordBuffer = Buffer.from(
    password,
    "utf8"
  );

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

function decryptCryptoJS(
  encrypted,
  password
) {
  const data = Buffer.from(
    encrypted,
    "base64"
  );

  const prefix = data
    .subarray(0, 8)
    .toString("utf8");

  if (prefix !== "Salted__") {
    throw new Error(
      "Invalid CryptoJS encrypted data"
    );
  }

  const salt = data.subarray(8, 16);
  const ciphertext = data.subarray(16);

  const { key, iv } =
    evpBytesToKey(
      password,
      salt
    );

  const decipher =
    crypto.createDecipheriv(
      "aes-256-cbc",
      key,
      iv
    );

  let decrypted =
    decipher.update(ciphertext);

  decrypted = Buffer.concat([
    decrypted,
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}

// =====================================================
// DECODE KUNDLI HASH
// =====================================================

export function decodeKundliHash(hash) {
  try {
    if (!hash) {
      console.error(
        "decodeKundliHash: hash missing"
      );
      return null;
    }

    const encrypted =
      decodeURIComponent(hash);

    const decrypted =
      decryptCryptoJS(
        encrypted,
        SECRET_KEY
      );

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
// DECODE NUMERO HASH
// =====================================================

export function decodeNumeroHash(hash) {
  try {
    console.log(
      "decodeNumeroHash - starting"
    );

    console.log(
      "decodeNumeroHash - secret loaded:",
      NUMERO_SECRET ? "YES" : "NO"
    );

    if (!hash) {
      console.error(
        "decodeNumeroHash: hash missing"
      );
      return null;
    }

    const encrypted =
      decodeURIComponent(hash);

    console.log(
      "decodeNumeroHash - encrypted hash received"
    );

    const decrypted =
      decryptCryptoJS(
        encrypted,
        NUMERO_SECRET
      );

    if (!decrypted) {
      console.error(
        "decodeNumeroHash: empty decrypted value"
      );
      return null;
    }

    const result =
      JSON.parse(decrypted);

    console.log(
      "decodeNumeroHash - successfully decrypted"
    );

    return result;
  } catch (error) {
    console.error(
      "decodeNumeroHash error:",
      error
    );

    return null;
  }
}
