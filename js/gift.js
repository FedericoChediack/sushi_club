(() => {
  const { montarLayout } = SushiClub.layout;
  const { REGALOS, ENVIO_REGALO, FRANJAS_REGALO, DIAS } = SushiClub.datos;
  const { $, delegar, moneda, escapar } = SushiClub.utilidades;
  const { barraPasos, fichas, opciones, campo } = SushiClub.componentes;
  const { reglas, validarFormulario, validarEnVivo, mascaras, aplicarMascaras } = SushiClub.validaciones;

  montarLayout({ pagina: 'gift' });

  const PASOS = ['Regalo', 'Tarjeta', 'Entrega', 'Pago'];
  const MAX_MENSAJE = 180;
  const MENSAJE_EJEMPLO = '¡Feliz cumple! Que lo disfrutes.';

  const regalo = {
    paso: 1,
    caja: 'premium',
    mensaje: '',
    firma: '',
    destinatario: '',
    telefono: '',
    direccion: '',
    dia: 1,
    franja: FRANJAS_REGALO[0],
    pago: 'tarjeta',
    email: '',
  };

  // Último error de cada campo, para volver a mostrarlo si el paso se redibuja.
  const errores = {};

  // Reglas de cada paso del regalo (el 1 solo elige la caja).
  const ESQUEMAS = {
    2: {
      mensaje: [reglas.maximo(MAX_MENSAJE, `El mensaje puede tener hasta ${MAX_MENSAJE} caracteres.`)],
      firma: [reglas.maximo(40, 'La firma puede tener hasta 40 caracteres.'), reglas.nombre('Firmá solo con letras y espacios.')],
    },
    3: {
      destinatario: [reglas.requerido('Ingresá el nombre de quien recibe: lo necesita el repartidor para entregar el regalo.'), reglas.nombre()],
      telefono: [reglas.telefono('Si lo completás, tiene que ser un teléfono de Argentina con código de área, por ejemplo 11 5555 5555.')],
      direccion: [reglas.requerido('Ingresá la dirección donde entregamos el regalo.'), reglas.direccion()],
    },
    4: {
      email: [reglas.requerido('Ingresá tu email: ahí te mandamos el comprobante y el seguimiento del envío.'), reglas.email()],
    },
  };
  const esquemaActual = () => ESQUEMAS[regalo.paso] || {};

  // Valida el paso actual del regalo; marca cada campo con su mensaje.
  function validarPasoRegalo() {
    const resultado = validarFormulario($('#regalo-form'), esquemaActual());
    Object.keys(errores).forEach(k => delete errores[k]);
    Object.assign(errores, resultado.errores);
    return resultado;
  }

  const cajaElegida = () => REGALOS.find(r => r.id === regalo.caja);
  const cuando = () => `${DIAS[regalo.dia]} · ${regalo.franja}`;
  const total = () => cajaElegida().precio + ENVIO_REGALO;

  function pasoRegalo() {
    return `<h2 class="titulo-seccion regalo-titulo">Elegí el regalo</h2>
      <div class="regalo-cajas">${REGALOS.map(c => `<button type="button" class="regalo-caja ${c.id === regalo.caja ? 'esta-activo' : ''}" data-accion="caja" data-valor="${c.id}" aria-pressed="${c.id === regalo.caja}">
        <span class="imagen imagen--cuadrada"><img src="${c.imagen}" alt="" loading="lazy"></span>
        <span class="regalo-caja__nombre">${c.nombre}</span>
        <span class="regalo-caja__descripcion">${c.descripcion}</span>
        <span class="regalo-caja__precio">${moneda(c.precio)}</span>
      </button>`).join('')}</div>`;
  }

  function pasoTarjeta() {
    return `<h2 class="titulo-seccion regalo-titulo">Escribí la tarjeta</h2>
      <div class="regalo-tarjeta">
        <div class="regalo-tarjeta__campos">
          <div class="campo">
            <label class="campo__etiqueta" for="campo-mensaje">Tu mensaje</label>
            <textarea class="entrada ${errores.mensaje ? 'tiene-error' : ''}" id="campo-mensaje" name="mensaje" rows="5" maxlength="${MAX_MENSAJE}" placeholder="${MENSAJE_EJEMPLO}" aria-describedby="regalo-contador error-mensaje">${escapar(regalo.mensaje)}</textarea>
            <span class="regalo-contador" id="regalo-contador">${regalo.mensaje.length} / ${MAX_MENSAJE}</span>
            <span class="campo__error" id="error-mensaje" ${errores.mensaje ? '' : 'hidden'}>${escapar(errores.mensaje || '')}</span>
          </div>
          ${campo({ etiqueta: 'Firmado por', nombre: 'firma', valor: regalo.firma, ayuda: 'Tu nombre', error: errores.firma, atributos: 'autocomplete="name" maxlength="40"' })}
        </div>
        <div class="regalo-vista" aria-label="Vista previa de la tarjeta">
          <span class="regalo-vista__punto" aria-hidden="true"></span>
          <span class="regalo-vista__etiqueta">VISTA PREVIA</span>
          <span class="regalo-vista__mensaje" id="vista-mensaje">${escapar(regalo.mensaje || MENSAJE_EJEMPLO)}</span>
          <span class="regalo-vista__firma" id="vista-firma">— ${escapar(regalo.firma || 'Tu nombre')}</span>
        </div>
      </div>`;
  }

  function pasoEntrega() {
    return `<h2 class="titulo-seccion regalo-titulo">¿A quién se lo mandamos?</h2>
      <div class="grilla-form">
        ${campo({ etiqueta: 'Nombre de quien recibe', nombre: 'destinatario', valor: regalo.destinatario, ayuda: 'Lucía', obligatorio: true, error: errores.destinatario, atributos: 'autocapitalize="words" maxlength="60"' })}
        ${campo({ etiqueta: 'Teléfono de quien recibe', nombre: 'telefono', tipo: 'tel', valor: regalo.telefono, ayuda: 'Para coordinar la entrega', error: errores.telefono, atributos: 'inputmode="tel" maxlength="20"' })}
        ${campo({ etiqueta: 'Dirección de entrega', nombre: 'direccion', valor: regalo.direccion, ayuda: 'Calle, número, piso', obligatorio: true, error: errores.direccion, clase: 'campo--completo', atributos: 'autocomplete="street-address" maxlength="80"' })}
      </div>
      <div class="campo" role="group" aria-label="Día"><span class="campo__etiqueta">Día</span><div class="regalo-dias">${fichas(DIAS, DIAS[regalo.dia], 'dia')}</div></div>
      <div class="campo" role="group" aria-label="Franja horaria"><span class="campo__etiqueta">Franja horaria</span>${fichas(FRANJAS_REGALO, regalo.franja, 'franja')}</div>
      <p class="form-nota">Los campos con * son obligatorios.</p>`;
  }

  function pasoPago() {
    const medios = [
      { id: 'tarjeta', titulo: 'Tarjeta', detalle: 'Crédito o débito' },
      { id: 'mp', titulo: 'Mercado Pago', detalle: 'Te redirigimos para pagar' },
    ];
    return `<h2 class="titulo-seccion regalo-titulo">Pago</h2>
      <div class="opciones">${opciones(medios, regalo.pago, 'pago')}</div>
      ${campo({ etiqueta: 'Tu email', nombre: 'email', tipo: 'email', valor: regalo.email, ayuda: 'Para mandarte el comprobante', obligatorio: true, error: errores.email, clase: 'regalo-email', atributos: 'autocomplete="email" inputmode="email" autocapitalize="off" spellcheck="false" maxlength="254"' })}`;
  }

  function panel() {
    return `<h2 class="panel__titulo regalo-panel__titulo">Tu regalo</h2>
      <div class="panel__lineas regalo-panel__lineas">
        <div class="fila"><span>${cajaElegida().nombre}</span><span class="es-fuerte">${moneda(cajaElegida().precio)}</span></div>
        <div class="fila"><span>Para</span><span class="es-fuerte" id="resumen-destinatario">${escapar(regalo.destinatario || '—')}</span></div>
        <div class="fila"><span>Entrega</span><span class="es-fuerte">${cuando()}</span></div>
        <div class="fila"><span>Envío</span><span class="es-fuerte">${moneda(ENVIO_REGALO)}</span></div>
      </div>
      <div class="panel__total separador-arriba"><span>Total</span><strong>${moneda(total())}</strong></div>`;
  }

  function dibujar() {
    $('#regalo-pasos').innerHTML = barraPasos(PASOS, regalo.paso - 1, { accion: 'ir-paso' });
    $('#regalo-paso').innerHTML = [pasoRegalo, pasoTarjeta, pasoEntrega, pasoPago][regalo.paso - 1]();
    $('#regalo-panel').innerHTML = panel();
    $('.regalo-nav__atras').style.visibility = regalo.paso > 1 ? 'visible' : 'hidden';
    $('#regalo-siguiente').textContent = regalo.paso === 4 ? `Pagar ${moneda(total())}` : 'Siguiente →';
  }

  function irAPaso(n) {
    regalo.paso = n;
    Object.keys(errores).forEach(k => delete errores[k]);
    dibujar();
    window.scrollTo({ top: 0 });
  }

  dibujar();

  delegar($('#principal'), 'click', {
    caja: el => { regalo.caja = el.dataset.valor; dibujar(); },
    dia: el => { regalo.dia = DIAS.indexOf(el.dataset.valor); dibujar(); },
    franja: el => { regalo.franja = el.dataset.valor; dibujar(); },
    pago: el => { regalo.pago = el.dataset.valor; dibujar(); },
    'ir-paso': el => irAPaso(Number(el.dataset.paso) + 1),
    atras: () => irAPaso(Math.max(1, regalo.paso - 1)),
  });

  // Inputs: formato del teléfono, se guarda sin redibujar y la vista previa y el resumen se actualizan en vivo.
  aplicarMascaras($('#regalo-form'), { telefono: mascaras.telefono });
  $('#regalo-form').addEventListener('input', ev => {
    const { name: nombre, value: valor } = ev.target;
    if (!(nombre in regalo)) return;
    regalo[nombre] = nombre === 'mensaje' ? valor.slice(0, MAX_MENSAJE) : valor;
    if (nombre === 'mensaje') {
      $('#regalo-contador').textContent = `${regalo.mensaje.length} / ${MAX_MENSAJE}`;
      $('#vista-mensaje').textContent = regalo.mensaje || MENSAJE_EJEMPLO;
    }
    if (nombre === 'firma') $('#vista-firma').textContent = `— ${regalo.firma || 'Tu nombre'}`;
    if (nombre === 'destinatario') $('#resumen-destinatario').textContent = regalo.destinatario || '—';
  });
  validarEnVivo($('#regalo-form'), esquemaActual, (nombre, mensaje) => { if (mensaje) errores[nombre] = mensaje; else delete errores[nombre]; });

  $('#regalo-form').addEventListener('submit', ev => {
    ev.preventDefault();
    const { valido, primero } = validarPasoRegalo();
    if (!valido) {
      primero.focus();
      return;
    }
    if (regalo.paso < 4) { irAPaso(regalo.paso + 1); return; }
    // Paso 4: pago confirmado.
    $('#regalo-enviado-cuando').textContent = `Se lo entregamos a ${regalo.destinatario} · ${cuando()}`;
    $('#regalo-flujo').hidden = true;
    $('#regalo-enviado').hidden = false;
    $('#regalo-enviado').focus();
    window.scrollTo({ top: 0 });
  });
})();
