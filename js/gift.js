(() => {
  const { montarLayout } = SushiClub.layout;
  const { REGALOS, ENVIO_REGALO, FRANJAS_REGALO, DIAS } = SushiClub.datos;
  const { $, delegar, moneda, escapar } = SushiClub.utilidades;
  const { barraPasos, fichas, opciones, campo } = SushiClub.componentes;

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
    error: false,
  };

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
          <label class="campo">
            <span class="campo__etiqueta">Tu mensaje</span>
            <textarea class="entrada" name="mensaje" rows="5" maxlength="${MAX_MENSAJE}" placeholder="${MENSAJE_EJEMPLO}">${escapar(regalo.mensaje)}</textarea>
            <span class="regalo-contador" id="regalo-contador">${regalo.mensaje.length} / ${MAX_MENSAJE}</span>
          </label>
          ${campo({ etiqueta: 'Firmado por', nombre: 'firma', valor: regalo.firma, ayuda: 'Tu nombre' })}
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
        ${campo({ etiqueta: 'Nombre de quien recibe *', nombre: 'destinatario', valor: regalo.destinatario, ayuda: 'Lucía', error: regalo.error && !regalo.destinatario.trim(), atributos: 'required' })}
        ${campo({ etiqueta: 'Teléfono de quien recibe', nombre: 'telefono', tipo: 'tel', valor: regalo.telefono, ayuda: 'Para coordinar la entrega' })}
        ${campo({ etiqueta: 'Dirección de entrega *', nombre: 'direccion', valor: regalo.direccion, ayuda: 'Calle, número, piso', error: regalo.error && !regalo.direccion.trim(), clase: 'campo--completo', atributos: 'required' })}
      </div>
      <div class="campo" role="group" aria-label="Día"><span class="campo__etiqueta">Día</span><div class="regalo-dias">${fichas(DIAS, DIAS[regalo.dia], 'dia')}</div></div>
      <div class="campo" role="group" aria-label="Franja horaria"><span class="campo__etiqueta">Franja horaria</span>${fichas(FRANJAS_REGALO, regalo.franja, 'franja')}</div>
      ${regalo.error ? '<p class="error-form">Completá el nombre y la dirección de quien recibe.</p>' : ''}`;
  }

  function pasoPago() {
    const medios = [
      { id: 'tarjeta', titulo: 'Tarjeta', detalle: 'Crédito o débito' },
      { id: 'mp', titulo: 'Mercado Pago', detalle: 'Te redirigimos para pagar' },
    ];
    return `<h2 class="titulo-seccion regalo-titulo">Pago</h2>
      <div class="opciones">${opciones(medios, regalo.pago, 'pago')}</div>
      ${campo({ etiqueta: 'Tu email', nombre: 'email', tipo: 'email', valor: regalo.email, ayuda: 'Para mandarte el comprobante', clase: 'regalo-email', atributos: 'autocomplete="email"' })}`;
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
    regalo.error = false;
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

  // Inputs: se guarda sin redibujar; la vista previa y el resumen se actualizan en vivo.
  $('#regalo-form').addEventListener('input', ev => {
    const { name: nombre, value: valor } = ev.target;
    if (!(nombre in regalo)) return;
    regalo[nombre] = nombre === 'mensaje' ? valor.slice(0, MAX_MENSAJE) : valor;
    ev.target.classList.remove('tiene-error');
    if (nombre === 'mensaje') {
      $('#regalo-contador').textContent = `${regalo.mensaje.length} / ${MAX_MENSAJE}`;
      $('#vista-mensaje').textContent = regalo.mensaje || MENSAJE_EJEMPLO;
    }
    if (nombre === 'firma') $('#vista-firma').textContent = `— ${regalo.firma || 'Tu nombre'}`;
    if (nombre === 'destinatario') $('#resumen-destinatario').textContent = regalo.destinatario || '—';
  });

  $('#regalo-form').addEventListener('submit', ev => {
    ev.preventDefault();
    if (regalo.paso === 3 && (!regalo.destinatario.trim() || !regalo.direccion.trim())) {
      regalo.error = true;
      dibujar();
      $('.entrada.tiene-error')?.focus();
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
