const fs = require('fs');
const path = require('path');

// =================================================================
// ⚙️ CONFIGURACIÓN DEL SCRIPT
// =================================================================

const PLACEHOLDER = '<!-- INJECT_SEO -->';

// Lista de tus archivos HTML.
const filesToProcess = [
  { path: './index.html', titleSuffix: '' }, 
  { path: './paginas/tienda.html', titleSuffix: ' - Catálogo' },
  { path: './paginas/liquidacion.html', titleSuffix: ' - Ofertas' },
  { path: './paginas/locales.html', titleSuffix: ' - Puntos de venta' },
  { path: './paginas/especial.html', titleSuffix: ' - ESPECIAL' },
];

// =================================================================
// 🌍 VARIABLES DE ENTORNO (NETLIFY)
// =================================================================

const CONFIG = {
  siteName: process.env.SEO_SITE_NAME || "Mi Tienda",
  titleBase: process.env.SEO_TITLE || "Tienda Online",
  description: process.env.SEO_DESCRIPTION || "La mejor tienda para comprar tus productos favoritos con envío a todo el país.",
  image: process.env.SEO_IMAGE || "https://tu-dominio.com/imagenes/share-default.jpg",
  favicon: process.env.SEO_FAVICON || "/imagenes/knecta.png",
  url: process.env.URL || "https://tu-sitio.netlify.app",
  themeColor: process.env.SEO_THEME_COLOR || "#ffffff",
  author: "Knecta Solutions"
};

// =================================================================
// 🏗️ CONSTRUCTOR DEL HEAD
// =================================================================

function generateHead(pageSuffix = '') {
  const fullTitle = pageSuffix 
    ? `${CONFIG.titleBase}${pageSuffix}` 
    : CONFIG.titleBase;
  
  return `
    <title>${fullTitle}</title>
    <meta name="description" content="${CONFIG.description}">
    <meta name="author" content="${CONFIG.author}">
    <link rel="canonical" href="${CONFIG.url}">
    <meta name="robots" content="index, follow">

    <meta name="theme-color" content="${CONFIG.themeColor}">
    <link rel="icon" type="image/png" href="${CONFIG.favicon}">
    <link rel="apple-touch-icon" href="${CONFIG.favicon}">

    <meta property="og:type" content="website">
    <meta property="og:site_name" content="${CONFIG.siteName}">
    <meta property="og:url" content="${CONFIG.url}">
    <meta property="og:title" content="${fullTitle}">
    <meta property="og:description" content="${CONFIG.description}">
    <meta property="og:image" content="${CONFIG.image}">
    
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${fullTitle}">
    <meta name="twitter:image" content="${CONFIG.image}">

    `;
}

// =================================================================
// 🏃 EJECUCIÓN DEL SCRIPT
// =================================================================

console.log(`\n🚀 Iniciando Inyección de SEO para: ${CONFIG.siteName}`);
console.log(`🌍 URL Base: ${CONFIG.url}`);

filesToProcess.forEach(file => {
  const fullPath = path.join(__dirname, file.path);

  if (fs.existsSync(fullPath)) {
    try {
      let content = fs.readFileSync(fullPath, 'utf8');

      const headHtml = generateHead(file.titleSuffix);

      if (content.includes(PLACEHOLDER)) {
        content = content.replace(PLACEHOLDER, headHtml);
        
        fs.writeFileSync(fullPath, content);
        console.log(`✅ SEO inyectado en: ${file.path}`);
      } else {
        console.warn(`⚠️ ALERTA: No se encontró la etiqueta ${PLACEHOLDER} en ${file.path}`);
      }
    } catch (err) {
      console.error(`❌ Error procesando ${file.path}:`, err.message);
    }
  } else {
    console.log(`ℹ️ Archivo omitido (no existe): ${file.path}`);
  }
});

console.log("🏁 Proceso de Build SEO finalizado con éxito.\n");