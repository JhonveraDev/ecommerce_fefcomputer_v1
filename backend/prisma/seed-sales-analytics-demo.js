import prismaPackage from '@prisma/client';

const { PrismaClient } = prismaPackage;
const prisma = new PrismaClient();

const demoOrders = [
  ['001', 13, 'DELIVERED', 'Bogotá', 'SSD Kingston NV3 — Demo', 2, 459800],
  ['002', 11, 'PAYMENT_APPROVED', 'Medellín', 'Mouse inalámbrico Logitech M185 — Demo', 3, 209700],
  ['003', 9, 'SHIPPED', 'Cali', 'Lenovo IdeaPad Slim — Demo', 1, 2599900],
  ['004', 7, 'DELIVERED', 'Bogota ', 'SSD Kingston NV3 — Demo', 1, 229900],
  ['005', 5, 'PREPARING', 'Medellín', 'Mouse inalámbrico Logitech M185 — Demo', 4, 279600],
  ['006', 3, 'DELIVERED', 'Cali', 'SSD Kingston NV3 — Demo', 3, 689700],
  ['007', 1, 'CANCELLED', 'Bogotá', 'Mouse inalámbrico Logitech M185 — Demo', 1, 69900],
];

async function main() {
  await prisma.order.deleteMany({ where: { publicNumber: { startsWith: 'DEMO-ANALYTICS-' } } });

  const now = new Date();
  await prisma.$transaction(demoOrders.map(([suffix, daysAgo, status, city, name, quantity, total]) => {
    const createdAt = new Date(now);
    createdAt.setDate(createdAt.getDate() - daysAgo);
    createdAt.setHours(10 + Number(suffix), 0, 0, 0);
    return prisma.order.create({
      data: {
        publicNumber: `DEMO-ANALYTICS-${suffix}`,
        customerEmail: `demo.analytics.${suffix}@example.test`,
        status,
        currency: 'COP',
        subtotal: total,
        discountTotal: 0,
        shippingTotal: 0,
        taxTotal: 0,
        grandTotal: total,
        shippingAddressSnapshot: { recipientName: 'Cliente de demostración', phone: '3000000000', city },
        createdAt,
        items: { create: { skuSnapshot: `DEMO-${suffix}`, nameSnapshot: name, quantity, unitPrice: total / quantity, lineTotal: total } },
        statusHistory: { create: { newStatus: status, comment: 'Pedido de demostración para evolución de ventas.' } },
      },
    });
  }));
  console.log('Se crearon 7 pedidos DEMO-ANALYTICS para el dashboard.');
}

main().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => prisma.$disconnect());
