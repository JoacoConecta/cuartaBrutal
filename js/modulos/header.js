// js/header.js

function initDisplaySwitcher() {
  document.querySelectorAll('.display-switcher .opcion').forEach(b => {
    b.addEventListener('click', () => {
      document
        .querySelectorAll('.display-switcher .opcion')
        .forEach(x => x.classList.toggle('is-active', x === b));
    });
  });
}

function initMobileMenu() {
  const mobileMenuTrigger = document.getElementById('mobile-menu-trigger');
  const mobileMenu = document.getElementById('barra_menu');
  const exitMenuButton = document.getElementById('exit-menu');
  let overlay = document.getElementById('overlay');
  const body = document.body;

  // crea overlay si no existe
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'overlay';
    overlay.className = 'menu-overlay';
    document.body.appendChild(overlay);
  }

  const openMenu = () => {
    mobileMenu.classList.add('visible');
    overlay.classList.add('visible');
    body.classList.add('no-scroll');
  };

  const closeMenu = () => {
    mobileMenu.classList.remove('visible');
    overlay.classList.remove('visible');
    body.classList.remove('no-scroll');
  };

  mobileMenuTrigger?.addEventListener('click', openMenu);
  exitMenuButton?.addEventListener('click', closeMenu);
  overlay?.addEventListener('click', closeMenu);
}

function initDropdown() {
  const dropdownToggle = document.querySelector('.dropdown-toggle');
  const dropdownMenu = document.querySelector('.dropdown-menu');

  if (!dropdownToggle || !dropdownMenu) return;

  dropdownToggle.addEventListener('click', (e) => {
    e.preventDefault();
    const isOpen = dropdownMenu.classList.toggle('visible');
    dropdownToggle.setAttribute('aria-expanded', String(isOpen));
  });

  document.addEventListener('click', (e) => {
    if (!dropdownMenu.contains(e.target) && !dropdownToggle.contains(e.target)) {
      dropdownMenu.classList.remove('visible');
      dropdownToggle.setAttribute('aria-expanded', 'false');
    }
  });
}

function installDragBlockerOnce() {
  if (window.__dragBlockerInstalled) return;

  document.addEventListener('dragstart', e => e.preventDefault());
  document
    .querySelectorAll('img, a')
    .forEach(el => el.setAttribute('draggable', 'false'));

  window.__dragBlockerInstalled = true;
}

// --------------------------------------------------
// INIT CUANDO LOS COMPONENTES YA ESTÁN MONTADOS
// --------------------------------------------------
document.addEventListener('components:ready', () => {
  initDisplaySwitcher();
  initMobileMenu();
  initDropdown();
  installDragBlockerOnce();
});
