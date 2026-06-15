import { CONFIG } from "../config";

const TOKEN_KEY = "re_token";
const USER_KEY = "re_user";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(t: string | null) {
  if (t) localStorage.setItem(TOKEN_KEY, t);
  else localStorage.removeItem(TOKEN_KEY);
}
export function getStoredUser(): any | null {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}
export function setStoredUser(u: any | null) {
  if (u) localStorage.setItem(USER_KEY, JSON.stringify(u));
  else localStorage.removeItem(USER_KEY);
}

const OK = ["CREATED", "OK", "success", "done"];

/** Invoke a Knative function method. Unwraps the gateway's nested `data.data`. */
export async function invoke<T = any>(
  method: string,
  objectData: Record<string, any> = {},
  auth = true
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Environment-Id": CONFIG.ENV_ID,
  };
  const token = getToken();
  if (auth && token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(
    `${CONFIG.BASE}/v2/invoke_function/${CONFIG.FUNCTION}?project-id=${CONFIG.PROJECT_ID}`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({ data: { method, object_data: objectData } }),
    }
  );
  const json = await res.json();
  if (json.status && !OK.includes(json.status)) {
    throw new Error(typeof json.data === "string" ? json.data : json.description || "request failed");
  }
  // { data: { status, data: <result> } }
  const inner = json?.data?.data ?? json?.data ?? {};
  return inner as T;
}

function itemHeaders(): Record<string, string> {
  const h: Record<string, string> = {
    "Content-Type": "application/json",
    authorization: "API-KEY",
    "X-API-KEY": CONFIG.APP_ID,
    "environment-id": CONFIG.ENV_ID,
  };
  return h;
}

/** List records from a table with optional Mongo-style filter. */
export async function itemList<T = any>(
  table: string,
  filter: Record<string, any> = {},
  page = 1,
  limit = 20
): Promise<{ items: T[]; count: number }> {
  const data = { offset: (page - 1) * limit, limit, ...filter };
  const enc = encodeURIComponent(JSON.stringify(data));
  const url = `${CONFIG.BASE}/v2/items/${table}?from-ofs=true&data=${enc}&offset=${(page - 1) * limit}&limit=${limit}`;
  const res = await fetch(url, { headers: itemHeaders() });
  const json = await res.json();
  const d = json?.data?.data ?? {};
  return { items: (d.response ?? []) as T[], count: d.count ?? 0 };
}

export async function itemGet<T = any>(table: string, id: string): Promise<T> {
  const res = await fetch(`${CONFIG.BASE}/v2/items/${table}/${id}?from-ofs=true`, {
    headers: itemHeaders(),
  });
  const json = await res.json();
  return (json?.data?.data?.response ?? json?.data?.data ?? {}) as T;
}

export async function itemCreate<T = any>(table: string, fields: Record<string, any>): Promise<T> {
  const res = await fetch(`${CONFIG.BASE}/v2/items/${table}?from-ofs=true`, {
    method: "POST",
    headers: itemHeaders(),
    body: JSON.stringify({ data: fields }),
  });
  const json = await res.json();
  return (json?.data?.data ?? {}) as T;
}

export async function itemUpdate<T = any>(table: string, fields: Record<string, any>): Promise<T> {
  const res = await fetch(`${CONFIG.BASE}/v2/items/${table}?from-ofs=true`, {
    method: "PUT",
    headers: itemHeaders(),
    body: JSON.stringify({ data: fields }),
  });
  const json = await res.json();
  return (json?.data ?? {}) as T;
}

export async function itemDelete(table: string, id: string): Promise<void> {
  await fetch(`${CONFIG.BASE}/v2/items/${table}/${id}?from-ofs=true`, {
    method: "DELETE",
    headers: itemHeaders(),
  });
}

/** Upload a file to UCode storage; returns the stored link (relative path). */
export async function uploadFile(file: File): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch(`${CONFIG.BASE}/v1/files/folder_upload?folder_name=Media`, {
    method: "POST",
    headers: {
      authorization: "API-KEY",
      "X-API-KEY": CONFIG.APP_ID,
      "environment-id": CONFIG.ENV_ID,
    },
    body: fd,
  });
  const json = await res.json();
  return json?.data?.link ?? "";
}

/** Build a public CDN URL from a stored file link. */
export function imgUrl(link?: string): string {
  if (!link) return "";
  if (link.startsWith("http")) return link;
  return CONFIG.CDN.replace(/\/$/, "") + "/" + link.replace(/^\//, "");
}

/** MULTISELECT helpers: fields are stored as arrays. */
export const one = (v: any): string =>
  Array.isArray(v) ? (v[0] ?? "") : (v ?? "");
export const arr = (v: string): string[] => (v ? [v] : []);
