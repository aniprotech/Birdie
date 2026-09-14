import CryptoJS from "crypto-js";

const SECRET_KEY = 'devTest'; 
const ENCRYPTION_KEY = import.meta.env.VITE_APP_SECRET_KEY || SECRET_KEY; 

export const encryptData = (data) => {
  return CryptoJS.AES.encrypt(JSON.stringify(data), ENCRYPTION_KEY).toString();
};

export const decryptData = (data) => {
  const bytes = CryptoJS.AES.decrypt(data, ENCRYPTION_KEY);
  const decrypted = bytes.toString(CryptoJS.enc.Utf8);
  return JSON.parse(decrypted);
};
