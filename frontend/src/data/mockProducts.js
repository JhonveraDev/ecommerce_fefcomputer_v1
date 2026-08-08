import gamingPcImage from '../assets/products/gaming-pc.png';
import laptopImage from '../assets/products/laptop.png';
import monitorImage from '../assets/products/monitor.png';
import solarPanelImage from '../assets/products/solar-panel.png';
import cctvCameraImage from '../assets/products/cctv-camera.png';
import routerImage from '../assets/products/router.png';
import serverImage from '../assets/products/server.png';
import graphicsCardImage from '../assets/products/graphics-card.png';
import dockingStationImage from '../assets/products/docking-station.png';
import keyboardImage from '../assets/products/keyboard.png';
import ssdImage from '../assets/products/ssd.png';
import printerImage from '../assets/products/printer.png';
import miniPcImage from '../assets/products/mini-pc.png';
import upsImage from '../assets/products/ups.png';

/**
 * @typedef {'Disponible' | 'Agotado' | 'Oferta' | 'Nuevo'} ProductStatus
 * @typedef {Object} Product
 * @property {string} id
 * @property {string} slug
 * @property {string} name
 * @property {string} category
 * @property {string} brand
 * @property {number} price
 * @property {number | null} previousPrice
 * @property {string} shortDescription
 * @property {string} description
 * @property {string} image
 * @property {ProductStatus} status
 * @property {string} sku
 * @property {number} stock
 * @property {number} rating
 * @property {number} reviewCount
 */

export const PRODUCT_PLACEHOLDER = '/product-placeholder.svg';

const categoryImages = {
  'Computadores Gaming': gamingPcImage,
  Laptops: laptopImage,
  Monitores: monitorImage,
  'Paneles Solares': solarPanelImage,
  'Sistemas CCTV': cctvCameraImage,
  'Redes y Telecomunicaciones': routerImage,
  Servidores: serverImage,
  'Componentes para PC': graphicsCardImage,
  'Accesorios Tecnológicos': dockingStationImage,
  'Accesorios Tecnológicos': dockingStationImage,
  Periféricos: keyboardImage,
  Almacenamiento: ssdImage,
  Impresoras: printerImage,
  'Equipos de Oficina': miniPcImage,
  'Energía y UPS': upsImage,
  'Energía y UPS': upsImage,
};

export const productCategories = [
  'Computadores Gaming', 'Laptops', 'Monitores', 'Paneles Solares', 'Sistemas CCTV',
  'Redes y Telecomunicaciones', 'Servidores', 'Componentes para PC', 'Accesorios Tecnológicos',
  'Periféricos', 'Almacenamiento', 'Impresoras', 'Equipos de Oficina', 'Energía y UPS',
];

