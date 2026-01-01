# 🧠 Arquitectura modular del frontend

Este proyecto utiliza un sistema de **carga modular de componentes HTML y CSS** basado en JavaScript puro.  
El archivo `main.js` actúa como un motor central que ensambla las diferentes piezas del sitio sin necesidad de frameworks como React o Vue.

---

## 📂 Estructura general

frontend/
│
├── js/
│ ├── main.js → núcleo del sistema modular
│ ├── components/ → piezas visuales reutilizables
│ │ ├── header.html
│ │ ├── footer.html
│ │ ├── loader.html
│ │ ├── ...
│ │
│ ├── pages/ → scripts específicos de cada página
│ │ ├── destacados.js
│ │ ├── producto.js
│ │ └── ...
│ │
│ ├── utils/ → funciones globales o helpers
│ │ ├── format.js
│ │ ├── promo.js
│ │ └── ...
│ │
│ └── components/ → componentes con lógica (ej. renderLista.js)
│
└── styles/ → CSS global y por componente




## ⚙️ Funcionamiento general

El sistema se basa en **fragmentos HTML independientes** que se cargan dinámicamente dentro del DOM.  
Cada fragmento puede tener su propio archivo CSS, que se inyecta automáticamente solo una vez.

`main.js`:
- Carga dinámicamente los componentes definidos.
- Inyecta sus estilos CSS (evitando duplicados).
- Reactiva los `<script>` inline dentro del HTML.
- Dispara un evento global llamado `components:ready` al terminar.

Esto permite tener una web modular sin necesidad de un build system.




🛡️ Arquitectura de Seguridad Anti-Bot (Trust Token)

Este documento describe el mecanismo de seguridad implementado en el backend y el frontend para proteger los endpoints de escritura (como /guardar, /create-preference, etc.) contra bots automatizados simples.

La estrategia se basa en un flujo de "Desafío de Confianza" (Trust Challenge). No confiamos en ninguna petición POST que no pueda demostrar primero que es un cliente (como un navegador) capaz de ejecutar JavaScript y almacenar cookies.

El Flujo de Confianza (Resumen)

    El Saludo (Handshake): El frontend (main.js), tan pronto como se carga, hace una petición GET a un endpoint público en el backend (/api/init-session).

    La Credencial (Cookie): El backend recibe este "saludo" y responde estableciendo una cookie firmada, segura y httpOnly en el navegador del cliente. Esta es la "credencial de confianza".

    El Pasaporte (Envío): Ahora, cada vez que el frontend necesita hacer una llamada real a la API (ej. guardar un pedido) a través de fetchClientes.js, adjunta esta cookie de confianza a la petición.

    La Verificación (Gatekeeper): El backend, en todos los endpoints POST protegidos, utiliza un middleware (requireTrustToken) que comprueba: "¿Esta petición trae una cookie de confianza? ¿Es válida y la firma es correcta?". Si la respuesta es sí, la petición pasa. Si es no, se bloquea con un error 403 (Prohibido).

Un bot simple que solo escanea endpoints y envía datos a /guardar nunca habrá hecho el "saludo" (Paso 1) y, por lo tanto, no tendrá la cookie (Paso 2). Fallará la verificación (Paso 4) y será bloqueado.

1. Componentes del Backend (Node.js)

El backend es el "guardia" que emite las credenciales y las verifica en la puerta.

cookie-parser y COOKIE_SECRET

    Qué hace: cookie-parser es el middleware que nos permite leer y escribir cookies. Lo más importante es que, al proporcionarle un COOKIE_SECRET desde el .env, nos permite firmar las cookies que enviamos y verificar la firma de las cookies que recibimos.

    Por qué: Una cookie firmada evita que un atacante pueda falsificar (fabricar) una cookie de confianza en su propia máquina. El backend es el único que conoce el secreto, por lo que es el único que puede crear una firma válida.

cors({ credentials: true })

    Qué hace: Esta es la configuración de CORS que autoriza explícitamente a los navegadores de orígenes permitidos (tu allowlist) a enviar peticiones que incluyan credenciales (como cookies o encabezados de autorización).

    Por qué: Por defecto, los navegadores bloquean el envío de cookies a un dominio diferente (ej. de tusitio.com a api.tusitio.com o localhost:3000). Añadir credentials: true en el backend y credentials: 'include' en el frontend completa el "apretón de manos" de seguridad necesario para que CORS permita el flujo.

