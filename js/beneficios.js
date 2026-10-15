import { montarLayout } from './shared/layout.js';
import { almacen } from './shared/store.js';
import { PRODUCTOS } from './shared/data.js';
import { $, delegar, enlaceIngreso, rutaActual, pagina } from './shared/utils.js';
import { tarjetaProducto, accionesProducto } from './shared/components.js';

montarLayout({ pagina: 'beneficios' });

function capaBloqueo() {
  return `<div class="ben-bloqueo">
    <div class="ben-bloqueo__caja">
      <span class="insignia">SOLO SOCIOS</span>
      <span class="ben-bloqueo__titulo">Estos beneficios son exclusivos si sos miembro de SushiClub</span>
      <span class="ben-bloqueo__texto">Registrate o iniciá sesión para acceder a estos beneficios.</span>
      <div class="ben-bloqueo__acciones">
        <a class="boton boton--chico ben-bloqueo__boton" href="${enlaceIngreso('pages/club.html', 'registro')}">Registrarme gratis</a>
        <a class="boton boton--borde boton--chico ben-bloqueo__boton" href="${enlaceIngreso(rutaActual())}">Iniciar sesión</a>
      </div>
    </div>
  </div>`;
}

function dibujar() {
  const e = almacen.obtener();
  const secciones = [
    { id: 'todos', titulo: 'Beneficios para todos', bajada: 'Para todos · válidas hasta el domingo', productos: PRODUCTOS.filter(p => p.seccion === 'oferta') },
    { id: 'socios', titulo: 'Exclusivos socios SushiClub', bajada: e.sesionIniciada ? 'Tu precio de socio ya está aplicado' : 'Precio exclusivo para socios', conEnlace: true, bloqueada: !e.sesionIniciada, productos: PRODUCTOS.filter(p => p.seccion === 'club') },
  ];
  $('#ben-secciones').innerHTML = secciones.map(s => {
    const tarjetas = s.productos.map(p => tarjetaProducto(p, e, 'oferta')).join('');
    return `<section class="contenedor ben-seccion" aria-labelledby="ben-${s.id}">
      <div class="encabezado-seccion">
        <h2 class="titulo-seccion" id="ben-${s.id}">${s.titulo}</h2>
        <div class="encabezado-seccion__extra"><span>${s.bajada}</span>${s.conEnlace ? `<a class="enlace-rojo" href="${pagina('club')}">Ver todos los beneficios →</a>` : ''}</div>
      </div>
      <div class="ben-grilla ${s.bloqueada ? 'esta-bloqueado' : ''}">
        ${s.bloqueada ? `<div class="ben-grilla__inerte" inert aria-hidden="true">${tarjetas}</div>${capaBloqueo()}` : tarjetas}
      </div>
    </section>`;
  }).join('');
}

dibujar();
almacen.suscribir(dibujar);

delegar($('#principal'), 'click', accionesProducto);
