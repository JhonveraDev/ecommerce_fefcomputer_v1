import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { SpreadsheetFile, Workbook } from '@oai/artifact-tool';

const outputDir = fileURLToPath(new URL('../outputs/product-import-samples/', import.meta.url));
const headers = ['SKU', 'Nombre', 'Categoría', 'Marca', 'Precio', 'Stock', 'Descripción corta', 'Descripción', 'Imagen principal', 'Imágenes adicionales', 'Peso (g)', 'Largo (cm)', 'Ancho (cm)', 'Alto (cm)', 'Garantía', 'Condición', 'Etiquetas', 'Estado', 'Destacado', 'Precio anterior', 'Inicio oferta', 'Fin oferta', 'URL amigable', 'Título SEO', 'Descripción SEO'];
const products = [
  ['DEMO-2026-LAP-001', 'Portátil Nova 14', 'Computadores', 'NovaTech', 2899000, 12, 'Portátil ligero para estudio y oficina.', 'Portátil de 14 pulgadas con procesador eficiente, SSD rápido y batería para una jornada de trabajo.', 'https://placehold.co/800x600/png?text=Portatil+Nova+14', 'https://placehold.co/800x600/png?text=Nova+14+Lateral|https://placehold.co/800x600/png?text=Nova+14+Teclado', 1400, 32, 22, 2, '12 meses', 'NEW', 'portátil, oficina, estudio', 'ACTIVE', 'SI', '', '', '', 'portatil-nova-14', 'Portátil Nova 14 para estudio', 'Portátil liviano con SSD para estudio y trabajo.'],
  ['DEMO-2026-MON-002', 'Monitor Vision 24 IPS', 'Monitores', 'Vision', 699000, 20, 'Monitor Full HD IPS de 24 pulgadas.', 'Monitor de 24 pulgadas con panel IPS, resolución Full HD y frecuencia de actualización de 100 Hz.', 'https://placehold.co/800x600/png?text=Monitor+Vision+24', '', 3500, 54, 18, 42, '24 meses', 'NEW', 'monitor, oficina, ips', 'ACTIVE', 'NO', '', '', '', 'monitor-vision-24-ips', 'Monitor Vision 24 IPS Full HD', 'Monitor IPS de 24 pulgadas para oficina y entretenimiento.'],
  ['DEMO-2026-SSD-003', 'SSD Pulse 1 TB NVMe', 'Almacenamiento', 'Pulse', 349000, 35, 'Unidad SSD NVMe de alto rendimiento.', 'SSD M.2 NVMe de 1 TB para acelerar equipos de escritorio y portátiles compatibles.', 'https://placehold.co/800x600/png?text=SSD+Pulse+1TB', '', 45, 8, 2, 0, '36 meses', 'NEW', 'ssd, nvme, almacenamiento', 'ACTIVE', 'SI', 399000, '2026-12-01T00:00:00', '2026-12-31T23:59:00', 'ssd-pulse-1tb-nvme', 'SSD Pulse 1 TB NVMe', 'SSD NVMe de 1 TB para mayor velocidad.'],
  ['DEMO-2026-KEY-004', 'Teclado Mecánico Forge K87', 'Periféricos', 'Forge', 279000, 18, 'Teclado mecánico compacto para gaming.', 'Teclado mecánico TKL con iluminación RGB y distribución en español.', 'https://placehold.co/800x600/png?text=Teclado+Forge+K87', 'https://placehold.co/800x600/png?text=Forge+K87+RGB', 900, 36, 14, 4, '12 meses', 'NEW', 'teclado, gaming, rgb', 'ACTIVE', 'NO', '', '', '', 'teclado-mecanico-forge-k87', 'Teclado mecánico Forge K87', 'Teclado mecánico compacto con iluminación RGB.'],
  ['DEMO-2026-ROU-005', 'Router Mesh LinkWave AX3000', 'Redes', 'LinkWave', 459000, 10, 'Router Wi-Fi 6 para hogares y oficinas.', 'Router Wi-Fi 6 con doble banda y cobertura ampliable mediante tecnología mesh.', 'https://placehold.co/800x600/png?text=Router+AX3000', '', 620, 23, 17, 5, '24 meses', 'NEW', 'router, wifi 6, redes', 'ACTIVE', 'NO', '', '', '', 'router-mesh-linkwave-ax3000', 'Router Mesh LinkWave AX3000', 'Router Wi-Fi 6 de doble banda para hogares y oficinas.'],
  ['DEMO-2026-UPS-006', 'UPS Guard 1200 VA', 'Energía y UPS', 'Guard', 589000, 8, 'Respaldo de energía para equipos críticos.', 'UPS interactiva de 1200 VA para proteger computadores, monitores y equipos de red.', 'https://placehold.co/800x600/png?text=UPS+Guard+1200VA', '', 8500, 35, 14, 20, '18 meses', 'NEW', 'ups, energía, protección', 'ACTIVE', 'NO', '', '', '', 'ups-guard-1200va', 'UPS Guard 1200 VA', 'UPS de 1200 VA para proteger equipos electrónicos.'],
  ['DEMO-2026-CAM-007', 'Cámara SecureCam 4 MP', 'Seguridad', 'SecureCam', 219000, 25, 'Cámara IP para vigilancia interior o exterior.', 'Cámara de seguridad IP de 4 MP con visión nocturna, detección de movimiento y conexión por red.', 'https://placehold.co/800x600/png?text=Camara+SecureCam+4MP', '', 480, 11, 11, 10, '12 meses', 'NEW', 'cámara, seguridad, cctv', 'ACTIVE', 'NO', '', '', '', 'camara-securecam-4mp', 'Cámara SecureCam 4 MP', 'Cámara IP 4 MP con visión nocturna y detección de movimiento.'],
  ['DEMO-2026-PRN-008', 'Impresora OfficeJet Pro 902', 'Impresoras', 'OfficeJet', 899000, 7, 'Impresora multifuncional para pequeñas oficinas.', 'Impresora multifuncional con conexión Wi-Fi, impresión a doble cara y alimentador automático.', 'https://placehold.co/800x600/png?text=Impresora+OfficeJet+902', '', 9200, 44, 36, 28, '12 meses', 'NEW', 'impresora, oficina, wifi', 'ACTIVE', 'NO', '', '', '', 'impresora-officejet-pro-902', 'Impresora OfficeJet Pro 902', 'Impresora multifuncional Wi-Fi para oficinas.'],
  ['DEMO-2026-PC-009', 'PC Gamer Titan X', 'Computadores', 'Titan', 5499000, 5, 'Computador gamer de alto desempeño.', 'PC gamer con procesador de última generación, tarjeta gráfica dedicada y refrigeración optimizada.', 'https://placehold.co/800x600/png?text=PC+Gamer+Titan+X', 'https://placehold.co/800x600/png?text=Titan+X+Interior', 11000, 48, 23, 48, '24 meses', 'NEW', 'pc gamer, gaming, escritorio', 'ACTIVE', 'SI', 5999000, '2026-12-05T00:00:00', '2027-01-05T23:59:00', 'pc-gamer-titan-x', 'PC Gamer Titan X', 'PC gamer con gráfica dedicada para alto rendimiento.'],
  ['DEMO-2026-DOC-010', 'Dock USB-C Connect 12 en 1', 'Accesorios', 'Connect', 329000, 15, 'Base USB-C con puertos para productividad.', 'Dock USB-C con HDMI, Ethernet, lectores de tarjetas y puertos USB para ampliar la conectividad.', 'https://placehold.co/800x600/png?text=Dock+USB-C+12en1', '', 320, 14, 6, 2, '12 meses', 'NEW', 'dock, usb-c, accesorios', 'ACTIVE', 'NO', '', '', '', 'dock-usb-c-connect-12-en-1', 'Dock USB-C Connect 12 en 1', 'Dock USB-C con HDMI, Ethernet y puertos USB.'],
];
const variants = [
  ['SKU producto', 'SKU variante', 'Atributos', 'Precio especial', 'Stock'],
  ['DEMO-2026-LAP-001', 'DEMO-2026-LAP-001-16GB', 'Memoria RAM: 16 GB|Color: Gris', 3099000, 6],
  ['DEMO-2026-LAP-001', 'DEMO-2026-LAP-001-32GB', 'Memoria RAM: 32 GB|Color: Gris', 3399000, 4],
  ['DEMO-2026-KEY-004', 'DEMO-2026-KEY-004-RED', 'Switch: Rojo|Distribución: Español', 279000, 10],
  ['DEMO-2026-KEY-004', 'DEMO-2026-KEY-004-BLUE', 'Switch: Azul|Distribución: Español', 289000, 8],
  ['DEMO-2026-CAM-007', 'DEMO-2026-CAM-007-BLANC', 'Color: Blanco|Alimentación: PoE', 229000, 12],
  ['DEMO-2026-CAM-007', 'DEMO-2026-CAM-007-NEGR', 'Color: Negro|Alimentación: PoE', 229000, 13],
];
const notes = [
  ['Guía rápida de importación'],
  ['1. Completa la hoja Productos. SKU, Nombre, Categoría, Precio, Stock e Imagen principal son obligatorios.'],
  ['2. Usa Condición: NEW, REFURBISHED o USED. Usa Estado: ACTIVE, DRAFT o INACTIVE. Destacado admite SI o NO.'],
  ['3. Separa varias imágenes con | y etiquetas con coma. Máximo 5 imágenes por producto.'],
  ['4. Si hay oferta, completa Precio anterior, Inicio oferta y Fin oferta. El precio anterior debe ser mayor al precio.'],
  ['5. Para variantes, relaciona cada fila de Variantes con el SKU del producto y separa atributos con |.'],
  ['6. Los SKU deben ser únicos. Reemplaza los productos DEMO antes de una carga real.'],
];

