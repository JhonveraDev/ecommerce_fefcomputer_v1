import * as XLSX from 'xlsx';
import ExcelJS from 'exceljs';
import { productInputSchema } from '../validators/admin-product.validator.js';
import { ApiError } from '../utils/api-error.js';

const MAX_PRODUCTS = 500;
const header = (value) => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s*\*\s*$/, '').trim().toLowerCase();
const valueFor = (row, names) => {
  const key = Object.keys(row).find((candidate) => names.includes(header(candidate)));
  return key == null ? '' : row[key];
};
const text = (value) => String(value ?? '').trim();
const list = (value, separator) => text(value).split(separator).map((item) => item.trim()).filter(Boolean);
const boolean = (value) => ['si', 'sí', 'true', '1', 'x', 'yes'].includes(header(value));
const status = (value) => ({ activo: 'ACTIVE', active: 'ACTIVE', borrador: 'DRAFT', draft: 'DRAFT', inactivo: 'INACTIVE', inactive: 'INACTIVE' }[header(value)] || text(value).toUpperCase());
const condition = (value) => ({ nuevo: 'NEW', new: 'NEW', reacondicionado: 'REFURBISHED', refurbished: 'REFURBISHED', usado: 'USED', used: 'USED' }[header(value)] || text(value).toUpperCase());
const optionalNumber = (value) => {
  if (text(value) === '') return null;
  if (typeof value === 'number') return value;
  const raw = text(value).replace(/\s/g, '');
  const comma = raw.lastIndexOf(','); const dot = raw.lastIndexOf('.');
  const normalized = comma > -1 && dot > -1 ? (comma > dot ? raw.replace(/\./g, '').replace(',', '.') : raw.replace(/,/g, '')) : comma > -1 ? (/,[0-9]{3}(,|$)/.test(raw) ? raw.replace(/,/g, '') : raw.replace(',', '.')) : dot > -1 && /\.[0-9]{3}(\.|$)/.test(raw) ? raw.replace(/\./g, '') : raw;
  return Number(normalized);
};
const date = (value) => text(value) === '' ? null : new Date(value);
const attributes = (value) => Object.fromEntries(list(value, '|').map((entry) => entry.split(/:(.*)/)).filter(([key, detail]) => key?.trim() && detail?.trim()).map(([key, detail]) => [key.trim(), detail.trim()]));

const fieldLabels = { name: 'Nombre', sku: 'SKU', categoryName: 'Categoría', basePrice: 'Precio', physicalQuantity: 'Stock', imageUrls: 'Imagen principal', compareAtPrice: 'Precio anterior', offerStartsAt: 'Inicio oferta', offerEndsAt: 'Fin oferta', status: 'Estado', condition: 'Condición', variants: 'Variantes' };
function issues(error) {
  return error.issues.map((issue) => `${fieldLabels[issue.path[0]] || issue.path[0] || 'Fila'}: ${issue.message}`).filter((message, index, messages) => messages.indexOf(message) === index);
}

function getSheet(workbook, names) {
  const name = workbook.SheetNames.find((sheetName) => names.includes(header(sheetName)));
  return name ? XLSX.utils.sheet_to_json(workbook.Sheets[name], { defval: '', raw: false, dateNF: 'yyyy-mm-dd' }) : [];
}

