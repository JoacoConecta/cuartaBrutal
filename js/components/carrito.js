// =========================================================
// 🛒 MÓDULO CARRITO — versión estable y estética intacta
// =========================================================

import { API_BASE_URL } from "../main.js";
import { el } from "../utils/domTarjetas.js";

// ---------------------------------------------------------
// 🔔 ALERTAS
// ---------------------------------------------------------
export function mostrarAlertaError(titulo, texto) {
  Swal.fire({
    icon: "error",
    title: titulo,
    text: texto,
    confirmButtonColor: "#d33",
    confirmButtonText: "Entendido",
  });
}

function mostrarToastExito(titulo) {
  const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 1500,
    timerProgressBar: true,
  });

  Toast.fire({
    icon: "success",
    title: titulo,
  });
}

// ---------------------------------------------------------
// 🧠 ESTADO
// ---------------------------------------------------------
let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
let carritoInicializado = false;
let cantidadActual = 0;
let isLoading = false;
const cacheProductos = {};

// ---------------------------------------------------------
// 🚀 INIT
// ---------------------------------------------------------
function inicializarCarrito() {

  if (carritoInicializado) return;

  const modalCarrito = document.getElementById("modal-carrito");
  const iconoCarrito = document.getElementById("carrito-icono");

  if (!modalCarrito || !iconoCarrito) return;

  carritoInicializado = true;

  const cerrarCarritoBtn = document.getElementById("cerrar-carrito-btn");
  const modalOverlay = document.getElementById("modal-carrito-overlay");
  const vaciarCarritoBtn = document.getElementById("vaciar-carrito-btn");
  const listaTalles = document.getElementById("cuarados_talles");
  const masBtn = document.getElementById("mas");
  const menosBtn = document.getElementById("menos");
  const cantidadDiv = document.getElementById("cantidad");
  const agregarBtn = document.getElementById("agregar-al-carrito-btn");

  actualizarContadorCarrito();

  // ---------------- MODAL ----------------
  const abrirModal = () => {
    renderizarCarrito();
    modalCarrito.classList.remove("modal-carrito-oculto");
    modalCarrito.classList.add("modal-carrito-visible");
  };

  // 🔑 FIX CRÍTICO: evita que los clicks internos burbujeen al overlay
  modalCarrito.addEventListener("click", (e) => e.stopPropagation());

  const cerrarModal = () => {
    modalCarrito.classList.remove("modal-carrito-visible");
    modalCarrito.classList.add("modal-carrito-oculto");
  };

  iconoCarrito.addEventListener("click", abrirModal);
  cerrarCarritoBtn?.addEventListener("click", cerrarModal);
  modalOverlay?.addEventListener("click", cerrarModal);
  vaciarCarritoBtn?.addEventListener("click", vaciarCarritoCompleto);

  // ---------------- TALLES ----------------
  listaTalles?.addEventListener("click", (e) => {
    const item = e.target.closest(".talle");
    if (!item) return;

    listaTalles
      .querySelectorAll(".talle")
      .forEach((t) => t.classList.remove("seleccionado"));

    item.classList.add("seleccionado");
    cantidadActual = 0;
    cantidadDiv.textContent = cantidadActual;
    masBtn.disabled = false;
  });

  // ---------------- + / - ----------------
  masBtn?.addEventListener("click", async () => {
    if (isLoading) return;

    const talleActual = document
      .querySelector("#cuarados_talles .talle.seleccionado p")
      ?.textContent.trim();

    if (!talleActual) {
      mostrarAlertaError(
        "Talle no seleccionado",
        "Por favor, elige un talle."
      );
      return;
    }

    isLoading = true;
    masBtn.disabled = true;
    cantidadDiv.classList.add("loading");
    cantidadDiv.textContent = "";

    try {
      const esValido = await validar(cantidadActual, talleActual);
      if (esValido) cantidadActual++;
      else
        mostrarAlertaError(
          "Stock no disponible",
          "No hay suficiente stock para ese talle."
        );
    } catch (err) {
      mostrarAlertaError("Error", err.message);
    } finally {
      isLoading = false;
      masBtn.disabled = false;
      cantidadDiv.classList.remove("loading");
      cantidadDiv.textContent = cantidadActual;
    }
  });

  menosBtn?.addEventListener("click", () => {
    if (cantidadActual > 0 && !isLoading) {
      cantidadActual--;
      cantidadDiv.textContent = cantidadActual;
    }
  });

  // ---------------- AGREGAR ----------------
  agregarBtn?.addEventListener("click", agregarAlCarrito);
}

