import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const upsertInventory = async ({ productId, variantId, physicalQuantity, reorderPoint }) => {
  const where = productId ? { productId } : { variantId };

  await prisma.inventory.upsert({
    where,
    update: { physicalQuantity, reorderPoint },
    create: { productId, variantId, physicalQuantity, reorderPoint },
  });
};

const upsertProductImage = async ({ productId, variantId, publicId, url, position, altText }) => {
  await prisma.productImage.upsert({
    where: { providerPublicId: publicId },
    update: { productId, variantId, url, position, altText },
    create: { productId, variantId, providerPublicId: publicId, url, position, altText },
  });
};

async function main() {
  await Promise.all(
    ['ADMIN', 'EMPLOYEE', 'CUSTOMER'].map((name) =>
      prisma.role.upsert({
        where: { name },
        update: {},
        create: { name, description: `Rol ${name.toLowerCase()} de demostración` },
      }),
    ),
  );

  const antioquia = await prisma.department.upsert({
    where: { daneCode: '05' },
    update: { name: 'Antioquia', isActive: true },
    create: { daneCode: '05', name: 'Antioquia' },
  });
  const bogotaDc = await prisma.department.upsert({
    where: { daneCode: '11' },
    update: { name: 'Bogotá, D.C.', isActive: true },
    create: { daneCode: '11', name: 'Bogotá, D.C.' },
  });
  const cundinamarca = await prisma.department.upsert({
    where: { daneCode: '25' },
    update: { name: 'Cundinamarca', isActive: true },
    create: { daneCode: '25', name: 'Cundinamarca' },
  });
  const valle = await prisma.department.upsert({
    where: { daneCode: '76' },
    update: { name: 'Valle del Cauca', isActive: true },
    create: { daneCode: '76', name: 'Valle del Cauca' },
  });

  const municipalities = await Promise.all([
    prisma.municipality.upsert({
      where: { daneCode: '05001' },
      update: { departmentId: antioquia.id, name: 'Medellín', isActive: true },
      create: { daneCode: '05001', departmentId: antioquia.id, name: 'Medellín' },
    }),
    prisma.municipality.upsert({
      where: { daneCode: '11001' },
      update: { departmentId: bogotaDc.id, name: 'Bogotá, D.C.', isActive: true },
      create: { daneCode: '11001', departmentId: bogotaDc.id, name: 'Bogotá, D.C.' },
    }),
    prisma.municipality.upsert({
      where: { daneCode: '25754' },
      update: { departmentId: cundinamarca.id, name: 'Soacha', isActive: true },
      create: { daneCode: '25754', departmentId: cundinamarca.id, name: 'Soacha' },
    }),
    prisma.municipality.upsert({
      where: { daneCode: '76001' },
      update: { departmentId: valle.id, name: 'Cali', isActive: true },
      create: { daneCode: '76001', departmentId: valle.id, name: 'Cali' },
    }),
  ]);

  await Promise.all(
    municipalities.map((municipality) =>
      prisma.shippingZone.upsert({
        where: { municipalityId_name: { municipalityId: municipality.id, name: 'Cobertura urbana' } },
        update: {
          coverageStatus: 'ACTIVE',
          baseRate: 12900,
          freeShippingThreshold: 250000,
          estimatedMinDays: 1,
          estimatedMaxDays: 4,
        },
        create: {
          municipalityId: municipality.id,
          name: 'Cobertura urbana',
          coverageStatus: 'ACTIVE',
          baseRate: 12900,
          freeShippingThreshold: 250000,
          estimatedMinDays: 1,
          estimatedMaxDays: 4,
        },
      }),
    ),
  );

  const [laptopCategory, peripheralsCategory, storageCategory] = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'portatiles' },
      update: { name: 'Portátiles', status: 'ACTIVE', position: 1 },
      create: { name: 'Portátiles', slug: 'portatiles', status: 'ACTIVE', position: 1 },
    }),
    prisma.category.upsert({
      where: { slug: 'perifericos' },
      update: { name: 'Periféricos', status: 'ACTIVE', position: 2 },
      create: { name: 'Periféricos', slug: 'perifericos', status: 'ACTIVE', position: 2 },
    }),
    prisma.category.upsert({
      where: { slug: 'almacenamiento' },
      update: { name: 'Almacenamiento', status: 'ACTIVE', position: 3 },
      create: { name: 'Almacenamiento', slug: 'almacenamiento', status: 'ACTIVE', position: 3 },
    }),
  ]);

  const [lenovo, logitech, kingston] = await Promise.all([
    prisma.brand.upsert({
      where: { slug: 'lenovo' },
      update: { name: 'Lenovo', status: 'ACTIVE' },
      create: { name: 'Lenovo', slug: 'lenovo', status: 'ACTIVE' },
    }),
    prisma.brand.upsert({
      where: { slug: 'logitech' },
      update: { name: 'Logitech', status: 'ACTIVE' },
      create: { name: 'Logitech', slug: 'logitech', status: 'ACTIVE' },
    }),
    prisma.brand.upsert({
      where: { slug: 'kingston' },
      update: { name: 'Kingston', status: 'ACTIVE' },
      create: { name: 'Kingston', slug: 'kingston', status: 'ACTIVE' },
    }),
  ]);

  const laptop = await prisma.product.upsert({
    where: { slug: 'lenovo-ideapad-slim-demo' },
    update: {
      brandId: lenovo.id,
      name: 'Lenovo IdeaPad Slim — Demo',
      shortDescription: 'Portátil de demostración con variantes de memoria y almacenamiento.',
      description: 'Producto ficticio para el desarrollo inicial de FEFCOMPUTER.',
      basePrice: 2599900,
      weightGrams: 1620,
      specifications: { processor: 'Intel Core i5', screen: '15.6 pulgadas' },
      status: 'ACTIVE',
    },
    create: {
      brandId: lenovo.id,
      name: 'Lenovo IdeaPad Slim — Demo',
      slug: 'lenovo-ideapad-slim-demo',
      shortDescription: 'Portátil de demostración con variantes de memoria y almacenamiento.',
      description: 'Producto ficticio para el desarrollo inicial de FEFCOMPUTER.',
      basePrice: 2599900,
      weightGrams: 1620,
      specifications: { processor: 'Intel Core i5', screen: '15.6 pulgadas' },
      status: 'ACTIVE',
    },
  });

  const mouse = await prisma.product.upsert({
    where: { slug: 'logitech-m185-demo' },
    update: {
      brandId: logitech.id,
      sku: 'FEF-MOU-001',
      name: 'Mouse inalámbrico Logitech M185 — Demo',
      shortDescription: 'Mouse inalámbrico de demostración.',
      description: 'Producto ficticio para pruebas del catálogo.',
      basePrice: 69900,
      weightGrams: 75,
      status: 'ACTIVE',
    },
    create: {
      brandId: logitech.id,
      sku: 'FEF-MOU-001',
      name: 'Mouse inalámbrico Logitech M185 — Demo',
      slug: 'logitech-m185-demo',
      shortDescription: 'Mouse inalámbrico de demostración.',
      description: 'Producto ficticio para pruebas del catálogo.',
      basePrice: 69900,
      weightGrams: 75,
      status: 'ACTIVE',
    },
  });

  const ssd = await prisma.product.upsert({
    where: { slug: 'kingston-nv3-demo' },
    update: {
      brandId: kingston.id,
      name: 'SSD Kingston NV3 — Demo',
      shortDescription: 'SSD NVMe de demostración con capacidades variables.',
      description: 'Producto ficticio para pruebas de variantes.',
      basePrice: 229900,
      weightGrams: 8,
      status: 'ACTIVE',
    },
    create: {
      brandId: kingston.id,
      name: 'SSD Kingston NV3 — Demo',
      slug: 'kingston-nv3-demo',
      shortDescription: 'SSD NVMe de demostración con capacidades variables.',
      description: 'Producto ficticio para pruebas de variantes.',
      basePrice: 229900,
      weightGrams: 8,
      status: 'ACTIVE',
    },
  });

  await Promise.all([
    prisma.productCategory.upsert({
      where: { productId_categoryId: { productId: laptop.id, categoryId: laptopCategory.id } },
      update: { isPrimary: true },
      create: { productId: laptop.id, categoryId: laptopCategory.id, isPrimary: true },
    }),
    prisma.productCategory.upsert({
      where: { productId_categoryId: { productId: mouse.id, categoryId: peripheralsCategory.id } },
      update: { isPrimary: true },
      create: { productId: mouse.id, categoryId: peripheralsCategory.id, isPrimary: true },
    }),
    prisma.productCategory.upsert({
      where: { productId_categoryId: { productId: ssd.id, categoryId: storageCategory.id } },
      update: { isPrimary: true },
      create: { productId: ssd.id, categoryId: storageCategory.id, isPrimary: true },
    }),
  ]);

  const [laptop16, laptop32, ssd500, ssd1000] = await Promise.all([
    prisma.productVariant.upsert({
      where: { sku: 'FEF-LAP-001-16-512' },
      update: { productId: laptop.id, attributes: { color: 'Gris', memory: '16 GB', storage: '512 GB' }, priceOverride: 2599900, status: 'ACTIVE' },
      create: { productId: laptop.id, sku: 'FEF-LAP-001-16-512', attributes: { color: 'Gris', memory: '16 GB', storage: '512 GB' }, priceOverride: 2599900, status: 'ACTIVE' },
    }),
    prisma.productVariant.upsert({
      where: { sku: 'FEF-LAP-001-32-1TB' },
      update: { productId: laptop.id, attributes: { color: 'Gris', memory: '32 GB', storage: '1 TB' }, priceOverride: 3299900, status: 'ACTIVE' },
      create: { productId: laptop.id, sku: 'FEF-LAP-001-32-1TB', attributes: { color: 'Gris', memory: '32 GB', storage: '1 TB' }, priceOverride: 3299900, status: 'ACTIVE' },
    }),
    prisma.productVariant.upsert({
      where: { sku: 'FEF-SSD-001-500' },
      update: { productId: ssd.id, attributes: { capacity: '500 GB', interface: 'NVMe PCIe 4.0' }, priceOverride: 229900, status: 'ACTIVE' },
      create: { productId: ssd.id, sku: 'FEF-SSD-001-500', attributes: { capacity: '500 GB', interface: 'NVMe PCIe 4.0' }, priceOverride: 229900, status: 'ACTIVE' },
    }),
    prisma.productVariant.upsert({
      where: { sku: 'FEF-SSD-001-1TB' },
      update: { productId: ssd.id, attributes: { capacity: '1 TB', interface: 'NVMe PCIe 4.0' }, priceOverride: 359900, status: 'ACTIVE' },
      create: { productId: ssd.id, sku: 'FEF-SSD-001-1TB', attributes: { capacity: '1 TB', interface: 'NVMe PCIe 4.0' }, priceOverride: 359900, status: 'ACTIVE' },
    }),
  ]);

  await Promise.all([
    upsertInventory({ variantId: laptop16.id, physicalQuantity: 8, reorderPoint: 2 }),
    upsertInventory({ variantId: laptop32.id, physicalQuantity: 4, reorderPoint: 2 }),
    upsertInventory({ productId: mouse.id, physicalQuantity: 25, reorderPoint: 5 }),
    upsertInventory({ variantId: ssd500.id, physicalQuantity: 18, reorderPoint: 4 }),
    upsertInventory({ variantId: ssd1000.id, physicalQuantity: 12, reorderPoint: 4 }),
    upsertProductImage({ productId: laptop.id, publicId: 'local/laptop-demo-cover', url: '/storage/products/laptop-demo-cover.jpg', position: 0, altText: 'Portátil de demostración FEFCOMPUTER' }),
    upsertProductImage({ productId: mouse.id, publicId: 'local/mouse-demo-cover', url: '/storage/products/mouse-demo-cover.jpg', position: 0, altText: 'Mouse de demostración FEFCOMPUTER' }),
    upsertProductImage({ productId: ssd.id, publicId: 'local/ssd-demo-cover', url: '/storage/products/ssd-demo-cover.jpg', position: 0, altText: 'SSD de demostración FEFCOMPUTER' }),
  ]);

  console.log('Datos semilla de FEFCOMPUTER creados o actualizados correctamente.');
}

main()
  .catch((error) => {
    console.error('No fue posible cargar los datos semilla.', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
