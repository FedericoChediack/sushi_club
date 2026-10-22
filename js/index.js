(() => {
  const { montarLayout, aviso } = SushiClub.layout;
  const { almacen, reservarEvento } = SushiClub.estado;
  const { EVENTOS } = SushiClub.datos;
  const { $, delegar, ir, pagina, productoPorId } = SushiClub.utilidades;
  const { tarjetaProducto, accionesProducto } = SushiClub.componentes;
  const { abrirModal } = SushiClub.modales;

  montarLayout({ pagina: 'inicio' });

  const DESTACADOS = ['nyr', 'salmon', 'ebi'];

  function dibujar() {
    const e = almacen.obtener();
    $('#inicio-productos').innerHTML = DESTACADOS
      .map(id => tarjetaProducto(productoPorId(id), e, 'inicio'))
      .join('');

    $('#inicio-eventos').innerHTML = EVENTOS.map(ev => {
      const reservado = ev.id in e.reservas;
      const detalle = pagina('evento', '?id=' + ev.id);
      return `<article class="inicio-evento">
        <span class="inicio-evento__fecha">${ev.fecha}</span>
        <a class="inicio-evento__nombre" href="${detalle}">${ev.nombre}</a>
        <a class="imagen inicio-evento__imagen solo-desktop" href="${detalle}" tabindex="-1" aria-hidden="true"><img src="${ev.imagen}" alt="" loading="lazy"></a>
        <button type="button" class="boton boton--borde inicio-evento__boton" data-accion="reservar" data-id="${ev.id}">${reservado ? 'Reservado ✓' : 'Reservar'}</button>
      </article>`;
    }).join('');
  }

  dibujar();
  almacen.suscribir(dibujar);

  delegar($('#principal'), 'click', {
    ...accionesProducto,
    reservar: el => {
      reservarEvento(el.dataset.id);
      aviso('Sumamos tu reserva. Seguí mirando o andá al checkout.');
    },
  });

  // Primera visita: elegir sede y servicio.
  if (!almacen.obtener().bienvenida) abrirModal('sede');
})();
