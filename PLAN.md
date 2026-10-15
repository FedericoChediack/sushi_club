# SushiClub · Plan de implementación

Implementación del diseño `SushiClub Prototipo v3.dc.html` (proyecto claude.ai/design `9dbe290e-1249-41c4-8301-8019f0878b00`) con HTML, CSS y JavaScript sin librerías.

## Decisiones tomadas

- **Sin librerías.** Cualquier dependencia nueva se consulta antes.
- **Fuentes:** Zen Kaku Gothic New (400/500/700), Anton e IBM Plex Mono (400), cargadas con `<link>` desde Google Fonts en el `<head>` de cada página.
- **JS con módulos ES** (`<script type="module">`, `import` / `export`). El sitio se abre con un servidor local (extensión Live Server de VS Code o `npx serve`); con `file://` los módulos no cargan.
- **Header, footer, menú mobile, barra de carrito, toast y modales se inyectan por JS** desde `js/shared/layout.js`. Cada HTML trae solo el contenido propio de la pantalla.
- **Responsive con media queries** (mobile-first): las vistas desktop (1280px) y mobile (390px) del prototipo son la misma página.
- **Estado compartido entre páginas** en `localStorage`, centralizado en `js/shared/store.js`.
- **Fuera de alcance:** la barra de herramientas del prototipo (switch Desktop/Mobile y selector de pantalla) y el estado de "reservas de mesa", que no tiene pantalla en v3.

## Estructura

```
sushi_club/
├─ index.html              Home (queda en la raíz: es la entrada del sitio)
├─ iniciar.bat             doble click para abrir el sitio (levanta el servidor local)
├─ herramientas/
│  └─ servidor.js          servidor local mínimo (solo Node, sin dependencias)
├─ pages/
│  ├─ carta.html           Carta / Pedí online
│  ├─ beneficios.html      Beneficios (ofertas)
│  ├─ carrito.html         Carrito
│  ├─ pago.html            Pago
│  ├─ confirmacion.html    Confirmación de compra
│  ├─ pedidos.html         Mis pedidos
│  ├─ eventos.html         Eventos (lista)
│  ├─ evento.html          Detalle de evento (?id=gala|jazz|omakase|sake)
│  ├─ catering.html        Catering
│  ├─ gift.html            SushiGift (wizard de 4 pasos + enviado)
│  ├─ club.html            Club SushiClub
│  └─ login.html           Login / Registro (?pestana=ingreso|registro&volver=...)
├─ css/
│  ├─ global.css           tokens, reset, tipografía, layout y componentes compartidos
│  └─ home.css · carta.css · beneficios.css · carrito.css · pago.css · confirmacion.css
│     pedidos.css · eventos.css · evento.css · catering.css · gift.css · club.css · login.css
├─ js/
│  ├─ shared/
│  │  ├─ data.js           productos, eventos, sedes, gifts, beneficios, días, horarios
│  │  ├─ store.js          estado persistente (localStorage) + suscripción a cambios
│  │  ├─ utils.js          moneda(), precio final, rutas, helpers de DOM, parámetros
│  │  ├─ layout.js         header, menú mobile, footer, barra de carrito, barra "Volver", toast
│  │  ├─ modals.js         modal de sede y modal de servicio
│  │  └─ components.js     tarjeta de producto, stepper de cantidad, stepper de pasos, chips
│  └─ home.js · carta.js · beneficios.js · carrito.js · pago.js · confirmacion.js
│     pedidos.js · eventos.js · evento.js · catering.js · gift.js · club.js · login.js
├─ img/
│  ├─ productos/           combo45, combo30, new-york-roll, salmon-especial, ebi-tempura,
│  │                       veggie-roll, geisha-roll, nigiri-salmon, tartar-atun, gyozas,
│  │                       hot-roll, mochi
│  ├─ eventos/             evento-gala, evento-jazz, evento-omakase, evento-sake
│  ├─ gift/                gift-clasico, gift-premium, gift-dulce, sushigift
│  └─ servicios/           catering
└─ _referencia/            capturas del diseño (no se publica)
   ├─ desktop/01–16.png
   └─ mobile/01–16.png
```

Plantilla de cada página dentro de `pages/` (las rutas a `css/`, `js/` e `img/` llevan `../`):

