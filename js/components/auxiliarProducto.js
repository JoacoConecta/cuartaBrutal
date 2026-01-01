// js/components/auxiliarProducto.js

// 1. Importamos la fábrica de tarjetas (que crea <a> tags)
import { crearCardProducto } from "./productCard.js";
// 2. Importamos la normalización para limpiar los datos crudos del backend
import { normalizeProducto } from "../utils/normalizar.js"; 

export function generarCarrusel(productos) {
  // Buscamos el contenedor (asegúrate que en tu HTML sea un ID único)
  const carrusel = document.getElementById('carrusel') || document.querySelector('.carrusel');

  // Si no existe el contenedor en esta página, salimos sin error
  if (!carrusel) return;

  // 1. Limpiamos el contenedor
  carrusel.innerHTML = '';

  // 2. Fragmento para rendimiento extremo
  const fragment = document.createDocumentFragment();

  productos.forEach(productoCrudo => {
    // 🧼 PASO CLAVE: Normalizamos los datos (convierte "precio final" -> precioFinal)
    const productoLimpio = normalizeProducto(productoCrudo);

    // 🏭 Creamos el nodo <a>...</a>
    const cardNode = crearCardProducto(productoLimpio);
    
    // Si usas Swiper o alguna librería, agrega aquí la clase necesaria
    // Si es CSS Grid/Flex puro, esto no molesta.
    cardNode.classList.add('swiper-slide'); 
    
    // 🚫 IMPORTANTE: NO AGREGUES addEventListener AQUÍ.
    // La tarjeta ya es un <a href="...">. El navegador se encarga.
    
    fragment.appendChild(cardNode);
  });

  // 3. Inyectamos todo de una sola vez
  carrusel.appendChild(fragment);
}