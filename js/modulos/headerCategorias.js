// ===============================================================
// heaserCategorias.js
// ===============================================================

import { API_BASE_URL } from "../main.js";

// Este evento se dispara cuando loadComponent ya montó el header
document.addEventListener("components:ready", () => {
    cargarCategoriasDinamicas();
    cargarLogoDinamico();
    inicializarMenuMovil();
});

async function cargarCategoriasDinamicas() {
  try {
    // 1. Seleccionamos el submenú del header
    const subMenu = document.querySelector("#sub_menu_tienda");
    if (!subMenu) return; // header aún no cargado

    // Las 3 columnas visibles dentro del dropdown
    const columnas = subMenu.querySelectorAll("#sub_menu_columnas > ul");
    if (columnas.length < 3) return;

    const listaHombres = columnas[0];
    const listaMujeres = columnas[1];
    const listaCategorias = columnas[2]; // Tercera columna

    // 2. Obtener categorías desde el backend
    const res = await fetch(`${API_BASE_URL}/hoja-categorias`);
    if (!res.ok) {
      console.error("Error obteniendo categorías", res.status);
      return;
    }

    const { data } = await res.json();
    const { hombres, mujeres } = data;

    // Limpieza y normalización
    const H = hombres.map((c) => c.trim().toLowerCase());
    const M = mujeres.map((c) => c.trim().toLowerCase());

    // Intersección (categorías compartidas entre ambos sexos)
    const shared = H.filter((cat) => M.includes(cat));

    // ===========================================================
    // 3. Limpieza de las columnas sin alterar estructura original
    // ===========================================================
    limpiarLista(listaHombres);
    limpiarLista(listaMujeres);

    // La tercera columna conserva título y LIQUIDACIÓN
    const { titulo, liquidacion } = extraerTituloYLiquidacion(listaCategorias);
    listaCategorias.innerHTML = ""; // limpiar interior
    listaCategorias.appendChild(titulo.cloneNode(true)); // restaurar título

    // ===========================================================
    // 4. Insertar HOMBRES
    // ===========================================================
    listaHombres.appendChild(crearTitulo("HOMBRES", "hombre"));
    H.forEach((cat) => listaHombres.appendChild(crearCategoria(cat, "hombre")));

    // ===========================================================
    // 5. Insertar MUJERES
    // ===========================================================
    listaMujeres.appendChild(crearTitulo("MUJERES", "mujer"));
    M.forEach((cat) => listaMujeres.appendChild(crearCategoria(cat, "mujer")));

    // ===========================================================
    // 6. Insertar Categorías COMUNES (intersección)
    // ===========================================================
    shared.forEach((cat) => listaCategorias.appendChild(crearCategoria(cat)));

    // Finalmente volvemos a insertar LIQUIDACIÓN tal como estaba
    if (liquidacion) {
      listaCategorias.appendChild(liquidacion.cloneNode(true));
    }

    console.log("✔ Categorías del header actualizadas dinámicamente.");

  } catch (err) {
    console.error("❌ Error cargando categorías dinámicas", err);
  }
}

// ===============================================================
// 🧹 Funciones utilitarias seguras
// ===============================================================

// Limpia SOLO el interior, no el <ul> completo
function limpiarLista(ul) {
  while (ul.firstChild) ul.removeChild(ul.firstChild);
}

// Extrae título y liquidación manteniendo estructura exacta
function extraerTituloYLiquidacion(ul) {
  const titulo = ul.querySelector("li:first-child");
  const liquidacion = ul.querySelector(".tag-liquidacion");

  return { titulo, liquidacion };
}

// Crea ítem título <li><a><b>...</b></a></li>
function crearTitulo(titulo, sexo = null) {
  const li = document.createElement("li");
  const a = document.createElement("a");

  a.textContent = titulo;
  a.style.fontWeight = "bold";

  if (sexo) {
    a.href = `/paginas/tienda.html?sexo=${sexo}`;
  } else {
    a.href = `/paginas/tienda.html`;
  }

  li.appendChild(a);
  return li;
}

// Crea categoría estándar (segura)
function crearCategoria(cat, sexo = null) {
  const li = document.createElement("li");
  const a = document.createElement("a");

  a.textContent = cat.toUpperCase();

  if (sexo) {
    a.href = `/paginas/tienda.html?sexo=${sexo}&categoria=${encodeURIComponent(cat)}`;
  } else {
    a.href = `/paginas/tienda.html?categoria=${encodeURIComponent(cat)}`;
  }

  li.appendChild(a);
  return li;
}


async function cargarLogoDinamico() {
  try {
    const response = await fetch(`${API_BASE_URL}/hoja-categorias/fotos`);
    
    if (!response.ok) return;

    const result = await response.json();

    if (result.ok && result.data) {
      const { Logo } = result.data;
// Inyectar LOGO
      if (Logo && Logo.trim() !== '') {
        // CORREGIDO: Usamos querySelector para buscar la IMG dentro del DIV
        const logoDesktop = document.querySelector('.img_header img');
        const logoMobile = document.querySelector('#mobile-menu-header img'); 

        if (logoDesktop) logoDesktop.src = Logo;
        if (logoMobile) logoMobile.src = Logo;
      }
    }
  } catch (error) {
    console.warn('Usando fotos locales.');
  }
}
// ===============================================================
// 📱 MENÚ MÓVIL (integrado desde activarMenuMovil.js)
// ===============================================================
function inicializarMenuMovil() {
  const btnMenu = document.getElementById("btn-menu-movil");
  const menuMobile = document.getElementById("mobile-menu");
  const cerrarMenu = document.getElementById("btn-cerrar-menu");

  if (!btnMenu || !menuMobile) return;

  // Clonamos para evitar listeners duplicados si header se reinyecta
  const nuevoBtnMenu = btnMenu.cloneNode(true);
  btnMenu.parentNode.replaceChild(nuevoBtnMenu, btnMenu);

  nuevoBtnMenu.addEventListener("click", () => {
    menuMobile.classList.add("active");
    document.body.classList.add("no-scroll");
  });

  if (cerrarMenu) {
    const nuevoCerrar = cerrarMenu.cloneNode(true);
    cerrarMenu.parentNode.replaceChild(nuevoCerrar, cerrarMenu);

    nuevoCerrar.addEventListener("click", () => {
      menuMobile.classList.remove("active");
      document.body.classList.remove("no-scroll");
    });
  }

  // Cerrar tocando backdrop (si existe)
  menuMobile.addEventListener("click", (e) => {
    if (e.target === menuMobile) {
      menuMobile.classList.remove("active");
      document.body.classList.remove("no-scroll");
    }
  });
}
