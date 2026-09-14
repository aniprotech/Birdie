import { create } from "zustand";
import { persist } from "zustand/middleware";
import { decryptData, encryptData } from "../utils/cryptoHelpers";

const useAuthStore = create(
  persist(
    (set) => ({
      userData: null,
      setUserData: (data) => set({ userData: data }),
    }),
    {
      name: "userInfo",
      storage: {
        getItem: (name) => {
          const stored = localStorage.getItem(name);
          return stored ? decryptData(stored) : null;
        },
        setItem: (name, value) => {
          const encrypted = encryptData(value);
          localStorage.setItem(name, encrypted);
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
    }
  )
);

export default useAuthStore;