export function parseProductWorkbook(buffer) {
  let workbook;
  try { workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true }); } catch { throw new ApiError(422, 'INVALID_IMPORT_FILE', 'No pudimos leer el archivo. Sube un libro Excel válido (.xlsx).'); }
  const rows = getSheet(workbook, ['productos', 'products']);
  if (!rows.length) throw new ApiError(422, 'EMPTY_IMPORT_FILE', 'La hoja “Productos” no contiene filas para importar.');
  if (rows.length > MAX_PRODUCTS) throw new ApiError(422, 'IMPORT_LIMIT_EXCEEDED', `El archivo supera el límite de ${MAX_PRODUCTS} productos por importación.`);
  const variantRows = getSheet(workbook, ['variantes', 'variants']);
  const variantsByProductSku = new Map();
  for (const row of variantRows) {
    const productSku = text(valueFor(row, ['sku producto', 'product sku']));
    if (!productSku) continue;
    const variant = { sku: text(valueFor(row, ['sku variante', 'variant sku'])), attributes: attributes(valueFor(row, ['atributos', 'attributes'])), priceOverride: optionalNumber(valueFor(row, ['precio especial', 'price override'])), physicalQuantity: optionalNumber(valueFor(row, ['stock', 'inventario'])) };
    variantsByProductSku.set(productSku, [...(variantsByProductSku.get(productSku) || []), variant]);
  }
  const seenSkus = new Set();
  const results = rows.map((row, index) => {
    const sku = text(valueFor(row, ['sku', 'codigo', 'código']));
    const product = {
      sku,
      name: text(valueFor(row, ['nombre', 'name'])),
      categoryName: text(valueFor(row, ['categoria', 'categoría', 'category'])),
      brandName: text(valueFor(row, ['marca', 'brand'])),
      basePrice: optionalNumber(valueFor(row, ['precio', 'precio venta', 'price'])),
      physicalQuantity: optionalNumber(valueFor(row, ['stock', 'inventario'])),
      shortDescription: text(valueFor(row, ['descripcion corta', 'descripción corta', 'short description'])),
      description: text(valueFor(row, ['descripcion', 'descripción', 'description'])),
      imageUrls: [text(valueFor(row, ['imagen principal', 'main image', 'imagen'])), ...list(valueFor(row, ['imagenes adicionales', 'imágenes adicionales', 'additional images']), '|')].filter(Boolean),
      weightGrams: optionalNumber(valueFor(row, ['peso (g)', 'peso', 'weight grams'])),
      lengthCm: optionalNumber(valueFor(row, ['largo (cm)', 'largo', 'length cm'])),
      widthCm: optionalNumber(valueFor(row, ['ancho (cm)', 'ancho', 'width cm'])),
      heightCm: optionalNumber(valueFor(row, ['alto (cm)', 'alto', 'height cm'])),
      warranty: text(valueFor(row, ['garantia', 'garantía', 'warranty'])),
      condition: condition(valueFor(row, ['condicion', 'condición', 'condition'])) || null,
      tags: list(valueFor(row, ['etiquetas', 'tags']), ','),
      status: status(valueFor(row, ['estado', 'status'])) || 'ACTIVE',
      isFeatured: boolean(valueFor(row, ['destacado', 'featured'])),
      compareAtPrice: optionalNumber(valueFor(row, ['precio anterior', 'compare at price'])),
      offerStartsAt: date(valueFor(row, ['inicio oferta', 'offer starts at'])),
      offerEndsAt: date(valueFor(row, ['fin oferta', 'offer ends at'])),
      slug: text(valueFor(row, ['url amigable', 'slug'])),
      seoTitle: text(valueFor(row, ['titulo seo', 'título seo', 'seo title'])),
      seoDescription: text(valueFor(row, ['descripcion seo', 'descripción seo', 'seo description'])),
      specifications: {},
      relatedProductIds: [],
      variants: variantsByProductSku.get(sku) || [],
    };
    const parsed = productInputSchema.safeParse(product);
    const errors = parsed.success ? [] : issues(parsed.error);
    if (!sku) errors.push('El SKU es obligatorio.');
    if (sku && seenSkus.has(sku.toLowerCase())) errors.push('El SKU está repetido dentro del archivo.');
    if (sku) seenSkus.add(sku.toLowerCase());
    return { rowNumber: index + 2, sku, name: product.name, errors, product: parsed.success ? parsed.data : null };
  });
  const orphanVariants = [...variantsByProductSku.keys()].filter((sku) => !seenSkus.has(sku.toLowerCase()));
  for (const sku of orphanVariants) results.push({ rowNumber: null, sku, name: '', errors: ['Hay variantes que apuntan a un SKU de producto que no existe en la hoja Productos.'], product: null });
  return results;
}

export const IMPORT_PRODUCT_LIMIT = MAX_PRODUCTS;

