import { mostrarAlertaError } from "./carrito.js";
import { API_BASE_URL } from "../main.js";

// --------------------------------------------------
// 🧠 Estado
// --------------------------------------------------
let inicializado = false;

// --------------------------------------------------
// 🛒 Utils
// --------------------------------------------------
function getCarrito() {
  return JSON.parse(localStorage.getItem("carrito")) || [];
}

function mostrarToastExito(titulo, texto = "") {
  Swal.fire({
    icon: "success",
    title: titulo,
    text: texto,
    timer: 3000,
    timerProgressBar: true,
    confirmButtonColor: "#28a745",
  });
}

// --------------------------------------------------
// 🚀 Init
// --------------------------------------------------
function inicializarFormularioCompra() {
  if (inicializado) return;

  const modal = document.getElementById("compra-modal");
  const formulario = document.getElementById("formulario-datos");
  const abrirBtn = document.getElementById("finalizar-compra-btn");
  const cerrarBtn = document.querySelector(".cerrar-modal");

  if (!modal || !formulario || !abrirBtn || !cerrarBtn) return;

  inicializado = true;

  const submitBtn = formulario.querySelector('button[type="submit"]');

  // ---------------- Modal ----------------
  const abrir = () => {
    modal.style.display = "flex";
    requestAnimationFrame(() => modal.classList.add("activo"));
  };

  const cerrar = () => {
    modal.classList.remove("activo");
    setTimeout(() => (modal.style.display = "none"), 300);
  };

  abrirBtn.addEventListener("click", () => {
    if (getCarrito().length === 0) {
      mostrarAlertaError("Tu carrito está vacío");
      return;
    }
    abrir();
  });

  cerrarBtn.addEventListener("click", cerrar);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) cerrar();
  });

  formulario.addEventListener("click", (e) => e.stopPropagation());

  // ---------------- Submit ----------------
  formulario.addEventListener("submit", async (e) => {
    e.preventDefault();
// ⛔ ESPERAR INIT-SESSION ANTES DE /guardar
if (window.__trustReady) {
  await window.__trustReady;
}

    // Honeypot
    if (document.getElementById("contact_preference")?.value) return;

    const { nombre, telefono, direccion, codigoPostal } = formulario;

    const data = {
      nombre: nombre.value.trim(),
      telefono: telefono.value.trim(),
      direccion: direccion.value.trim(),
      codigoPostal: codigoPostal.value.trim(),
      productos: getCarrito().map(({ id, cantidad, talle, precio }) => ({
        id, cantidad, talle, precio
      })),
    };

    if (!data.nombre || !data.telefono || !data.direccion || !data.codigoPostal) {
      mostrarAlertaError("Completá todos los campos");
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Procesando…";

    try {
      const res = await fetch(`${API_BASE_URL}/guardar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Error");

      cerrar();
      mostrarToastExito("¡Gracias por tu compra!");

      await enviarCarritoAlBackend();
      localStorage.removeItem("carrito");
      formulario.reset();

    } catch (err) {
      mostrarAlertaError(err.message);
      submitBtn.disabled = false;
      submitBtn.textContent = "Confirmar datos";
    }
  });
}

// --------------------------------------------------
// 💳 Mercado Pago
// --------------------------------------------------
async function enviarCarritoAlBackend() {
    if (window.__trustReady) {
    await window.__trustReady;
  }
  const carrito = getCarrito().map(({ id, cantidad }) => ({ id, cantidad }));

  const res = await fetch(`${API_BASE_URL}/create-preference`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ carrito }),
    credentials: "include",
  });

  const data = await res.json();
  if (res.ok && data.preference_url) {
    window.location.href = data.preference_url;
  } else {
    mostrarAlertaError("No se pudo generar el pago");
  }
}

// --------------------------------------------------
// 🧩 Arranque
// --------------------------------------------------
document.addEventListener("DOMContentLoaded", inicializarFormularioCompra, { once: true });
document.addEventListener("components:ready", inicializarFormularioCompra, { once: true });
