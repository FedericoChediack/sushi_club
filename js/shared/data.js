// Datos fijos del sitio (copiados del prototipo v3).

// Imagen en img/, resuelta desde la raíz del sitio (este módulo está en js/shared/).
const imagen = ruta => new URL('../../img/' + ruta, import.meta.url).href;

export const PRODUCTOS = [
  { id: 'combo45', seccion: 'oferta', categoria: 'Combinados', nombre: 'Combinado Club 45', descripcion: '45 piezas · salmón, langostino y pesca blanca', precio: 42900, anterior: 53600, etiqueta: '−20%', imagen: imagen('productos/combo45.jpg') },
  { id: 'combo30', seccion: 'oferta', categoria: 'Combinados', nombre: 'Combinado Club 30', descripcion: '30 piezas · rolls, nigiris y sashimi', precio: 31500, anterior: 36900, etiqueta: '−15%', imagen: imagen('productos/combo30.jpg') },
  { id: 'nyr', seccion: 'oferta', categoria: 'Rolls', nombre: 'New York Roll', descripcion: '10 piezas · salmón, palta, queso', precio: 14200, imagen: imagen('productos/new-york-roll.jpg') },
  { id: 'salmon', seccion: 'oferta', categoria: 'Combinados', nombre: 'Salmón Especial', descripcion: '15 piezas · nigiri, sashimi y hot roll', precio: 21500, imagen: imagen('productos/salmon-especial.jpg') },
  { id: 'ebi', seccion: 'oferta', categoria: 'Rolls', nombre: 'Ebi Tempura Roll', descripcion: '10 piezas · langostino tempura, teriyaki', precio: 16800, imagen: imagen('productos/ebi-tempura.jpg') },
  { id: 'veggie', seccion: 'oferta', categoria: 'Veggie', nombre: 'Veggie Roll', descripcion: '10 piezas · palta, pepino, mango', precio: 11900, anterior: 13900, etiqueta: '2X1 LUNES', imagen: imagen('productos/veggie-roll.jpg') },
  { id: 'geisha', seccion: 'club', categoria: 'Rolls', nombre: 'Geisha Roll', descripcion: '10 piezas · envuelto en salmón, philadelphia', precio: 15600, anterior: 17800, etiqueta: 'PRECIO CLUB', imagen: imagen('productos/geisha-roll.jpg') },
  { id: 'nigiri', seccion: 'club', categoria: 'Nigiris y sashimi', nombre: 'Nigiri de Salmón', descripcion: '6 piezas · salmón rosado', precio: 9800, anterior: 11200, etiqueta: 'PRECIO CLUB', imagen: imagen('productos/nigiri-salmon.jpg') },
  { id: 'tartar', seccion: 'club', categoria: 'Entradas', nombre: 'Tartar de Atún', descripcion: 'Atún rojo, palta, sésamo tostado', precio: 13400, anterior: 15500, etiqueta: 'PRECIO CLUB', imagen: imagen('productos/tartar-atun.jpg') },
  { id: 'gyozas', seccion: 'club', categoria: 'Entradas', nombre: 'Gyozas de Cerdo', descripcion: '6 unidades · salsa ponzu', precio: 8900, anterior: 9900, etiqueta: 'PRECIO CLUB', imagen: imagen('productos/gyozas.jpg') },
  { id: 'hot', seccion: 'club', categoria: 'Rolls', nombre: 'Hot Roll', descripcion: '10 piezas · rebozado panko, salsa de anguila', precio: 15200, anterior: 16900, etiqueta: 'PRECIO CLUB', imagen: imagen('productos/hot-roll.jpg') },
  { id: 'mochi', seccion: 'club', categoria: 'Postres', nombre: 'Mochi', descripcion: '3 unidades · matcha, maracuyá, chocolate', precio: 6500, anterior: 7400, etiqueta: 'PRECIO CLUB', imagen: imagen('productos/mochi.jpg') },
];

export const CATEGORIAS = ['Todos', 'Combinados', 'Rolls', 'Nigiris y sashimi', 'Entradas', 'Veggie', 'Postres'];

export const EVENTOS = [
  { id: 'gala', fecha: '10.10', dia: 'Viernes 10 de octubre', hora: '21:00 h', nombre: 'Cena de Gala', precio: 85000, sede: 'Puerto Madero', cupos: 'Quedan 14 lugares', descripcion: 'Menú de siete pasos del chef con maridaje de vinos y espumantes. Dress code formal.', incluye: ['7 pasos del chef', 'Maridaje de vinos y espumantes', 'Recepción con champagne', 'Música en vivo'], imagen: imagen('eventos/evento-gala.jpg') },
  { id: 'jazz', fecha: '16.10', dia: 'Jueves 16 de octubre', hora: '21:30 h', nombre: 'Noche de Jazz', precio: 55000, sede: 'Palermo Soho', cupos: 'Quedan 22 lugares', descripcion: 'Trío de jazz en vivo y carta de autor con barra de cócteles.', incluye: ['Show de jazz en vivo', 'Menú de 5 pasos', 'Un cóctel de autor'], imagen: imagen('eventos/evento-jazz.jpg') },
  { id: 'omakase', fecha: '18.10', dia: 'Sábado 18 de octubre', hora: '20:00 h', nombre: 'Barra Omakase', precio: 120000, sede: 'Recoleta', cupos: 'Quedan 4 lugares', descripcion: 'Doce lugares en barra. El sushiman elige y prepara cada pieza frente a vos.', incluye: ['18 piezas omakase', 'Maridaje de sake', 'Barra para 12 personas'], imagen: imagen('eventos/evento-omakase.jpg') },
  { id: 'sake', fecha: '23.10', dia: 'Jueves 23 de octubre', hora: '20:30 h', nombre: 'Cata de Sake', precio: 48000, sede: 'Belgrano', cupos: 'Quedan 18 lugares', descripcion: 'Cata guiada de cinco sakes japoneses con piezas pensadas para cada uno.', incluye: ['5 sakes japoneses', 'Piezas de maridaje', 'Guía de un sommelier'], imagen: imagen('eventos/evento-sake.jpg') },
];

