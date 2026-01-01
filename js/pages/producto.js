// --------------------------------------------------------------
// 📦 IMPORTS
// --------------------------------------------------------------
import { generarCarrusel } from "../components/auxiliarProducto.js";
import { generarEtiquetaPromo } from "../utils/promo.js";
import { API_BASE_URL } from "../main.js";
import { COLOR_BANK } from "../utils/colores.js";
import { el } from "../utils/domTarjetas.js";

// --------------------------------------------------------------
// ⚙️ HELPERS
// --------------------------------------------------------------
const ULTIMAS_UNIDADES_UMBRAL = 3;

function renderUltimasUnidades(producto) {
  const mount = document.getElementById("aviso-stock");
  if (!mount) return;

  mount.innerHTML = "";

  if (
    Number(producto.stock) > 0 &&
    Number(producto.stock) <= ULTIMAS_UNIDADES_UMBRAL
  ) {
    mount.appendChild(
      el("div", {
        className: "aviso-ultimas-unidades",
        text: "ÚLTIMAS UNIDADES"
      })
    );
  }
}

function getLoader() {
  return document.getElementById("loader");
}

function formatearPrecio(valor) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2
  }).format(valor);
}

function stringToNode(htmlString) {
  if (!htmlString) return null;
  const t = document.createElement("div");
  t.innerHTML = htmlString;
  return t.firstElementChild;
}