const productColumns = [
  ['SKU', true, 19], ['Nombre', true, 30], ['Categoría', true, 22], ['Marca', false, 20], ['Precio', true, 15], ['Stock', true, 12], ['Descripción corta', false, 36], ['Descripción', false, 48], ['Imagen principal', true, 44], ['Imágenes adicionales', false, 48], ['Peso (g)', false, 12], ['Largo (cm)', false, 12], ['Ancho (cm)', false, 12], ['Alto (cm)', false, 12], ['Garantía', false, 25], ['Condición', false, 19], ['Etiquetas', false, 28], ['Estado', false, 16], ['Destacado', false, 14], ['Precio anterior', false, 17], ['Inicio oferta', false, 19], ['Fin oferta', false, 19], ['URL amigable', false, 30], ['Título SEO', false, 32], ['Descripción SEO', false, 45],
];
const headerStyle = { font: { bold: true, color: { argb: 'FFFFFFFF' } }, fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0A2342' } }, alignment: { vertical: 'middle', horizontal: 'center', wrapText: true }, border: { bottom: { style: 'thin', color: { argb: 'FFFFFFFF' } } } };
const optionalHeaderStyle = { ...headerStyle, fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2876BD' } } };
const requiredFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5FAFF' } };

export async function buildProductImportTemplate(categories = []) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'FEFCOMPUTER'; workbook.created = new Date();
  const instructions = workbook.addWorksheet('Instrucciones', { views: [{ showGridLines: false }] });
  const products = workbook.addWorksheet('Productos', { views: [{ state: 'frozen', ySplit: 1 }] });
  const variants = workbook.addWorksheet('Variantes', { views: [{ state: 'frozen', ySplit: 1 }] });
  const examples = workbook.addWorksheet('Ejemplos', { views: [{ state: 'frozen', ySplit: 1 }] });
  const exampleVariants = workbook.addWorksheet('Variantes ejemplo', { views: [{ state: 'frozen', ySplit: 1 }] });
  const options = workbook.addWorksheet('_Opciones', { state: 'hidden' });
  instructions.getCell('A1').value = 'Carga masiva de productos'; instructions.getCell('A1').font = { size: 18, bold: true, color: { argb: 'FF0A2342' } };
  const guide = [
    ['Cómo usar esta plantilla'], ['1. Completa la hoja Productos. Las columnas con encabezado azul oscuro son obligatorias.'], ['2. Consulta las hojas Ejemplos y Variantes ejemplo para ver casos completos antes de empezar.'], ['3. Usa las listas desplegables para Categoría, Condición, Estado y Destacado.'], ['4. Precio y Stock deben ser números positivos o cero. La imagen principal debe ser una URL pública.'], ['5. Para una oferta, completa Precio anterior, Inicio oferta y Fin oferta. El precio anterior debe ser mayor al precio.'], ['6. Usa Variantes solo si un producto tiene versiones. Relaciónalas mediante el SKU del producto.'], ['7. No copies los SKU DEMO. Guarda el archivo como .xlsx y sube únicamente Productos y Variantes.'], ['Errores comunes'], ['• Escribir un valor distinto de las listas permitidas.'], ['• Omitir SKU, nombre, categoría, precio, stock o imagen principal.'], ['• Usar fechas de oferta incompletas o una URL de imagen inválida.'],
  ];
  guide.forEach(([value], index) => { const cell = instructions.getCell(index + 3, 1); cell.value = value; cell.alignment = { wrapText: true, vertical: 'middle' }; if ([0, 7].includes(index)) { cell.font = { bold: true, color: { argb: 'FF006CE5' } }; } });
  instructions.getColumn(1).width = 110;
  const applyProductTableDesign = (sheet, rows) => {
    productColumns.forEach(([name, required, width], index) => { const cell = sheet.getCell(1, index + 1); cell.value = required ? `${name} *` : name; Object.assign(cell, required ? headerStyle : optionalHeaderStyle); sheet.getColumn(index + 1).width = width; });
    sheet.autoFilter = { from: 'A1', to: 'Y1' }; sheet.getRow(1).height = 32;
    for (let row = 2; row <= rows + 1; row += 1) { productColumns.forEach(([, required], index) => { const cell = sheet.getCell(row, index + 1); cell.alignment = { vertical: 'middle' }; if (required) cell.fill = requiredFill; }); }
  };
  applyProductTableDesign(products, MAX_PRODUCTS);
  const setRequiredText = (column, label) => { for (let row = 2; row <= MAX_PRODUCTS + 1; row += 1) products.getCell(row, column).dataValidation = { type: 'textLength', operator: 'greaterThan', formulae: [0], allowBlank: false, errorTitle: `${label} obligatorio`, error: `Completa el campo ${label}.`, showErrorMessage: true }; };
  setRequiredText(1, 'SKU'); setRequiredText(2, 'Nombre'); setRequiredText(9, 'Imagen principal');
  products.addConditionalFormatting({ ref: `A2:A${MAX_PRODUCTS + 1}`, rules: [{ type: 'expression', formulae: [`COUNTIF($A$2:$A$${MAX_PRODUCTS + 1},A2)>1`], style: { fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFE3E7' } }, font: { color: { argb: 'FFB32945' }, bold: true } } }] });
  const categoryValues = categories.length ? categories : ['Sin categorías configuradas'];
  options.getColumn(1).values = ['Categorías', ...categoryValues]; options.getColumn(2).values = ['Condición', 'Nuevo', 'Reacondicionado', 'Usado']; options.getColumn(3).values = ['Estado', 'Activo', 'Borrador', 'Inactivo']; options.getColumn(4).values = ['Destacado', 'Sí', 'No'];
  const validationRange = `2:${MAX_PRODUCTS + 1}`;
  products.getColumn(3).eachCell({ includeEmpty: true }, (cell, row) => { if (row > 1) cell.dataValidation = { type: 'list', allowBlank: false, formulae: [`'_Opciones'!$A$2:$A$${categoryValues.length + 1}`], errorTitle: 'Categoría inválida', error: 'Selecciona una categoría de la lista.', showErrorMessage: true }; });
  const setList = (column, formula, title) => { for (let row = 2; row <= MAX_PRODUCTS + 1; row += 1) products.getCell(row, column).dataValidation = { type: 'list', allowBlank: true, formulae: [formula], errorTitle: `${title} inválido`, error: `Selecciona una opción permitida para ${title}.`, showErrorMessage: true }; };
  setList(16, "'_Opciones'!$B$2:$B$4", 'Condición'); setList(18, "'_Opciones'!$C$2:$C$4", 'Estado'); setList(19, "'_Opciones'!$D$2:$D$3", 'Destacado');
  const numeric = [5, 6, 11, 12, 13, 14, 20]; numeric.forEach((column) => { for (let row = 2; row <= MAX_PRODUCTS + 1; row += 1) { const cell = products.getCell(row, column); cell.numFmt = '#,##0'; cell.dataValidation = { type: 'decimal', operator: 'greaterThanOrEqual', formulae: [0], allowBlank: ![5, 6].includes(column), errorTitle: 'Número inválido', error: [5, 6].includes(column) ? 'Precio y stock son obligatorios y deben ser iguales o mayores a cero.' : 'Usa un número igual o mayor a cero.', showErrorMessage: true }; } });
  [21, 22].forEach((column) => { for (let row = 2; row <= MAX_PRODUCTS + 1; row += 1) { const cell = products.getCell(row, column); cell.numFmt = 'yyyy-mm-dd hh:mm'; cell.dataValidation = { type: 'date', operator: 'greaterThan', formulae: [new Date(2000, 0, 1)], allowBlank: true, errorTitle: 'Fecha inválida', error: 'Ingresa una fecha válida.', showErrorMessage: true }; } });
  const categoryAt = (index) => categories[index % Math.max(categories.length, 1)] || '';
  const exampleRows = [
    ['DEMO-LAP-001', 'Portátil Office 14', categoryAt(0), 'NovaTech', 2899000, 12, 'Portátil para estudio y oficina.', 'Equipo liviano con SSD y batería para una jornada de trabajo.', 'https://placehold.co/800x600/png?text=Portatil+Office+14', 'https://placehold.co/800x600/png?text=Office+14+Lateral', 1400, 32, 22, 2, '12 meses', 'Nuevo', 'portátil, oficina', 'Activo', 'Sí', '', '', '', 'portatil-office-14', 'Portátil Office 14', 'Portátil para estudio y oficina.'],
    ['DEMO-MON-002', 'Monitor Vision 24', categoryAt(1), 'Vision', 699000, 20, 'Monitor IPS Full HD.', 'Monitor de 24 pulgadas para productividad y entretenimiento.', 'https://placehold.co/800x600/png?text=Monitor+Vision+24', '', 3500, 54, 18, 42, '24 meses', 'Nuevo', 'monitor, ips', 'Borrador', 'No', '', '', '', 'monitor-vision-24', 'Monitor Vision 24', 'Monitor IPS de 24 pulgadas.'],
    ['DEMO-SSD-003', 'SSD Pulse 1 TB', categoryAt(2), 'Pulse', 349000, 35, 'Unidad SSD NVMe.', 'Almacenamiento de alto rendimiento para equipos compatibles.', 'https://placehold.co/800x600/png?text=SSD+Pulse+1TB', '', 45, 8, 2, 0, '36 meses', 'Nuevo', 'ssd, nvme', 'Activo', 'Sí', 399000, '2026-12-01T00:00:00', '2026-12-31T23:59:00', 'ssd-pulse-1tb', 'SSD Pulse 1 TB', 'SSD NVMe de 1 TB.'],
    ['DEMO-KEY-004', 'Teclado Forge K87', categoryAt(3), 'Forge', 279000, 18, 'Teclado mecánico compacto.', 'Teclado TKL con iluminación RGB y distribución en español.', 'https://placehold.co/800x600/png?text=Teclado+Forge+K87', '', 900, 36, 14, 4, '12 meses', 'Nuevo', 'teclado, gaming', 'Activo', 'No', '', '', '', 'teclado-forge-k87', 'Teclado Forge K87', 'Teclado mecánico compacto.'],
    ['DEMO-CAM-005', 'Cámara Secure 4 MP', categoryAt(4), 'Secure', 219000, 0, 'Cámara IP de seguridad.', 'Cámara IP con visión nocturna y detección de movimiento.', 'https://placehold.co/800x600/png?text=Camara+Secure+4MP', '', 480, 11, 11, 10, '12 meses', 'Reacondicionado', 'cámara, seguridad', 'Inactivo', 'No', '', '', '', 'camara-secure-4mp', 'Cámara Secure 4 MP', 'Cámara IP de seguridad.'],
    ['DEMO-DOCK-006', 'Dock USB-C 12 en 1', categoryAt(5), 'Connect', 329000, 15, 'Base USB-C para productividad.', 'Dock con HDMI, Ethernet, lectores de tarjetas y puertos USB.', 'https://placehold.co/800x600/png?text=Dock+USB-C+12en1', '', 320, 14, 6, 2, '12 meses', 'Usado', 'dock, usb-c', 'Borrador', 'No', '', '', '', 'dock-usb-c-12-en-1', 'Dock USB-C 12 en 1', 'Dock USB-C con HDMI y Ethernet.'],
  ];
  applyProductTableDesign(examples, 0);
  examples.addRows(exampleRows);
  applyProductTableDesign(examples, exampleRows.length);
  for (let row = 2; row <= exampleRows.length + 1; row += 1) { examples.getCell(row, 5).numFmt = '#,##0'; examples.getCell(row, 6).numFmt = '#,##0'; examples.getCell(row, 20).numFmt = '#,##0'; examples.getCell(row, 21).numFmt = 'yyyy-mm-dd hh:mm'; examples.getCell(row, 22).numFmt = 'yyyy-mm-dd hh:mm'; }
  const variantHeaders = ['SKU producto', 'SKU variante', 'Atributos', 'Precio especial', 'Stock']; variantHeaders.forEach((name, index) => { const cell = variants.getCell(1, index + 1); cell.value = name; Object.assign(cell, index < 2 ? headerStyle : optionalHeaderStyle); variants.getColumn(index + 1).width = [22, 25, 48, 18, 12][index]; }); variants.autoFilter = { from: 'A1', to: 'E1' }; variants.getRow(1).height = 32;
  for (let row = 2; row <= MAX_PRODUCTS + 1; row += 1) { [4, 5].forEach((column) => { variants.getCell(row, column).numFmt = '#,##0'; variants.getCell(row, column).dataValidation = { type: 'decimal', operator: 'greaterThanOrEqual', formulae: [0], allowBlank: true, errorTitle: 'Número inválido', error: 'Usa un número igual o mayor a cero.', showErrorMessage: true }; }); }
  const exampleVariantRows = [
    ['DEMO-LAP-001', 'DEMO-LAP-001-16GB', 'Memoria RAM: 16 GB|Color: Gris', 3099000, 6], ['DEMO-LAP-001', 'DEMO-LAP-001-32GB', 'Memoria RAM: 32 GB|Color: Gris', 3399000, 4], ['DEMO-KEY-004', 'DEMO-KEY-004-RED', 'Switch: Rojo|Distribución: Español', 279000, 10], ['DEMO-KEY-004', 'DEMO-KEY-004-BLUE', 'Switch: Azul|Distribución: Español', 289000, 8], ['DEMO-CAM-005', 'DEMO-CAM-005-WHT', 'Color: Blanco|Alimentación: PoE', 229000, 5],
  ];
  variantHeaders.forEach((name, index) => { const cell = exampleVariants.getCell(1, index + 1); cell.value = name; Object.assign(cell, index < 2 ? headerStyle : optionalHeaderStyle); exampleVariants.getColumn(index + 1).width = [22, 25, 48, 18, 12][index]; }); exampleVariants.addRows(exampleVariantRows); exampleVariants.autoFilter = { from: 'A1', to: 'E1' }; exampleVariants.getRow(1).height = 32; for (let row = 2; row <= exampleVariantRows.length + 1; row += 1) { exampleVariants.getCell(row, 4).numFmt = '#,##0'; exampleVariants.getCell(row, 5).numFmt = '#,##0'; }
  return workbook.xlsx.writeBuffer();
}