/** @type {Product[]} */
export const mockProducts = [
  ['gaming-aurora-r5', 'PC Gaming Aurora R5', 'Computadores Gaming', 'Aorus', 6499900, 7199900, 'Torre gaming con RTX y refrigeración optimizada.', 'Equipo gaming ficticio con procesador de alto rendimiento, gráficos dedicados y componentes seleccionados para pruebas de catálogo.', 'Oferta', 'FEF-GAM-001', 7, 4.8, 38],
  ['gaming-nexus-x7', 'PC Gaming Nexus X7', 'Computadores Gaming', 'ASUS', 8299900, null, 'Potencia extrema para gaming y streaming.', 'Computador de demostración con arquitectura de última generación, iluminación configurable y amplio espacio de expansión.', 'Nuevo', 'FEF-GAM-002', 4, 4.9, 21],
  ['gaming-orbit-pro', 'PC Gaming Orbit Pro', 'Computadores Gaming', 'MSI', 5699900, 6199900, 'Configuración equilibrada para jugar en alta resolución.', 'Torre ficticia pensada para ejecutar títulos actuales, editar video y realizar tareas creativas exigentes.', 'Disponible', 'FEF-GAM-003', 11, 4.7, 54],
  ['gaming-vertex-mini', 'PC Gaming Vertex Mini', 'Computadores Gaming', 'Cooler Master', 4499900, null, 'Formato compacto con desempeño para esports.', 'Equipo compacto de muestra con componentes eficientes, gabinete de flujo de aire mejorado y conectividad moderna.', 'Disponible', 'FEF-GAM-004', 9, 4.6, 17],

  ['laptop-zenbook-14', 'Laptop ZenBook 14 Demo', 'Laptops', 'ASUS', 3799900, 4199900, 'Portátil liviano para estudio y trabajo.', 'Laptop ficticia de 14 pulgadas con diseño delgado, almacenamiento rápido y autonomía pensada para jornadas móviles.', 'Oferta', 'FEF-LAP-001', 16, 4.8, 71],
  ['laptop-thinkbook-16', 'Laptop ThinkBook 16 Demo', 'Laptops', 'Lenovo', 4599900, null, 'Productividad profesional con pantalla amplia.', 'Portátil empresarial ficticio con teclado cómodo, conectividad completa y rendimiento multitarea para oficina.', 'Nuevo', 'FEF-LAP-002', 10, 4.7, 42],
  ['laptop-inspiron-15', 'Laptop Inspiron 15 Demo', 'Laptops', 'Dell', 3299900, 3599900, 'Una opción versátil para el día a día.', 'Computador portátil de demostración para navegación, clases virtuales, documentos y entretenimiento en casa.', 'Disponible', 'FEF-LAP-003', 19, 4.5, 66],
  ['laptop-pavilion-x360', 'Laptop Pavilion x360 Demo', 'Laptops', 'HP', 4099900, null, 'Diseño convertible para crear y colaborar.', 'Modelo ficticio de pantalla táctil adaptable, ideal para presentar ideas, tomar notas y consumir contenido.', 'Disponible', 'FEF-LAP-004', 8, 4.6, 29],

  ['monitor-nova-27', 'Monitor Nova 27 QHD', 'Monitores', 'LG', 1199900, 1399900, 'Pantalla QHD de 27 pulgadas para productividad.', 'Monitor de muestra con panel de alta definición, bordes delgados y ergonomía ajustable para escritorio.', 'Oferta', 'FEF-MON-001', 22, 4.8, 93],
  ['monitor-gamer-curve-32', 'Monitor Gamer Curve 32', 'Monitores', 'Samsung', 1799900, null, 'Curvatura inmersiva y alta tasa de actualización.', 'Pantalla curva ficticia para pruebas de experiencia gaming, edición visual y estaciones de trabajo creativas.', 'Nuevo', 'FEF-MON-002', 12, 4.7, 48],
  ['monitor-viewpro-24', 'Monitor ViewPro 24 IPS', 'Monitores', 'ViewSonic', 759900, 849900, 'Color preciso para tareas de oficina y diseño.', 'Monitor IPS ficticio con base ajustable y conectividad versátil para equipos de oficina modernos.', 'Disponible', 'FEF-MON-003', 28, 4.6, 84],
  ['monitor-ultrawide-29', 'Monitor UltraWide 29', 'Monitores', 'LG', 1499900, null, 'Espacio extra para multitarea y análisis.', 'Pantalla panorámica de demostración para usar múltiples aplicaciones sin perder concentración.', 'Disponible', 'FEF-MON-004', 14, 4.7, 33],

  ['solar-neo-450', 'Panel Solar Neo 450 W', 'Paneles Solares', 'Trina Solar', 689900, 749900, 'Panel de alta eficiencia para proyectos energéticos.', 'Panel solar ficticio para catálogos de energía sostenible, con marco reforzado y rendimiento confiable.', 'Oferta', 'FEF-SOL-001', 35, 4.8, 18],
  ['solar-vertex-550', 'Panel Solar Vertex 550 W', 'Paneles Solares', 'Jinko Solar', 829900, null, 'Mayor capacidad para instalaciones comerciales.', 'Módulo solar de demostración pensado para proyectos de autoconsumo y soluciones empresariales.', 'Nuevo', 'FEF-SOL-002', 24, 4.9, 11],
  ['solar-kit-home', 'Kit Solar Hogar 2 kW', 'Paneles Solares', 'EcoFlow', 6499900, 6999900, 'Kit demostrativo para iniciar en energía solar.', 'Solución ficticia que agrupa paneles, estructura y componentes esenciales para una instalación residencial.', 'Disponible', 'FEF-SOL-003', 6, 4.6, 23],
  ['solar-microinverter-800', 'Microinversor Solar 800 W', 'Paneles Solares', 'Hoymiles', 1249900, null, 'Control inteligente para sistemas fotovoltaicos.', 'Microinversor ficticio de muestra para integrar paneles solares en proyectos compactos y escalables.', 'Disponible', 'FEF-SOL-004', 17, 4.5, 15],

  ['cctv-vigilant-4k', 'Cámara CCTV Vigilant 4K', 'Sistemas CCTV', 'Hikvision', 429900, 499900, 'Vigilancia en alta resolución para interiores y exteriores.', 'Cámara de demostración con visión nocturna, carcasa resistente y conectividad para sistemas de seguridad.', 'Oferta', 'FEF-CCTV-001', 30, 4.8, 102],
  ['cctv-kit-secure-8', 'Kit CCTV Secure 8 Canales', 'Sistemas CCTV', 'Dahua', 1899900, null, 'Kit de seguridad para negocios y hogares.', 'Conjunto ficticio de grabador, cámaras y accesorios para visualizar una solución de videovigilancia completa.', 'Nuevo', 'FEF-CCTV-002', 13, 4.7, 39],
  ['cctv-dome-color', 'Cámara Domo Color Night', 'Sistemas CCTV', 'Ezviz', 289900, 329900, 'Imagen a color en condiciones de baja luz.', 'Cámara domo ficticia con diseño discreto, detección inteligente y grabación de prueba.', 'Disponible', 'FEF-CCTV-003', 26, 4.6, 68],
  ['cctv-videoportero-smart', 'Videoportero Smart View', 'Sistemas CCTV', 'TP-Link', 549900, null, 'Control de acceso desde el celular.', 'Equipo ficticio para recibir visitas y gestionar accesos de forma remota en hogar u oficina.', 'Disponible', 'FEF-CCTV-004', 15, 4.5, 27],

  ['network-router-ax6000', 'Router AX6000 Pro', 'Redes y Telecomunicaciones', 'TP-Link', 789900, 879900, 'Wi‑Fi rápido para hogares conectados.', 'Router de demostración con cobertura ampliada, puertos de alto desempeño y gestión sencilla.', 'Oferta', 'FEF-NET-001', 20, 4.8, 117],
  ['network-switch-24g', 'Switch Gigabit 24 Puertos', 'Redes y Telecomunicaciones', 'Ubiquiti', 1299900, null, 'Conectividad confiable para pequeñas empresas.', 'Switch ficticio administrable para organizar redes de oficina, puntos de acceso y equipos críticos.', 'Nuevo', 'FEF-NET-002', 12, 4.7, 31],
  ['network-ap-ceiling', 'Punto de Acceso Ceiling Wi‑Fi 6', 'Redes y Telecomunicaciones', 'Aruba', 699900, 779900, 'Cobertura profesional de alto rendimiento.', 'Access point de muestra para ambientes corporativos con múltiples usuarios conectados.', 'Disponible', 'FEF-NET-003', 18, 4.6, 46],
  ['network-fiber-kit', 'Kit Fibra Óptica Office', 'Redes y Telecomunicaciones', 'MikroTik', 949900, null, 'Base de conectividad para enlaces empresariales.', 'Kit ficticio con componentes para representar una instalación de fibra óptica y telecomunicaciones.', 'Disponible', 'FEF-NET-004', 10, 4.5, 19],

  ['server-poweredge-t150', 'Servidor PowerEdge T150 Demo', 'Servidores', 'Dell', 7999900, 8599900, 'Servidor torre para operaciones de negocio.', 'Equipo empresarial ficticio para centralizar archivos, aplicaciones y servicios internos con fiabilidad.', 'Oferta', 'FEF-SRV-001', 5, 4.8, 14],
  ['server-proliant-ml', 'Servidor ProLiant ML Demo', 'Servidores', 'HPE', 10499900, null, 'Capacidad escalable para crecimiento empresarial.', 'Servidor de muestra con opciones de expansión, almacenamiento y administración remota.', 'Nuevo', 'FEF-SRV-002', 3, 4.9, 9],
  ['server-nas-rack', 'NAS Rack 8 Bahías', 'Servidores', 'Synology', 5399900, 5999900, 'Almacenamiento central para equipos de trabajo.', 'NAS ficticio de montaje en rack para copias de seguridad, colaboración y gestión documental.', 'Disponible', 'FEF-SRV-003', 7, 4.7, 25],
  ['server-mini-edge', 'Servidor Mini Edge', 'Servidores', 'Lenovo', 4299900, null, 'Procesamiento local en formato compacto.', 'Servidor compacto ficticio para puntos de venta, automatización y cargas de trabajo distribuidas.', 'Disponible', 'FEF-SRV-004', 9, 4.6, 12],

  ['component-rtx-vision', 'Tarjeta Gráfica RTX Vision Demo', 'Componentes para PC', 'NVIDIA', 2899900, 3199900, 'Gráficos dedicados para creación y gaming.', 'Tarjeta gráfica ficticia para tarjetas de producto, comparadores y filtros de componentes.', 'Oferta', 'FEF-CMP-001', 10, 4.9, 75],
  ['component-ram-32', 'Memoria RAM DDR5 32 GB', 'Componentes para PC', 'Kingston', 529900, null, 'Memoria rápida para equipos exigentes.', 'Módulo de memoria de demostración ideal para pruebas de categorías, filtros de capacidad y promociones.', 'Nuevo', 'FEF-CMP-002', 33, 4.8, 96],
  ['component-board-b760', 'Board B760 Creator Demo', 'Componentes para PC', 'Gigabyte', 899900, 999900, 'Base moderna para computadores de alto desempeño.', 'Tarjeta principal ficticia con conectividad avanzada, ranuras de expansión y diseño premium.', 'Disponible', 'FEF-CMP-003', 14, 4.6, 36],
  ['component-liquid-240', 'Refrigeración Líquida 240 mm', 'Componentes para PC', 'Corsair', 649900, null, 'Control térmico para configuraciones potentes.', 'Sistema de refrigeración ficticio con iluminación configurable y rendimiento estable.', 'Disponible', 'FEF-CMP-004', 16, 4.7, 43],

  ['accessory-dock-12', 'Docking Station 12 en 1', 'Accesorios Tecnológicos', 'Baseus', 379900, 429900, 'Expande puertos y productividad en un solo equipo.', 'Dock ficticio para laptops con HDMI, USB, red y lector de tarjetas para estaciones de trabajo.', 'Oferta', 'FEF-ACC-001', 21, 4.7, 89],
  ['accessory-webcam-2k', 'Webcam Stream 2K', 'Accesorios Tecnológicos', 'Logitech', 459900, null, 'Video nítido para reuniones y transmisiones.', 'Webcam de muestra con micrófonos integrados y ajuste automático de iluminación.', 'Nuevo', 'FEF-ACC-002', 17, 4.6, 57],
  ['accessory-hub-usbc', 'Hub USB‑C Essential', 'Accesorios Tecnológicos', 'Belkin', 219900, 249900, 'Conecta tus dispositivos esenciales.', 'Hub compacto ficticio para ampliar puertos en computadores, tablets y estaciones de trabajo.', 'Disponible', 'FEF-ACC-003', 39, 4.5, 62],
  ['accessory-stand-aluminum', 'Soporte Aluminio para Laptop', 'Accesorios Tecnológicos', 'UGREEN', 149900, null, 'Mejora ergonomía y ventilación en tu escritorio.', 'Soporte de demostración con diseño minimalista para elevar computadores portátiles.', 'Disponible', 'FEF-ACC-004', 28, 4.6, 44],

  ['peripheral-keyboard-mech', 'Teclado Mecánico Pulse', 'Periféricos', 'Redragon', 349900, 399900, 'Teclas mecánicas para juego y escritura.', 'Teclado ficticio con iluminación configurable, diseño compacto y respuesta precisa.', 'Oferta', 'FEF-PER-001', 24, 4.8, 125],
  ['peripheral-mouse-precision', 'Mouse Precision Pro', 'Periféricos', 'Logitech', 289900, null, 'Control exacto para trabajo y gaming.', 'Mouse de demostración ergonómico con sensor avanzado y botones programables.', 'Nuevo', 'FEF-PER-002', 32, 4.7, 98],
  ['peripheral-headset-air', 'Audífonos Air Wireless', 'Periféricos', 'HyperX', 429900, 479900, 'Audio inmersivo sin cables.', 'Audífonos ficticios con micrófono removible y comodidad para largas sesiones.', 'Disponible', 'FEF-PER-003', 18, 4.6, 73],
  ['peripheral-pad-xl', 'Mouse Pad Control XL', 'Periféricos', 'SteelSeries', 119900, null, 'Superficie amplia para mayor precisión.', 'Mouse pad de muestra con base antideslizante para complementar escritorios de trabajo o juego.', 'Disponible', 'FEF-PER-004', 41, 4.5, 51],

  ['storage-ssd-nvme-1tb', 'SSD NVMe 1 TB Gen4', 'Almacenamiento', 'Kingston', 389900, 459900, 'Almacenamiento veloz para sistemas modernos.', 'Unidad SSD ficticia de alta velocidad para computadores, laptops y estaciones creativas.', 'Oferta', 'FEF-STO-001', 29, 4.8, 143],
  ['storage-hdd-4tb', 'Disco Duro 4 TB Plus', 'Almacenamiento', 'Seagate', 469900, null, 'Capacidad amplia para archivos y respaldos.', 'Disco duro de demostración para bibliotecas multimedia, copias de seguridad y almacenamiento masivo.', 'Nuevo', 'FEF-STO-002', 20, 4.7, 64],
  ['storage-ssd-portable-2tb', 'SSD Portátil 2 TB Shield', 'Almacenamiento', 'Samsung', 729900, 799900, 'Lleva tus archivos con velocidad y protección.', 'SSD externo ficticio con formato resistente para respaldar y transportar proyectos.', 'Disponible', 'FEF-STO-003', 13, 4.6, 49],
  ['storage-nas-8tb', 'Disco NAS 8 TB', 'Almacenamiento', 'Western Digital', 899900, null, 'Unidad diseñada para almacenamiento continuo.', 'Disco ficticio para servidores NAS y soluciones de respaldo compartido.', 'Disponible', 'FEF-STO-004', 11, 4.7, 22],

  ['printer-laser-mono', 'Impresora Laser Mono Pro', 'Impresoras', 'Brother', 789900, 869900, 'Impresión rápida para documentos de oficina.', 'Impresora láser ficticia con conectividad inalámbrica y bandeja de alta capacidad.', 'Oferta', 'FEF-IMP-001', 12, 4.7, 58],
  ['printer-ecotank-color', 'Impresora EcoTank Color', 'Impresoras', 'Epson', 1199900, null, 'Impresión a color de bajo costo operativo.', 'Impresora de muestra con sistema de tinta recargable para hogares y pequeños negocios.', 'Nuevo', 'FEF-IMP-002', 9, 4.8, 76],
  ['printer-multifunction-office', 'Multifuncional Office Scan', 'Impresoras', 'HP', 679900, 749900, 'Imprime, copia y escanea con facilidad.', 'Equipo ficticio multifuncional para escenarios de oficina y trabajo remoto.', 'Disponible', 'FEF-IMP-003', 15, 4.5, 42],
  ['printer-label-thermal', 'Impresora Térmica de Etiquetas', 'Impresoras', 'Zebra', 999900, null, 'Etiquetado eficiente para operaciones comerciales.', 'Impresora ficticia para inventario, logística, puntos de venta y envíos.', 'Disponible', 'FEF-IMP-004', 8, 4.6, 16],

  ['office-mini-pc', 'Mini PC Office Core', 'Equipos de Oficina', 'Intel', 1899900, 2099900, 'Computador compacto para espacios de trabajo.', 'Mini PC ficticio con conectividad completa para escritorios, recepción y señalización digital.', 'Oferta', 'FEF-OFC-001', 18, 4.6, 31],
  ['office-allinone-24', 'All in One 24 Business', 'Equipos de Oficina', 'HP', 3499900, null, 'Solución todo en uno para oficinas modernas.', 'Equipo de demostración que integra pantalla y computador para mantener escritorios organizados.', 'Nuevo', 'FEF-OFC-002', 11, 4.7, 24],
  ['office-scanner-duplex', 'Escáner Duplex Smart', 'Equipos de Oficina', 'Epson', 859900, 929900, 'Digitaliza documentos a doble cara.', 'Escáner ficticio de alimentación automática para flujos documentales de negocio.', 'Disponible', 'FEF-OFC-003', 14, 4.5, 18],
  ['office-shredder-secure', 'Trituradora Secure 12', 'Equipos de Oficina', 'Fellowes', 499900, null, 'Protege información física sensible.', 'Trituradora de demostración para oficinas que requieren gestionar documentos confidenciales.', 'Disponible', 'FEF-OFC-004', 10, 4.4, 13],

  ['energy-ups-1500', 'UPS Smart 1500 VA', 'Energía y UPS', 'APC', 1099900, 1199900, 'Respaldo eléctrico para equipos críticos.', 'UPS fictiva con regulación automática para computadores, redes y estaciones de trabajo.', 'Oferta', 'FEF-ENE-001', 17, 4.8, 70],
  ['energy-powerstation-1k', 'Estación de Energía 1 kWh', 'Energía y UPS', 'EcoFlow', 4299900, null, 'Energía portátil para trabajo y respaldo.', 'Estación ficticia para cargar dispositivos, respaldar equipos y apoyar actividades fuera de la red.', 'Nuevo', 'FEF-ENE-002', 6, 4.7, 28],
  ['energy-regulator-1200', 'Regulador Pro 1200 W', 'Energía y UPS', 'Forza', 279900, 329900, 'Protección estable para electrónicos sensibles.', 'Regulador de voltaje ficticio con múltiples salidas para organizar y proteger el escritorio.', 'Disponible', 'FEF-ENE-003', 25, 4.5, 47],
  ['energy-rack-pdu', 'PDU Rack Inteligente', 'Energía y UPS', 'Tripp Lite', 749900, null, 'Distribución de energía para infraestructura.', 'Unidad PDU ficticia para racks de comunicaciones, servidores y equipos empresariales.', 'Disponible', 'FEF-ENE-004', 9, 4.6, 20],
].map(([slug, name, category, brand, price, previousPrice, shortDescription, description, status, sku, stock, rating, reviewCount], index) => ({
  id: `mock-product-${index + 1}`,
  slug,
  name,
  category,
  brand,
  price,
  previousPrice,
  shortDescription,
  description,
  image: categoryImages[category] ?? PRODUCT_PLACEHOLDER,
  status,
  sku,
  stock,
  rating,
  reviewCount,
}));
