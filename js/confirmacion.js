(() => {
  const { montarLayout } = SushiClub.layout;
  const { almacen } = SushiClub.estado;
  const { $, datosPedido, enlaceIngreso, pagina } = SushiClub.utilidades;

  montarLayout({ pagina: 'confirmacion', encabezado: 'ok', pie: false });

  function dibujar() {
    const e = almacen.obtener();
    const p = datosPedido(e);
    $('#confirmacion-llegada').textContent = p.llegada;
    $('#confirmacion-pedido').textContent = `Pedido ${p.numero} · ${p.totalTexto}`;
    $('#confirmacion-invitado').hidden = e.sesionIniciada;
    const principal = $('#confirmacion-principal');
    principal.href = e.sesionIniciada ? pagina('pedidos') : enlaceIngreso('pages/pedidos.html');
    principal.textContent = e.sesionIniciada ? 'Ver estado en Mis pedidos' : 'Iniciá sesión / Registro';
  }

  dibujar();
  almacen.suscribir(dibujar);
})();
