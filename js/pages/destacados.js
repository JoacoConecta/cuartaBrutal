import { renderLista } from "../components/renderLista.js";
import { fetchCliente } from "../utils/fetchClientes.js";
import { normalizeProducto } from "../utils/normalizar.js";

// --------------------------------------------------------------
// 🧩 Helpers DOM
// --------------------------------------------------------------
const getEl = (s) => document.querySelector(s);
const getLoader = () => document.getElementById("loader");

// --------------------------------------------------------------
// 🚀 Fetch + render destacados (UNA SOLA VEZ)
// --------------------------------------------------------------
async function conseguirFetchStock() {
  const loader = getLoader();
  loader?.classList.remove("hidden");

  try {
    const res = await fetchCliente("/hoja2/destacados");
    const { ok, data } = await res.json();
    if (!ok) throw new Error("Respuesta inválida");

    const normalizados = data.map(normalizeProducto);

    const destacadosPrincipales = normalizados.filter(
      p => p.muyDestacado && p.stock > 0
    );

    const productosFiltrados = normalizados.filter(
      p => p.destacado && !p.muyDestacado && p.stock > 0
    );

    renderLista(destacadosPrincipales, getEl(".carrusel"));
    renderLista(productosFiltrados, getEl(".carrusel.i"));

  } catch (err) {
    console.error("Error al obtener datos:", err);
  } finally {
    loader?.classList.add("hidden");
  }
}

// --------------------------------------------------------------
// 🧩 Arranque único y limpio
// --------------------------------------------------------------
window.addEventListener(
  "components:ready",
  () => {
    if (getLoader()) {
      conseguirFetchStock();
    }
  },
  { once: true }
);
