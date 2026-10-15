(() => {
  const { montarLayout, aviso } = SushiClub.layout;
  const { almacen } = SushiClub.estado;
  const { EMAIL_USUARIO, NOMBRE_COMPLETO_USUARIO } = SushiClub.datos;
  const { $, delegar, moneda, escapar, resumenCarrito, resumenModo, ir, pagina } = SushiClub.utilidades;
  const { campo, opciones } = SushiClub.componentes;
  const { reglas, validarFormulario, validarEnVivo, mascaras, aplicarMascaras, formatearTelefono } = SushiClub.validaciones;

  if (resumenCarrito(almacen.obtener()).vacio) ir(pagina('carrito'));

  const inicial = almacen.obtener();
  if (inicial.sesionIniciada && !inicial.email) almacen.actualizar({ email: EMAIL_USUARIO }, { silencioso: true });
  if (inicial.sesionIniciada && !inicial.nombre) almacen.actualizar({ nombre: NOMBRE_COMPLETO_USUARIO }, { silencioso: true });
  if (inicial.modo === 'delivery' && inicial.medioPago === 'efectivo') almacen.actualizar({ medioPago: 'tarjeta' }, { silencioso: true });

  montarLayout({
    pagina: 'pago',
    encabezado: 'volver',
    volver: { texto: 'Volver al carrito', enlace: pagina('carrito') },
    paso: 1,
  });

  // Campos que se guardan en el estado (sobreviven al cambiar de página dentro de la pestaña).
  const CAMPOS_GUARDADOS = ['nombre', 'email', 'telefono', 'direccion', 'cp', 'indicaciones'];
  // Los datos de la tarjeta quedan solo en memoria: nunca se guardan en el navegador.
  const tarjeta = { tarjetaNumero: '', tarjetaVencimiento: '', tarjetaCodigo: '' };
  // Último error de cada campo, para volver a mostrarlo si la pantalla se redibuja.
  const errores = {};

  // ---- Validación ----

  // Las reglas dependen de lo que se está comprando (delivery o no) y del medio de pago.
  function esquemaPago() {
    const e = almacen.obtener();
    const r = resumenCarrito(e);
    const esquema = {
      nombre: [reglas.requerido('Ingresá tu nombre y apellido: así sabemos a nombre de quién va el pedido.'), reglas.nombreCompleto()],
      email: [reglas.requerido('Ingresá tu email: ahí te mandamos el comprobante.'), reglas.email()],
      telefono: [reglas.requerido('Ingresá un teléfono para avisarte si hay algún problema con el pedido.'), reglas.telefono()],
    };
    if (r.hayComida && e.modo === 'delivery') {
      esquema.direccion = [reglas.requerido('Ingresá la calle y la altura donde llevamos el pedido.'), reglas.direccion()];
      esquema.cp = [reglas.requerido('Ingresá el código postal: con él calculamos la zona de entrega.'), reglas.codigoPostal()];
      esquema.indicaciones = [reglas.maximo(120)];
    }
    if (e.medioPago === 'tarjeta') {
      esquema.tarjetaNumero = [reglas.requerido('Ingresá el número que figura en el frente de la tarjeta.'), reglas.numeroTarjeta()];
      esquema.tarjetaVencimiento = [reglas.requerido('Ingresá el vencimiento que figura en la tarjeta (MM/AA).'), reglas.vencimiento()];
      esquema.tarjetaCodigo = [reglas.requerido('Ingresá el código de seguridad de la tarjeta.'), reglas.codigoSeguridad('tarjetaNumero')];
    }
    return esquema;
  }

  // Valida todo el formulario de pago; marca cada campo con su mensaje.
  function validarFormularioPago() {
    const resultado = validarFormulario($('#pago-form'), esquemaPago());
    Object.keys(errores).forEach(k => delete errores[k]);
    Object.assign(errores, resultado.errores);
    return resultado;
  }

  // ---- Pantalla ----

  function datos(e) {
    return `${e.sesionIniciada ? '<p class="pago-nota">Completamos tus datos con tu cuenta del Club.</p>' : ''}
      <div class="grilla-form">
        ${campo({ etiqueta: 'Nombre y apellido', nombre: 'nombre', valor: e.nombre, ayuda: 'Sofía Martínez', obligatorio: true, error: errores.nombre, atributos: 'autocomplete="name" autocapitalize="words" maxlength="60"' })}
        ${campo({ etiqueta: 'Email', nombre: 'email', tipo: 'email', valor: e.email, ayuda: 'sofia@mail.com', obligatorio: true, error: errores.email, atributos: 'autocomplete="email" inputmode="email" autocapitalize="off" spellcheck="false" maxlength="254"' })}
        ${campo({ etiqueta: 'Teléfono', nombre: 'telefono', tipo: 'tel', valor: e.telefono, ayuda: '11 5555 5555', obligatorio: true, error: errores.telefono, atributos: 'autocomplete="tel" inputmode="tel" maxlength="20"' })}
      </div>`;
  }

  function entrega(e, r) {
    if (r.hayComida && e.modo === 'delivery') {
      return `<div class="grilla-form">
        ${campo({ etiqueta: 'Dirección', nombre: 'direccion', valor: e.direccion, ayuda: 'Calle y número', obligatorio: true, error: errores.direccion, clase: 'campo--completo', atributos: 'autocomplete="street-address" maxlength="80"' })}
        ${campo({ etiqueta: 'Código postal', nombre: 'cp', valor: e.cp, ayuda: 'C1414', obligatorio: true, error: errores.cp, atributos: 'autocomplete="postal-code" autocapitalize="characters" maxlength="8"' })}
        ${campo({ etiqueta: 'Piso / depto / indicaciones', nombre: 'indicaciones', valor: e.indicaciones, ayuda: 'Timbre, piso, referencias', error: errores.indicaciones, atributos: 'maxlength="120"' })}
      </div>`;
    }
    if (!r.hayComida) {
      const sedes = [...new Set(r.eventos.map(ev => ev.sede))];
      return `<div class="pago-caja">${r.eventos.length === 1 ? 'Tu reserva no requiere' : 'Tus reservas no requieren'} entrega. Te esperamos en ${sedes.length === 1 ? 'la sucursal ' + sedes[0] : 'las sucursales ' + sedes.slice(0, -1).join(', ') + ' y ' + sedes.at(-1)}.</div>`;
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
    // type="text" + inputmode="numeric": teclado numérico sin perder ceros a la izquierda ni dígitos.
    return `<div class="pago-pila">
      <div class="opciones">${opciones(medios, e.medioPago, 'medio-pago')}</div>
      ${e.medioPago === 'tarjeta' ? `<div class="grilla-form grilla-form--chica">
        ${campo({ etiqueta: 'Número de tarjeta', nombre: 'tarjetaNumero', valor: tarjeta.tarjetaNumero, ayuda: '0000 0000 0000 0000', obligatorio: true, error: errores.tarjetaNumero, clase: 'campo--completo', atributos: 'inputmode="numeric" autocomplete="cc-number" maxlength="19"' })}
        ${campo({ etiqueta: 'Vencimiento', nombre: 'tarjetaVencimiento', valor: tarjeta.tarjetaVencimiento, ayuda: 'MM/AA', obligatorio: true, error: errores.tarjetaVencimiento, atributos: 'inputmode="numeric" autocomplete="cc-exp" maxlength="5"' })}
        ${campo({ etiqueta: 'Código', nombre: 'tarjetaCodigo', valor: tarjeta.tarjetaCodigo, ayuda: '123', obligatorio: true, error: errores.tarjetaCodigo, atributos: 'inputmode="numeric" autocomplete="cc-csc" maxlength="4"' })}
      </div>` : ''}
    </div>`;
  }

  function panel(e, r) {
    return `<h2 class="panel__titulo">Resumen</h2>
      <div class="panel__lineas">${r.items.map(i => `<div class="fila"><span>${i.cantidad} × ${i.nombre}</span><span>${moneda(i.subtotal)}</span></div>`).join('')}</div>
      ${r.eventos.map(ev => `<div class="pago-evento">
        <span class="pago-evento__insignia">EVENTO · RESERVA DE LUGAR</span>
        <span class="pago-evento__nombre">${ev.nombre}</span>
        <span class="pago-evento__cuando">${ev.dia} · ${ev.hora} · Exclusivo sucursal ${ev.sede}</span>
        <div class="fila pago-evento__linea"><span>${ev.personas} personas</span><span>${moneda(ev.totalEvento)}</span></div>
        <div class="fila pago-evento__linea pago-evento__linea--fuerte"><span>Seña a pagar (30%)</span><span>${moneda(ev.sena)}</span></div>
      </div>`).join('')}
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

  const formulario = $('#pago-form');

  // 1) Formato mientras se escribe, 2) guardar el valor, 3) validar en vivo (en ese orden).
  aplicarMascaras(formulario, {
    telefono: mascaras.telefono,
    cp: mascaras.codigoPostal,
    tarjetaNumero: mascaras.tarjeta,
    tarjetaVencimiento: mascaras.vencimiento,
    tarjetaCodigo: mascaras.digitos(4),
  });
  formulario.addEventListener('input', ev => {
    const { name: nombre, value: valor } = ev.target;
    if (CAMPOS_GUARDADOS.includes(nombre)) almacen.actualizar({ [nombre]: valor }, { silencioso: true });
    if (nombre in tarjeta) tarjeta[nombre] = valor;
  });
  validarEnVivo(formulario, esquemaPago, (nombre, mensaje) => { if (mensaje) errores[nombre] = mensaje; else delete errores[nombre]; });

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

  formulario.addEventListener('submit', ev => {
    ev.preventDefault();
    const { valido, primero } = validarFormularioPago();
    if (!valido) {
      primero.focus();
      aviso('Revisá los campos marcados en rojo.');
      return;
    }
    const e = almacen.obtener();
    const r = resumenCarrito(e);
    const items = r.items.map(i => ({ cantidad: i.cantidad, nombre: i.nombre, subtotalTexto: moneda(i.subtotal) }));
    r.eventos.forEach(evento => items.push({ cantidad: evento.personas, nombre: `Reserva · ${evento.nombre} · ${evento.sede}`, subtotalTexto: moneda(evento.sena) + ' (seña)' }));
    almacen.actualizar({
      telefono: formatearTelefono(e.telefono),
      ultimoPedido: {
        numero: '#SC-' + (48214 + Math.floor(Math.random() * 700)),
        modo: r.hayComida ? e.modo : 'evento',
        total: r.total,
        items,
      },
      carrito: {},
      reservas: {},
      deshacer: null,
    }, { silencioso: true });
    ir(pagina('confirmacion'));
  });
})();
