(() => {
  const { montarLayout, aviso } = SushiClub.layout;
  const { almacen } = SushiClub.estado;
  const { BENEFICIOS, NOMBRE_USUARIO } = SushiClub.datos;
  const { $, delegar, enlaceIngreso } = SushiClub.utilidades;

  montarLayout({ pagina: 'club' });

  function dibujar() {
    const e = almacen.obtener();
    $('#club-bajada').textContent = e.sesionIniciada
      ? `Hola, ${NOMBRE_USUARIO}. Estos son tus beneficios disponibles.`
      : 'Sumarte es gratis. Descuentos, prioridad en eventos y regalos en todas las sedes del país.';

    $('#club-extra').innerHTML = e.sesionIniciada
      ? '<div class="club-puntos"><span class="club-puntos__etiqueta">TUS PUNTOS</span><span class="club-puntos__valor">1.240</span></div>'
      : `<div class="club-cabecera__acciones">
          <a class="boton" href="${enlaceIngreso('pages/club.html', 'registro')}">Unite gratis</a>
          <a class="boton boton--borde" href="${enlaceIngreso('pages/club.html')}">Ya soy socio</a>
        </div>`;

    $('#club-grilla').innerHTML = BENEFICIOS.map(b => {
      const bloqueado = b.exclusivo && !e.sesionIniciada;
      const canjeado = !!e.canjeados[b.id];
      const etiqueta = bloqueado ? 'EXCLUSIVO SOCIOS' : b.exclusivo ? 'SOCIO' : 'PARA TODOS';
      let accion;
      if (bloqueado) accion = `<a class="boton boton--borde beneficio__boton" href="${enlaceIngreso('pages/club.html')}">Iniciá sesión para desbloquear</a>`;
      else if (canjeado) accion = '<button type="button" class="boton boton--borde beneficio__boton" disabled aria-disabled="true">Aplicado ✓</button>';
      else accion = `<button type="button" class="boton beneficio__boton" data-accion="canjear" data-id="${b.id}">Canjear</button>`;
      return `<article class="beneficio ${bloqueado ? 'esta-bloqueado' : ''}">
        <span class="beneficio__etiqueta">${etiqueta}</span>
        <h2 class="beneficio__titulo">${b.titulo}</h2>
        <p class="beneficio__descripcion">${b.descripcion}</p>
        ${accion}
      </article>`;
    }).join('');
  }

  dibujar();
  almacen.suscribir(dibujar);

  delegar($('#principal'), 'click', {
    canjear: el => {
      almacen.actualizar(e => ({ canjeados: { ...e.canjeados, [el.dataset.id]: true } }));
      aviso('Beneficio aplicado a tu próximo pedido');
    },
  });
})();
