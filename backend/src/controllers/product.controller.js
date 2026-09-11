import { prisma } from '../config/prisma.js';
import { asyncHandler } from '../utils/async-handler.js';

const include = { brand: true, categories: { include: { category: true }, orderBy: { isPrimary: 'desc' }, take: 1 }, images: { orderBy: { position: 'asc' }, take: 1 }, inventory: true };
const serialize = (product) => {
  const stock = product.inventory?.physicalQuantity ?? 0;
  const isNew = Date.now() - product.createdAt.getTime() < 1000 * 60 * 60 * 24 * 30;
  return {
    id: product.id, slug: product.slug, name: product.name, sku: product.sku || '',
    category: product.categories[0]?.category.name || 'Sin categoría', brand: product.brand?.name || 'Sin marca',
    price: Number(product.basePrice), previousPrice: product.compareAtPrice == null ? null : Number(product.compareAtPrice),
    shortDescription: product.shortDescription || '', description: product.description || '', image: product.images[0]?.url || '/product-placeholder.svg',
    stock, status: stock === 0 ? 'Agotado' : product.compareAtPrice ? 'Oferta' : isNew ? 'Nuevo' : 'Disponible', rating: 0, reviewCount: 0,
  };
};

export const listPublicProducts = asyncHandler(async (_request, response) => {
  const products = await prisma.product.findMany({ where: { status: 'ACTIVE', deletedAt: null }, include, orderBy: { createdAt: 'desc' } });
  response.json({ success: true, data: { products: products.map(serialize) } });
});
