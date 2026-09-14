import CryptoJS from "crypto-js";

const ENCRYPTION_KEY = import.meta.env.VITE_APP_SECRET_KEY;

if (!ENCRYPTION_KEY) {
  throw new Error("VITE_APP_SECRET_KEY is required");
}

export const encryptData = (data) => {
  return CryptoJS.AES.encrypt(JSON.stringify(data), ENCRYPTION_KEY).toString();
};

export const decryptData = (data) => {
  const bytes = CryptoJS.AES.decrypt(data, ENCRYPTION_KEY);
  const decrypted = bytes.toString(CryptoJS.enc.Utf8);
  return JSON.parse(decrypted);
};