// ---------------------------------------------------------
// 🧩 DATA
// ---------------------------------------------------------
function obtenerIdProducto() {
  return new URLSearchParams(window.location.search).get("id");
}

async function obtenerProductoPorId(id) {
  if (cacheProductos[id]) return cacheProductos[id];

  const res = await fetch(`${API_BASE_URL}/hoja2/${id}`);
  if (!res.ok) throw new Error("Producto no encontrado");

  const json = await res.json();
  if (!json.ok) throw new Error("Producto inválido");

  cacheProductos[id] = json.data;
  return json.data;
}

async function validar(cantidadDeseada, talle) {
  const id = obtenerIdProducto();
  const producto = await obtenerProductoPorId(id);

  const stock = parseInt(producto[talle]);
  if (isNaN(stock)) return false;

  return cantidadDeseada < stock;
}

// ---------------------------------------------------------
// 🛒 CARRITO
// ---------------------------------------------------------
async function agregarAlCarrito() {
  const talle = document
    .querySelector("#cuarados_talles .talle.seleccionado p")
    ?.textContent.trim();

  const id = obtenerIdProducto();

  if (!talle)
    return mostrarAlertaError("Talle requerido", "Seleccioná un talle.");
  if (cantidadActual === 0)
    return mostrarAlertaError("Cantidad inválida", "Elegí al menos una unidad.");

  const producto = await obtenerProductoPorId(id);
  const nombre = producto["nombre producto"] || "Producto";
  const precio = parseFloat(producto["precio final"]) || 0;

  const existente = carrito.find(
    (i) => i.id === id && i.talle === talle
  );

  if (existente) {
    existente.cantidad += cantidadActual;
    existente.subtotal = existente.cantidad * existente.precio;
  } else {
    carrito.push({
      id,
      nombre,
      precio,
      talle,
      cantidad: cantidadActual,
      subtotal: precio * cantidadActual,
      timestamp: Date.now(),
    });
  }

  cantidadActual = 0;
  document.getElementById("cantidad").textContent = cantidadActual;

  persistir();
  renderizarCarrito();
  mostrarToastExito("¡Agregado al carrito!");
}

// ---------------------------------------------------------
// 🎨 RENDER (RESPETA CSS)
// ---------------------------------------------------------
function renderizarCarrito() {
  const cont = document.getElementById("carrito-items-container");
  const totalPrecioEl = document.getElementById("carrito-total-precio");
  const msgVacio = document.getElementById("carrito-vacio-msg");
  const footer = document.querySelector(".modal-carrito-footer");

  if (!cont) return;

  cont.replaceChildren();

  if (carrito.length === 0) {
    msgVacio.style.display = "block";
    footer.style.display = "none";
    totalPrecioEl.textContent = "$0.00";
    return;
  }

  msgVacio.style.display = "none";
  footer.style.display = "block";

  let total = 0;

  carrito.forEach((item) => {
    total += item.subtotal;

    cont.appendChild(
      el(
        "div",
        { className: "carrito-item" },
        el(
          "div",
          { className: "carrito-item-info" },
          el("p", { className: "item-nombre", text: item.nombre }),
          el("p", {
            className: "item-detalle",
            text: `Talle: ${item.talle} | Cantidad: ${item.cantidad}`,
          }),
          el("p", {
            className: "item-precio",
            text: `$${item.subtotal.toFixed(2)}`,
          })
        ),
        el("button", {
          className: "remover-item-btn",
          text: "Quitar",
          onclick: () => removerItemDelCarrito(item.timestamp),
        })
      )
    );
  });

  totalPrecioEl.textContent = `$${total.toFixed(2)}`;
}

// ---------------------------------------------------------
// 🧹 UTILS
// ---------------------------------------------------------
function removerItemDelCarrito(timestamp) {
  carrito = carrito.filter((i) => i.timestamp !== timestamp);
  persistir();
  renderizarCarrito();
}

function vaciarCarritoCompleto() {
  carrito = [];
  persistir();
  renderizarCarrito();
}

function actualizarContadorCarrito() {
  const el = document.getElementById("carrito-contador");
  if (!el) return;

  const total = carrito.reduce((acc, i) => acc + i.cantidad, 0);
  el.textContent = total;
  el.style.display = total > 0 ? "block" : "none";
}

function persistir() {
  localStorage.setItem("carrito", JSON.stringify(carrito));
  actualizarContadorCarrito();
}

// ---------------------------------------------------------
// 🧩 ARRANQUE
// ---------------------------------------------------------
document.addEventListener("DOMContentLoaded", inicializarCarrito, { once: true });
document.addEventListener("components:ready", inicializarCarrito, { once: true });