const workbook = Workbook.create();
const productSheet = workbook.worksheets.add('Productos');
const variantSheet = workbook.worksheets.add('Variantes');
const guideSheet = workbook.worksheets.add('Guía');
for (const sheet of [productSheet, variantSheet, guideSheet]) { sheet.showGridLines = false; }
productSheet.getRange(`A1:Y${products.length + 1}`).values = [headers, ...products];
variantSheet.getRange(`A1:E${variants.length}`).values = variants;
guideSheet.getRange(`A1:A${notes.length}`).values = notes;
productSheet.getRange('A1:Y1').format = { fill: '#12365A', font: { name: 'Arial', size: 10, bold: true, color: '#FFFFFF' }, horizontalAlignment: 'center', verticalAlignment: 'center', wrapText: true };
variantSheet.getRange('A1:E1').format = { fill: '#12365A', font: { name: 'Arial', size: 10, bold: true, color: '#FFFFFF' }, horizontalAlignment: 'center', verticalAlignment: 'center', wrapText: true };
guideSheet.getRange('A1').format = { font: { name: 'Arial', size: 15, bold: true, color: '#12365A' } };
guideSheet.getRange('A2:A7').format = { font: { name: 'Arial', size: 10, color: '#263238' }, wrapText: true };
productSheet.getRange(`A2:Y${products.length + 1}`).format.verticalAlignment = 'center';
productSheet.getRange(`E2:F${products.length + 1}`).format.numberFormat = '#,##0';
productSheet.getRange(`T2:T${products.length + 1}`).format.numberFormat = '#,##0';
productSheet.getRange(`U2:V${products.length + 1}`).format.numberFormat = 'yyyy-mm-dd hh:mm';
productSheet.getRange(`A1:Y${products.length + 1}`).format.borders = { preset: 'outside', style: 'thin', color: '#C9D5E2' };
variantSheet.getRange(`A1:E${variants.length}`).format.borders = { preset: 'outside', style: 'thin', color: '#C9D5E2' };
productSheet.tables.add(`A1:Y${products.length + 1}`, true, 'ProductosImportacion');
variantSheet.tables.add(`A1:E${variants.length}`, true, 'VariantesImportacion');
productSheet.freezePanes.freezeRows(1);
variantSheet.freezePanes.freezeRows(1);
productSheet.getRange('A:Y').format.columnWidth = 15;
productSheet.getRange('B:B').format.columnWidth = 25;
productSheet.getRange('G:H').format.columnWidth = 34;
productSheet.getRange('I:J').format.columnWidth = 42;
productSheet.getRange('W:Y').format.columnWidth = 30;
variantSheet.getRange('A:E').format.columnWidth = 22;
variantSheet.getRange('C:C').format.columnWidth = 42;
guideSheet.getRange('A:A').format.columnWidth = 110;
guideSheet.getRange('A1:A7').format.autofitRows();
workbook.recalculate();
const check = await workbook.inspect({ kind: 'table', range: 'Productos!A1:Y11', include: 'values,formulas', tableMaxRows: 12, tableMaxCols: 25 });
console.log(check.ndjson);
const errors = await workbook.inspect({ kind: 'match', searchTerm: '#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!|#NULL!|#SPILL!|#CALC!', options: { useRegex: true, maxResults: 30 } });
console.log(errors.ndjson);
const preview = await workbook.render({ sheetName: 'Productos', range: 'A1:Y11', scale: 1, format: 'png' });
await fs.mkdir(outputDir, { recursive: true });
await fs.writeFile(`${outputDir}preview.png`, new Uint8Array(await preview.arrayBuffer()));
const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(`${outputDir}productos-ejemplo-importacion.xlsx`);
