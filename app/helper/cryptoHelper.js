import CryptoJS from "crypto-js";

const SECRET_KEY = process.env.NEXT_PUBLIC_SECRET_KEY_FOR_CRYPTO;

if (!SECRET_KEY) {
  throw new Error("NEXT_PUBLIC_SECRET_KEY_FOR_CRYPTO is not defined");
}

export const encryptData = (data) => {
  try {
    const encrypted = CryptoJS.AES.encrypt(
      JSON.stringify(data),
      SECRET_KEY
    ).toString();

    return encodeURIComponent(encrypted);
  } catch (error) {
    return null;
  }
};

export const decryptData = (encryptedData) => {
  try {
    const bytes = CryptoJS.AES.decrypt(
      decodeURIComponent(encryptedData),
      SECRET_KEY
    );

    const decrypted = bytes.toString(CryptoJS.enc.Utf8);

    return JSON.parse(decrypted);
  } catch (error) {
    return null;
  }
};