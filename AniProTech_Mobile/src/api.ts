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
export class ApiRequestError extends Error {
  status: number | null;
  constructor(message: string, status: number | null = null) {
    super(message);
    this.status = status;
  }
}
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
      throw new ApiRequestError(result.message || "Request failed", response.status);
    return result.results?.data;
  } catch (e) {
    if (e instanceof Error && e.name === "AbortError")
      throw new ApiRequestError(
        "The server took too long. Check your connection and retry.",
      );
    throw e;
  } finally {
    clearTimeout(timer);
  }
};

type PendingMutation = { id: string; ownerId: string; path: string; body: unknown; queuedAt: string };
const queueKey = "caremonitor.pending-mutations";
export function clientEventId() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (character) => {
    const value = Math.floor(Math.random() * 16);
    return (character === "x" ? value : (value & 3) | 8).toString(16);
  });
}
async function readQueue(): Promise<PendingMutation[]> {
  if (Platform.OS === "web") return [];
  const stored = await SecureStore.getItemAsync(queueKey);
  if (!stored) return [];
  try { return JSON.parse(stored); } catch { await SecureStore.deleteItemAsync(queueKey); return []; }
}
async function writeQueue(items: PendingMutation[]) {
  if (Platform.OS === "web") return;
  if (items.length) await SecureStore.setItemAsync(queueKey, JSON.stringify(items));
  else await SecureStore.deleteItemAsync(queueKey);
}
export async function clearPendingMutations() {
  if (Platform.OS !== "web") await SecureStore.deleteItemAsync(queueKey);
}
export async function apiOrQueue(path: string, body: unknown, ownerId: string) {
  try { return { data: await api(path, "POST", body), queued: false }; }
  catch (error) {
    if (Platform.OS === "web" || (error instanceof ApiRequestError && error.status !== null && error.status < 500)) throw error;
    const items = await readQueue();
    if (items.length >= 50) throw new Error("The secure offline queue is full. Reconnect before recording more medication.");
    const id = (body as any)?.clientEventId;
    if (!id) throw error;
    if (!items.some((item) => item.id === id)) items.push({ id, ownerId, path, body, queuedAt: new Date().toISOString() });
    await writeQueue(items);
    return { data: null, queued: true };
  }
}
export async function flushPendingMutations(ownerId: string) {
  const items = await readQueue(), remaining: PendingMutation[] = [];
  let sent = 0, blocked = 0;
  for (const item of items) {
    if (item.ownerId !== ownerId) { remaining.push(item); blocked += 1; continue; }
    try { await api(item.path, "POST", item.body); sent += 1; }
    catch (error) {
      if (error instanceof ApiRequestError && error.status !== null && error.status < 500) blocked += 1;
      remaining.push(item);
    }
  }
  await writeQueue(remaining);
  return { sent, pending: remaining.length, blocked };
}

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