Endpoint: GET /api/init-session (El Desafío)

    Qué hace: Este es el único trabajo de este endpoint. Es público y no requiere autenticación. Cuando se le llama, genera una cookie de confianza (_trust_token) y la establece en el navegador del cliente.

    Atributos de la Cookie:

        httpOnly: true: Crítico. Evita que el JavaScript del frontend (incluido código malicioso XSS) pueda leer o manipular esta cookie. Solo el navegador y el servidor pueden verla.

        secure: true: Asegura que la cookie solo viaje sobre HTTPS.

        sameSite: 'none': Necesario (junto con secure: true) para que la cookie pueda ser enviada en un contexto de dominios cruzados (cross-domain).

        signed: true: Firma la cookie usando el COOKIE_SECRET para probar su autenticidad.

Middleware: requireTrustToken (El Guardia)

    Qué hace: Este middleware es el "guardia" que se coloca delante de todas las rutas sensibles (POST /guardar, POST /create-preference, POST /api/refresh-cache).

    Por qué: Utiliza req.signedCookies[TRUST_COOKIE_NAME] para buscar la cookie de confianza. signedCookies (proporcionado por cookie-parser) hace el trabajo pesado: busca la cookie, comprueba su firma y la descifra. Si la cookie no existe o la firma es inválida (falsificada), el middleware bloquea la petición con un 403 Forbidden antes de que llegue a la lógica de la ruta.

2. Componentes del Frontend (JavaScript)

El frontend es el "ciudadano" que debe saludar para obtener su credencial y luego presentarla en cada punto de control.

main.js (El Saludo / Handshake)

    Qué hace: El bloque IIFE (la función anónima (() => { ... })();) al inicio de main.js se ejecuta inmediatamente cuando se carga la página. Su primera acción es hacer el fetch a /api/init-session.

    Por qué está aquí:

        Inmediatez: Necesitamos obtener la cookie de confianza lo antes posible.

        credentials: 'include' (El Receptor): Esta opción en el fetch es la contraparte del cors({ credentials: true }). Le dice al navegador: "Por favor, acepta y guarda cualquier cookie que el backend me envíe en esta petición cross-domain".

    Separación: Este bloque solo se encarga de obtener la cookie. No se preocupa de enviarla en futuras peticiones. Su otra función (interceptar fetch globalmente) solo se usa para inyectar x-cliente y ?cliente=, pero no las credenciales.

utils/fetchClientes.js (El Pasaporte)

    Qué hace: Este es tu módulo "helper" que centraliza todas las llamadas a la API (ej. fetchCliente('/hoja2')). Es el único lugar donde se define cómo hablar con tu backend.

    Por qué está aquí:

        Centralización: En lugar de añadir credentials: 'include' en cada fetch por todo tu sitio, lo pones en un solo lugar.

        credentials: 'include' (El Emisor): Esta línea, dentro de newOptions, le dice al navegador: "En esta petición (y en todas las que usen fetchCliente), por favor adjunta cualquier cookie relevante (como _trust_token) que tengas para este dominio".

        El Flujo Completo: main.js obtiene la cookie y la guarda. fetchClientes.js la envía de vuelta cada vez que llama a la API.

⚠️ Por Qué Debe Mantenerse Así

Esta arquitectura de "separación de intereses" es robusta y mantenible:

    main.js es el "Anfitrión Global": Se ejecuta una vez, saluda al backend (para la cookie) y configura reglas globales (como inyectar x-cliente). No sabe nada sobre la lógica de la API, solo sobre la configuración inicial.

    utils/fetchClientes.js es el "Mensajero de la API": Es el especialista. Es el único archivo que sabe cómo hablar con la API (usando la ruta base) y qué necesita para autenticarse (enviando credentials: 'include').

No se debe "simplificar" este flujo (por ejemplo, moviendo la lógica de credentials: 'include' al interceptor global de main.js). Hacerlo mezclaría las responsabilidades:

    El interceptor global de main.js también captura fetch para archivos estáticos (como loader.html, header.html). No queremos (ni necesitamos) enviar cookies de autenticación al pedir archivos HTML.

    Mantener la lógica de credenciales dentro de fetchClientes.js asegura que solo las peticiones destinadas a la API real lleven el "pasaporte".

Modificar este flujo, eliminar requireTrustToken del backend, o quitar credentials: 'include' de cualquiera de los dos archivos, romperá el sistema y reabrirá la puerta a los bots.


/////////////////////////////////////////// Segundo escudo, honney pot
🍯 Mecanismo de Defensa: Campo Trampa (Honeypot)

Este mecanismo de defensa avanzada protege los endpoints de escritura (POST) de la aplicación contra la mayoría de los bots de spam mediante una estrategia de Engaño Silencioso. Funciona en complemento con el Trust Token y los límites de tasa.

1. El Flujo de la Petición y la Cadena de Express

La clave de este sistema es la interrupción del flujo de ejecución de Express en una etapa temprana, antes de consumir recursos de servidor.

1.1. ⚙️ Comportamiento Secuencial

