// --------------------------------------------------------------
// 📦 IMPORTS
// --------------------------------------------------------------
import { normalizeProducto } from "../utils/normalizar.js";
import { renderLista } from "../components/renderLista.js";
import { API_BASE_URL } from "../main.js";

// --------------------------------------------------------------
// 🧩 Helpers DOM
// --------------------------------------------------------------
const getEl = (s) => document.querySelector(s);
const getLoader = () => document.getElementById("loader");

// --------------------------------------------------------------
// 🧠 Estado único
// --------------------------------------------------------------
let productosBase = [];
let carruselPrincipal = null;

// --------------------------------------------------------------
// 🎛️ Listeners (UNA SOLA VEZ)
// --------------------------------------------------------------
function initFiltros() {
  const selectOrden = getEl("#orden-precio");
  const selectTalle = getEl("#filtro-talle-select");

  if (selectOrden) selectOrden.addEventListener("change", aplicarFiltros);
  if (selectTalle) selectTalle.addEventListener("change", aplicarFiltros);
}

// --------------------------------------------------------------
// 🔄 Aplicar filtros frontend
// --------------------------------------------------------------
function aplicarFiltros() {
  if (!carruselPrincipal) return;

  let resultado = [...productosBase];
  const orden = getEl("#orden-precio")?.value;
  const talle = getEl("#filtro-talle-select")?.value;

  if (talle) resultado = resultado.filter(p => Number(p[talle]) > 0);

  if (orden === "asc") {
    resultado.sort((a, b) => a.precioFinal - b.precioFinal);
  } else if (orden === "desc") {
    resultado.sort((a, b) => b.precioFinal - a.precioFinal);
  }

  renderLista(resultado, carruselPrincipal);
}

// --------------------------------------------------------------
// 🔗 PASO 1: 1 PRODUCTO POR LINKEO
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

// --------------------------------------------------------------
// 🎨 PASO 2: MAPA COLORES POR LINKEO
// --------------------------------------------------------------
function mapearColoresPorLinkeo(productos) {
  const map = new Map();

  productos.forEach(p => {
    const key = String(p.linkeo || p.id);
    if (!map.has(key)) map.set(key, new Set());
    (p.colores || []).forEach(c => map.get(key).add(c));
  });

  for (const [k, v] of map.entries()) {
    map.set(k, Array.from(v));
  }

  return map;
}

// --------------------------------------------------------------
// 🚀 Fetch + render (UNA SOLA VEZ)
// --------------------------------------------------------------
async function conseguirFetchStock() {
  const loader = getLoader();
  loader?.classList.remove("hidden");

  try {
    const params = new URLSearchParams(window.location.search);
    const categoria = params.get("categoria");
    const sexo = params.get("sexo");

    let endpoint = "/hoja2";
    if (categoria) endpoint = `/hoja2/categoria/${categoria}`;
    else if (sexo === "mujer") endpoint = "/hoja2/mujer";
    else if (sexo === "hombre") endpoint = "/hoja2/hombre";

    const res = await fetch(`${API_BASE_URL}${endpoint}`);
    const { ok, data } = await res.json();
    if (!ok) throw new Error("Respuesta inválida");

    let normalizados = data.map(normalizeProducto);

    // Filtro frontend mínimo existente
    if (categoria && sexo) {
      normalizados = normalizados.filter(p => p.sexo === sexo);
    } else if (!categoria && sexo) {
      normalizados = normalizados.filter(p => p.stock > 0 && p.sexo === sexo);
    }

    // 🔑 Colores del grupo (antes de filtrar)
    const coloresPorLinkeo = mapearColoresPorLinkeo(normalizados);

    // 🔑 1 producto por linkeo
    productosBase = filtrarUnicoPorLinkeo(normalizados);

    // 🔑 Inyectar colores del grupo al representante
    productosBase.forEach(p => {
      const key = String(p.linkeo || p.id);
      p._coloresGrupo = coloresPorLinkeo.get(key) || [];
    });

    carruselPrincipal = getEl(".carrusel");
    renderLista(productosBase, carruselPrincipal);
    initFiltros();

  } catch (err) {
    console.error("Error al obtener datos:", err);
  } finally {
    loader?.classList.add("hidden");
  }
}

// --------------------------------------------------------------
// 🧩 Arranque único
// --------------------------------------------------------------
window.addEventListener(
  "components:ready",
  () => {
    if (getLoader()) conseguirFetchStock();
  },
  { once: true }
);
