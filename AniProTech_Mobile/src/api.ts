import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
export const API_URL = (
  process.env.EXPO_PUBLIC_API_URL || "http://10.0.2.2:8080"
).replace(/\/$/, "");
export type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
};
export type Api = <T = any>(
  path: string,
  method?: string,
  body?: unknown,
) => Promise<T>;
let token: string | null = null;
let unauthorized: (() => void) | null = null;
export function onUnauthorized(handler: () => void) {
  unauthorized = handler;
}

const key = "aniprotech.session";
export async function saveToken(value: string | null) {
  token = value;
  if (Platform.OS === "web") return;
  if (value)
    await SecureStore.setItemAsync(
      key,
      JSON.stringify({ token: value, origin: API_URL }),
    );
  else await SecureStore.deleteItemAsync(key);
}
export async function restoreToken() {
  if (Platform.OS === "web") return null;
  const stored = await SecureStore.getItemAsync(key);
  if (!stored) return null;
  try {
    const parsed = JSON.parse(stored);
    if (parsed.origin !== API_URL) {
      await SecureStore.deleteItemAsync(key);
      return null;
    }
    token = parsed.token;
    return token;
  } catch {
    await SecureStore.deleteItemAsync(key);
    return null;
  }
}
export const api: Api = async (path, method = "GET", body) => {
  const controller = new AbortController(),
    timer = setTimeout(() => controller.abort(), 25000);
  try {
    const response = await fetch(API_URL + path, {
      method,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: "Bearer " + token } : {}),
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
    const result = await response.json();
    if (
      response.status === 401 &&
      !path.includes("/auth/get-token") &&
      !path.includes("/auth/request-link")
    )
      unauthorized?.();
    if (!response.ok || result.error)
      throw new Error(result.message || "Request failed");
    return result.results?.data;
  } catch (e) {
    if (e instanceof Error && e.name === "AbortError")
      throw new Error(
        "The server took too long. Check your connection and retry.",
      );
    throw e;
  } finally {
    clearTimeout(timer);
  }
};

export async function upload(path: string, uri: string, caption = "") {
  const form = new FormData();
  form.append("caption", caption);
  form.append("photo", { uri, name: `care-photo-${Date.now()}.jpg`, type: "image/jpeg" } as any);
  const response = await fetch(API_URL + path, {
    method: "POST",
    headers: token ? { Authorization: "Bearer " + token } : {},
    body: form,
  });
  const result = await response.json();
  if (!response.ok || result.error) throw new Error(result.message || "Upload failed");
  return result.results?.data;
}