```html
<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Carta · SushiClub</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Anton&family=IBM+Plex+Mono:wght@400&family=Zen+Kaku+Gothic+New:wght@400;500;700&display=swap" rel="stylesheet">
  <link rel="icon" href="../img/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="../css/global.css">
  <link rel="stylesheet" href="../css/carta.css">
  <script type="module" src="../js/carta.js"></script>
</head>
<body>
  <main id="principal"><!-- contenido propio de la pantalla --></main>
</body>
</html>
```

Cada `js/<pantalla>.js` arranca con:

```js
import { montarLayout } from './shared/layout.js';
import { almacen } from './shared/store.js';

montarLayout({ pagina: 'carta' });
// lógica de la pantalla
```

**Rutas desde JS:** como el HTML puede estar en la raíz o en `pages/`, el JS nunca escribe rutas relativas a mano. Usa los helpers de `js/shared/utils.js`, que calculan la raíz del sitio a partir de `import.meta.url` (así también funciona si el sitio se publica en una subcarpeta):

- `pagina('carta')`, `pagina('evento', '?id=gala')`, `pagina('inicio')` → URL de una pantalla.
- `enlace('pages/club.html')` → URL a partir de una ruta relativa a la raíz (así se guardan `ultimaPagina` y `?volver=`).
- `rutaSegura()` descarta destinos fuera del sitio en `?volver=`.
- Las imágenes de `data.js` se resuelven con `imagen()`.


## Convenciones de nombres (todo en español)

Clases CSS, variables CSS, ids, atributos `data-*`, campos de formulario y todo el JS (variables, funciones, constantes, propiedades de los datos y claves del estado) están en español. Quedan en inglés solo las palabras del lenguaje y del navegador (`const`, `querySelector`, `display`, `href`…) y los nombres de archivos y carpetas.

- **Clases:** BEM en español: `bloque__elemento--variante`. Ej.: `producto__importe`, `boton--borde`, `barra-carrito__total`.
- **Estados:** `esta-activo`, `esta-hecho`, `esta-actual`, `esta-deshabilitado`, `esta-bloqueado`, `esta-reservado`, `esta-cerrado`, `esta-marcado`, `esta-apagado`, `tiene-error`, `es-alerta`, `es-fuerte`. En el `body`: `menu-abierto`, `con-modal`.
- **Responsive:** `solo-desktop` / `solo-mobile`.
- **Variables CSS:** `--fondo`, `--fondo-2…4`, `--texto`, `--texto-2/3`, `--apagado…`, `--rojo`, `--rojo-oscuro`, `--rojo-claro`, `--rojo-suave`, `--borde`, `--borde-suave`, `--borde-tenue`, `--fuente-texto`, `--fuente-titulo`, `--fuente-mono`, `--ancho-maximo`, `--margen`.
- **Acciones:** los botones usan `data-accion="agregar"` y `data-valor`; `delegar(raiz, 'click', { agregar: el => … })` las conecta.
- **Estado (`almacen`):** `almacen.obtener()`, `almacen.actualizar(cambios, { silencioso })`, `almacen.suscribir(fn)`. Claves: `carrito`, `modo` (`retiro` | `delivery`), `sede`, `sesionIniciada`, `medioPago`, `reservaEvento`, `ultimoPedido`, `ultimaPagina`, etc. Se guarda en `localStorage` con la clave `sushiclub:estado:v3`.
- **Layout:** `montarLayout({ pagina, encabezado: 'principal' | 'volver' | 'ok', volver: { texto, enlace }, paso, pie })`, `aviso(mensaje)` y `avisoSiguiente(mensaje)`.

---

## Paso 0 · Preparación

- [x] Crear la estructura de carpetas.
- [x] Crear los 13 HTML con la plantilla y sus CSS/JS vacíos enlazados.
- [x] Bajar las 21 imágenes de `assets-web/` (JPG optimizados) del proyecto de diseño a `img/`, en la subcarpeta que corresponda.
- [x] Bajar las capturas `export/desktop/01–16.png` y `export/mobile/01–16.png` a `_referencia/`.
- [x] Verificar que el sitio abre con Live Server.

## Paso 1 · CSS global (`css/global.css`)

- [x] Tokens en `:root`:
  - Fondos: `#0e0d0c`, `#141211`, `#1f1d1b`, `#2a2724`, `#3a3734`.
  - Textos: `#f5f2ee`, `#b9b4ad`, `#8c867e`, `#a39d95`.
  - Acento: `#e0362b` (principal) y `#c8261c` (links / hover).
  - Bordes: `rgba(245,242,238,.25)` y `rgba(245,242,238,.2)`.
  - Familias: `--fuente-texto` (Zen Kaku Gothic New), `--fuente-titulo` (Anton), `--fuente-mono` (IBM Plex Mono).
