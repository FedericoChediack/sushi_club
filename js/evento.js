(() => {
  const { montarLayout, aviso } = SushiClub.layout;
  const { almacen, reservarEvento, cambiarPersonasEvento } = SushiClub.estado;
  const { EVENTOS, SENA_EVENTO } = SushiClub.datos;
  const { $, delegar, moneda, parametro, eventoPorId } = SushiClub.utilidades;
  const { selectorCantidad } = SushiClub.componentes;

  montarLayout({ pagina: 'evento' });

  const evento = eventoPorId(parametro('id')) || EVENTOS[0];
  document.title = `${evento.nombre} · Eventos · SushiClub`;

  const estaReservado = e => evento.id in e.reservas;
  const personas = e => (estaReservado(e) ? e.reservas[evento.id] : e.personasEvento || 2);

  function dibujar() {
    const e = almacen.obtener();
    const cantidad = personas(e);
    const sena = moneda(Math.round(evento.precio * SENA_EVENTO * cantidad));
    const reservado = estaReservado(e);
    $('#ev-detalle').innerHTML = `
      <div class="imagen ev-detalle__imagen"><img src="${evento.imagen}" alt="${evento.nombre}"></div>
      <div class="ev-detalle__info">
        <span class="ev-detalle__fecha">${evento.fecha}</span>
        <h1 class="titulo-pantalla">${evento.nombre}</h1>
        <p class="ev-detalle__descripcion">${evento.descripcion}</p>
        <dl class="ev-detalle__datos">
          <div><dt>Fecha</dt><dd>${evento.dia}</dd></div>
          <div><dt>Horario</dt><dd>${evento.hora}</dd></div>
          <div><dt>Sede</dt><dd>Exclusivo sucursal ${evento.sede}</dd></div>
          <div><dt>Valor</dt><dd>${moneda(evento.precio)} por persona</dd></div>
          <div><dt>Cupos</dt><dd class="es-alerta">${evento.cupos}</dd></div>
        </dl>
        <div class="ev-detalle__incluye">
          <span class="ev-detalle__incluye-titulo">INCLUYE</span>
          <ul>${evento.incluye.map(i => `<li>${i}</li>`).join('')}</ul>
        </div>
        <div class="ev-detalle__personas"><span>Personas</span>${selectorCantidad(cantidad, { restar: 'restar-personas', sumar: 'sumar-personas', clase: 'ev-detalle__cantidad' })}</div>
        <button type="button" class="boton boton--ancho boton--grande ${reservado ? 'esta-reservado' : ''}" data-accion="reservar">${reservado ? 'Lugar reservado ✓' : 'Reservar lugar'} · seña ${sena}</button>
        <span class="ev-detalle__nota">Reservás con una seña del 30%. El resto se abona en el salón.</span>
      </div>`;
  }

  // Cambia la cantidad de personas (si el evento ya está reservado, también la reserva).
  function cambiarPersonas(n) {
    if (!cambiarPersonasEvento(evento.id, n)) aviso('Para más de 12 personas, consultá por Catering');
  }

  dibujar();
  almacen.suscribir(dibujar);

  delegar($('#principal'), 'click', {
    'restar-personas': () => cambiarPersonas(personas(almacen.obtener()) - 1),
    'sumar-personas': () => cambiarPersonas(personas(almacen.obtener()) + 1),
    reservar: () => {
      reservarEvento(evento.id, personas(almacen.obtener()));
      aviso('Sumamos tu reserva. Seguí mirando o andá al checkout.');
    },
  });
})();
