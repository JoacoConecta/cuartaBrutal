import { fetchLinksConCache } from "../services/contactos.js";

// --------------------------------------------------------------
// 🧠 Estado único
// --------------------------------------------------------------
let numeroWhatsApp = null;
let inicializado = false;

// --------------------------------------------------------------
// 📡 Cargar número (UNA SOLA VEZ)
// --------------------------------------------------------------
async function cargarNumeroWhatsApp() {
  if (numeroWhatsApp) return;

  try {
    const resp = await fetchLinksConCache();
    if (resp.ok && resp.data?.telefono) {
      numeroWhatsApp = resp.data.telefono.trim();
    }
  } catch {
    console.warn("⚠️ No se pudo obtener el número de WhatsApp");
  }
}

// --------------------------------------------------------------
// 🧾 Enviar carrito
// --------------------------------------------------------------
function enviarCarritoPorWhatsApp() {
  const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
  if (!carrito.length) {
    alert("Tu carrito está vacío. ¡Añade productos para continuar!");
    return;
  }

  if (!numeroWhatsApp) {
    alert("No se pudo obtener el número de WhatsApp. Intenta más tarde.");
    return;
  }

  let mensaje = "¡Hola! Me gustaría hacer el siguiente pedido:\n\n";
  let total = 0;

  carrito.forEach(({ nombre, talle, cantidad, subtotal }) => {
    mensaje +=
      `Producto: ${nombre}\n` +
      `Talle: ${talle}\n` +
      `Cantidad: ${cantidad}\n` +
      `Subtotal: $${subtotal.toFixed(2)}\n\n`;
    total += subtotal;
  });

  mensaje += `*TOTAL DEL PEDIDO: $${total.toFixed(2)}*`;

  window.open(
    `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensaje)}`,
    "_blank"
  );
}

// --------------------------------------------------------------
// 🧩 Init único (sin polling)
// --------------------------------------------------------------
async function initWhatsApp() {
  if (inicializado) return;

  const btn = document.getElementById("mandar_wpp");
  if (!btn) return;

  inicializado = true;

  await cargarNumeroWhatsApp();
  btn.addEventListener("click", enviarCarritoPorWhatsApp);
}

// --------------------------------------------------------------
// 🚀 Arranque
// --------------------------------------------------------------
document.addEventListener("components:ready", initWhatsApp, { once: true });
document.addEventListener("DOMContentLoaded", initWhatsApp, { once: true });
