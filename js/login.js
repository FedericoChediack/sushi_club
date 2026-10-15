import { montarLayout, avisoSiguiente } from './shared/layout.js';
import { almacen, iniciarSesion } from './shared/store.js';
import { PROMO_CLUB, NOMBRE_USUARIO } from './shared/data.js';
import { $, $$, delegar, parametro, ir, enlace, rutaSegura } from './shared/utils.js';

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

function mostrarError(visible) {
  formulario.elements.email.classList.toggle('tiene-error', visible);
  $('#acceso-error').hidden = !visible;
}

function terminar() {
  iniciarSesion();
  avisoSiguiente(`Hola, ${NOMBRE_USUARIO}. Ya sos parte del Club SushiClub.`);
  ir(enlace(volver));
}

dibujar();

delegar($('#principal'), 'click', {
  pestana: el => { pestana = el.dataset.valor; mostrarError(false); dibujar(); },
  sumarme: () => { sumarme = !sumarme; dibujar(); },
  google: () => terminar(),
});

formulario.elements.email.addEventListener('input', () => mostrarError(false));

formulario.addEventListener('submit', ev => {
  ev.preventDefault();
  if (!formulario.elements.email.value.includes('@')) {
    mostrarError(true);
    formulario.elements.email.focus();
    return;
  }
  terminar();
});
