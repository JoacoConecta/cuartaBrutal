// main.js
import { CONFIG } from './config.js';

// ===============================================================
// ⚙️ CONFIGURACIÓN GLOBAL
// ===============================================================
export const CLIENTE = CONFIG.cliente || "pruebamidway";
export const API_BASE_URL =
  CONFIG.apiBase || "https://k-nectafrstat.onrender.com";
// 💳 Mercado Pago – init seguro
window.addEventListener("load", () => {
  if (CONFIG.mpPublicKey && window.MercadoPago) {
    window.mercadopago = new window.MercadoPago(CONFIG.mpPublicKey, {
      locale: "es-AR",
    });
    console.log("💳 MercadoPago inicializado");
  }
});

// ===============================================================
// 🛡️ INIT GLOBAL (ANTI-BOT + FETCH INTERCEPTOR)
// ===============================================================
(() => {
  // 1️⃣ Token anti-bot
// 🔐 PROMESA GLOBAL DE SESIÓN (BLOQUEANTE)
window.__trustReady = fetch(`${API_BASE_URL}/api/init-session`, {
  method: "GET",
  credentials: "include",
  headers: { "x-cliente": CLIENTE },
})
  .then(res => res.json())
  .then(data => {
    if (data.ok) {
      console.log(`🛡️ Sesión segura iniciada para: ${CLIENTE}`);
    }
    return data;
  })
  .catch(err => {
    console.error("Error sesión anti-bot:", err);
    return null;
  });


  // 2️⃣ Interceptor fetch (solo headers)
  const originalFetch = window.fetch;
  window.fetch = (url, options = {}) => {
    const headers = {
      "x-cliente": CLIENTE,
      ...(options.headers || {}),
    };
    return originalFetch(url, { ...options, headers });
  };
})();

// ===============================================================
// 🧠 CACHE Y CONTROL DE RECURSOS
// ===============================================================
const htmlCache = new Map();
const cssLoaded = new Set();

// ===============================================================
// 🎨 CARGA DE ESTILOS (DEDUP)
// ===============================================================
function loadStyles(files = []) {
  files.forEach((href) => {
    if (cssLoaded.has(href)) return;

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    document.head.appendChild(link);

    cssLoaded.add(href);
  });
}

// ===============================================================
// 🎨 MOTOR DE TEMAS (BLINDADO)
// ===============================================================
(() => {
  try {
    if (!CONFIG || !CONFIG.theme) return;
    if (Object.keys(CONFIG.theme).length === 0) return;

    const root = document.documentElement;
    Object.entries(CONFIG.theme).forEach(([variable, valor]) => {
      if (variable && valor) {
        root.style.setProperty(variable, valor);
      }
    });

    console.log("🎨 Tema personalizado aplicado:", CONFIG.cliente);
  } catch (err) {
    console.warn("⚠️ Tema no aplicado, usando default.", err);
  }
})();

// ===============================================================
// 🧩 loadComponent (HTML PASIVO, SIN SCRIPTS)
// ===============================================================
export async function loadComponent(mountSelector, file, styles = []) {
  const mount = document.querySelector(mountSelector);
  if (!mount) return false;

  // estilos
  loadStyles(styles);

  // cache
  if (htmlCache.has(file)) {
    mount.innerHTML = htmlCache.get(file);
    return true;
  }

  // fetch HTML
  const res = await fetch(`/js/modulos/${file}`);
  if (!res.ok) {
    mount.innerHTML = `<p style="color:red">Error cargando ${file}</p>`;
    return false;
  }

  const html = await res.text();
  htmlCache.set(file, html);
  mount.innerHTML = html;

  // 🚫 NO scripts, NO ejecución
  return true;
}

// ===============================================================
// 🚀 ARRANQUE PRINCIPAL
// ===============================================================
document.addEventListener("DOMContentLoaded", async () => {
  // 1️⃣ estilos core
  loadStyles([
    "/styles/core/tokens.css",
    "/styles/core/base.css",
    "/styles/core/utilities.css",
    "/styles/components/ribbon.css",
    "/styles/components/carousel.css",
  ]);

  // 2️⃣ componentes
  await Promise.all([
    loadComponent("#loader-mount", "loader.html", [
      "/styles/components/loader.css",
    ]),
    loadComponent("#header-mount", "header.html", [
      "/styles/components/header.css",
      "/styles/components/buttons.css",
    ]),
    loadComponent("#footer-mount", "footer.html", [
      "/styles/components/footer.css",
      "/styles/components/formulario.css",
    ]),
  ]);

  // 3️⃣ loaders visuales
  const splashScreen = document.querySelector("#splash-screen");
  const dataLoader = document.querySelector("#loader");

  if (splashScreen) splashScreen.classList.add("hidden");
  if (dataLoader) dataLoader.classList.add("visible");

  // 4️⃣ evento global
  document.dispatchEvent(new CustomEvent("components:ready"));
  window.dispatchEvent(new Event("components:ready"));
});
