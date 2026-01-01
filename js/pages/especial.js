import { normalizeProducto } from "../utils/normalizar.js";
import { renderLista } from "../components/renderLista.js";
import { API_BASE_URL } from "../main.js";

const getEl = (s) => document.querySelector(s);
const getLoader = () => document.getElementById("loader");

let productosBase = [];
let carruselPrincipal = null;

// --------------------------------------------------------------
// 🔗 Helpers linkeo
// --------------------------------------------------------------
function filtrarUnicoPorLinkeo(productos) {
  const seen = new Set();
  const out = [];
  for (const p of productos) {
    const key = String(p.linkeo || p.id);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(p);
  }
  return out;
}

function mapearColoresPorLinkeo(productos) {
  const map = new Map();
  productos.forEach(p => {
    const key = String(p.linkeo || p.id);
    if (!map.has(key)) map.set(key, new Set());
    (p.colores || []).forEach(c => map.get(key).add(c));
  });
  for (const [k, v] of map.entries()) map.set(k, Array.from(v));
  return map;
}

// --------------------------------------------------------------
async function conseguirFetchStock() {
  const loader = getLoader();
  loader?.classList.remove("hidden");

  try {
    const res = await fetch(`${API_BASE_URL}/hoja2/especial`);
    const { ok, data } = await res.json();
    if (!ok) throw new Error("Respuesta inválida");

    const normalizados = data.map(normalizeProducto);
    const coloresPorLinkeo = mapearColoresPorLinkeo(normalizados);

    productosBase = filtrarUnicoPorLinkeo(normalizados);

    productosBase.forEach(p => {
      const key = String(p.linkeo || p.id);
      p._coloresGrupo = coloresPorLinkeo.get(key) || [];
    });

    carruselPrincipal = getEl(".carrusel");
    renderLista(productosBase, carruselPrincipal);

  } catch (err) {
    console.error("Error al cargar productos", err);
  } finally {
    loader?.classList.add("hidden");
  }
}

window.addEventListener("components:ready", () => {
  if (getLoader()) conseguirFetchStock();
}, { once: true });
