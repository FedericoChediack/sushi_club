import { montarLayout, aviso } from './shared/layout.js';
import { almacen } from './shared/store.js';
import { EMAIL_USUARIO } from './shared/data.js';
import { $, delegar, moneda, escapar, resumenCarrito, resumenModo, ir, pagina } from './shared/utils.js';
import { campo, opciones } from './shared/components.js';

if (resumenCarrito(almacen.obtener()).vacio) ir(pagina('carrito'));

const inicial = almacen.obtener();
if (inicial.sesionIniciada && !inicial.email) almacen.actualizar({ email: EMAIL_USUARIO }, { silencioso: true });
if (inicial.modo === 'delivery' && inicial.medioPago === 'efectivo') almacen.actualizar({ medioPago: 'tarjeta' }, { silencioso: true });

montarLayout({
  pagina: 'pago',
  encabezado: 'volver',
  volver: { texto: 'Volver al carrito', enlace: pagina('carrito') },
  paso: 1,
});

// Errores de validación visibles (se marcan al intentar pagar).
const errores = { email: false, direccion: false };

function datos(e) {
  return `${e.sesionIniciada ? '<p class="pago-nota">Completamos tus datos con tu cuenta del Club.</p>' : ''}
    <div class="grilla-form">
      ${campo({ etiqueta: 'Nombre y apellido', nombre: 'nombre', ayuda: 'Sofía Martínez', atributos: 'autocomplete="name"' })}
      <div class="campo">
        ${campo({ etiqueta: 'Email *', nombre: 'email', tipo: 'email', valor: e.email, ayuda: 'sofia@mail.com', error: errores.email, atributos: 'autocomplete="email" required' })}
        ${errores.email ? '<span class="error-form error-form--chico">Ingresá un email válido: ahí te mandamos el comprobante.</span>' : ''}
      </div>
      ${campo({ etiqueta: 'Teléfono', nombre: 'telefono', tipo: 'tel', ayuda: '11 5555 5555', atributos: 'autocomplete="tel"' })}
    </div>`;
}

function entrega(e, r) {
  if (r.hayComida && e.modo === 'delivery') {
    return `<div class="pago-pila">
      <div class="grilla-form">
        ${campo({ etiqueta: 'Dirección *', nombre: 'direccion', valor: e.direccion, ayuda: 'Calle y número', error: errores.direccion && !e.direccion.trim(), clase: 'campo--completo', atributos: 'autocomplete="street-address" required' })}
        ${campo({ etiqueta: 'Código postal *', nombre: 'cp', valor: e.cp, ayuda: 'C1414', error: errores.direccion && e.cp.trim().length < 4, atributos: 'autocomplete="postal-code" maxlength="8" required' })}
        ${campo({ etiqueta: 'Piso / depto / indicaciones', nombre: 'indicaciones', valor: e.indicaciones, ayuda: 'Timbre, piso, referencias' })}
      </div>
      ${errores.direccion ? '<span class="error-form error-form--chico">Completá la dirección y el código postal.</span>' : ''}
    </div>`;
  }
  if (!r.hayComida) {
    return `<div class="pago-caja">Tu reserva no requiere entrega. Te esperamos en la sucursal ${r.evento.sede}.</div>`;
  }
  return `<div class="pago-caja pago-caja--fila">
    <div class="pago-caja__texto"><span class="pago-caja__titulo">Retiro en ${escapar(e.sede)}</span><span class="pago-caja__detalle">Listo en 25 min · sin costo</span></div>
    <button type="button" class="enlace-rojo pago-caja__enlace" data-accion="pasar-a-delivery">Prefiero delivery</button>
  </div>`;
}

function medio(e) {
  const delivery = e.modo === 'delivery';
  const medios = [
    { id: 'tarjeta', titulo: 'Tarjeta', detalle: 'Crédito o débito, hasta 3 cuotas' },
    { id: 'mp', titulo: 'Mercado Pago', detalle: 'Te redirigimos para pagar' },
    { id: 'efectivo', titulo: 'Efectivo', detalle: delivery ? 'Solo para retiro en el local' : 'Pagás al retirar', deshabilitada: delivery },
  ];
  return `<div class="pago-pila">
    <div class="opciones">${opciones(medios, e.medioPago, 'medio-pago')}</div>
    ${e.medioPago === 'tarjeta' ? `<div class="grilla-form grilla-form--chica">
      ${campo({ etiqueta: 'Número de tarjeta', nombre: 'tarjetaNumero', ayuda: '0000 0000 0000 0000', clase: 'campo--completo', atributos: 'inputmode="numeric" autocomplete="cc-number"' })}
      ${campo({ etiqueta: 'Vencimiento', nombre: 'tarjetaVencimiento', ayuda: 'MM/AA', atributos: 'inputmode="numeric" autocomplete="cc-exp"' })}
      ${campo({ etiqueta: 'Código', nombre: 'tarjetaCodigo', ayuda: '123', atributos: 'inputmode="numeric" autocomplete="cc-csc"' })}
    </div>` : ''}
  </div>`;
}

