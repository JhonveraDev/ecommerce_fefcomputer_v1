import { prisma } from '../config/prisma.js';
import { asyncHandler } from '../utils/async-handler.js';

const include = { brand: true, categories: { include: { category: true }, orderBy: { isPrimary: 'desc' }, take: 1 }, images: { orderBy: { position: 'asc' } }, inventory: true, variants: { include: { inventory: true } } };
const serialize = (product, isNew = false) => {
  const baseStock = product.inventory?.physicalQuantity ?? 0;
  const variantStock = product.variants.reduce((total, variant) => total + (variant.inventory?.physicalQuantity ?? 0), 0);
  const stock = baseStock + variantStock;
  const now = Date.now();
  const offerIsActive = product.compareAtPrice != null && product.offerStartsAt != null && product.offerEndsAt != null && product.offerStartsAt.getTime() <= now && product.offerEndsAt.getTime() > now;
  return {
    id: product.id, slug: product.slug, name: product.name, sku: product.sku || '',
    category: product.categories[0]?.category.name || 'Sin categoría', brand: product.brand?.name || 'Sin marca',
    price: Number(product.basePrice), previousPrice: offerIsActive ? Number(product.compareAtPrice) : null,
    shortDescription: product.shortDescription || '', description: product.description || '', image: product.images[0]?.url || '/product-placeholder.svg', imageUrls: product.images.map((image) => image.url), specifications: product.specifications || {}, warranty: product.warranty, condition: product.condition, tags: Array.isArray(product.tags) ? product.tags : [], seoTitle: product.seoTitle, seoDescription: product.seoDescription, weightGrams: product.weightGrams, lengthCm: product.lengthCm, widthCm: product.widthCm, heightCm: product.heightCm, offerStartsAt: product.offerStartsAt, offerEndsAt: product.offerEndsAt,
    hasVariants: product.variants.some((variant) => variant.status === 'ACTIVE'), variants: product.variants.filter((variant) => variant.status === 'ACTIVE').map((variant) => ({ id: variant.id, sku: variant.sku, attributes: variant.attributes, priceOverride: variant.priceOverride == null ? null : Number(variant.priceOverride), stock: variant.inventory?.physicalQuantity ?? 0 })), baseStock, variantStock, stock, status: stock === 0 ? 'Agotado' : offerIsActive ? 'Oferta' : isNew ? 'Nuevo' : 'Disponible', isFeatured: product.isFeatured,
  };
};

export const listPublicProducts = asyncHandler(async (_request, response) => {
  const products = await prisma.product.findMany({ where: { status: 'ACTIVE', deletedAt: null }, include, orderBy: { createdAt: 'desc' } });
  response.json({ success: true, data: { products: products.map((product, index) => serialize(product, index < 4)) } });
});
