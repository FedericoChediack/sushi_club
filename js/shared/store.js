// Estado compartido entre páginas, persistido en localStorage.
import { MAX_PERSONAS_EVENTO } from './data.js';

const CLAVE = 'sushiclub:estado:v3';

export function estadoInicial() {
  return {
    carrito: { combo45: 1, nyr: 2, geisha: 1 },
    modo: 'retiro',
    sede: 'Chacras Park',
    bienvenida: false,
    sesionIniciada: false,
    medioPago: 'tarjeta',
    email: '',
    direccion: '',
    cp: '',
    indicaciones: '',
    reservaEvento: null,
    personasEvento: 2,
    deshacer: null,
    canjeados: {},
    ultimaPagina: 'index.html', // ruta relativa a la raíz del sitio
    ultimoPedido: {
      numero: '#SC-48213',
      modo: 'delivery',
      total: 73800,
      items: [
        { cantidad: 1, nombre: 'Combinado Club 45', subtotalTexto: '$ 42.900' },
        { cantidad: 2, nombre: 'New York Roll', subtotalTexto: '$ 28.400' },
      ],
    },
  };
}

function cargar() {
  try {
    const guardado = localStorage.getItem(CLAVE);
    if (guardado) return { ...estadoInicial(), ...JSON.parse(guardado) };
  } catch (e) { /* storage bloqueado o JSON inválido */ }
  return estadoInicial();
}

let estado = cargar();
const suscriptores = new Set();

function guardar() {
  try { localStorage.setItem(CLAVE, JSON.stringify(estado)); } catch (e) { /* sin persistencia */ }
}

export const almacen = {
  obtener: () => estado,

  // cambios puede ser un objeto o una función (estado) => objeto.
  // Con { silencioso: true } guarda sin redibujar (lo usan los inputs mientras se escribe).
  actualizar(cambios, { silencioso = false } = {}) {
    const nuevos = typeof cambios === 'function' ? cambios(estado) : cambios;
    estado = { ...estado, ...nuevos };
    guardar();
    if (!silencioso) suscriptores.forEach(fn => fn(estado));
  },

  suscribir(fn) {
    suscriptores.add(fn);
    return () => suscriptores.delete(fn);
  },

  reiniciar() {
    estado = estadoInicial();
    guardar();
    suscriptores.forEach(fn => fn(estado));
  },
};

// ---- Acciones ----

export function cambiarCantidad(id, cantidad) {
  almacen.actualizar(e => {
    const carrito = { ...e.carrito };
    if (cantidad <= 0) delete carrito[id]; else carrito[id] = cantidad;
    return { carrito };
  });
}

export function quitarProducto(id, nombre) {
  almacen.actualizar(e => {
    const carrito = { ...e.carrito };
    const cantidad = carrito[id];
    delete carrito[id];
    return { carrito, deshacer: { id, cantidad, nombre } };
  });
}

export function deshacerQuitar() {
  const { deshacer } = almacen.obtener();
  if (!deshacer) return;
  almacen.actualizar(e => ({ carrito: { ...e.carrito, [deshacer.id]: deshacer.cantidad }, deshacer: null }));
}

// Reserva de lugar en un evento (queda en el carrito junto con la comida).
export function reservarEvento(id, personas) {
  almacen.actualizar(e => ({ reservaEvento: { id, personas: personas || e.personasEvento || 2 } }));
}

// Cantidad de personas para la reserva (1 a 12). Devuelve false si se pasa del máximo.
export function cambiarPersonasEvento(n) {
  if (n > MAX_PERSONAS_EVENTO) return false;
  const personas = Math.max(1, n);
  almacen.actualizar(e => ({ personasEvento: personas, reservaEvento: e.reservaEvento ? { ...e.reservaEvento, personas } : e.reservaEvento }));
  return true;
}

export function iniciarSesion() {
  almacen.actualizar({ sesionIniciada: true });
}

// Para reiniciar el estado de prueba desde la consola: reiniciarSushiclub()
window.reiniciarSushiclub = () => almacen.reiniciar();