- [x] Reset, tipografía base y escala de tamaños.
- [x] Layout: contenedor con ancho máximo de 1280px, gutter mobile de 16px, breakpoint de desktop en `min-width: 900px`.
- [x] Componentes compartidos:
  - Botones (primario rojo, secundario con borde, deshabilitado).
  - Chips activo/inactivo.
  - Inputs, textarea y select, con estado de error.
  - Tags (−20%, 2X1 LUNES, PRECIO CLUB).
  - Tarjeta de producto (imagen 4:3 en desktop, 1:1 en mobile, en fila con miniatura de 96px).
  - Stepper de cantidad.
  - Stepper de pasos (Carrito → Pago → Confirmación y los 4 pasos del Gift).
  - Tabs, toast, modal y overlay.

## Paso 2 · JS compartido (`js/shared/`)

- [x] `data.js`: exportar `PRODUCTOS`, `EVENTOS`, `SEDES`, `REGALOS`, `BENEFICIOS`, `DIAS`, `CATEGORIAS`, copiados del prototipo, con la ruta de imagen de cada uno.
- [x] `store.js`:
  - Estado inicial igual al del prototipo: carrito de ejemplo, sede "Chacras Park", modo retiro, sin sesión, último pedido de ejemplo.
  - `almacen.obtener()`, `almacen.actualizar(cambios)`, `almacen.suscribir(fn)` y `almacen.reiniciar()`.
  - Lectura y escritura de `localStorage` dentro de try/catch, con el estado en memoria como respaldo.
  - Acciones: `cambiarCantidad`, `quitarProducto` (con datos para deshacer), `deshacerQuitar`, `reservarEvento`, `cambiarPersonasEvento` e `iniciarSesion`.
- [x] `utils.js`:
  - `moneda(n)`: formato `$ 42.900` con `es-AR`.
  - `precioFinal(p, sesionIniciada)`: los productos del club cuestan el precio de lista sin sesión.
  - `resumenCarrito()`: subtotal, envío ($ 2.500 en delivery), seña del evento (30%) y total.
  - `parametro(nombre)` para los parámetros de la URL y helpers `$`, `$$` y `delegar()`.
- [x] `layout.js`:
  - Header desktop: logo, nav con el ítem activo subrayado, sede actual, login / "Hola, Sofía" y carrito.
  - Header mobile y menú hamburguesa (suma "Mis pedidos" con sesión).
  - Footer con links (suma "Mis pedidos" con sesión).
  - Barra "Volver" en Carrito y Pago, en lugar del header principal.
  - Barra flotante de carrito: visible con productos o un evento reservado, oculta en carrito, pago, confirmación, login y gift.
  - `aviso(mensaje)` (toast), que dura 2,4 s.
  - Redibujado al cambiar el estado.
- [x] `modals.js`:
  - Modal de sede: buscador, zonas (CABA, GBA, INTERIOR, TEMPORADA cerrada "Abre en diciembre"), "Usar mi ubicación" (que elige Palermo Soho), "sin resultados" y continuar.
  - Modal de servicio: Pedí online, Eventos, Regalar sushi, Catering.
  - Se abre en la primera visita y desde la sede del header.
  - Cierre con Esc, con click afuera y con foco atrapado mientras está abierto.
- [x] `components.js`: `productCard(p)` con agregar o stepper según esté en el carrito, `qtyStepper()`, `stepsBar()` y `chips()`.

## Paso 3 · Pantallas (en el orden del flujo)

Cada una lleva su HTML, CSS y JS propios.

- [x] **3.1 Home** (`index.html`): hero con CTA que suma el Combinado Club 45 y lleva a la Carta, destacados (3 productos en desktop, 2 en mobile) y accesos a los servicios. Modal de sede en la primera visita.
- [x] **3.2 Carta** (`carta.html`): chips de categoría (Todos, Combinados, Rolls, Nigiris y sashimi, Entradas, Veggie, Postres) y grilla de productos con agregar y stepper.
- [x] **3.3 Beneficios** (`beneficios.html`):
  - Sección "Beneficios para todos".
  - Sección "Exclusivos socios": bloqueada sin sesión (precio de lista y nota "Precio Club"), con precio de socio aplicado con sesión.
  - Link al Club.
