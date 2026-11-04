import * as XLSX from 'xlsx';
import { productInputSchema } from '../validators/admin-product.validator.js';
import { ApiError } from '../utils/api-error.js';

const MAX_PRODUCTS = 500;
const header = (value) => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();
const valueFor = (row, names) => {
  const key = Object.keys(row).find((candidate) => names.includes(header(candidate)));
  return key == null ? '' : row[key];
};
const text = (value) => String(value ?? '').trim();
const list = (value, separator) => text(value).split(separator).map((item) => item.trim()).filter(Boolean);
const boolean = (value) => ['si', 'sí', 'true', '1', 'x', 'yes'].includes(header(value));
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

function issues(error) {
  return error.issues.map((issue) => issue.message).filter((message, index, messages) => messages.indexOf(message) === index);
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
      condition: text(valueFor(row, ['condicion', 'condición', 'condition'])) || null,
      tags: list(valueFor(row, ['etiquetas', 'tags']), ','),
      status: text(valueFor(row, ['estado', 'status'])) || 'ACTIVE',
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

export function buildProductImportTemplate() {
  const workbook = XLSX.utils.book_new();
  const products = XLSX.utils.aoa_to_sheet([
    ['SKU', 'Nombre', 'Categoría', 'Marca', 'Precio', 'Stock', 'Descripción corta', 'Descripción', 'Imagen principal', 'Imágenes adicionales', 'Peso (g)', 'Largo (cm)', 'Ancho (cm)', 'Alto (cm)', 'Garantía', 'Condición', 'Etiquetas', 'Estado', 'Destacado', 'Precio anterior', 'Inicio oferta', 'Fin oferta', 'URL amigable', 'Título SEO', 'Descripción SEO'],
    ['FEF-EJEMPLO-001', 'Portátil de ejemplo', 'Computadores', 'Marca demo', 2500000, 10, 'Equipo de ejemplo para completar la plantilla.', 'Agrega aquí la descripción completa del producto.', 'https://ejemplo.com/imagen-principal.jpg', 'https://ejemplo.com/imagen-2.jpg|https://ejemplo.com/imagen-3.jpg', 1800, 35, 24, 2, '12 meses', 'NEW', 'portátil, oficina', 'ACTIVE', 'NO', '', '', '', 'portatil-de-ejemplo', 'Portátil de ejemplo', 'Descripción para buscadores'],
  ]);
  const variants = XLSX.utils.aoa_to_sheet([
    ['SKU producto', 'SKU variante', 'Atributos', 'Precio especial', 'Stock'],
    ['FEF-EJEMPLO-001', 'FEF-EJEMPLO-001-16GB', 'Memoria RAM: 16 GB|Color: Negro', 2700000, 4],
  ]);
  products['!cols'] = [16, 30, 20, 18, 14, 12, 38, 48, 45, 55, 12, 12, 12, 12, 20, 16, 24, 14, 12, 16, 16, 16, 30, 30, 42].map((wch) => ({ wch }));
  variants['!cols'] = [20, 25, 45, 16, 12].map((wch) => ({ wch }));
  XLSX.utils.book_append_sheet(workbook, products, 'Productos');
  XLSX.utils.book_append_sheet(workbook, variants, 'Variantes');
  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
}
