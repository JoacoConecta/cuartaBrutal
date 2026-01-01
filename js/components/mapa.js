import { getLinksData } from "../utils/mapadatos.js";

// ===============================================================
// 🗺️ MAP SRC BUILDER (SAFE)
// ===============================================================
function buildMapSrc({ lat, lng, zoom }) {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  const z = Number.isFinite(zoom) ? zoom : 16;
  return `https://www.google.com/maps?q=${lat},${lng}&z=${z}&output=embed`;
}

// ===============================================================
// 🏬 TARJETA
// ===============================================================
function crearTarjeta(local, active) {
  const { nombre, direccion, horario, mapa } = local;

  const card = document.createElement("div");
  card.className = "tarjeta-tienda";
  if (active) card.classList.add("active");

  card.dataset.lat = String(mapa.lat);
  card.dataset.lng = String(mapa.lng);
  card.dataset.zoom = String(mapa.zoom || 16);

  const icono = document.createElement("div");
  icono.className = "icono-tienda";
  icono.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
      viewBox="0 0 24 24" fill="none" stroke="currentColor"
      stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
      aria-hidden="true">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
      <circle cx="12" cy="10" r="3"></circle>
    </svg>
  `;

  const detalles = document.createElement("div");
  detalles.className = "detalles-tienda";

  const h2 = document.createElement("h2");
  h2.textContent = nombre;

  const dir = document.createElement("p");
  dir.className = "direccion";
  dir.textContent = direccion;

  const hor = document.createElement("p");
  hor.className = "horario";
  hor.textContent = horario;

  detalles.append(h2, dir, hor);
  card.append(icono, detalles);

  return card;
}

// ===============================================================
// 🚀 RENDER PRINCIPAL (SAFE + OPTIMIZED)
// ===============================================================
async function renderMapaTiendasSeguro() {
  const mount =
    document.getElementById("main_tiendas") ||
    document.querySelector("main");
  if (!mount) return;

  mount.replaceChildren();

  const info = document.createElement("section");
  info.id = "info_tiendas";

  const encabezado = document.createElement("div");
  encabezado.className = "encabezado-tiendas";

  const h1 = document.createElement("h1");
  h1.textContent = "Nuestras Tiendas";

  const p = document.createElement("p");
  p.textContent =
    "Encuentra tu local más cercano. Haz clic en una tienda para verla en el mapa.";

  encabezado.append(h1, p);

  const contenedor = document.createElement("div");
  contenedor.className = "contenedor-tarjetas";

  info.append(encabezado, contenedor);

  const mapaSec = document.createElement("section");
  mapaSec.id = "mapa_tiendas";

  const iframe = document.createElement("iframe");
  iframe.id = "google-maps-iframe";
  iframe.width = "600";
  iframe.height = "450";
  iframe.style.border = "0";
  iframe.loading = "lazy";
  iframe.referrerPolicy = "no-referrer-when-downgrade";
  iframe.allowFullscreen = true;

  mapaSec.appendChild(iframe);
  mount.append(info, mapaSec);

  const data = await getLinksData();
  if (!data || !Array.isArray(data.locales) || data.locales.length === 0) return;

  // Delegación de eventos (eficiencia)
  contenedor.addEventListener("click", e => {
    const card = e.target.closest(".tarjeta-tienda");
    if (!card) return;

    contenedor
      .querySelectorAll(".tarjeta-tienda.active")
      .forEach(c => c.classList.remove("active"));

    card.classList.add("active");

    const src = buildMapSrc({
      lat: +card.dataset.lat,
      lng: +card.dataset.lng,
      zoom: +card.dataset.zoom,
    });

    if (src && src.startsWith("https://www.google.com/maps")) {
      iframe.src = src;
    }
  });

  data.locales.forEach((local, index) => {
    const src = buildMapSrc(local.mapa);
    if (!src) return;

    const card = crearTarjeta(local, index === 0);
    contenedor.appendChild(card);

    if (index === 0 && src.startsWith("https://www.google.com/maps")) {
      iframe.src = src;
    }
  });
}

// ===============================================================
// 🧠 INIT
// ===============================================================
if (document.readyState === "loading") {
  document.addEventListener(
    "DOMContentLoaded",
    renderMapaTiendasSeguro,
    { once: true }
  );
} else {
  renderMapaTiendasSeguro();
}