- [x] **3.4 Carrito** (`carrito.html`):
  - Stepper de pasos.
  - Tabs de retiro / delivery con su texto de tiempo.
  - Ítems con stepper y eliminar, y aviso con "Deshacer".
  - Reserva de evento: cantidad de personas y quitar.
  - Resumen (subtotal, envío, seña, total), estado vacío y botón a Pago (deshabilitado si está vacío).
  - En mobile, panel desplegable de artículos.
- [x] **3.5 Pago** (`pago.html`):
  - Email, autocompletado si hay sesión.
  - Delivery: dirección, CP, nota y mapa clickeable con pin que completa dirección y CP.
  - Retiro: sede elegida. Solo evento: bloque "Tu lugar".
  - Métodos: tarjeta (muestra el formulario de tarjeta), Mercado Pago o efectivo (deshabilitado en delivery).
  - Validaciones de dirección, CP y email. Al confirmar se guarda el pedido y se va a Confirmación.
- [x] **3.6 Confirmación** (`confirmacion.html`):
  - Número de pedido, ETA según el modo y tracker de 4 estados (delivery, retiro o evento).
  - Resumen del pedido.
  - Botón principal: "Ver estado en Mis pedidos" con sesión, o "Iniciá sesión / Registro" sin sesión.
  - Esta pantalla no lleva footer.
- [x] **3.7 Login / Registro** (`login.html?pestana=…&volver=…`):
  - Tabs, validación de email y botón de login social.
  - En registro, checkbox "sumarme al Club".
  - Al terminar redirige a `volver` (pantalla de origen, por defecto `club`) y muestra el toast "Hola, Sofía…".
- [x] **3.8 Club** (`club.html`): texto según la sesión, beneficios con tag (PARA TODOS / SOCIO / EXCLUSIVO SOCIOS), canjear → "Aplicado ✓", bloqueados sin sesión con CTA a login. Pitch del club y CTAs para registrarse o ingresar.
- [x] **3.9 Mis pedidos** (`pedidos.html`): sin sesión muestra la invitación a ingresar; con sesión, el tracker del último pedido, pedidos anteriores con "Repetir pedido" (carga el carrito y va a Carrito) y el contacto por WhatsApp (toast).
- [x] **3.10 Eventos** (`eventos.html`): lista con fecha, nombre, sede exclusiva, cupos, precio por persona y "Reservar" / "Reservado ✓". Link al detalle.
- [x] **3.11 Detalle de evento** (`evento.html?id=…`):
  - Descripción e "incluye".
  - Personas de 1 a 12; con más de 12, toast que deriva a Catering.
  - Seña del 30%. "Reservar lugar" suma el evento al carrito y "Ir al checkout" lleva a Carrito.
  - Volver a la lista.
- [x] **3.12 Catering** (`catering.html`): 3 servicios, formulario con chips de tipo y de invitados, nombre y contacto con validación, y estado "enviado".
- [x] **3.13 SushiGift** (`gift.html`):
  - Paso 1, Regalo: 3 cajas.
  - Paso 2, Tarjeta: mensaje de hasta 180 caracteres con contador, "de parte de" y vista previa.
  - Paso 3, Entrega: destinatario, dirección (obligatorios), día y franja horaria.
  - Paso 4, Pago: tarjeta o Mercado Pago y resumen con envío de $ 2.500.
  - Se puede volver a los pasos ya hechos y se sube al inicio en cada paso. Al final, pantalla "SushiGift enviado".

## Paso 4 · Integración y QA funcional

- [x] Flujos completos:
  - Compra con retiro.
  - Compra con delivery (con y sin mapa).
  - Solo evento.
  - Evento con comida.
  - SushiGift.
  - Catering.
- [x] Login iniciado desde Beneficios, Club, Confirmación y Mis pedidos: vuelve a la pantalla de origen.
- [x] Precios club con y sin sesión en Carta, Beneficios, Carrito y Pago.
- [x] Persistencia al recargar y al navegar, y que `reset()` restaura los datos de ejemplo.
- [x] Estados vacíos y mensajes de error.
- [x] Links del header, footer y menú, y toasts de "Disponible en la versión final del sitio".
- [x] Sin errores en la consola.

## Paso 5 · Responsive y accesibilidad