function panel(e, r) {
  return `<h2 class="panel__titulo">Resumen</h2>
    <div class="panel__lineas">${r.items.map(i => `<div class="fila"><span>${i.cantidad} × ${i.nombre}</span><span>${moneda(i.subtotal)}</span></div>`).join('')}</div>
    ${r.hayEvento ? `<div class="pago-evento">
      <span class="pago-evento__insignia">EVENTO · RESERVA DE LUGAR</span>
      <span class="pago-evento__nombre">${r.evento.nombre}</span>
      <span class="pago-evento__cuando">${r.evento.dia} · ${r.evento.hora} · Exclusivo sucursal ${r.evento.sede}</span>
      <div class="fila pago-evento__linea"><span>${r.personas} personas</span><span>${moneda(r.totalEvento)}</span></div>
      <div class="fila pago-evento__linea pago-evento__linea--fuerte"><span>Seña a pagar (30%)</span><span>${moneda(r.sena)}</span></div>
    </div>` : ''}
    ${r.hayComida ? `<div class="fila pago-modo"><span>${escapar(resumenModo(e))}</span><a href="${pagina('carrito')}" class="pago-modo__enlace">Cambiar</a></div>
    <div class="fila pago-envio"><span>Envío</span><span>${r.envio ? moneda(r.envio) : 'Sin costo'}</span></div>` : ''}
    <div class="panel__total"><span>Total a pagar</span><strong>${moneda(r.total)}</strong></div>
    <button type="submit" form="pago-form" class="boton boton--ancho boton--grande">Pagar ${moneda(r.total)}</button>
    <span class="panel__nota">Pago seguro. Podés cancelar sin cargo hasta que el pedido entre en preparación.</span>`;
}

function dibujar() {
  const e = almacen.obtener();
  const r = resumenCarrito(e);
  if (r.vacio) return;
  $('#pago-paso-2').textContent = r.hayComida ? 'Entrega' : 'Tu lugar';
  $('#pago-datos').innerHTML = datos(e);
  $('#pago-entrega').innerHTML = entrega(e, r);
  $('#pago-medio').innerHTML = medio(e);
  $('#pago-panel').innerHTML = panel(e, r);
}

dibujar();
almacen.suscribir(dibujar);

// Mientras se escribe se guarda sin redibujar (para no perder el foco).
const CAMPOS_GUARDADOS = ['email', 'direccion', 'cp', 'indicaciones'];
$('#principal').addEventListener('input', ev => {
  const nombre = ev.target.name;
  if (!CAMPOS_GUARDADOS.includes(nombre)) return;
  if (nombre === 'cp') ev.target.value = ev.target.value.toUpperCase().slice(0, 8);
  almacen.actualizar({ [nombre]: ev.target.value }, { silencioso: true });
  ev.target.classList.remove('tiene-error');
});

delegar($('#principal'), 'click', {
  'pasar-a-delivery': () => almacen.actualizar({ modo: 'delivery' }),
  'medio-pago': el => {
    if (el.dataset.valor === 'efectivo' && almacen.obtener().modo === 'delivery') {
      aviso('El pago en efectivo es solo para retiro en el local');
      return;
    }
    almacen.actualizar({ medioPago: el.dataset.valor });
  },
});

$('#pago-form').addEventListener('submit', ev => {
  ev.preventDefault();
  const e = almacen.obtener();
  const r = resumenCarrito(e);
  errores.direccion = r.hayComida && e.modo === 'delivery' && (!e.direccion.trim() || e.cp.trim().length < 4);
  errores.email = !e.email.includes('@');
  if (errores.direccion || errores.email) {
    dibujar();
    $('.entrada.tiene-error')?.focus();
    return;
  }
  const items = r.items.map(i => ({ cantidad: i.cantidad, nombre: i.nombre, subtotalTexto: moneda(i.subtotal) }));
  if (r.hayEvento) items.push({ cantidad: r.personas, nombre: `Reserva · ${r.evento.nombre} · ${r.evento.sede}`, subtotalTexto: moneda(r.sena) + ' (seña)' });
  almacen.actualizar({
    ultimoPedido: {
      numero: '#SC-' + (48214 + Math.floor(Math.random() * 700)),
      modo: r.hayComida ? e.modo : 'evento',
      total: r.total,
      items,
    },
    carrito: {},
    reservaEvento: null,
    deshacer: null,
  }, { silencioso: true });
  ir(pagina('confirmacion'));
});
