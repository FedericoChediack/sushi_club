import { montarLayout, aviso, avisoSiguiente } from './shared/layout.js';
import { almacen, cambiarCantidad, reservarEvento } from './shared/store.js';
import { EVENTOS } from './shared/data.js';
import { $, delegar, ir, pagina, productoPorId } from './shared/utils.js';
import { tarjetaProducto, accionesProducto } from './shared/components.js';
import { abrirModal } from './shared/modals.js';

montarLayout({ pagina: 'inicio' });

const DESTACADOS = ['nyr', 'salmon', 'ebi'];

function dibujar() {
  const e = almacen.obtener();
  $('#inicio-productos').innerHTML = DESTACADOS
    .map(id => tarjetaProducto(productoPorId(id), e, 'inicio'))
    .join('');

  $('#inicio-eventos').innerHTML = EVENTOS.map(ev => {
    const reservado = e.reservaEvento?.id === ev.id;
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
  'agregar-portada': () => {
    cambiarCantidad('combo45', Math.max(1, almacen.obtener().carrito.combo45 || 0));
    avisoSiguiente('Sumamos el Combinado Club 45 a tu pedido');
    ir(pagina('carta'));
  },
  reservar: el => {
    reservarEvento(el.dataset.id);
    aviso('Sumamos tu reserva. Seguí mirando o andá al checkout.');
  },
});

// Primera visita: elegir sede y servicio.
if (!almacen.obtener().bienvenida) abrirModal('sede');
