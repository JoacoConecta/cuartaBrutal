// /js/banners/liquidacion.js
import { API_BASE_URL } from "../main.js";

// ===============================================================
// 🛡️ BLINDAJE ANTI-XSS (vía URLs externas / SVG / schemes raros)
// ===============================================================

// Si querés permitir CDN(s), agregalos acá. Por defecto: SOLO mismo host.
const ALLOW_EXTERNAL_IMAGE_HOSTS = [
  "i.ibb.co",
];


const SOLO_MISMO_HOST = ALLOW_EXTERNAL_IMAGE_HOSTS.length === 0;

function sanitizeImageUrl(raw) {
  if (!raw) return null;
  const s = String(raw).trim();
  if (!s) return null;

  let u;
  try {
    // Permite URLs relativas (se resuelven contra el origin actual)
    u = new URL(s, window.location.origin);
  } catch {
    return null;
  }

  // Bloquear esquemas peligrosos / no deseados
  // (javascript:, data:, blob:, file:, etc.)
  if (u.protocol !== "https:" && u.protocol !== "http:") return null;

  // Bloquear credenciales embebidas (phishing / abuso)
  if (u.username || u.password) return null;

  // Host allowlist
  const hostOk = SOLO_MISMO_HOST
    ? u.host === window.location.host
    : u.host === window.location.host || ALLOW_EXTERNAL_IMAGE_HOSTS.includes(u.host);

  if (!hostOk) return null;

  // Extra: bloquear svg (reduce superficie: scripts/links embebidos)
  // Si necesitás SVG, sacá esto, pero asumís riesgo y dependés de CSP.
  const pathname = u.pathname.toLowerCase();
  if (pathname.endsWith(".svg")) return null;

  return u.href;
}

// helper: aplica fade cuando cambia la imagen
function suavizarCambio(img, nuevaUrl) {
  if (!img || !nuevaUrl) return;

  // Evita acumular handlers
  img.onload = null;
  img.onerror = null;

  if (img.src === nuevaUrl) {
    img.classList.add("visible");
    return;
  }

  // Endurecer el elemento (no ejecuta JS, pero suma higiene)
  img.referrerPolicy = "no-referrer";
  img.decoding = "async";
  img.loading = img.loading || "lazy";

  img.onload = () => img.classList.add("visible");
  img.onerror = () => img.classList.add("visible"); // fallback visual si falla

  img.src = nuevaUrl;
}

async function cargarBannerLiquidacion() {
  const imgDesktop = document.getElementById("banner-desktop");
  const imgMovil = document.getElementById("banner-movil");

  try {
    const res = await fetch(`${API_BASE_URL}/hoja-categorias/fotos`, {
      method: "GET",
      credentials: "include",
      headers: { "Accept": "application/json" },
      cache: "no-store",
    });
    if (!res.ok) return;

    const json = await res.json();
    if (!json?.ok || !json?.data) return;

    const deskRaw = json.data.BannerGeneralDesktop;
    const mobRaw = json.data.BannerGeneralMobile;

    const deskUrl = sanitizeImageUrl(deskRaw);
    const mobUrl = sanitizeImageUrl(mobRaw);

    if (imgDesktop && deskUrl) suavizarCambio(imgDesktop, deskUrl);
    else if (imgDesktop) imgDesktop.classList.add("visible");

    if (imgMovil && mobUrl) suavizarCambio(imgMovil, mobUrl);
    else if (imgMovil) imgMovil.classList.add("visible");
  } catch {
    if (imgDesktop) imgDesktop.classList.add("visible");
    if (imgMovil) imgMovil.classList.add("visible");
  }
}

// ejecución
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", cargarBannerLiquidacion, { once: true });
} else {
  cargarBannerLiquidacion();
}