El controlador POST /guardar (y similares) sigue una cadena de responsabilidad estricta, donde cada middleware es un guardián.
PeticioˊnwriteLimiter​requireTrustToken​requireHoneypotClearDetiene al Bot​requireApiKey​Controlador FinalSolo aquıˊ guarda datos​

1.2. 🛑 El Corte de Flujo No Booleano

En Express, la cadena no se interrumpe devolviendo un estado false. La interrupción se logra asegurando que el ciclo de Petición/Respuesta (Request/Response) se dé por terminado, lo cual se hace con funciones de respuesta (res.json(), res.send()).
Condición	Acción en el Código	Efecto sobre la Cadena
Petición Válida (Humano)	return next();	La cadena continúa al siguiente guardián.
Petición Inválida (Bot)	return res.json(...);	La cadena se detiene inmediatamente, ya que el cliente ha recibido una respuesta HTTP final.

IV. 💻 Arquitectura del Backend (Node.js/Express)

El servidor está construido sobre Express y diseñado para la robustez, el rendimiento y la seguridad.

1. Middlewares Críticos y Optimización

Middleware	Propósito	Configuración Clave
helmet	Seguridad	Establece varios headers HTTP para proteger contra ataques comunes (ej. XSS, Clickjacking).
compression	Rendimiento	Comprime las respuestas del servidor (Gzip) para reducir la latencia de carga.
timeout	Estabilidad	Limita el tiempo de procesamiento de cada petición a 15 segundos (REQUEST_TIMEOUT_MS).
morgan	Monitoreo	Logger de peticiones para seguimiento en desarrollo (dev) y producción (combined).
express.json	Seguridad	Limita el tamaño del cuerpo de las peticiones JSON a 300kb para prevenir ataques de sobrecarga.

2. Configuración de CORS y Rate Limiting

    CORS (cors): Está configurado para ser restrictivo (allowlist) en producción, pero permite localhost en desarrollo. El atributo credentials: true es crucial, ya que permite que los navegadores envíen la cookie firmada _trust_token a la API.

    Rate Limiting (express-rate-limit): Se aplican límites de solicitud:

        Límite Global (globalLimiter): 120 peticiones/min para todas las rutas.

        Límite de Escritura (writeLimiter): 25 peticiones/min para rutas sensibles (POST /guardar, /create-preference).

V. 🏢 Arquitectura de Datos Multi-Tenant (Google Sheets & Cache)

El backend soporta múltiples clientes (tenants) sirviendo contenido personalizado.

1. Identificación y Configuración de Clientes

Todas las rutas dinámicas están precedidas por un middleware que identifica al cliente:

    El cliente se identifica por la query param ?cliente=nombre o el header x-cliente.

    El middleware inyecta el objeto req.clienteConfig (obtenido de CLIENTES.js) en la petición, que contiene las variables específicas de ese cliente (ej. SPREADSHEET_ID, MP_ACCESS_TOKEN).

2. Servicio de Datos con Caché Inteligente

La aplicación utiliza Google Sheets como base de datos y un sistema de caché en memoria para optimizar el rendimiento y evitar exceder los límites de la API de Google:

    getGoogleFor(clientId): Se autentica como cada cliente usando su Cuenta de Servicio JWT y guarda la instancia de google.sheets en googleCache.

    getSheetData(...): Es la función principal de lectura.

        Utiliza cacheProductos (en memoria) con una caducidad de 1 hora (CACHE_MS).

        Solo se realiza una llamada a Google Sheets si el caché ha expirado o si se fuerza su refresco (útil para el administrador a través de la ruta /api/refresh-cache).

3. Flujo de Transacción y Pago

Las rutas de escritura y pago siguen una cadena de protección total: writeLimiter → requireTrustToken → requireHoneypotClear → Controlador.

    POST /guardar: Escribe el pedido del cliente en la hoja VentasG usando sheets.spreadsheets.values.append. Incluye sanitización básica (sanitize) y validación de longitud (clampLen) en los datos de entrada.

    POST /create-preference: Genera un link de pago de Mercado Pago (init_point), utilizando el MP_ACCESS_TOKEN específico del cliente actual (req.clienteConfig).

VI. ⚠️ Requerimiento de Integración en el Frontend

Para mantener el sistema Multi-Tenant y de seguridad, la lógica de comunicación con la API debe estar centralizada.

Todos los módulos de frontend que realicen llamadas a la API (ej. /guardar, /create-preference) DEBEN utilizar la función fetchCliente(...) exportada desde utils/fetchClientes.js.

    fetchCliente garantiza la inclusión de:

        El header x-cliente.

        El query param ?cliente=.

        La opción credentials: 'include' (esencial para enviar la cookie _trust_token).

¡No usar fetch directamente! El uso de fetch directo podría romper la autenticación Multi-Tenant y el flujo Anti-Bot.