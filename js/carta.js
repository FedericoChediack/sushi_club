import { montarLayout } from './shared/layout.js';
import { almacen } from './shared/store.js';
import { PRODUCTOS, CATEGORIAS } from './shared/data.js';
import { $, delegar, moneda, escapar, resumenCarrito, resumenModo, pagina } from './shared/utils.js';
import { tarjetaProducto, accionesProducto, fichas } from './shared/components.js';

montarLayout({ pagina: 'carta' });

let categoria = 'Todos';

function panel(e) {
  const r = resumenCarrito(e);
  return `<h2 class="panel__titulo">Tu pedido</h2>
    <span class="carta-panel__modo">${escapar(resumenModo(e))}</span>
    ${r.vacio ? '<span class="carta-panel__vacio">Todavía no agregaste nada.</span>' : ''}
    <div class="panel__lineas">${r.items.map(i => `<div class="fila"><span>${i.cantidad} × ${i.nombre}</span><span>${moneda(i.subtotal)}</span></div>`).join('')}</div>
    <div class="panel__total separador-arriba"><span>Subtotal</span><strong>${moneda(r.subtotal)}</strong></div>
    <a class="boton boton--ancho" href="${pagina('carrito')}">Ir al carrito →</a>`;
}

function dibujar() {
  const e = almacen.obtener();
  $('#carta-sede').textContent = e.sede.toUpperCase();
  $('#carta-categorias').innerHTML = fichas(CATEGORIAS, categoria, 'categoria');
  $('#carta-grilla').innerHTML = PRODUCTOS
    .filter(p => categoria === 'Todos' || p.categoria === categoria)
    .map(p => tarjetaProducto(p, e, 'carta'))
    .join('');
  $('#carta-panel').innerHTML = panel(e);
}

dibujar();
almacen.suscribir(dibujar);

delegar($('#principal'), 'click', {
  ...accionesProducto,
  categoria: el => { categoria = el.dataset.valor; dibujar(); },
});
