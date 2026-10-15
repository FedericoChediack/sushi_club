// Piezas de markup que se repiten en varias pantallas.
import { almacen, cambiarCantidad } from './store.js';
import { moneda, escapar, precioFinal, enlaceIngreso, rutaActual, ir } from './utils.js';

export function imagen(src, alt, clase = '') {
  return `<div class="imagen ${clase}"><img src="${src}" alt="${escapar(alt)}" loading="lazy"></div>`;
}

export function selectorCantidad(valor, { id = '', restar = 'restar', sumar = 'sumar', texto = valor, clase = '' } = {}) {
  const datos = id ? ` data-id="${id}"` : '';
  return `<div class="cantidad ${clase}">
    <button type="button" class="cantidad__boton" data-accion="${restar}"${datos} aria-label="Restar uno">−</button>
    <span class="cantidad__valor" aria-live="polite">${texto}</span>
    <button type="button" class="cantidad__boton cantidad__boton--mas" data-accion="${sumar}"${datos} aria-label="Sumar uno">+</button>
  </div>`;
}

// variante: 'inicio' | 'oferta' | 'carta'
export function tarjetaProducto(p, e, variante) {
  const cantidad = e.carrito[p.id] || 0;
  const precio = precioFinal(p, e.sesionIniciada);
  const mostrarAnterior = p.anterior && precio !== p.anterior;
  const mostrarEtiqueta = p.etiqueta && (p.seccion !== 'club' || e.sesionIniciada);
  const notaClub = p.seccion === 'club' && !e.sesionIniciada
    ? `<button type="button" class="producto__club enlace-rojo" data-accion="ingresar-club">Precio Club ${moneda(p.precio)} · Iniciá sesión</button>`
    : '';
  const compra = cantidad > 0
    ? selectorCantidad(cantidad, { id: p.id, clase: 'producto__cantidad' })
    : `<button type="button" class="boton boton--chico producto__agregar" data-accion="agregar" data-id="${p.id}">Agregar</button>`;
  const precioHtml = `<div class="producto__precio"><span class="producto__importe">${moneda(precio)}</span>${mostrarAnterior ? `<s class="producto__anterior">${moneda(p.anterior)}</s>` : ''}</div>`;

  return `<article class="producto producto--${variante}">
    <div class="imagen producto__imagen">
      <img src="${p.imagen}" alt="${escapar(p.nombre)}" loading="lazy">
      ${mostrarEtiqueta ? `<span class="etiqueta">${p.etiqueta}</span>` : ''}
    </div>
    <div class="producto__cuerpo">
      <h3 class="producto__nombre">${p.nombre}</h3>
      <p class="producto__descripcion">${p.descripcion}</p>
      ${variante === 'carta'
        ? `${precioHtml}${notaClub}${compra}`
        : `${notaClub}<div class="producto__compra">${precioHtml}${compra}</div>`}
    </div>
  </article>`;
}

// Acciones de la tarjeta de producto, para sumar a las acciones de cada página.
export const accionesProducto = {
  agregar: el => cambiarCantidad(el.dataset.id, 1),
  sumar: el => cambiarCantidad(el.dataset.id, (almacen.obtener().carrito[el.dataset.id] || 0) + 1),
  restar: el => cambiarCantidad(el.dataset.id, (almacen.obtener().carrito[el.dataset.id] || 0) - 1),
  'ingresar-club': () => ir(enlaceIngreso(rutaActual())),
};

// Pasos numerados. actual: índice (desde 0) del paso actual. accion: permite volver a pasos previos.
export function barraPasos(etiquetas, actual, { accion = '', clase = '' } = {}) {
  return `<ol class="pasos ${clase}">${etiquetas.map((etiqueta, i) => {
    const estado = i < actual ? 'esta-hecho' : i === actual ? 'esta-actual' : '';
    const sePuedeVolver = accion && i < actual;
    const interior = `<span class="pasos__numero">${i + 1}</span><span>${etiqueta}</span>`;
    return `<li class="pasos__item ${estado}">${sePuedeVolver
      ? `<button type="button" class="pasos__boton" data-accion="${accion}" data-paso="${i}">${interior}</button>`
      : interior}</li>`;
  }).join('')}</ol>`;
}

// Fichas de selección única.
export function fichas(lista, activa, accion) {
  return `<div class="fichas">${lista.map(f => `<button type="button" class="ficha ${f === activa ? 'esta-activo' : ''}" data-accion="${accion}" data-valor="${escapar(f)}" aria-pressed="${f === activa}">${f}</button>`).join('')}</div>`;
}

// Opciones tipo "tarjeta" (medios de pago).
export function opciones(lista, activa, accion) {
  return lista.map(o => `<button type="button" class="opcion ${o.id === activa ? 'esta-activo' : ''} ${o.deshabilitada ? 'esta-deshabilitado' : ''}" data-accion="${accion}" data-valor="${o.id}" aria-pressed="${o.id === activa}">
    <span class="opcion__titulo">${o.titulo}</span><span class="opcion__detalle">${o.detalle}</span>
  </button>`).join('');
}

export function campo({ etiqueta, nombre, valor = '', ayuda = '', tipo = 'text', error = false, clase = '', atributos = '' }) {
  return `<label class="campo ${clase}">
    <span class="campo__etiqueta">${etiqueta}</span>
    <input class="entrada ${error ? 'tiene-error' : ''}" name="${nombre}" type="${tipo}" value="${escapar(valor)}" placeholder="${escapar(ayuda)}" ${atributos}>
  </label>`;
}
