// js/utils/normalizar.js 
import { limpiarPath, boolStr } from "./format.js"; 

export function normalizeProducto(p) {
  return {
    id: p.id,

    // ✅ NUEVO: linkeo (clave para agrupar)
    linkeo: (p.linkeo ?? "").toString().trim(),

    nombre: p["nombre producto"] ?? p.nombre ?? "",
    categoria: String(p.categoria ?? "").toLowerCase().trim(),
    sexo: String(p.sexo ?? "").toLowerCase().trim(),
    stock: Number(p.stock) || 0,
    foto: limpiarPath(p.foto || ""),
    foto2: limpiarPath(p.foto2 || ""),
    promo: (p.promo ?? '').toString().trim(),
    precio: Number(p.precio) || 0,
    precioFinal: Number(p["precio final"] ?? p.precioFinal) || 0,
    precioTransferencia: Number(p["precio transferencia"] ?? p.precioTransferencia) || 0,
    precioCuotas: Number(p["precio cuotas"] ?? p.precioCuotas) || 0,
    especial: boolStr(p.especial),

    colores: parseColores(p.colores),

    destacado: boolStr(p.destacado),
    muyDestacado: boolStr(p.muyDestacado),

    XXS: Number(p.XXS) || 0,
    XS: Number(p.XS) || 0,
    S: Number(p.S) || 0,
    M: Number(p.M) || 0,
    L: Number(p.L) || 0,
    XL: Number(p.XL) || 0,
    XXL: Number(p.XXL) || 0,
  };
}

function parseColores(raw) {
  if (!raw) return [];
  return raw
    .toString()
    .toLowerCase()
    .split(',')
    .map(c => c.trim())
    .filter(Boolean);
}
