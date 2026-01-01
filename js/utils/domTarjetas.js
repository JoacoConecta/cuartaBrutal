// js/utils/domTarjetas.js

/**
 * 🧱 DOM BUILDER: Crea elementos HTML de forma segura y modular.
 * @param {string} tag - La etiqueta (ej: 'div', 'h1', 'img')
 * @param {object} attrs - Atributos (ej: { class: 'btn', src: '...' })
 * @param {...(HTMLElement|string)} children - Hijos (nodos o texto)
 * @returns {HTMLElement}
 */
export function el(tag, attrs = {}, ...children) {
  const element = document.createElement(tag);

  // 1. Asignar atributos y eventos
  for (const [key, value] of Object.entries(attrs)) {
    if (key.startsWith('on') && typeof value === 'function') {
      // Manejo de eventos (ej: onclick)
      element.addEventListener(key.substring(2).toLowerCase(), value);
    } else if (key === 'text') {
      // Atajo seguro para textContent
      element.textContent = value; 
    } else if (key === 'dataset') {
        // Manejo de data-* attributes
        for (const [dataKey, dataValue] of Object.entries(value)) {
            element.dataset[dataKey] = dataValue;
        }
    } else if (value !== false && value !== null && value !== undefined) {
      // Atributos normales (class, src, href, etc.)
      if (key === 'className') element.className = value;
      else element.setAttribute(key, value);
    }
  }

  // 2. Añadir hijos (append)
  children.forEach(child => {
    if (typeof child === 'string' || typeof child === 'number') {
      element.appendChild(document.createTextNode(child));
    } else if (child instanceof Node) {
      element.appendChild(child);
    }
  });

  return element;
}