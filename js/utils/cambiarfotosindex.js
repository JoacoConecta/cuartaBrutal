import { API_BASE_URL } from "../main.js";

async function cargarBannersDinamicos() {
  // 1. Pequeña función para manejar la carga suave
  const suavizarCambio = (img, nuevaUrl) => {
    // Si la imagen ya tiene esa URL, no hacemos nada
    if (img.src === nuevaUrl) {
        img.classList.add('visible'); 
        return;
    }

    // Definimos qué pasa cuando la nueva foto termine de cargar
    img.onload = () => {
      img.classList.add('visible'); 
    };

    // Asignamos la nueva URL para que empiece a descargar
    img.src = nuevaUrl;
  };

  try {
    const response = await fetch(`${API_BASE_URL}/hoja-categorias/fotos`);

    if (!response.ok) return; 

    const result = await response.json();

    if (result.ok && result.data) {
      const { BanHombreMenu, BanMujerMenu } = result.data;

      // CORRECCIÓN AQUÍ: Usamos los IDs que tienes en tu HTML actual
      const imgMujer = document.getElementById('banner-mujer');
      const imgHombre = document.getElementById('banner-hombre');

      // 2. Usamos la función auxiliar
      if (imgMujer && BanMujerMenu?.trim()) {
        suavizarCambio(imgMujer, BanMujerMenu);
      }

      if (imgHombre && BanHombreMenu?.trim()) {
        suavizarCambio(imgHombre, BanHombreMenu);
      }
    }
  } catch (error) {
    console.warn('Usando banners locales.');
    // Si falla la API, mostramos las imágenes locales por defecto
    const imgMujer = document.getElementById('banner-mujer');
    const imgHombre = document.getElementById('banner-hombre');
    
    if (imgMujer) imgMujer.classList.add('visible');
    if (imgHombre) imgHombre.classList.add('visible');
  }
}

// 🔥 EJECUCIÓN
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', cargarBannersDinamicos);
} else {
    cargarBannersDinamicos();
}