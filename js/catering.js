(() => {
  const { montarLayout, aviso } = SushiClub.layout;
  const { SERVICIOS_CATERING, TIPOS_CATERING, INVITADOS_CATERING } = SushiClub.datos;
  const { $, delegar } = SushiClub.utilidades;
  const { fichas } = SushiClub.componentes;
  const { reglas, validarFormulario, validarEnVivo, fechaLocal } = SushiClub.validaciones;

  montarLayout({ pagina: 'catering' });

  let tipo = TIPOS_CATERING[0];
  let invitados = INVITADOS_CATERING[0];

  $('#cat-servicios').innerHTML = SERVICIOS_CATERING.map(s => `<div class="cat-servicio">
    <span class="cat-servicio__numero">${s.numero}</span>
    <h3 class="cat-servicio__titulo">${s.titulo}</h3>
    <p class="cat-servicio__descripcion">${s.descripcion}</p>
  </div>`).join('');

  function dibujarFichas() {
    $('#cat-tipos').innerHTML = fichas(TIPOS_CATERING, tipo, 'tipo');
    $('#cat-invitados').innerHTML = fichas(INVITADOS_CATERING, invitados, 'invitados');
  }
  dibujarFichas();

  const formulario = $('#cat-form');

  // El catering se pide con al menos un día de anticipación.
  formulario.elements.fecha.min = fechaLocal(1);

  const ESQUEMA_CATERING = {
    nombre: [reglas.requerido('Ingresá tu nombre y apellido para saber a quién dirigir la propuesta.'), reglas.nombreCompleto()],
    empresa: [reglas.maximo(80)],
    contacto: [reglas.requerido('Ingresá un email o un WhatsApp: por ahí te mandamos la propuesta.'), reglas.emailOTelefono()],
    fecha: [reglas.fechaDesde(1, 'Elegí una fecha a partir de mañana: necesitamos al menos un día para preparar el catering.')],
    comentarios: [reglas.maximo(500)],
  };

  // Valida todo el formulario de catering; marca cada campo con su mensaje.
  const validarFormularioCatering = () => validarFormulario(formulario, ESQUEMA_CATERING);

  delegar($('#principal'), 'click', {
    tipo: el => { tipo = el.dataset.valor; dibujarFichas(); },
    invitados: el => { invitados = el.dataset.valor; dibujarFichas(); },
    whatsapp: () => aviso('Se abre WhatsApp con el equipo de SushiClub'),
  });

  validarEnVivo(formulario, () => ESQUEMA_CATERING);

  formulario.addEventListener('submit', ev => {
    ev.preventDefault();
    const { valido, primero } = validarFormularioCatering();
    if (!valido) {
      primero.focus();
      return;
    }
    formulario.hidden = true;
    $('#cat-enviado').hidden = false;
    $('#cat-enviado').focus();
  });
})();