function shuffleArray(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// --------------------------------------------------------------
// 💲 PRECIO
// --------------------------------------------------------------
function animarPrecio(el, precioFinal, duracion = 800) {
  let t = 0;
  const step = 40;

  const id = setInterval(() => {
    t += step;
    const v = Math.random() * precioFinal * 1.5;
    el.textContent = formatearPrecio(v);
    if (t >= duracion) {
      clearInterval(id);
      el.textContent = formatearPrecio(precioFinal);
    }
  }, step);
}

function renderPrecio(producto) {
  const cont = document.querySelector(".precio").parentNode;
  cont.innerHTML = "";

  const promoActiva = producto.promo && producto.promo !== "0";

  if (!promoActiva) {
    cont.appendChild(el("h1", {
      className: "precio",
      text: formatearPrecio(producto.precio)
    }));
    return;
  }

  const h1 = el("h1", {
    className: "precio",
    id: "precio-final",
    text: formatearPrecio(0)
  });

  cont.appendChild(
    el("div", { className: "precio-contenedor-moderno" },
      el("span", {
        className: "precio-original-tachado",
        text: formatearPrecio(producto.precio)
      }),
      el("div", { className: "precio-promo-wrapper" },
        h1,
        el("span", {
          className: "etiqueta-descuento",
          text: `${producto.promo} OFF`
        })
      )
    )
  );

  requestAnimationFrame(() =>
    animarPrecio(h1, Number(producto["precio final"]))
  );
}

// --------------------------------------------------------------
// 🖼️ GALERÍA
// --------------------------------------------------------------
function renderGaleria(producto) {
  const fotos = [producto.foto, producto.foto2, producto.foto3].filter(Boolean);

  const principal = document.querySelector(".placeholder_foto.principal");
  principal.innerHTML = "";

  const promoNode = stringToNode(generarEtiquetaPromo(producto));

  const imgPrincipal = el("img", {
    src: fotos[0],
    alt: producto["nombre producto"],
    style: "width:100%;height:100%;object-fit:cover;"
  });

  principal.appendChild(
    el("div", { className: "contenedor_producto_foto" },
      imgPrincipal,
      promoNode
    )
  );

  const aux = document.querySelectorAll(".placeholder_foto.auxiliar");
  aux.forEach((p, i) => {
    p.innerHTML = "";
    if (fotos[i + 1]) {
      p.appendChild(el("img", {
        src: fotos[i + 1],
        style: "width:100%;height:100%;object-fit:cover;cursor:pointer;"
      }));
      p.style.display = "block";
    } else {
      p.style.display = "none";
    }
  });

  const contAux = document.getElementById("contenedor_producto_auxiliar");
  const nuevo = contAux.cloneNode(true);
  contAux.parentNode.replaceChild(nuevo, contAux);

  nuevo.addEventListener("click", e => {
    const img = e.target.closest("img");
    if (!img) return;
    const tmp = imgPrincipal.src;
    imgPrincipal.src = img.src;
    img.src = tmp;
  });
  // ----------------------------------------------------------
// 🖱️ CLICK EN PRINCIPAL = ROTAR (MISMA LÓGICA DEL ORIGINAL)
// ----------------------------------------------------------
let siguienteIdx = 0;

imgPrincipal.addEventListener("click", () => {
  const auxImgs = document.querySelectorAll(".placeholder_foto.auxiliar img");
  if (!auxImgs.length) return;

  const target = auxImgs[siguienteIdx];

  imgPrincipal.style.transition = "opacity .25s ease";
  imgPrincipal.style.opacity = 0;

  setTimeout(() => {
    const tmp = imgPrincipal.src;
    imgPrincipal.src = target.src;
    target.src = tmp;

    imgPrincipal.style.opacity = 1;
    siguienteIdx = (siguienteIdx + 1) % auxImgs.length;
  }, 150);
});

}

// --------------------------------------------------------------
// 📏 TALLES
// --------------------------------------------------------------
function renderTalles(producto) {
  const lista = document.getElementById("cuarados_talles");
  lista.innerHTML = "";

  const talles = ["XXS", "XS", "S", "M", "L", "XL", "XXL"];
  const frag = document.createDocumentFragment();

  talles.forEach(t => {
    if (producto[t] && Number(producto[t]) > 0) {
      frag.appendChild(
        el("li", { className: "talle" }, el("p", { text: t }))
      );
    }
  });

  lista.appendChild(frag);
}

// --------------------------------------------------------------
// 🎨 COLORES (DESDE VARIANTES)
// --------------------------------------------------------------
function renderColoresDesdeVariantes(variantes, productId) {
  const mount = document.getElementById("producto-colores-mount");
  if (!mount || !Array.isArray(variantes)) return;

  mount.innerHTML = "";
  const cont = el("div", { className: "producto-colores" });

  variantes.forEach(v => {
    const raw = v.color || v.colores;
    if (!raw) return;

    const nombre = raw.toLowerCase().split(",")[0].trim();
    const hex = COLOR_BANK[nombre];
    if (!hex) return;

    const activo = String(v.id) === String(productId);

    const dot = el("div", {
      className: activo ? "color-dot active" : "color-dot",
      style: `background-color:${hex}`,
      "data-color-name": nombre
    });

    if (!activo) {
      dot.addEventListener("click", () => {
        location.search = `?id=${v.id}`;
      });
    }

    cont.appendChild(dot);
  });

  mount.appendChild(cont);
}

// --------------------------------------------------------------
// 🧠 RECOMENDADOS
// --------------------------------------------------------------
async function cargarRecomendados(categoria) {
  if (!categoria) return;

  try {
    const r = await fetch(`${API_BASE_URL}/hoja2/categoria/${categoria}`);
    const { ok, data } = await r.json();

    if (ok && data?.length) {
      const aleatorios = shuffleArray(data);
      generarCarrusel(aleatorios);
    }
  } catch {}
}

// --------------------------------------------------------------
// 🚀 MAIN
// --------------------------------------------------------------
async function cargarProductoIndividual() {
  const loader = getLoader();
  const id = new URLSearchParams(location.search).get("id");
  if (!id) return;

  loader?.classList.remove("hidden");

  try {
    const r = await fetch(`${API_BASE_URL}/hoja2/${id}/full`);
    const { ok, data } = await r.json();
    if (!ok || !data?.producto) return;

    const { producto, variantes } = data;

    document.querySelector(".titulo").textContent =
      producto["nombre producto"];
      renderUltimasUnidades(producto);

    document.title = `${producto["nombre producto"]} |`;

    document.getElementById("descripcion_contenido").textContent =
      producto.descripcion || "";
      // ----------------------------------------------------------
// 📝 DESCRIPCIÓN + TOGGLE (RESTORE)
// ----------------------------------------------------------
const descripcionToggle = document.getElementById("descripcion");

if (descripcionToggle) {
  const nuevo = descripcionToggle.cloneNode(true);
  descripcionToggle.parentNode.replaceChild(nuevo, descripcionToggle);

  nuevo.addEventListener("click", () => {
    nuevo.classList.toggle("active");
  });
}

// ----------------------------------------------------------
// 📦 POLÍTICAS + TOGGLE (RESTORE)
// ----------------------------------------------------------
const politicas = document.getElementById("politicas");

if (politicas) {
  const nuevoPoliticas = politicas.cloneNode(true);
  politicas.parentNode.replaceChild(nuevoPoliticas, politicas);

  nuevoPoliticas.addEventListener("click", () => {
    nuevoPoliticas.classList.toggle("active");
  });
}

// -----------------------------
// 💸 TRANSFERENCIA / EFECTIVO
// -----------------------------
    const precioTransferenciaEl = document.querySelector(".precio_transferencia");

    if (precioTransferenciaEl) {
      if (producto.desactivarTransferencia === "FALSE" && producto["precio transferencia"]) {
        precioTransferenciaEl.textContent =
          `${formatearPrecio(producto["precio transferencia"])} por transferencia`;
        precioTransferenciaEl.style.display = "block";
      } else {
        precioTransferenciaEl.style.display = "none";
      }
    }

    renderPrecio(producto);
    renderGaleria(producto);
    renderTalles(producto);
    renderColoresDesdeVariantes(variantes, id);
    cargarRecomendados(producto.categoria);

  } finally {
    loader?.classList.add("hidden");
  }
}

// --------------------------------------------------------------
// INIT
// --------------------------------------------------------------
window.addEventListener("components:ready", () => {
  if (document.getElementById("loader")) cargarProductoIndividual();
}, { once: true });

if (document.getElementById("loader")) cargarProductoIndividual();
