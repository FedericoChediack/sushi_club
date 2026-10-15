(() => {
  const { montarLayout, aviso } = SushiClub.layout;
  const { SERVICIOS_CATERING, TIPOS_CATERING, INVITADOS_CATERING } = SushiClub.datos;
  const { $, delegar } = SushiClub.utilidades;
  const { fichas } = SushiClub.componentes;

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

  delegar($('#principal'), 'click', {
    tipo: el => { tipo = el.dataset.valor; dibujarFichas(); },
    invitados: el => { invitados = el.dataset.valor; dibujarFichas(); },
    whatsapp: () => aviso('Se abre WhatsApp con el equipo de SushiClub'),
  });

  formulario.addEventListener('input', ev => {
    ev.target.classList.remove('tiene-error');
    $('#cat-error').hidden = true;
  });

  formulario.addEventListener('submit', ev => {
    ev.preventDefault();
    const obligatorios = [formulario.elements.nombre, formulario.elements.contacto];
    const faltantes = obligatorios.filter(entrada => !entrada.value.trim());
    obligatorios.forEach(entrada => entrada.classList.toggle('tiene-error', faltantes.includes(entrada)));
    if (faltantes.length) {
      $('#cat-error').hidden = false;
      faltantes[0].focus();
      return;
    }
    formulario.hidden = true;
    $('#cat-enviado').hidden = false;
    $('#cat-enviado').focus();
  });
})();
