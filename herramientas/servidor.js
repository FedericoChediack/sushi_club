// Servidor local mínimo para ver el sitio (solo usa módulos que trae Node, sin instalar nada).
// Uso: node herramientas/servidor.js            -> sirve el sitio y abre el navegador
//      node herramientas/servidor.js --sin-navegador
const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const RAIZ = path.resolve(__dirname, '..');
const PUERTO_INICIAL = 5500;
const ABRIR_NAVEGADOR = !process.argv.includes('--sin-navegador');

const TIPOS = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.md': 'text/plain; charset=utf-8',
};

const servidor = http.createServer((pedido, respuesta) => {
  let ruta = decodeURIComponent(pedido.url.split('?')[0]);
  if (ruta.endsWith('/')) ruta += 'index.html';
  const archivo = path.join(RAIZ, ruta);

  // No deja salir de la carpeta del proyecto.
  if (!archivo.startsWith(RAIZ)) {
    respuesta.writeHead(403);
    respuesta.end('Prohibido');
    return;
  }

  fs.readFile(archivo, (error, contenido) => {
    if (error) {
      respuesta.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      respuesta.end('No encontrado: ' + ruta);
      return;
    }
    respuesta.writeHead(200, {
      'Content-Type': TIPOS[path.extname(archivo).toLowerCase()] || 'application/octet-stream',
      'Cache-Control': 'no-store', // siempre la última versión de los archivos
    });
    respuesta.end(contenido);
  });
});

function abrir(url) {
  const comando = process.platform === 'win32' ? `start "" "${url}"`
    : process.platform === 'darwin' ? `open "${url}"`
    : `xdg-open "${url}"`;
  exec(comando);
}

function escuchar(puerto) {
  servidor.once('error', error => {
    if (error.code === 'EADDRINUSE' && puerto < PUERTO_INICIAL + 20) escuchar(puerto + 1);
    else { console.error('No se pudo iniciar el servidor:', error.message); process.exit(1); }
  });
  servidor.listen(puerto, '127.0.0.1', () => {
    const url = `http://localhost:${puerto}/`;
    console.log('');
    console.log('  SushiClub corriendo en ' + url);
    console.log('  Dejá esta ventana abierta mientras usás el sitio. Para cerrarlo: Ctrl + C');
    console.log('');
    if (ABRIR_NAVEGADOR) abrir(url);
  });
}

escuchar(PUERTO_INICIAL);
