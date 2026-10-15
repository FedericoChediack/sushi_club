import { montarLayout } from './shared/layout.js';
import { almacen } from './shared/store.js';
import { $, datosPedido, enlaceIngreso, pagina } from './shared/utils.js';

montarLayout({ pagina: 'confirmacion', encabezado: 'ok', pie: false });

function dibujar() {
  const e = almacen.obtener();
  const p = datosPedido(e);
  $('#confirmacion-llegada').textContent = p.llegada;
  $('#confirmacion-pedido').textContent = `Pedido ${p.numero} · ${p.totalTexto}`;
  $('#confirmacion-invitado').hidden = e.sesionIniciada;
  const principal = $('#confirmacion-principal');
  principal.href = e.sesionIniciada ? pagina('pedidos') : enlaceIngreso('pages/pedidos.html');
  principal.textContent = e.sesionIniciada ? 'Ver estado en Mis pedidos' : 'Iniciá sesión / Registro';
}

dibujar();
almacen.suscribir(dibujar);
