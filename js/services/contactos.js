// services/contacto.js
import { API_BASE_URL } from "../main.js"; // ajusta la ruta según tu estructura

// Caché en memoria para los links del footer
const CACHE_MS = 3600000; // 1 hora

let footerLinksCache = {
  ts: 0,   // timestamp de última actualización
  data: null, // datos de /links
};

/**
 * Obtiene los links del backend usando caché en el navegador.
 * - Si hay caché fresco -> lo devuelve.
 * - Si no, llama a `${API_BASE_URL}/links`, guarda y devuelve.
 * - Si el fetch falla pero hay caché viejo, devuelve ese.
 */
export async function fetchLinksConCache() {
  const now = Date.now();

  // 1️⃣ Cache válido en memoria
  if (footerLinksCache.data && now - footerLinksCache.ts < CACHE_MS) {
    return { ok: true, data: footerLinksCache.data, fromCache: true };
  }

  try {
    // 2️⃣ Llamada real al backend
    const res = await fetch(`${API_BASE_URL}/links`);
    if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);

    const { ok, data } = await res.json();
    if (!ok || !data) throw new Error("Respuesta ok:false o sin data");

    // 3️⃣ Guardar en caché
    footerLinksCache = {
      ts: now,
      data,
    };

    return { ok: true, data, fromCache: false };
  } catch (error) {
    console.warn("[fetchLinksConCache] Error obteniendo /links:", error);

    // 4️⃣ Fallback: si hay algo en caché, aunque esté viejo, lo devolvemos
    if (footerLinksCache.data) {
      return { ok: true, data: footerLinksCache.data, fromCache: true };
    }

    // 5️⃣ Sin datos ni caché
    return { ok: false, data: null };
  }
}

// Opcional: por si algún día quieres forzar limpiar el caché
export function clearFooterLinksCache() {
  footerLinksCache = { ts: 0, data: null };
}
