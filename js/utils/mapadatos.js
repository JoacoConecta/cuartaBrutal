import { API_BASE_URL } from "../main.js";

let _cache = null;

export async function getLinksData({ useCache = false } = {}) {
  if (useCache && _cache) return _cache;

  const url = `${API_BASE_URL.replace(/\/$/, "")}/links`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(url, {
      method: "GET",
      credentials: "include",
      headers: { Accept: "application/json" },
      cache: "no-store",
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) return null;

    const json = await res.json();
    if (!json?.ok) return null;

    _cache = json.data;
    return json.data; // { instagram, telefono, mail, tiktok, locales }

  } catch {
    return null;
  }
}
