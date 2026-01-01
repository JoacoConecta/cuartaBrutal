// js/components/productCard.js
import { el } from "../utils/domTarjetas.js";
import { generarEtiquetaPromo } from "../utils/promo.js";
import { formatearPrecio } from "../utils/format.js";
import { COLOR_BANK } from "../utils/colores.js";

// --------------------------------------------------------------
// 🎨 APÉNDICE VISUAL DE COLORES (SIN INTERACCIÓN)
// --------------------------------------------------------------
function renderColoresAppend(colores = []) {
  if (!Array.isArray(colores) || !colores.length) return null;

  const cont = el("div", { className: "producto-colores-append" });

  colores.forEach(nombre => {
    const hex = COLOR_BANK[nombre];
    if (!hex) return;

    cont.appendChild(
      el("span", {
        className: "color-dot",
        style: `background-color:${hex}`,
        title: nombre
      })
    );
  });

  return cont;
}

// --------------------------------------------------------------
// 🧱 CARD ORIGINAL (INTOCADA) + EXTENSIÓN
// --------------------------------------------------------------
export function crearCardProducto(p) {
  // 1. Promo
  const promoHtmlString = generarEtiquetaPromo({ promo: p.promo });
  let promoNode = null;
  if (promoHtmlString) {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = promoHtmlString;
    promoNode = tempDiv.firstElementChild;
  }

  // 2. Construcción visual
  const contenedorFoto = el('div', { className: 'contenedor_producto_foto' },
    el('img', {
      src: p.foto,
      className: 'sin_hover',
      alt: p.nombre,
      loading: 'lazy'
    }),
    p.foto2 ? el('img', {
      src: p.foto2,
      className: 'hovered',
      alt: '',
      loading: 'lazy'
    }) : null,
    promoNode
  );

  const descripcion = el('div', { className: 'descrippcion_producto' },
    el('h1', { className: 'nombre_producto', text: p.nombre }),
    (p.promo && p.promo !== "0")
      ? el('h2', { className: 'precio_original', text: formatearPrecio(p.precio) })
      : null,
    el('h2', { className: 'precio_producto', text: formatearPrecio(p.precioFinal) }),
    el('h3', { className: 'precio_transferencia', text: `${formatearPrecio(p.precioTransferencia)} con transferencia` }),
    el('h3', { text: `3 cuotas de ${formatearPrecio(p.precioCuotas)}` })
  );

  const card = el('a', {
    className: 'contenedor_producto',
    href: `/paginas/producto.html?id=${p.id}`,
    dataset: { categoria: p.categoria }
  },
    contenedorFoto,
    descripcion
  );

  // 🟣 APÉNDICE DE COLORES DEL GRUPO (VISUAL)
  if (Array.isArray(p._coloresGrupo) && p._coloresGrupo.length) {
    const coloresNode = renderColoresAppend(p._coloresGrupo);
    if (coloresNode) card.appendChild(coloresNode);
  }

  return card;
}
