import { montarLayout, aviso, avisoSiguiente } from './shared/layout.js';
import { almacen } from './shared/store.js';
import { PEDIDOS_ANTERIORES } from './shared/data.js';
import { $, delegar, datosPedido, enlaceIngreso, ir, pagina } from './shared/utils.js';

montarLayout({ pagina: 'pedidos' });

function dibujar() {
  const e = almacen.obtener();
  const p = datosPedido(e);
  $('#pedidos-contenido').innerHTML = `
    ${!e.sesionIniciada ? `<div class="pedidos__invitado">
      <span>Estás viendo tu último pedido como invitado. Iniciá sesión para ver tu historial.</span>
      <a class="boton boton--claro boton--chico" href="${enlaceIngreso('pages/pedidos.html')}">Iniciar sesión</a>
    </div>` : ''}

    <section class="pedido-tarjeta" aria-labelledby="pedido-llegada">
      <div class="pedido-tarjeta__cabecera">
        <div class="pedido-tarjeta__titulo">
          <span class="pedido-tarjeta__modo">EN CURSO · ${p.etiquetaModo}</span>
          <h2 class="pedido-tarjeta__llegada" id="pedido-llegada">${p.llegada}</h2>
        </div>
        <span class="texto-mono">Pedido ${p.numero}</span>
      </div>
      <ol class="seguimiento" aria-label="Estado del pedido">
        ${p.seguimiento.map(s => `<li class="seguimiento__paso ${s.hecho ? 'esta-hecho' : ''} ${s.actual ? 'esta-actual' : ''}" ${s.actual ? 'aria-current="step"' : ''}>
          <span class="seguimiento__barra"></span>
          <span class="seguimiento__etiqueta">${s.etiqueta}</span>
          <span class="seguimiento__hora">${s.hora}</span>
        </li>`).join('')}
      </ol>
      <div class="pedido-tarjeta__items">
        ${p.items.map(i => `<div class="fila"><span>${i.cantidad} × ${i.nombre}</span><span>${i.subtotalTexto}</span></div>`).join('')}
        <div class="fila pedido-tarjeta__total"><span>Total</span><span>${p.totalTexto}</span></div>
      </div>
      <p class="pedido-tarjeta__ayuda">¿Algún problema con tu pedido? <button type="button" class="enlace-rojo" data-accion="whatsapp">Escribinos por WhatsApp</button></p>
    </section>

    ${e.sesionIniciada ? `<section aria-labelledby="titulo-anteriores">
      <h2 class="pedidos__titulo-anteriores" id="titulo-anteriores">Anteriores</h2>
      ${PEDIDOS_ANTERIORES.map(a => `<div class="pedido-anterior">
        <div class="pedido-anterior__info"><span class="pedido-anterior__productos">${a.productos}</span><span class="texto-mono">${a.id} · ${a.fecha} · ${a.total}</span></div>
        <button type="button" class="boton boton--borde boton--chico" data-accion="repetir" data-id="${a.id}">Repetir pedido</button>
      </div>`).join('')}
    </section>` : ''}`;
}

dibujar();
almacen.suscribir(dibujar);

delegar($('#principal'), 'click', {
  whatsapp: () => aviso('Se abre WhatsApp con el equipo de SushiClub'),
  repetir: el => {
    const pedido = PEDIDOS_ANTERIORES.find(a => a.id === el.dataset.id);
    almacen.actualizar({ carrito: { ...pedido.carrito } }, { silencioso: true });
    avisoSiguiente(`Cargamos el pedido ${pedido.id} en tu carrito`);
    ir(pagina('carrito'));
  },
});
