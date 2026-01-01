//lupa.search.js
import { fetchCliente } from "/js/utils/fetchClientes.js";
import { normalizeProducto } from "../utils/normalizar.js";

let HOJA2_CACHE = null;
let HOJA2_LOADING = null;

// =======================================================
// 📦 CARGA ÚNICA HOJA 2 (usa cache backend + memoria)
// =======================================================
async function getHoja2() {
  if (HOJA2_CACHE) return HOJA2_CACHE;
  if (HOJA2_LOADING) return HOJA2_LOADING;

  HOJA2_LOADING = fetchCliente("/hoja2")
    .then(r => r.json())
    .then(j => {
      if (!j.ok) throw new Error("hoja2 fail");
      HOJA2_CACHE = j.data || [];
      return HOJA2_CACHE;
    })
    .finally(() => {
      HOJA2_LOADING = null;
    });

  return HOJA2_LOADING;
}

// =======================================================
// 🔍 FILTRO PRINCIPAL (DATOS YA NORMALIZADOS)
// =======================================================
function filtrarProductos(lista, query) {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  return lista.filter(p => {
    if (Number(p.stock) <= 0) return false;

    const nombre = p.nombre?.toLowerCase() || "";
    const categoria = p.categoria?.toLowerCase() || "";
    const sexo = p.sexo?.toLowerCase() || "";

    return (
      nombre.includes(q) ||
      categoria.includes(q) ||
      sexo.includes(q)
    );
  });
}

// =======================================================
// 🔥 DETECCIÓN PROMO (CORREGIDA)
// =======================================================
function tienePromo(promo) {
  if (promo == null) return false;

  const raw = String(promo).trim();

  // DEBUG
  console.log("🧪 tienePromo()", {
    raw,
    includesPercent: raw.includes("%"),
    numeric: Number(raw),
    numericFromPercent: Number(raw.replace("%", ""))
  });

  if (raw === "" || raw === "0") return false;

  // Caso "20%" / "50%"
  if (raw.includes("%")) {
    return Number(raw.replace("%", "")) > 0;
  }

  // Caso numérico "10", 10, true
  return Number(raw) > 0 || raw === "TRUE" || raw === "true";
}

// =======================================================
// 🧱 RENDER RESULTADOS (SIN innerHTML)
// =======================================================
function renderResultados(items, container) {
  container.innerHTML = "";

  if (!items.length) {
    const empty = document.createElement("div");
    empty.className = "search-empty";
    empty.textContent = "Sin resultados";
    container.appendChild(empty);
    return;
  }

  items.slice(0, 8).forEach(p => {
    const nombre = p.nombre || "Producto";
    const categoria = p.categoria || "";
    const precio = p.precio ? `$${p.precio}` : "";
    const foto = p.foto || "";

    const link = document.createElement("a");
    link.href = `/paginas/producto.html?id=${p.id}`;
    link.className = "search-item";

    const esPromo = tienePromo(p.promo);

    console.log("🔥 CHECK PROMO FINAL", {
      id: p.id,
      promo: p.promo,
      esPromo
    });

    if (esPromo) {
      link.classList.add("is-promo");
    }

    const thumb = document.createElement("div");
    thumb.className = "search-thumb";

    const img = document.createElement("img");
    img.src = foto;
    img.alt = nombre;
    img.loading = "lazy";

    thumb.appendChild(img);

    const info = document.createElement("div");
    info.className = "search-info";

    const nombreEl = document.createElement("span");
    nombreEl.className = "search-nombre";
    nombreEl.textContent = nombre;

    const categoriaEl = document.createElement("span");
    categoriaEl.className = "search-categoria";
    categoriaEl.textContent = categoria;

    const precioEl = document.createElement("span");
    precioEl.className = "search-precio";
    precioEl.textContent = precio;

    info.appendChild(nombreEl);
    info.appendChild(categoriaEl);
    info.appendChild(precioEl);

    link.appendChild(thumb);
    link.appendChild(info);

    container.appendChild(link);
  });
}

// =======================================================
// 🚀 INIT LUPA
// =======================================================
document.addEventListener("components:ready", () => {
  const input = document.querySelector("#search-input");
  const results = document.querySelector("#search-results");
  const toggle = document.querySelector("#search-toggle");
  const box = document.querySelector("#search-box");

  if (!input || !results) return;

  toggle?.addEventListener("click", () => {
    box.classList.toggle("open");
    input.focus();
  });

  let debounce;
  input.addEventListener("input", async () => {
    clearTimeout(debounce);
    debounce = setTimeout(async () => {
      const hoja2 = await getHoja2();

      console.group("🔍 DEBUG HOJA2 RAW");
      hoja2.slice(0, 5).forEach(p => {
        console.log({ id: p.id, promo: p.promo, tipo: typeof p.promo });
      });
      console.groupEnd();

      const normalizados = hoja2.map(p => normalizeProducto(p));

      console.group("🧪 DEBUG NORMALIZADO");
      normalizados.slice(0, 5).forEach(p => {
        console.log({
          id: p.id,
          promo: p.promo,
          tipo: typeof p.promo
        });
      });
      console.groupEnd();

      const filtrados = filtrarProductos(normalizados, input.value);
      renderResultados(filtrados, results);
    }, 120);
  });

  document.addEventListener("click", e => {
    if (!box.contains(e.target)) {
      results.innerHTML = "";
    }
  });
});
