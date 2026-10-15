window.SushiClub = window.SushiClub || {};

(() => {
  // Validaciones de formularios: validadores, reglas con su mensaje, máscaras de escritura
  // y las funciones que validan un formulario completo y muestran el error de cada campo.

  const LETRAS = /^[a-záéíóúüñ' -]+$/i;

  // ---------------------------------------------------------------------------
  // Validadores: reciben un texto y devuelven true / false.
  // ---------------------------------------------------------------------------

  const soloDigitos = texto => String(texto || '').replace(/\D/g, '');

  function esEmail(texto) {
    const email = String(texto || '').trim();
    return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(email);
  }

  // Teléfonos de Argentina, fijos o celulares, en los formatos habituales:
  // +54 9 11 5555-5555 · 54 11 5555 5555 · 011 15 5555-5555 · 11 5555 5555 · 0261 444-5555 · 2614445555
  // Quitando el 54 (país), el 9 (celular internacional), el 0 (larga distancia) y el 15
  // (celular local), siempre quedan 10 dígitos: código de área (2 a 4) + número.
  function numeroNacional(texto) {
    const original = String(texto || '').trim();
    if (/[^\d\s()+.-]/.test(original)) return null; // letras u otros símbolos
    let d = soloDigitos(original);
    if (original.startsWith('+') && !d.startsWith('54')) return null; // otro país
    if (d.startsWith('54') && d.length >= 12) {
      d = d.slice(2);
      if (d.startsWith('9')) d = d.slice(1);
    }
    if (d.startsWith('0')) d = d.slice(1);
    if (d.length === 12) {
      // Celular escrito con 15 después del código de área (de 2, 3 o 4 dígitos).
      for (const area of [2, 3, 4]) {
        if (d.slice(area, area + 2) === '15') { d = d.slice(0, area) + d.slice(area + 2); break; }
      }
    }
    // Los códigos de área argentinos empiezan con 1, 2 o 3.
    return /^[123]\d{9}$/.test(d) ? d : null;
  }

  const esTelefonoArgentino = texto => numeroNacional(texto) !== null;

  // Formato estándar para guardar o mostrar: +54 11 5555 5555
  function formatearTelefono(texto) {
    const d = numeroNacional(texto);
    return d ? `+54 ${d.slice(0, 2)} ${d.slice(2, 6)} ${d.slice(6)}` : String(texto || '').trim();
  }

  // Tarjetas: American Express empieza con 34 o 37 y tiene 15 dígitos (código de 4).
  const esAmex = numero => /^3[47]/.test(soloDigitos(numero));

  // Dígito verificador (algoritmo de Luhn), el que usan todas las tarjetas.
  function cumpleLuhn(digitos) {
    let suma = 0;
    for (let i = 0; i < digitos.length; i++) {
      let n = Number(digitos[digitos.length - 1 - i]);
      if (i % 2 === 1) { n *= 2; if (n > 9) n -= 9; }
      suma += n;
    }
    return suma % 10 === 0;
  }

  function esNumeroTarjeta(texto) {
    const d = soloDigitos(texto);
    const largo = esAmex(d) ? 15 : 16;
    return d.length === largo && cumpleLuhn(d);
  }

  // Vencimiento MM/AA: mes válido y que no haya pasado (vence el último día del mes).
  function estadoVencimiento(texto) {
    const m = /^(\d{2})\/(\d{2})$/.exec(String(texto || '').trim());
    if (!m) return 'formato';
    const mes = Number(m[1]);
    const anio = 2000 + Number(m[2]);
    if (mes < 1 || mes > 12) return 'mes';
    const hoy = new Date();
    const finDeMes = new Date(anio, mes, 0, 23, 59, 59);
    if (finDeMes < hoy) return 'vencida';
    if (anio > hoy.getFullYear() + 20) return 'lejana';
    return 'ok';
  }

  const esCodigoSeguridad = (texto, numeroTarjeta) => new RegExp(`^\\d{${esAmex(numeroTarjeta) ? 4 : 3}}$`).test(String(texto || '').trim());

  // Código postal argentino: 4 números (1414) o CPA: letra de provincia + 4 números (+ 3 letras opcionales).
  const esCodigoPostal = texto => /^(\d{4}|[A-HJ-NP-Z]\d{4}([A-Z]{3})?)$/.test(String(texto || '').trim().toUpperCase());

  // Fecha AAAA-MM-DD (input type="date") igual o posterior a hoy + dias.
  function fechaLocal(dias = 0) {
    const f = new Date();
    f.setDate(f.getDate() + dias);
    return `${f.getFullYear()}-${String(f.getMonth() + 1).padStart(2, '0')}-${String(f.getDate()).padStart(2, '0')}`;
  }
  const esFechaDesde = (texto, dias) => /^\d{4}-\d{2}-\d{2}$/.test(texto) && texto >= fechaLocal(dias);

  // ---------------------------------------------------------------------------
  // Reglas: cada una devuelve una función (valor, formulario) => mensaje de error ('' si está bien).
  // Salvo "requerido", las reglas no se quejan de un campo vacío: así sirven para campos opcionales.
  // ---------------------------------------------------------------------------

  const reglas = {
    requerido: mensaje => valor => (String(valor || '').trim() ? '' : mensaje),

    maximo: (n, mensaje) => valor => (String(valor || '').length > n ? (mensaje || `Usá hasta ${n} caracteres (escribiste ${String(valor).length}).`) : ''),

    nombre: (mensaje = 'Usá solo letras y espacios.') => valor => {
      const v = String(valor || '').trim();
      if (!v) return '';
      if (!LETRAS.test(v)) return mensaje;
      return v.replace(/[^a-záéíóúüñ]/gi, '').length < 2 ? 'El nombre es muy corto.' : '';
    },

    nombreCompleto: () => valor => {
      const v = String(valor || '').trim();
      if (!v) return '';
      if (!LETRAS.test(v)) return 'Usá solo letras y espacios, sin números ni símbolos.';
      return v.split(/\s+/).filter(p => p.length >= 2).length < 2 ? 'Escribí tu nombre y también tu apellido.' : '';
    },

    email: (mensaje = 'El email no parece válido. Revisá que tenga el formato nombre@dominio.com.') => valor =>
      (!String(valor || '').trim() || esEmail(valor) ? '' : mensaje),

    telefono: (mensaje = 'Ingresá un teléfono de Argentina con código de área, por ejemplo 11 5555 5555 o 0261 444 5555.') => valor =>
      (!String(valor || '').trim() || esTelefonoArgentino(valor) ? '' : mensaje),

    emailOTelefono: () => valor => {
      const v = String(valor || '').trim();
      if (!v) return '';
      if (v.includes('@')) return esEmail(v) ? '' : 'El email no parece válido. Revisá que tenga el formato nombre@dominio.com.';
      return esTelefonoArgentino(v) ? '' : 'Ingresá un email o un WhatsApp de Argentina con código de área, por ejemplo 11 5555 5555.';
    },

    direccion: () => valor => {
      const v = String(valor || '').trim();
      if (!v) return '';
      if (v.length < 5 || !/[a-záéíóúñ]/i.test(v)) return 'Escribí la calle y la altura, por ejemplo Honduras 5100.';
      return /\d/.test(v) ? '' : 'Falta la altura de la calle, por ejemplo Honduras 5100.';
    },

    codigoPostal: () => valor => (!String(valor || '').trim() || esCodigoPostal(valor)
      ? '' : 'El código postal tiene 4 números (1414) o el formato nuevo, con letra: C1414 o C1414ABC.'),

    numeroTarjeta: () => valor => {
      const d = soloDigitos(valor);
      if (!d) return '';
      const largo = esAmex(d) ? 15 : 16;
      if (d.length !== largo) return `El número de tarjeta tiene ${largo} dígitos y escribiste ${d.length}.`;
      return cumpleLuhn(d) ? '' : 'El número de tarjeta no es válido. Revisá que esté bien copiado.';
    },

    vencimiento: () => valor => {
      if (!String(valor || '').trim()) return '';
      return {
        formato: 'Usá el formato MM/AA, por ejemplo 08/27.',
        mes: 'El mes tiene que estar entre 01 y 12.',
        vencida: 'La tarjeta está vencida. Usá otra tarjeta o elegí otro medio de pago.',
        lejana: 'Revisá el año de vencimiento.',
        ok: '',
      }[estadoVencimiento(valor)];
    },

    // campoTarjeta: nombre del input con el número, para saber si es American Express (4 dígitos).
    codigoSeguridad: campoTarjeta => (valor, formulario) => {
      if (!String(valor || '').trim()) return '';
      const numero = formulario?.elements[campoTarjeta]?.value || '';
      return esCodigoSeguridad(valor, numero) ? ''
        : esAmex(numero) ? 'El código de American Express tiene 4 dígitos y está en el frente de la tarjeta.'
          : 'El código tiene 3 dígitos y está en el dorso de la tarjeta.';
    },

    fechaDesde: (dias, mensaje) => valor => (!valor || esFechaDesde(valor, dias) ? '' : mensaje),

    clave: () => valor => {
      const v = String(valor || '');
      if (!v) return '';
      if (v.length < 8) return `La contraseña tiene que tener al menos 8 caracteres (tiene ${v.length}).`;
      return /[a-z]/i.test(v) && /\d/.test(v) ? '' : 'Combiná letras y números para que sea más segura.';
    },
  };

  // ---------------------------------------------------------------------------
  // Mostrar errores y validar formularios.
  // Cada campo tiene debajo un <span id="error-NOMBRE" class="campo__error"> con su mensaje.
  // ---------------------------------------------------------------------------

  function mostrarError(entrada, mensaje) {
    entrada.classList.toggle('tiene-error', !!mensaje);
    if (mensaje) entrada.setAttribute('aria-invalid', 'true'); else entrada.removeAttribute('aria-invalid');
    const id = 'error-' + entrada.name;
    let caja = document.getElementById(id);
    if (!caja) {
      caja = document.createElement('span');
      caja.className = 'campo__error';
      caja.id = id;
      entrada.insertAdjacentElement('afterend', caja);
      entrada.setAttribute('aria-describedby', id);
    }
    caja.textContent = mensaje || '';
    caja.hidden = !mensaje;
  }

  // Devuelve el primer mensaje de error del campo ('' si cumple todas las reglas).
  function validarCampo(formulario, nombre, listaReglas) {
    const entrada = formulario.elements[nombre];
    if (!entrada) return '';
    for (const regla of listaReglas) {
      const mensaje = regla(entrada.value, formulario);
      if (mensaje) return mensaje;
    }
    return '';
  }

  // esquema: { nombreDelCampo: [regla, regla, …] }. Los campos que no están en el formulario se saltean.
  // Devuelve { valido, errores: { campo: mensaje }, primero: input con el primer error }.
  function validarFormulario(formulario, esquema, { mostrar = true } = {}) {
    const errores = {};
    let primero = null;
    for (const [nombre, listaReglas] of Object.entries(esquema)) {
      const entrada = formulario.elements[nombre];
      if (!entrada) continue;
      const mensaje = validarCampo(formulario, nombre, listaReglas);
      if (mensaje) { errores[nombre] = mensaje; primero = primero || entrada; }
      if (mostrar) mostrarError(entrada, mensaje);
    }
    return { valido: !primero, errores, primero };
  }

  // Valida cada campo al salir de él, y mientras se escribe si ya tenía un error
  // (así el mensaje desaparece apenas se corrige). obtenerEsquema puede cambiar según el estado.
  // alCambiar(nombre, mensaje) avisa a la pantalla para que recuerde el error al redibujar.
  function validarEnVivo(formulario, obtenerEsquema, alCambiar = () => {}) {
    const revisar = (ev, soloSiTieneError) => {
      const entrada = ev.target;
      const listaReglas = obtenerEsquema()[entrada.name];
      if (!listaReglas) return;
      if (soloSiTieneError && !entrada.classList.contains('tiene-error')) return;
      if (!soloSiTieneError && !entrada.value.trim() && !entrada.classList.contains('tiene-error')) return; // no retar por pasar de largo
      const mensaje = validarCampo(formulario, entrada.name, listaReglas);
      mostrarError(entrada, mensaje);
      alCambiar(entrada.name, mensaje);
    };
    formulario.addEventListener('focusout', ev => revisar(ev, false));
    formulario.addEventListener('input', ev => revisar(ev, true));
  }

  // ---------------------------------------------------------------------------
  // Máscaras: dan formato mientras se escribe.
  // ---------------------------------------------------------------------------

  const mascaras = {
    // 4 grupos de 4 (Amex: 4-6-5).
    tarjeta: valor => {
      const d = soloDigitos(valor).slice(0, esAmex(valor) ? 15 : 16);
      const grupos = esAmex(d) ? [4, 6, 5] : [4, 4, 4, 4];
      const partes = [];
      let i = 0;
      for (const g of grupos) { if (i < d.length) partes.push(d.slice(i, i + g)); i += g; }
      return partes.join(' ');
    },
    // MM/AA, agregando la barra sola.
    vencimiento: valor => {
      const d = soloDigitos(valor).slice(0, 4);
      return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
    },
    digitos: largo => valor => soloDigitos(valor).slice(0, largo),
    telefono: valor => String(valor).replace(/[^\d\s()+-]/g, '').slice(0, 20),
    codigoPostal: valor => String(valor).toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8),
  };

  // aplicarMascaras(formulario, { nombreDelCampo: mascara }). alCambiar(nombre, valor) recibe el valor ya formateado.
  function aplicarMascaras(formulario, mapa, alCambiar = () => {}) {
    formulario.addEventListener('input', ev => {
      const mascara = mapa[ev.target.name];
      if (!mascara) return;
      const formateado = mascara(ev.target.value);
      if (formateado !== ev.target.value) ev.target.value = formateado;
      alCambiar(ev.target.name, formateado);
    });
  }

  SushiClub.validaciones = {
    soloDigitos, esEmail, esTelefonoArgentino, formatearTelefono, esNumeroTarjeta, esCodigoPostal, fechaLocal,
    reglas, mostrarError, validarCampo, validarFormulario, validarEnVivo, mascaras, aplicarMascaras,
  };
})();
