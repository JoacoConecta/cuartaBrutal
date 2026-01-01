import { fetchLinksConCache } from "../services/contactos.js";

// --------------------------------------------------------------
// 🧠 Estado
// --------------------------------------------------------------
let inicializado = false;

// --------------------------------------------------------------
// 🚀 Init único
// --------------------------------------------------------------
async function initWhatsappButton() {
  if (inicializado) return;

  const botonFixed = document.getElementById("whatsapp");
  if (!botonFixed) return;

  inicializado = true;

  try {
    const resp = await fetchLinksConCache();
    if (!resp.ok || !resp.data?.telefono) {
      console.warn("No se encontró teléfono en /links");
      return;
    }

    const numero = resp.data.telefono.trim();
    const mensaje = "wachinn";

    botonFixed.addEventListener("click", () => {
      window.open(
        `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`,
        "_blank"
      );
    });

  } catch {
    console.warn("Error inicializando botón de WhatsApp");
  }
}

// --------------------------------------------------------------
// 🧩 Arranque seguro
// --------------------------------------------------------------
document.addEventListener("components:ready", initWhatsappButton, { once: true });
document.addEventListener("DOMContentLoaded", initWhatsappButton, { once: true });
