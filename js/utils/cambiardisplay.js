document.addEventListener('click', (e) => {
  const opcion = e.target.closest('.selector-columnas .opcion');
  if (!opcion) return;
  e.preventDefault();

  // 1. Visual: Mover la clase active solo dentro de su grupo visible
  // (Esto evita que se "desmarque" el botón oculto del otro dispositivo)
  const esDesktop = window.innerWidth >= 768;
  const selector = esDesktop ? '.desktop-only' : '.mobile-only';
  
  document.querySelectorAll(`.selector-columnas ${selector}`).forEach(btn => btn.classList.remove('active'));
  opcion.classList.add('active');

  // 2. Lógica: Aplicar columnas
  const cols = opcion.dataset.cols;
  const carrusel = document.querySelector('.carrusel');
  
  if (carrusel) {
    carrusel.classList.add('modo-grid');
    // Esto "pisa" el valor por defecto del CSS
    carrusel.style.setProperty('--num-cols', cols);
  }
}, false);