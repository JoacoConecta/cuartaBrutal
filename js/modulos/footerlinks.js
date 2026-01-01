// ui/footer.js
import { fetchLinksConCache } from "../services/contactos.js";

// ======================================================
// 🧰 UTILIDADES
// ======================================================

/**
 * Limpia y normaliza URLs de redes sociales.
 * Acepta URL completa, usuario solo o con '@'.
 */
const getSocialUrl = (input, baseUrl) => {
  if (!input) return null;

  if (input.includes("http") || input.includes("www.")) {
    return input.startsWith("www.") ? `https://${input}` : input;
  }

  const cleanHandle = input.replace(/[@/]/g, "").trim();
  return `${baseUrl}/${cleanHandle}`;
};

/**
 * Rellena texto y/o link en elementos por ID o class
 */
const rellenar = (selector, texto, link) => {
  const elementos = document.querySelectorAll(`#${selector}, .${selector}`);

  if (!texto && !link) {
    elementos.forEach(el => (el.style.display = "none"));
    return;
  }

  elementos.forEach(el => {
    if (texto) el.textContent = texto;
    if (link && el.tagName === "A") el.href = link;
    el.style.display = "";
  });
};

// ======================================================
// 🚀 LÓGICA PRINCIPAL
// ======================================================

export async function cargarDatosFooter() {
  try {
    const { ok, data } = await fetchLinksConCache();
    if (!ok || !data) return;

    const { instagram, telefono, mail, tiktok } = data;

    // --- TELÉFONO ---
    if (telefono) {
      const cleanPhone = telefono.replace(/\D/g, "");
      rellenar("dato-telefono", telefono, `tel:+${cleanPhone}`);
      rellenar("link-soporte", null, `https://wa.me/${cleanPhone}`);
    } else {
      rellenar("dato-telefono", null, null);
      rellenar("link-soporte", null, null);
    }

    // --- MAIL ---
    if (mail) {
      rellenar("dato-mail", mail.toUpperCase(), `mailto:${mail}`);
    } else {
      rellenar("dato-mail", null, null);
    }

    // --- INSTAGRAM ---
    const instaUrl = getSocialUrl(instagram, "https://instagram.com");
    rellenar("link-instagram-icon", null, instaUrl);
    rellenar("link-instagram-texto", null, instaUrl);

    // --- TIKTOK ---
    const tiktokUrl = getSocialUrl(tiktok, "https://tiktok.com/@");
    rellenar("link-tiktok-icon", null, tiktokUrl);

    console.log("✔ Footer actualizado correctamente");
  } catch (err) {
    console.warn("⚠ No se pudieron cargar los links del footer:", err);
  }
}

// ======================================================
// 🧩 ARRANQUE CONTROLADO (LIFECYCLE REAL)
// ======================================================

window.addEventListener(
  "components:ready",
  () => {
    // Seguridad mínima: solo si el footer existe
    if (document.getElementById("footer-mount")) {
      cargarDatosFooter();
    }
  },
  { once: true }
);
