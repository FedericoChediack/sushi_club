window.SushiClub = window.SushiClub || {};

(() => {
  // Encabezado, menú mobile, pie, barra "Mi carrito" y aviso: se inyectan en cada página.
  const { almacen } = SushiClub.estado;
  const { NOMBRE_USUARIO } = SushiClub.datos;
  const { moneda, escapar, resumenCarrito, enlaceIngreso, rutaActual, pagina, delegar, $ } = SushiClub.utilidades;
  const { barraPasos } = SushiClub.componentes;
  const { abrirModal, montarModales } = SushiClub.modales;

  const NAVEGACION = [
    ['Inicio', 'inicio'],
    ['Pedí online', 'carta'],
    ['Beneficios', 'beneficios'],
    ['Eventos', 'eventos'],
    ['Catering', 'catering'],
  ];
  const ALIAS_NAVEGACION = { club: 'beneficios', evento: 'eventos' };

  // Páginas que no se guardan como "volver" del carrito.
  const SIN_VOLVER = ['carrito', 'pago', 'confirmacion', 'login'];
  // Páginas sin barra flotante de carrito.
  const SIN_BARRA_CARRITO = ['carrito', 'pago', 'confirmacion', 'login', 'gift'];

  const PROXIMAMENTE = 'Disponible en la versión final del sitio';

  let paginaActual = '';
  let opciones = {};

  const logo = (clase = '') => `<a href="${pagina('inicio')}" class="logo ${clase}" aria-label="SushiClub, ir al inicio">SUSHI<span>CLUB</span></a>`;
  const textoCuenta = e => (e.sesionIniciada ? `Hola, ${NOMBRE_USUARIO} · Mis pedidos` : 'Iniciá sesión / Registrate');

  function enlaceCuenta(e) {
    if (e.sesionIniciada) return pagina('pedidos');
    return enlaceIngreso(['login', 'confirmacion'].includes(paginaActual) ? 'pages/club.html' : rutaActual());
  }

  function encabezadoPrincipal(e) {
    const activa = ALIAS_NAVEGACION[paginaActual] || paginaActual;
    return `<header class="encabezado">
      <div class="contenedor encabezado__superior">
        <div class="encabezado__marca">
          <button type="button" class="hamburguesa solo-mobile" data-accion="abrir-menu" aria-label="Abrir menú" aria-expanded="false" aria-controls="menu-lateral">
            <span></span><span></span><span></span>
          </button>
          ${logo()}
        </div>
        <div class="encabezado__acciones">
          <button type="button" class="encabezado__sede solo-desktop" data-accion="abrir-sede">${escapar(e.sede)} ▾</button>
          <a class="encabezado__ingreso solo-desktop" href="${enlaceCuenta(e)}">${textoCuenta(e)}</a>
          <a class="encabezado__ingreso-mobile solo-mobile" href="${enlaceCuenta(e)}">${e.sesionIniciada ? NOMBRE_USUARIO : 'Ingresar'}</a>
        </div>
      </div>
      <button type="button" class="encabezado__sede-mobile solo-mobile" data-accion="abrir-sede">Sede: <b>${escapar(e.sede)}</b> ▾</button>
      <nav class="contenedor navegacion solo-desktop" aria-label="Principal">
        ${NAVEGACION.map(([texto, clave]) => `<a href="${pagina(clave)}" ${clave === activa ? 'class="esta-activo" aria-current="page"' : ''}>${texto}</a>`).join('')}
      </nav>
    </header>`;
  }

  function encabezadoVolver() {
    const { volver = {}, paso } = opciones;
    return `<header class="barra-volver">
      <div class="banda banda--filete">
        <div class="contenedor barra-volver__interior">
          <a class="barra-volver__enlace" href="${volver.enlace}">← ${volver.texto}</a>
          ${logo('logo--mediano')}
        </div>
      </div>
      ${paso != null ? `<div class="pasos-linea"><div class="contenedor">${barraPasos(['Carrito', 'Pago', 'Confirmación'], paso)}</div></div>` : ''}
    </header>`;
  }

  function encabezadoOk(e) {
    return `<header class="barra-ok">
      <div class="banda banda--filete solo-desktop">
        <div class="contenedor barra-ok__interior">
          ${logo()}
          <div class="barra-ok__acciones">
            ${e.sesionIniciada ? `<a href="${pagina('pedidos')}">Mis pedidos</a>` : ''}
            <a class="barra-ok__ingreso" href="${enlaceCuenta(e)}">${textoCuenta(e)}</a>
          </div>
        </div>
      </div>
      <div class="contenedor barra-ok__cerrar solo-mobile"><a href="${pagina('inicio')}" aria-label="Cerrar y volver al inicio">✕</a></div>
    </header>`;
  }

  function pie(e) {
    const enlaces = [['Pedí Online', 'carta'], ['Beneficios', 'beneficios'], ['Eventos', 'eventos'], ['Catering', 'catering']]
      .concat(e.sesionIniciada ? [['Mis pedidos', 'pedidos']] : []);
    return `<footer class="pie banda banda--filete">
      <div class="contenedor pie__interior">
        <div class="pie__principal">
          <span class="logo logo--grande">SUSHI<span>CLUB</span></span>
          <nav class="pie__enlaces" aria-label="Pie de página">${enlaces.map(([texto, clave]) => `<a href="${pagina(clave)}">${texto}</a>`).join('')}</nav>
        </div>
        <div class="pie__redes">
          <button type="button" data-accion="proximamente">Instagram</button>
          <button type="button" data-accion="proximamente">Twitter</button>
          <button type="button" data-accion="proximamente">Email</button>
        </div>
      </div>
    </footer>`;
  }

  function menuLateral(e) {
    const items = NAVEGACION.concat(e.sesionIniciada ? [['Mis pedidos', 'pedidos']] : []);
    const activa = ALIAS_NAVEGACION[paginaActual] || paginaActual;
    return `<div class="menu-fondo" data-accion="cerrar-menu"></div>
    <nav class="menu-lateral" id="menu-lateral" aria-label="Menú">
      <div class="menu-lateral__cabecera">${logo('logo--chico')}<button type="button" class="menu-lateral__cerrar" data-accion="cerrar-menu" aria-label="Cerrar menú">✕</button></div>
      <button type="button" class="menu-lateral__sede" data-accion="abrir-sede"><span>Sede: <b>${escapar(e.sede)}</b></span><span>Cambiar ▾</span></button>
      ${items.map(([texto, clave]) => `<a href="${pagina(clave)}" class="menu-lateral__enlace ${clave === activa ? 'esta-activo' : ''}">${texto}</a>`).join('')}
      <a href="${enlaceCuenta(e)}" class="boton menu-lateral__ingreso">${textoCuenta(e)}</a>
    </nav>`;
  }

  function barraCarrito(e) {
    const r = resumenCarrito(e);
    if (SIN_BARRA_CARRITO.includes(paginaActual) || opciones.barraCarrito === false || (r.cantidad === 0 && !r.hayEvento)) return '';
    const productos = r.cantidad ? r.cantidad + (r.cantidad === 1 ? ' producto' : ' productos') : 'Sin productos';
    return `<div class="barra-carrito" role="region" aria-label="Mi carrito">
      <div class="contenedor barra-carrito__interior">
        <div class="barra-carrito__info">
          <span class="barra-carrito__titulo">Mi carrito</span>
          <span class="barra-carrito__productos">${productos}</span>
          ${r.hayEvento ? `<span class="barra-carrito__evento"><span class="insignia insignia--mini">${r.eventos.length === 1 ? 'EVENTO' : 'EVENTOS'}</span>${r.eventos.length === 1
            ? `${r.eventos[0].nombre} · ${r.eventos[0].personas} pers.`
            : `${r.eventos.length} reservas`} · seña ${moneda(r.sena)}</span>` : ''}
        </div>
        <div class="barra-carrito__derecha">
          <div class="barra-carrito__total"><span>TOTAL</span><strong>${moneda(r.total)}</strong></div>
          <a class="boton" href="${pagina('carrito')}">Ir al checkout →</a>
        </div>
      </div>
    </div>`;
  }

  // ---- Aviso (toast) ----
  let temporizadorAviso;

  function aviso(mensaje) {
    const el = $('#aviso');
    if (!el) return;
    el.textContent = mensaje;
    el.hidden = false;
    clearTimeout(temporizadorAviso);
    temporizadorAviso = setTimeout(() => { el.hidden = true; }, 2400);
  }

  // Muestra el aviso en la próxima página (cuando la acción navega). Viaja en el estado,
  // así funciona también abriendo los archivos con doble click en cualquier navegador.
  function avisoSiguiente(mensaje) {
    almacen.actualizar({ avisoPendiente: mensaje }, { silencioso: true });
  }

  // ---- Montaje ----
  function dibujar() {
    const e = almacen.obtener();
    const tipo = opciones.encabezado || 'principal';
    const encabezado = tipo === 'ninguno' ? '' : tipo === 'volver' ? encabezadoVolver() : tipo === 'ok' ? encabezadoOk(e) : encabezadoPrincipal(e);
    $('#zona-encabezado').innerHTML = encabezado;
    $('#zona-pie').innerHTML = opciones.pie === false ? '' : pie(e);
    $('#zona-menu').innerHTML = tipo === 'principal' ? menuLateral(e) : '';
    $('#zona-barra-carrito').innerHTML = barraCarrito(e);
    ajustarEspacioBarra();
  }

  // Reserva espacio para que la barra fija no tape el final de la página.
  function ajustarEspacioBarra() {
    const barra = $('#zona-barra-carrito').firstElementChild;
    const alto = barra ? barra.offsetHeight + 'px' : '';
    document.body.style.paddingBottom = alto;
    document.body.style.setProperty('--alto-barra-carrito', alto || '0px');
  }

  function cambiarMenu(abierto) {
    document.body.classList.toggle('menu-abierto', abierto);
    const hamburguesa = $('.hamburguesa');
    if (hamburguesa) hamburguesa.setAttribute('aria-expanded', String(abierto));
    if (abierto) $('.menu-lateral__cerrar')?.focus();
  }

  // opciones: { pagina, encabezado: 'principal' | 'volver' | 'ok' | 'ninguno', volver: { texto, enlace }, paso, pie, barraCarrito }
  function montarLayout(opcionesPagina) {
    opciones = opcionesPagina;
    paginaActual = opcionesPagina.pagina;
    document.body.dataset.pagina = paginaActual;

    const principal = $('#principal');
    principal.insertAdjacentHTML('beforebegin', '<a class="salto-contenido" href="#principal">Saltar al contenido</a><div id="zona-encabezado"></div>');
    principal.insertAdjacentHTML('afterend', '<div id="zona-pie"></div><div id="zona-barra-carrito"></div><div id="zona-menu"></div><div id="zona-modal"></div><div id="aviso" class="aviso" role="status" aria-live="polite" hidden></div>');
    principal.tabIndex = -1;

    if (!SIN_VOLVER.includes(paginaActual)) almacen.actualizar({ ultimaPagina: rutaActual() }, { silencioso: true });

    dibujar();
    almacen.suscribir(dibujar);
    montarModales();

    delegar(document.body, 'click', {
      'abrir-menu': () => cambiarMenu(true),
      'cerrar-menu': () => cambiarMenu(false),
      'abrir-sede': () => { cambiarMenu(false); abrirModal('sede'); },
      proximamente: () => aviso(PROXIMAMENTE),
    });
    document.addEventListener('keydown', ev => {
      if (ev.key === 'Escape' && document.body.classList.contains('menu-abierto')) cambiarMenu(false);
    });
    window.addEventListener('resize', ajustarEspacioBarra);

    const { avisoPendiente } = almacen.obtener();
    if (avisoPendiente) {
      almacen.actualizar({ avisoPendiente: null }, { silencioso: true });
      aviso(avisoPendiente);
    }
  }

  SushiClub.layout = { PROXIMAMENTE, aviso, avisoSiguiente, montarLayout };
})();