export const SEDES = [
  { zona: 'CABA', sedes: [['Palermo Soho', 'Honduras 5100'], ['Puerto Madero', 'Alicia M. de Justo 1100'], ['Recoleta', 'Av. Quintana 450'], ['Belgrano', 'Av. Cabildo 2200']] },
  { zona: 'GBA', sedes: [['Nordelta', 'Av. de los Lagos 7010'], ['Pilar', 'Panamericana km 50'], ['San Isidro', 'Av. Centenario 150']] },
  { zona: 'INTERIOR', sedes: [['Chacras Park', 'Mendoza · Viamonte 4800'], ['Córdoba', 'Nuevocentro Shopping']] },
  { zona: 'TEMPORADA', cerrada: true, sedes: [['Cariló', 'Av. Divisadero y Cerezo'], ['Pinamar', 'Av. Bunge 1200']] },
];

export const REGALOS = [
  { id: 'clasico', nombre: 'Gift Clásico', descripcion: '24 piezas · rolls y nigiris', precio: 29900, imagen: imagen('gift/gift-clasico.jpg') },
  { id: 'premium', nombre: 'Gift Premium', descripcion: '40 piezas · sashimi, rolls especiales y postre', precio: 47500, imagen: imagen('gift/gift-premium.jpg') },
  { id: 'dulce', nombre: 'Gift Dulce', descripcion: 'Mochis, dorayakis y té matcha', precio: 18900, imagen: imagen('gift/gift-dulce.jpg') },
];

export const ENVIO_REGALO = 2500;
export const FRANJAS_REGALO = ['12–15 h', '15–18 h', '18–21 h'];

export const BENEFICIOS = [
  { id: 'b1', titulo: '−20% martes y miércoles', descripcion: 'En el Combinado Club 45, delivery y retiro en el local.', exclusivo: false },
  { id: 'b2', titulo: '2x1 en Veggie Rolls', descripcion: 'Todos los lunes, en todas las sedes.', exclusivo: false },
  { id: 'b3', titulo: 'Precio Club en la carta', descripcion: 'Hasta 15% menos en más de 40 productos.', exclusivo: true },
  { id: 'b4', titulo: 'Postre en tu cumpleaños', descripcion: 'Un mochi de regalo, válido 7 días.', exclusivo: true },
  { id: 'b5', titulo: 'Prioridad en eventos', descripcion: 'Reservá la Cena de Gala 72 h antes que el resto.', exclusivo: true },
  { id: 'b6', titulo: 'Envío sin costo', descripcion: 'En pedidos desde $ 40.000.', exclusivo: true },
];

export const PROMO_CLUB = [
  { numero: '01', texto: 'Precio Club en más de 40 productos de la carta.' },
  { numero: '02', texto: 'Prioridad para reservar Cena de Gala y Noche de Jazz.' },
  { numero: '03', texto: 'Seguimiento de tus pedidos y repetirlos en un toque.' },
];

export const SERVICIOS_CATERING = [
  { numero: '01', titulo: 'Corporativo', descripcion: 'Almuerzos de trabajo, reuniones de directorio y lanzamientos. Bandejas individuales o para compartir.' },
  { numero: '02', titulo: 'Eventos sociales', descripcion: 'Cumpleaños, casamientos y celebraciones, con menú a medida.' },
  { numero: '03', titulo: 'Barra en vivo', descripcion: 'Un sushiman prepara las piezas frente a tus invitados.' },
];
export const TIPOS_CATERING = ['Corporativo', 'Social', 'Barra en vivo'];
export const INVITADOS_CATERING = ['20–50', '50–100', '100–250', '+250'];

export const DIAS = ['Mié 30/9', 'Jue 1/10', 'Vie 2/10', 'Sáb 3/10', 'Dom 4/10', 'Lun 5/10', 'Mar 6/10'];

export const PEDIDOS_ANTERIORES = [
  { id: '#SC-47102', fecha: '12 sep', productos: 'Salmón Especial · 2 × Gyozas', total: '$ 39.300', carrito: { salmon: 1, gyozas: 2 } },
  { id: '#SC-46388', fecha: '28 ago', productos: 'Combinado Club 30 · Mochi', total: '$ 38.000', carrito: { combo30: 1, mochi: 1 } },
];

export const COSTO_DELIVERY = 2500;
export const SENA_EVENTO = 0.3;
export const MAX_PERSONAS_EVENTO = 12;
export const NOMBRE_USUARIO = 'Sofía';
export const EMAIL_USUARIO = 'sofia@mail.com';
