// Modal de sede (paso 1) y modal de servicio (paso 2).
import { almacen } from './store.js';
import { SEDES } from './data.js';
import { escapar, delegar, pagina, $, $$ } from './utils.js';
import { aviso } from './layout.js';

let modalActual = null;
let busqueda = '';
let focoPrevio = null;

function listaSedes() {
  const e = almacen.obtener();
  const texto = busqueda.trim().toLowerCase();
  const zonas = SEDES
    .map(z => ({ ...z, sedes: z.sedes.filter(([nombre, direccion]) => !texto || `${nombre} ${direccion} ${z.zona}`.toLowerCase().includes(texto)) }))
    .filter(z => z.sedes.length);
  if (!zonas.length) return `<p class="lista-sedes__vacio">No encontramos sedes con “${escapar(busqueda)}”. Probá con otra zona.</p>`;
  return zonas.map(z => `<div class="lista-sedes__zona">
    <span class="lista-sedes__etiqueta">${z.zona}</span>
    ${z.sedes.map(([nombre, direccion]) => {
      const activa = e.sede === nombre;
      const estado = z.cerrada ? 'Abre en diciembre' : activa ? '● Seleccionada' : 'Abierto hasta 00 h';
      return `<button type="button" class="sede ${activa ? 'esta-activo' : ''} ${z.cerrada ? 'esta-cerrado' : ''}" ${z.cerrada ? 'disabled' : `data-accion="elegir-sede" data-valor="${escapar(nombre)}"`} aria-pressed="${activa}">
        <span class="sede__texto"><span class="sede__nombre">${nombre}</span><span class="sede__direccion">${direccion}</span></span>
        <span class="sede__estado">${estado}</span>
      </button>`;
    }).join('')}
  </div>`).join('');
}

function modalSede() {
  const e = almacen.obtener();
  return `<div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-titulo">
    <div class="modal__cabecera banda banda--filete">
      <div class="modal__superior"><span class="antetitulo">PASO 1 DE 2</span><button type="button" class="modal__cerrar" data-accion="cerrar-modal" aria-label="Cerrar">✕</button></div>
      <h2 class="modal__titulo" id="modal-titulo">¿Dónde estás?</h2>
      <p class="modal__bajada">Elegí tu sede para ver la carta, precios y horarios de ese local.</p>
    </div>
    <div class="modal__busqueda">
      <input class="entrada" type="search" id="busqueda-sede" value="${escapar(busqueda)}" placeholder="Buscá por barrio o ciudad" aria-label="Buscar sede">
      <button type="button" class="boton boton--borde boton--chico" data-accion="usar-ubicacion">◎ Usar mi ubicación</button>
    </div>
    <div class="lista-sedes" id="lista-sedes">${listaSedes()}</div>
    <div class="modal__pie">
      <span class="modal__seleccion">Seleccionada: <b>${escapar(e.sede)}</b></span>
      <button type="button" class="boton" data-accion="continuar-sede">Continuar →</button>
    </div>
  </div>`;
}

function modalServicio() {
  const e = almacen.obtener();
  const servicios = [
    { titulo: 'Pedí online', descripcion: `Delivery en 45–60 min o retiro en ${escapar(e.sede)} en 25 min.`, enlace: pagina('carta'), destacado: true },
    { titulo: 'Eventos', descripcion: 'Cenas de gala, jazz, omakase y catas.', enlace: pagina('eventos') },
    { titulo: 'Regalar sushi', descripcion: 'SushiGift con tarjeta personalizada.', enlace: pagina('gift') },
    { titulo: 'Catering', descripcion: 'Para eventos de 20 a 500 personas.', enlace: pagina('catering') },
  ];
  return `<div class="modal modal--ancho" role="dialog" aria-modal="true" aria-labelledby="modal-titulo">
    <div class="modal__cabecera banda">
      <div class="modal__superior"><span class="antetitulo antetitulo--suave">PASO 2 DE 2 · ${escapar(e.sede.toUpperCase())}</span><button type="button" class="modal__cerrar" data-accion="cerrar-modal" aria-label="Cerrar">✕</button></div>
      <h2 class="modal__titulo" id="modal-titulo">¿Qué querés hacer hoy?</h2>
      <p class="modal__bajada modal__bajada--suave">Elegí el momento. Nosotros nos ocupamos del resto.</p>
    </div>
    <div class="servicios">
      ${servicios.map(s => `<a class="servicio ${s.destacado ? 'servicio--destacado' : ''}" href="${s.enlace}" data-accion="bienvenida">
        <span class="servicio__titulo">${s.titulo} →</span><span class="servicio__descripcion">${s.descripcion}</span>
      </a>`).join('')}
    </div>
    <div class="modal__enlaces">
      <button type="button" data-accion="volver-sede">← Cambiar sede</button>
      <button type="button" class="esta-apagado" data-accion="cerrar-modal">Solo quiero mirar</button>
    </div>
  </div>`;
}

function dibujar() {
  const zona = $('#zona-modal');
  if (!modalActual) { zona.innerHTML = ''; return; }
  zona.innerHTML = `<div class="fondo-modal" data-accion="cerrar-modal"></div>${modalActual === 'sede' ? modalSede() : modalServicio()}`;
  const primero = modalActual === 'sede' ? $('#busqueda-sede') : $('.servicio', zona);
  primero?.focus({ preventScroll: true });
}

export function abrirModal(nombre) {
  if (!modalActual) focoPrevio = document.activeElement;
  modalActual = nombre;
  document.body.classList.add('con-modal');
  dibujar();
}

export function cerrarModal() {
  modalActual = null;
  almacen.actualizar({ bienvenida: true }, { silencioso: true });
  document.body.classList.remove('con-modal');
  dibujar();
  focoPrevio?.focus?.();
}

export function montarModales() {
  const zona = $('#zona-modal');
  delegar(zona, 'click', {
    'cerrar-modal': () => cerrarModal(),
    'elegir-sede': el => {
      almacen.actualizar({ sede: el.dataset.valor });
      $('#lista-sedes').innerHTML = listaSedes();
      $('.modal__seleccion b').textContent = el.dataset.valor;
    },
    'usar-ubicacion': () => {
      busqueda = '';
      almacen.actualizar({ sede: 'Palermo Soho' });
      dibujar();
      aviso('Encontramos la sede más cercana: Palermo Soho');
    },
    'continuar-sede': () => abrirModal('servicio'),
    'volver-sede': () => abrirModal('sede'),
    bienvenida: () => almacen.actualizar({ bienvenida: true }, { silencioso: true }),
  });
  zona.addEventListener('input', ev => {
    if (ev.target.id !== 'busqueda-sede') return;
    busqueda = ev.target.value;
    $('#lista-sedes').innerHTML = listaSedes();
  });
  document.addEventListener('keydown', ev => {
    if (!modalActual) return;
    if (ev.key === 'Escape') { cerrarModal(); return; }
    if (ev.key !== 'Tab') return;
    // Mantiene el foco dentro del modal.
    const enfocables = $$('.modal button:not([disabled]), .modal a, .modal input', zona);
    if (!enfocables.length) return;
    const primero = enfocables[0];
    const ultimo = enfocables[enfocables.length - 1];
    if (ev.shiftKey && document.activeElement === primero) { ev.preventDefault(); ultimo.focus(); }
    else if (!ev.shiftKey && document.activeElement === ultimo) { ev.preventDefault(); primero.focus(); }
  });
}
