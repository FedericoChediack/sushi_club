import { montarLayout, aviso } from './shared/layout.js';
import { almacen, reservarEvento } from './shared/store.js';
import { EVENTOS } from './shared/data.js';
import { $, delegar, moneda, pagina } from './shared/utils.js';

montarLayout({ pagina: 'eventos' });

function dibujar() {
  const e = almacen.obtener();
  $('#eventos-grilla').innerHTML = EVENTOS.map(ev => {
    const reservado = e.reservaEvento?.id === ev.id;
    const detalle = pagina('evento', '?id=' + ev.id);
    return `<article class="evento-tarjeta">
      <div class="evento-tarjeta__superior"><span class="evento-tarjeta__fecha">${ev.fecha}</span><span class="evento-tarjeta__precio">${moneda(ev.precio)} por persona</span></div>
      <a class="imagen imagen--panoramica" href="${detalle}" tabindex="-1" aria-hidden="true"><img src="${ev.imagen}" alt="" loading="lazy"></a>
      <h2 class="evento-tarjeta__nombre"><a href="${detalle}">${ev.nombre}</a></h2>
      <span class="evento-tarjeta__cuando">${ev.dia} · ${ev.hora}</span>
      <span class="insignia evento-tarjeta__sede">Exclusivo sucursal ${ev.sede}</span>
      <p class="evento-tarjeta__descripcion">${ev.descripcion}</p>
      <div class="evento-tarjeta__acciones">
        <button type="button" class="boton ${reservado ? 'esta-reservado' : ''}" data-accion="reservar" data-id="${ev.id}">${reservado ? 'Reservado ✓' : 'Reservar'}</button>
        <a class="boton boton--borde" href="${detalle}">Ver detalle</a>
      </div>
    </article>`;
  }).join('');
}

dibujar();
almacen.suscribir(dibujar);

delegar($('#principal'), 'click', {
  reservar: el => {
    reservarEvento(el.dataset.id);
    aviso('Sumamos tu reserva. Seguí mirando o andá al checkout.');
  },
});
