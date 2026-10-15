window.SushiClub = window.SushiClub || {};

(() => {
  // URL de este archivo (equivale a import.meta.url en un módulo).
  const URL_SCRIPT = document.currentScript.src;

  const { PRODUCTOS, EVENTOS, COSTO_DELIVERY, SENA_EVENTO } = SushiClub.datos;

  const moneda = n => '$ ' + n.toLocaleString('es-AR');

  // Escapa texto ingresado por el usuario antes de meterlo en innerHTML.
  const escapar = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const $ = (selector, raiz = document) => raiz.querySelector(selector);
  const $$ = (selector, raiz = document) => [...raiz.querySelectorAll(selector)];

  const parametro = nombre => new URLSearchParams(location.search).get(nombre);

  const productoPorId = id => PRODUCTOS.find(p => p.id === id);
  const eventoPorId = id => EVENTOS.find(e => e.id === id);

  // Los productos "Precio Club" se cobran a precio de lista si no hay sesión.
  const precioFinal = (p, sesionIniciada) => (p.seccion === 'club' && !sesionIniciada ? p.anterior : p.precio);

  function resumenCarrito(e) {
    const items = Object.keys(e.carrito)
      .map(id => productoPorId(id))
      .filter(Boolean)
      .map(p => {
        const cantidad = e.carrito[p.id];
        const unitario = precioFinal(p, e.sesionIniciada);
        return { ...p, cantidad, unitario, subtotal: unitario * cantidad };
      });
    const subtotal = items.reduce((a, i) => a + i.subtotal, 0);
    const cantidad = items.reduce((a, i) => a + i.cantidad, 0);
    const hayComida = items.length > 0;
    const envio = e.modo === 'delivery' && hayComida ? COSTO_DELIVERY : 0;
    // Reservas de eventos: cada una con su seña (30% del valor por persona).
    const eventos = Object.keys(e.reservas || {})
      .map(id => eventoPorId(id))
      .filter(Boolean)
      .map(ev => {
        const personas = e.reservas[ev.id];
        return { ...ev, personas, totalEvento: ev.precio * personas, sena: Math.round(ev.precio * SENA_EVENTO * personas) };
      });
    const hayEvento = eventos.length > 0;
    const sena = eventos.reduce((a, ev) => a + ev.sena, 0);
    return {
      items, subtotal, cantidad, envio, hayComida,
      eventos, hayEvento, sena,
      total: subtotal + envio + sena,
      vacio: !hayComida && !hayEvento,
    };
  }

  const resumenModo = e => (e.modo === 'delivery'
    ? 'Delivery · 45–60 min' + (e.direccion ? ' · ' + e.direccion : '')
    : 'Retiro en ' + e.sede + ' · 25 min');

  // Textos del último pedido (confirmación y Mis pedidos).
  function datosPedido(e) {
    const p = e.ultimoPedido;
    const delivery = p.modo === 'delivery';
    const etiquetas = p.modo === 'evento'
      ? ['Reservado', 'Seña recibida', 'Confirmación enviada', 'Te esperamos']
      : ['Confirmado', 'En preparación', delivery ? 'En camino' : 'Listo para retirar', delivery ? 'Entregado' : 'Retirado'];
    const horas = ['21:42', '21:45', '≈ 22:10', delivery ? '≈ 22:30' : ''];
    return {
      ...p,
      totalTexto: moneda(p.total),
      llegada: p.modo === 'evento'
        ? 'Tu lugar está reservado. Te mandamos la confirmación por email.'
        : delivery ? 'Tu pedido llega a las 22:30' : 'Tu pedido está listo a las 22:10 en ' + e.sede,
      etiquetaModo: p.modo === 'evento' ? 'RESERVA DE EVENTO' : delivery ? 'DELIVERY' : 'RETIRO EN ' + e.sede.toUpperCase(),
      seguimiento: etiquetas.map((etiqueta, i) => ({ etiqueta, hora: horas[i], hecho: i <= 1, actual: i === 1 })),
    };
  }

  // Raíz del sitio, calculada desde este módulo (js/shared/utils.js): funciona aunque el sitio
  // esté publicado en una subcarpeta.
  const RAIZ = new URL('../../', URL_SCRIPT).href;

  // Ruta relativa a la raíz -> URL absoluta. Ej.: enlace('pages/evento.html?id=gala')
  const enlace = ruta => new URL(ruta, RAIZ).href;

  // URL de una pantalla por nombre. Ej.: pagina('carta'), pagina('evento', '?id=gala'), pagina('inicio')
  const pagina = (nombre, consulta = '') => enlace((nombre === 'inicio' ? 'index.html' : `pages/${nombre}.html`) + consulta);

  // Ruta relativa a la raíz validada: descarta destinos fuera del sitio (p. ej. un ?next= manipulado).
  function rutaSegura(ruta, alternativa) {
    if (!ruta) return alternativa;
    try { return new URL(ruta, RAIZ).href.startsWith(RAIZ) ? ruta : alternativa; } catch (e) { return alternativa; }
  }

  // volver: ruta relativa a la raíz a la que se vuelve después de ingresar.
  const enlaceIngreso = (volver, pestana) => {
    const p = new URLSearchParams();
    if (pestana) p.set('pestana', pestana);
    if (volver) p.set('volver', volver);
    const consulta = p.toString();
    return pagina('login', consulta ? '?' + consulta : '');
  };

  // Página actual relativa a la raíz, con su consulta. Ej.: "pages/evento.html?id=gala".
  const rutaActual = () => {
    const aca = location.href.split('#')[0];
    return aca.startsWith(RAIZ) ? aca.slice(RAIZ.length) || 'index.html' : 'index.html';
  };

  // Navegación entre páginas (recibe una URL de pagina()/enlace()/enlaceIngreso()).
  function ir(url) {
    location.href = url;
  }

  // Delegación de eventos: acciones = { nombre: (el, evento) => {} }, se dispara con data-accion.
  function delegar(raiz, tipo, acciones) {
    raiz.addEventListener(tipo, ev => {
      const el = ev.target.closest('[data-accion]');
      if (!el || !raiz.contains(el)) return;
      const fn = acciones[el.dataset.accion];
      if (fn) fn(el, ev);
    });
  }

  SushiClub.utilidades = { moneda, escapar, $, $$, parametro, productoPorId, eventoPorId, precioFinal, resumenCarrito, resumenModo, datosPedido, RAIZ, enlace, pagina, rutaSegura, enlaceIngreso, rutaActual, ir, delegar };
})();
