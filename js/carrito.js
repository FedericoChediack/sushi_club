(() => {
  const { montarLayout, aviso } = SushiClub.layout;
  const { almacen, cambiarCantidad, quitarProducto, deshacerQuitar, quitarReserva, cambiarPersonasEvento } = SushiClub.estado;
  const { $, delegar, moneda, escapar, resumenCarrito, ir, pagina, enlace, rutaSegura } = SushiClub.utilidades;
  const { selectorCantidad, imagen } = SushiClub.componentes;

  // Un "deshacer" viejo no tiene sentido al volver a entrar.
  almacen.actualizar({ deshacer: null }, { silencioso: true });

  montarLayout({
    pagina: 'carrito',
    encabezado: 'volver',
    volver: { texto: 'Volver', enlace: enlace(rutaSegura(almacen.obtener().ultimaPagina, 'pages/carta.html')) },
    paso: 0,
  });

  function cambiarPersonas(id, n) {
    if (!cambiarPersonasEvento(id, n)) aviso('Para más de 12 personas, consultá por Catering');
  }

  function cajaEvento(ev) {
    return `<div class="caja-evento carrito-evento">
      <span class="insignia">EVENTO · RESERVA DE LUGAR</span>
      <div class="fila carrito-evento__cabecera"><span class="carrito-evento__nombre">${ev.nombre}</span><span class="carrito-evento__precio">${moneda(ev.sena)}</span></div>
      <span class="carrito-evento__cuando">${ev.dia} · ${ev.hora} · Exclusivo sucursal ${ev.sede}</span>
      <span class="carrito-evento__nota">Seña del 30% sobre ${moneda(ev.totalEvento)}. El resto se abona en el salón.</span>
      <div class="carrito-item__acciones">
        <button type="button" class="boton-texto" data-accion="quitar-evento" data-id="${ev.id}">Quitar reserva</button>
        ${selectorCantidad(ev.personas, { id: ev.id, restar: 'restar-personas', sumar: 'sumar-personas', texto: `${ev.personas} pers.`, clase: 'carrito-evento__cantidad' })}
      </div>
    </div>`;
  }

  function lista(e, r) {
    return `${r.eventos.map(cajaEvento).join('')}
      ${r.vacio ? `<p class="carrito-vacio">Tu carrito está vacío. <a class="enlace-rojo" href="${pagina('carta')}">Ver la carta →</a></p>` : ''}
      ${r.items.map(i => `<div class="carrito-item">
        ${imagen(i.imagen, i.nombre, 'imagen--cuadrada')}
        <div class="carrito-item__cuerpo">
          <div class="fila"><span class="carrito-item__nombre">${i.nombre}</span><span class="carrito-item__subtotal">${moneda(i.subtotal)}</span></div>
          <span class="carrito-item__descripcion">${i.descripcion}</span>
          <div class="carrito-item__acciones">
            <button type="button" class="boton-texto" data-accion="eliminar" data-id="${i.id}" data-nombre="${escapar(i.nombre)}">Eliminar</button>
            ${selectorCantidad(i.cantidad, { id: i.id })}
          </div>
        </div>
      </div>`).join('')}
      ${e.deshacer ? `<div class="carrito-deshacer" role="status"><span>Eliminaste ${escapar(e.deshacer.nombre)}</span><button type="button" data-accion="deshacer">Deshacer</button></div>` : ''}`;
  }

  function panel(e, r) {
    const retiro = e.modo === 'retiro';
    return `<h2 class="panel__titulo">Elegí lo que prefieras</h2>
      <span class="carrito-panel__bajada">Nosotros nos encargamos del resto.</span>
      ${r.hayComida ? `
        <button type="button" class="tarjeta-radio ${retiro ? 'esta-activo' : ''}" data-accion="modo" data-valor="retiro" aria-pressed="${retiro}">
          <span class="tarjeta-radio__punto"></span>
          <span class="tarjeta-radio__texto"><span class="tarjeta-radio__titulo">Retirá en el local</span><span class="tarjeta-radio__detalle">${escapar(e.sede)} · listo en 25 min · sin costo</span></span>
        </button>
        <button type="button" class="tarjeta-radio ${!retiro ? 'esta-activo' : ''}" data-accion="modo" data-valor="delivery" aria-pressed="${!retiro}">
          <span class="tarjeta-radio__punto"></span>
          <span class="tarjeta-radio__texto"><span class="tarjeta-radio__titulo">Delivery</span><span class="tarjeta-radio__detalle">45–60 min · $ 2.500</span></span>
          <span aria-hidden="true">${retiro ? '▾' : '▴'}</span>
        </button>
        ${!retiro ? '<span class="carrito-panel__ayuda">Indicás la dirección en el próximo paso.</span>' : ''}` : ''}
      <div class="panel__lineas separador-arriba carrito-panel__lineas">
        ${r.hayComida ? `<div class="fila"><span>Subtotal</span><span>${moneda(r.subtotal)}</span></div>
        <div class="fila"><span>Envío</span><span>${r.envio ? moneda(r.envio) : 'Sin costo'}</span></div>` : ''}
        ${r.eventos.map(ev => `<div class="fila"><span>Seña ${ev.nombre} (30%)</span><span>${moneda(ev.sena)}</span></div>`).join('')}
      </div>
      <div class="panel__total"><span>Total a pagar</span><strong>${moneda(r.total)}</strong></div>
      <button type="button" class="boton boton--ancho boton--grande ${r.vacio ? 'esta-deshabilitado' : ''}" data-accion="ir-pago" aria-disabled="${r.vacio}">Continuar al pago →</button>`;
  }

  function dibujar() {
    const e = almacen.obtener();
    const r = resumenCarrito(e);
    $('#carrito-lista').innerHTML = lista(e, r);
    $('#carrito-panel').innerHTML = panel(e, r);
  }

  dibujar();
  almacen.suscribir(dibujar);

  delegar($('#principal'), 'click', {
    sumar: el => cambiarCantidad(el.dataset.id, almacen.obtener().carrito[el.dataset.id] + 1),
    restar: el => cambiarCantidad(el.dataset.id, almacen.obtener().carrito[el.dataset.id] - 1),
    eliminar: el => quitarProducto(el.dataset.id, el.dataset.nombre),
    deshacer: () => deshacerQuitar(),
    'quitar-evento': el => quitarReserva(el.dataset.id),
    'restar-personas': el => cambiarPersonas(el.dataset.id, almacen.obtener().reservas[el.dataset.id] - 1),
    'sumar-personas': el => cambiarPersonas(el.dataset.id, almacen.obtener().reservas[el.dataset.id] + 1),
    modo: el => almacen.actualizar({ modo: el.dataset.valor }),
    'ir-pago': () => {
      if (resumenCarrito(almacen.obtener()).vacio) { aviso('Agregá al menos un producto para continuar'); return; }
      ir(pagina('pago'));
    },
  });
})();
