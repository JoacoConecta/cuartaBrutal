// js/components/renderLista.js
import { crearCardProducto } from "./productCard.js";

/** * Renderiza la lista de productos de forma segura (DOM Manipulation) 
 */
export function renderLista(productos, container) {
  if (!container) return;

  // 1. Limpiar contenedor (rápido y seguro)
  container.innerHTML = ''; 

  // 2. Crear un Fragmento de Documento
  // (Esto es un truco de rendimiento: ensamblas todo en memoria y 
  // haces un solo "repaint" en el navegador al final).
  const fragment = document.createDocumentFragment();

  // 3. Generar y apilar las cards
  productos.forEach(producto => {
    const cardNode = crearCardProducto(producto);
    fragment.appendChild(cardNode);
  });

  // 4. Inyectar todo al DOM de una sola vez
  container.appendChild(fragment);


}