- [x] Que no haya scroll horizontal a 390px. Revisar 390, 768, 1024 y 1280px.
- [x] HTML semántico (`header`, `nav`, `main`, `footer`, `button` en lugar de `div` clickeables).
- [x] `alt` en las imágenes, `label` en los inputs y `aria-live` en el toast.
- [x] Navegación completa con teclado y foco visible. Los modales cierran con Esc.
- [x] Contraste suficiente en los textos grises sobre fondos oscuros.

## Paso 6 · Revisión estética por pantalla (último paso)

Comparar cada pantalla contra su captura de referencia, en desktop y en mobile. El orden de las capturas parece seguir el selector del prototipo; confirmarlo al bajarlas.

| # | Pantalla | Archivo | Desktop | Mobile |
|---|---|---|---|---|
| 01 | Home | `index.html` | [x] | [x] |
| 02 | Modal · Sede | `index.html` | [x] | [x] |
| 03 | Modal · Servicio | `index.html` | [x] | [x] |
| 04 | Carta | `carta.html` | [x] | [x] |
| 05 | Beneficios | `beneficios.html` | [x] | [x] |
| 06 | Carrito | `carrito.html` | [x] | [x] |
| 07 | Pago | `pago.html` | [x] | [x] |
| 08 | Confirmación | `confirmacion.html` | [x] | [x] |
| 09 | Mis pedidos | `pedidos.html` | [x] | [x] |
| 10 | Eventos | `eventos.html` | [x] | [x] |
| 11 | Detalle de evento | `evento.html` | [x] | [x] |
| 12 | Catering | `catering.html` | [x] | [x] |
| 13 | SushiGift | `gift.html` | [x] | [x] |
| 14 | SushiGift enviado | `gift.html` | [x] | [x] |
| 15 | Club | `club.html` | [x] | [x] |
| 16 | Login / Registro | `login.html` | [x] | [x] |

Checklist para cada pantalla:

- [x] Tipografía: familia, peso, tamaño, interlineado y mayúsculas.
- [x] Espaciados, márgenes y grilla.
- [x] Colores, fondos y bordes.
- [x] Estados hover, activo, foco, error y deshabilitado.
- [x] Imágenes: recorte, proporción y posición del sujeto.
- [x] Header y footer alineados con el resto del contenido.
- [x] Coherencia entre pantallas (mismos componentes, mismos tamaños).

---

## Estado (15/10/2026)

Pasos 0 a 6 completos. Verificado con Chrome headless: las 13 páginas cargan sin errores de consola, sin scroll horizontal a 390px, y los flujos del Paso 4 pasan (retiro, delivery, solo evento, login con regreso a la pantalla de origen, club, repetir pedido, gift y catering).

### Diferencias con el plan original

- **Mapa de delivery:** el prototipo v3 tiene la lógica del mapa con pin pero no lo muestra en pantalla, así que no se implementó.
- **Mis pedidos sin sesión:** el diseño muestra el último pedido como invitado (con aviso para iniciar sesión), no una pantalla bloqueada. Se respetó el diseño.
- **Capturas de referencia:** 19 de las 32 quedaron cortadas (el MCP limita las descargas a 256 KB). Para compararlas completas, bajar `export/desktop/*.png` y `export/mobile/*.png` a mano desde el proyecto de diseño.

### Correcciones de diseño aplicadas (Paso 6)

- Club: las tarjetas de beneficio desbloqueadas tenían fondo blanco con texto claro (ilegible). Ahora tienen fondo oscuro con borde.
- Club: el botón "Unite gratis" tenía el mismo color que la banda y no se veía. Ahora es rojo.
- Club: el recuadro "Tus puntos" se fundía con la banda. Ahora usa un fondo un tono más claro.
- Carta: el panel "Tu pedido" del prototipo desbordaba el subtotal y partía los nombres. Ahora las filas no se pisan.
- Detalle de evento: cambiar la cantidad de personas solo modifica la reserva si es del mismo evento (en el prototipo pisaba la de otro).

### Cómo probar

1. Doble click en `iniciar.bat`: levanta un servidor local (`herramientas/servidor.js`, solo Node, sin instalar nada) y abre el navegador en `http://localhost:5500`. En Mac o Linux: `node herramientas/servidor.js`. Abrir `index.html` con doble click no funciona: el navegador bloquea los módulos JS en `file://`.
2. Para volver al estado inicial (carrito de ejemplo, sin sesión, con el modal de sede), ejecutar `reiniciarSushiclub()` en la consola del navegador.
