(() => {
  const { montarLayout, avisoSiguiente } = SushiClub.layout;
  const { almacen, iniciarSesion } = SushiClub.estado;
  const { PROMO_CLUB, NOMBRE_USUARIO } = SushiClub.datos;
  const { $, $$, delegar, parametro, ir, enlace, rutaSegura } = SushiClub.utilidades;
  const { reglas, validarFormulario, validarEnVivo, mostrarError } = SushiClub.validaciones;

  montarLayout({ pagina: 'login' });

  let pestana = parametro('pestana') === 'registro' ? 'registro' : 'ingreso';
  let sumarme = true;
  const volver = rutaSegura(parametro('volver'), 'pages/club.html');
  const formulario = $('#acceso-form');

  $('#promo-lista').innerHTML = PROMO_CLUB.map(p => `<li><span class="acceso__promo-numero">${p.numero}</span><span>${p.texto}</span></li>`).join('');
  $('#acceso-invitado').href = enlace(rutaSegura(almacen.obtener().ultimaPagina, 'index.html'));

  function dibujar() {
    const registro = pestana === 'registro';
    $$('.acceso__pestana').forEach(boton => {
      const activa = boton.dataset.valor === pestana;
      boton.classList.toggle('esta-activo', activa);
      boton.setAttribute('aria-selected', String(activa));
    });
    formulario.setAttribute('aria-labelledby', 'pestana-' + pestana);
    $$('[data-solo]', formulario).forEach(el => { el.hidden = el.dataset.solo !== pestana; });
    $('#acceso-enviar').textContent = registro ? 'Crear cuenta' : 'Ingresar';
    formulario.elements.clave.autocomplete = registro ? 'new-password' : 'current-password';
    document.title = (registro ? 'Registrate' : 'Iniciá sesión') + ' · SushiClub';
    const casilla = $('[data-accion="sumarme"]');
    casilla.classList.toggle('esta-marcado', sumarme);
    casilla.setAttribute('aria-pressed', String(sumarme));
  }

  // Reglas de cada pestaña: al registrarse se pide nombre y una contraseña segura.
  function esquemaAcceso() {
    const email = [reglas.requerido('Ingresá tu email para entrar a tu cuenta.'), reglas.email()];
    if (pestana === 'registro') {
      return {
        nombre: [reglas.requerido('Ingresá tu nombre y apellido para crear la cuenta.'), reglas.nombreCompleto()],
        email: [reglas.requerido('Ingresá tu email: lo vas a usar para entrar y ahí te llegan los beneficios.'), reglas.email()],
        clave: [reglas.requerido('Elegí una contraseña para tu cuenta.'), reglas.clave()],
      };
    }
    return { email, clave: [reglas.requerido('Ingresá tu contraseña.')] };
  }

  // Valida el formulario de la pestaña activa; marca cada campo con su mensaje.
  const validarFormularioAcceso = () => validarFormulario(formulario, esquemaAcceso());

  // Al cambiar de pestaña se limpian los errores de la anterior.
  function limpiarErrores() {
    ['nombre', 'email', 'clave'].forEach(nombre => mostrarError(formulario.elements[nombre], ''));
  }

  function terminar() {
    iniciarSesion();
    avisoSiguiente(`Hola, ${NOMBRE_USUARIO}. Ya sos parte del Club SushiClub.`);
    ir(enlace(volver));
  }

  dibujar();

  delegar($('#principal'), 'click', {
    pestana: el => { pestana = el.dataset.valor; limpiarErrores(); dibujar(); },
    sumarme: () => { sumarme = !sumarme; dibujar(); },
    google: () => terminar(),
  });

  validarEnVivo(formulario, esquemaAcceso);

  formulario.addEventListener('submit', ev => {
    ev.preventDefault();
    const { valido, primero } = validarFormularioAcceso();
    if (!valido) {
      primero.focus();
      return;
    }
    terminar();
  });
})();
