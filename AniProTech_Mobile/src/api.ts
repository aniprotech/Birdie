import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { replayOwnedQueue } from "./offlineQueue.js";
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

export type PendingMutation = { id: string; ownerId: string; path: string; body: unknown; label: string; queuedAt: string; attempts: number; lastError: string };
export type SyncSummary = { pending: number; blocked: number; sent: number; lastSyncAt: string | null; items: Pick<PendingMutation,"id"|"label"|"queuedAt"|"attempts"|"lastError">[] };
const queueKey = "caremonitor.pending-mutations";
const syncKey = "caremonitor.sync-summary";
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
export async function pendingMutationSummary(ownerId: string): Promise<SyncSummary> {
  const items=(await readQueue()).filter((item)=>item.ownerId===ownerId);
  let lastSyncAt:string|null=null,sent=0;
  if(Platform.OS!=="web")try{const stored=await SecureStore.getItemAsync(syncKey);if(stored){const parsed=JSON.parse(stored);lastSyncAt=parsed.lastSyncAt||null;sent=Number(parsed.sent||0);}}catch{}
  return {pending:items.length,blocked:items.filter((item)=>!!item.lastError).length,sent,lastSyncAt,items:items.map(({id,label,queuedAt,attempts,lastError})=>({id,label,queuedAt,attempts,lastError}))};
}
export async function apiOrQueue(path: string, body: unknown, ownerId: string, label = "Visit record") {
  try { return { data: await api(path, "POST", body), queued: false }; }
  catch (error) {
    if (Platform.OS === "web" || (error instanceof ApiRequestError && error.status !== null && error.status < 500)) throw error;
    const items = await readQueue();
    if (items.length >= 100) throw new Error("The secure offline queue is full. Reconnect before recording more visit information.");
    const id = (body as any)?.clientEventId;
    if (!id) throw error;
    if (!items.some((item) => item.id === id)) items.push({ id, ownerId, path, body, label, queuedAt: new Date().toISOString(), attempts:0, lastError:"" });
    await writeQueue(items);
    return { data: null, queued: true };
  }
}
export async function flushPendingMutations(ownerId: string) {
  const items = await readQueue();
  const {remaining,sent}=await replayOwnedQueue(items,ownerId,(item)=>api(item.path,"POST",item.body),(error)=>error instanceof ApiRequestError&&error.status!==null&&error.status<500?(error as Error).message:"Waiting for a network connection");
  await writeQueue(remaining);
  const owned=remaining.filter((item)=>item.ownerId===ownerId),summary={sent,pending:owned.length,blocked:owned.filter((item)=>!!item.lastError).length,lastSyncAt:new Date().toISOString()};
  if(Platform.OS!=="web")await SecureStore.setItemAsync(syncKey,JSON.stringify(summary));
  return summary;
}

export type UploadAsset = { uri:string; fileName?:string|null; mimeType?:string|null; fileSize?:number|null };
export async function upload(path: string, asset: UploadAsset, caption = "", metadata?: { latitude:number|null; longitude:number|null; accuracy:number|null; capturedAt:string }) {
  if(asset.fileSize && asset.fileSize > 12 * 1024 * 1024)
    throw new Error("The photo is larger than 12 MB. Retake it at a lower resolution.");
  const form = new FormData();
  form.append("caption", caption);
  if(metadata){
    if(metadata.latitude!=null)form.append("latitude",String(metadata.latitude));
    if(metadata.longitude!=null)form.append("longitude",String(metadata.longitude));
    if(metadata.accuracy!=null)form.append("accuracy",String(metadata.accuracy));
    form.append("capturedAt",metadata.capturedAt);
  }
  const inferredExtension=asset.mimeType==="image/png"?"png":asset.mimeType?.includes("hei")?"heic":"jpg";
  form.append("photo", { uri:asset.uri, name:asset.fileName||`care-photo-${Date.now()}.${inferredExtension}`, type:asset.mimeType||"image/jpeg" } as any);
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),60000);
  try{
    const response = await fetch(API_URL + path, {
      method: "POST",
      signal:controller.signal,
      headers: token ? { Authorization: "Bearer " + token } : {},
      body: form,
    });
    const raw=await response.text();
    let result:any={};
    try{result=raw?JSON.parse(raw):{}}catch{throw new Error(`Photo upload failed (${response.status}). Please retry.`)}
    if(response.status===401)unauthorized?.();
    if (!response.ok || result.error) throw new ApiRequestError(result.message || "Photo upload failed",response.status);
    return result.results?.data;
  }catch(error){
    if(error instanceof Error&&error.name==="AbortError")throw new Error("The photo upload took too long. Check your connection and retry.");
    throw error;
  }finally{clearTimeout(timer)}
}
