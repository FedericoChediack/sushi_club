window.SushiClub = window.SushiClub || {};

(() => {
  // Estado compartido entre páginas.
  const { MAX_PERSONAS_EVENTO } = SushiClub.datos;

  const CLAVE = 'sushiclub:estado:v5';

  // Datos personales que no se copian a window.name (ver guardar()).
  const PRIVADOS = ['email', 'direccion', 'cp', 'indicaciones'];

  function estadoInicial() {
    return {
      carrito: {},
      reservas: {}, // { idEvento: personas }
      modo: 'retiro',
      sede: 'Chacras Park',
      bienvenida: false,
      sesionIniciada: false,
      medioPago: 'tarjeta',
      email: '',
      direccion: '',
      cp: '',
      indicaciones: '',
      personasEvento: 2, // cantidad sugerida al reservar un evento nuevo
      deshacer: null,
      canjeados: {},
      avisoPendiente: null, // aviso para mostrar en la próxima página
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
      actualizado: 0,
    };
  }

  // El estado dura lo que dura la pestaña: al cerrarla se borra todo (carrito, reservas, sesión).
  // Se guarda en dos lugares:
  // - sessionStorage: en Chrome y Edge se comparte entre las páginas de la pestaña, también
  //   abriendo los archivos con doble click.
  // - window.name: sobrevive al pasar de una página a otra en la misma pestaña. Hace falta
  //   porque Firefox y Safari tratan cada archivo abierto con doble click como un sitio
  //   distinto y no comparten sessionStorage entre páginas.
  // Al cargar se usa el más reciente de los dos.

  // Versiones anteriores guardaban el estado en localStorage (que no se borra nunca): se limpia.
  try {
    Object.keys(localStorage).filter(clave => clave.startsWith('sushiclub:')).forEach(clave => localStorage.removeItem(clave));
  } catch (e) { /* sin localStorage */ }

  function leerVentana() {
    try { return window.name.startsWith(CLAVE) ? JSON.parse(window.name.slice(CLAVE.length)) : null; } catch (e) { return null; }
  }

  function leerSesion() {
    try { const guardado = sessionStorage.getItem(CLAVE); return guardado ? JSON.parse(guardado) : null; } catch (e) { return null; }
  }

  function cargar() {
    const ventana = leerVentana();
    const sesion = leerSesion();
    let guardado = ventana || sesion;
    if (ventana && sesion) {
      // Si window.name es el más nuevo, completa los datos personales desde sessionStorage.
      guardado = (ventana.actualizado || 0) >= (sesion.actualizado || 0) ? { ...sesion, ...ventana } : sesion;
    }
    return guardado ? { ...estadoInicial(), ...guardado } : estadoInicial();
  }

  let estado = cargar();
  const suscriptores = new Set();

  function guardar() {
    estado.actualizado = Date.now();
    try { sessionStorage.setItem(CLAVE, JSON.stringify(estado)); } catch (e) { /* sin sessionStorage */ }
    // window.name lo puede leer cualquier sitio que se abra después en la misma pestaña:
    // por eso no lleva email ni dirección.
    const publico = { ...estado };
    PRIVADOS.forEach(clave => delete publico[clave]);
    window.name = CLAVE + JSON.stringify(publico);
  }

  const almacen = {
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

  function cambiarCantidad(id, cantidad) {
    almacen.actualizar(e => {
      const carrito = { ...e.carrito };
      if (cantidad <= 0) delete carrito[id]; else carrito[id] = cantidad;
      return { carrito };
    });
  }

  function quitarProducto(id, nombre) {
    almacen.actualizar(e => {
      const carrito = { ...e.carrito };
      const cantidad = carrito[id];
      delete carrito[id];
      return { carrito, deshacer: { id, cantidad, nombre } };
    });
  }

  function deshacerQuitar() {
    const { deshacer } = almacen.obtener();
    if (!deshacer) return;
    almacen.actualizar(e => ({ carrito: { ...e.carrito, [deshacer.id]: deshacer.cantidad }, deshacer: null }));
  }

  // Reserva de lugar en un evento (queda en el carrito junto con la comida). Se pueden tener varias.
  function reservarEvento(id, personas) {
    almacen.actualizar(e => ({ reservas: { ...e.reservas, [id]: personas || e.reservas[id] || e.personasEvento || 2 } }));
  }

  function quitarReserva(id) {
    almacen.actualizar(e => {
      const reservas = { ...e.reservas };
      delete reservas[id];
      return { reservas };
    });
  }

  // Personas de un evento (1 a 12). Si el evento ya está reservado, cambia la reserva;
  // si no, cambia la cantidad sugerida. Devuelve false si se pasa del máximo.
  function cambiarPersonasEvento(id, n) {
    if (n > MAX_PERSONAS_EVENTO) return false;
    const personas = Math.max(1, n);
    almacen.actualizar(e => (id in e.reservas
      ? { reservas: { ...e.reservas, [id]: personas }, personasEvento: personas }
      : { personasEvento: personas }));
    return true;
  }

  function iniciarSesion() {
    almacen.actualizar({ sesionIniciada: true });
  }

  // Para reiniciar el estado de prueba desde la consola: reiniciarSushiclub()
  window.reiniciarSushiclub = () => almacen.reiniciar();

  SushiClub.estado = { estadoInicial, almacen, cambiarCantidad, quitarProducto, deshacerQuitar, reservarEvento, quitarReserva, cambiarPersonasEvento, iniciarSesion };
})();
