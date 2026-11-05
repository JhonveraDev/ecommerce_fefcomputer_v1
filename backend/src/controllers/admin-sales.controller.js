import { prisma } from '../config/prisma.js';
import prismaPackage from '@prisma/client';
import { ApiError } from '../utils/api-error.js';
import { asyncHandler } from '../utils/async-handler.js';
import { z } from 'zod';

const { Prisma } = prismaPackage;

export const CONFIRMED_SALE_STATUSES = ['PAYMENT_APPROVED', 'PREPARING', 'SHIPPED', 'DELIVERED'];
const saleInclude = {
  user: { select: { name: true, lastName: true, email: true, phone: true } },
  items: { select: { id: true, skuSnapshot: true, nameSnapshot: true, imageUrlSnapshot: true, quantity: true, unitPrice: true, lineTotal: true } },
};
const number = (value) => Number(value);
const SALES_PAGE_SIZE = 5;
const NOTIFICATION_PAGE_SIZE = 4;
const MAX_SALE_NOTIFICATIONS = 20;
const buyer = (order) => {
  const address = order.shippingAddressSnapshot && typeof order.shippingAddressSnapshot === 'object' ? order.shippingAddressSnapshot : {};
  const name = [order.user?.name, order.user?.lastName].filter(Boolean).join(' ') || address.recipientName || null;
  return { name, email: order.user?.email || order.customerEmail, phone: order.user?.phone || address.phone || null };
};
const serializeSale = (order) => ({
  id: order.id,
  publicNumber: order.publicNumber,
  status: order.status,
  currency: order.currency,
  total: number(order.grandTotal),
  createdAt: order.createdAt,
  buyer: buyer(order),
  items: order.items.map((item) => ({ ...item, unitPrice: number(item.unitPrice), lineTotal: number(item.lineTotal) })),
});

const syncSaleNotifications = async () => {
  const pending = await prisma.order.findMany({ where: { status: { in: CONFIRMED_SALE_STATUSES }, saleNotification: null }, select: { id: true } });
  if (pending.length) await prisma.saleNotification.createMany({ data: pending.map((order) => ({ orderId: order.id })), skipDuplicates: true });
  await pruneReadSaleNotifications();
};

const pruneReadSaleNotifications = async () => {
  const [administrators, candidates] = await prisma.$transaction([
    prisma.user.findMany({ where: { status: 'ACTIVE', roles: { some: { role: { name: 'ADMIN' } } } }, select: { id: true } }),
    prisma.saleNotification.findMany({ orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], skip: MAX_SALE_NOTIFICATIONS, select: { id: true, reads: { select: { userId: true } } } }),
  ]);
  if (!administrators.length || !candidates.length) return;
  const administratorIds = administrators.map((administrator) => administrator.id);
  const idsToDelete = candidates.filter((notification) => {
    const readers = new Set(notification.reads.map((read) => read.userId));
    return administratorIds.every((administratorId) => readers.has(administratorId));
  }).map((notification) => notification.id);
  if (idsToDelete.length) await prisma.saleNotification.deleteMany({ where: { id: { in: idsToDelete } } });
};

const pagination = (query) => {
  const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
  const pageSize = Math.min(SALES_PAGE_SIZE, Math.max(1, Number.parseInt(query.pageSize, 10) || SALES_PAGE_SIZE));
  return { page, pageSize };
};
const notificationPagination = (query) => {
  const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
  const pageSize = Math.min(NOTIFICATION_PAGE_SIZE, Math.max(1, Number.parseInt(query.pageSize, 10) || NOTIFICATION_PAGE_SIZE));
  return { page, pageSize };
};
const parseDate = (value, endOfDay = false) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  if (endOfDay && /^\d{4}-\d{2}-\d{2}$/.test(value)) date.setHours(23, 59, 59, 999);
  return date;
};

const FUZZY_SEARCH_THRESHOLD = 0.28;
const fuzzySaleSearch = async ({ q, status, start, end, page, pageSize }) => {
  const normalizedQuery = q.toLocaleLowerCase('es-CO');
  const statuses = status ? [status] : CONFIRMED_SALE_STATUSES;
  const statusValues = Prisma.join(statuses.map((value) => Prisma.sql`${value}::"OrderStatus"`));
  const filters = [Prisma.sql`o."status" IN (${statusValues})`];
  if (start) filters.push(Prisma.sql`o."created_at" >= ${start}`);
  if (end) filters.push(Prisma.sql`o."created_at" <= ${end}`);

  const recipientName = Prisma.sql`COALESCE(o."shipping_address_snapshot"->>'recipientName', '')`;
  const buyerName = Prisma.sql`(COALESCE(u."name", '') || ' ' || COALESCE(u."last_name", ''))`;
  const exactMatch = Prisma.join([
    Prisma.sql`o."public_number" ILIKE ${`%${q}%`}`,
    Prisma.sql`o."customer_email" ILIKE ${`%${q}%`}`,
    Prisma.sql`${buyerName} ILIKE ${`%${q}%`}`,
    Prisma.sql`${recipientName} ILIKE ${`%${q}%`}`,
    Prisma.sql`EXISTS (SELECT 1 FROM "order_items" item WHERE item."order_id" = o."id" AND item."name_snapshot" ILIKE ${`%${q}%`})`,
  ], ' OR ');
  const similarityScore = Prisma.sql`GREATEST(
    similarity(lower(o."public_number"), ${normalizedQuery}),
    similarity(lower(o."customer_email"), ${normalizedQuery}),
    similarity(lower(${buyerName}), ${normalizedQuery}),
    word_similarity(${normalizedQuery}, lower(${buyerName})),
    similarity(lower(${recipientName}), ${normalizedQuery}),
    word_similarity(${normalizedQuery}, lower(${recipientName})),
    COALESCE((SELECT MAX(GREATEST(similarity(lower(item."name_snapshot"), ${normalizedQuery}), word_similarity(${normalizedQuery}, lower(item."name_snapshot")))) FROM "order_items" item WHERE item."order_id" = o."id"), 0)
  )`;
  const threshold = q.length >= 3 ? FUZZY_SEARCH_THRESHOLD : 1;
  const rows = await prisma.$queryRaw`
    WITH ranked_sales AS (
      SELECT o."id", o."created_at",
        CASE WHEN (${exactMatch}) THEN 1 ELSE 0 END AS exact_match,
        ${similarityScore} AS similarity_score
      FROM "orders" o
      LEFT JOIN "users" u ON u."id" = o."user_id"
      WHERE ${Prisma.join(filters, ' AND ')}
    ), matched_sales AS (
      SELECT * FROM ranked_sales
      WHERE exact_match = 1 OR similarity_score >= ${threshold}
    )
    SELECT "id", COUNT(*) OVER() AS "total"
    FROM matched_sales
    ORDER BY exact_match DESC, similarity_score DESC, "created_at" DESC
    OFFSET ${(page - 1) * pageSize} LIMIT ${pageSize}
  `;
  return { ids: rows.map((row) => row.id), total: Number(rows[0]?.total || 0) };
};

export const listSales = asyncHandler(async (request, response) => {
  await syncSaleNotifications();
  const { page, pageSize } = pagination(request.query);
  const q = String(request.query.q || '').trim();
  const status = CONFIRMED_SALE_STATUSES.includes(request.query.status) ? request.query.status : null;
  const start = parseDate(request.query.startDate);
  const end = parseDate(request.query.endDate, true);
  const where = {
    status: status ? status : { in: CONFIRMED_SALE_STATUSES },
    ...(start || end ? { createdAt: { ...(start ? { gte: start } : {}), ...(end ? { lte: end } : {}) } } : {}),
  };
  const confirmedWhere = { status: { in: CONFIRMED_SALE_STATUSES } };
  const recentSince = new Date(); recentSince.setDate(recentSince.getDate() - 7);
  const fuzzyResults = q ? await fuzzySaleSearch({ q, status, start, end, page, pageSize }) : null;
  const [revenue, recentSales, unreadNotifications] = await prisma.$transaction([
    prisma.order.aggregate({ where: confirmedWhere, _sum: { grandTotal: true }, _count: { _all: true } }),
    prisma.order.count({ where: { ...confirmedWhere, createdAt: { gte: recentSince } } }),
    prisma.saleNotification.count({ where: { reads: { none: { userId: request.auth.userId } } } }),
  ]);
  const total = fuzzyResults ? fuzzyResults.total : await prisma.order.count({ where });
  let orders;
  if (fuzzyResults) {
    const unorderedOrders = fuzzyResults.ids.length ? await prisma.order.findMany({ where: { id: { in: fuzzyResults.ids } }, include: saleInclude }) : [];
    const ordersById = new Map(unorderedOrders.map((order) => [order.id, order]));
    orders = fuzzyResults.ids.map((id) => ordersById.get(id)).filter(Boolean);
  } else {
    orders = await prisma.order.findMany({ where, include: saleInclude, orderBy: { createdAt: 'desc' }, skip: (page - 1) * pageSize, take: pageSize });
  }
  response.json({ success: true, data: { sales: orders.map(serializeSale), pagination: { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) }, summary: { totalSales: revenue._count._all, revenue: number(revenue._sum.grandTotal || 0), recentSales, unreadNotifications } } });
});

export const saleDetail = asyncHandler(async (request, response) => {
  const order = await prisma.order.findFirst({ where: { id: request.params.id, status: { in: CONFIRMED_SALE_STATUSES } }, include: { ...saleInclude, payments: { select: { provider: true, providerReference: true, status: true, amount: true, paidAt: true } }, shipment: true, statusHistory: { orderBy: { createdAt: 'asc' } } } });
  if (!order) throw new ApiError(404, 'SALE_NOT_FOUND', 'No encontramos esa venta confirmada.');
  response.json({ success: true, data: { sale: { ...serializeSale(order), payments: order.payments.map((payment) => ({ ...payment, amount: number(payment.amount) })), shipment: order.shipment, statusHistory: order.statusHistory } } });
});

export const listNotifications = asyncHandler(async (request, response) => {
  await syncSaleNotifications();
  const { page, pageSize } = notificationPagination(request.query);
  const [total, notifications] = await prisma.$transaction([
    prisma.saleNotification.count(),
    prisma.saleNotification.findMany({ include: { order: { include: saleInclude }, reads: { where: { userId: request.auth.userId }, select: { readAt: true } } }, orderBy: { createdAt: 'desc' }, skip: (page - 1) * pageSize, take: pageSize }),
  ]);
  response.json({ success: true, data: { notifications: notifications.map((notification) => ({ id: notification.id, createdAt: notification.createdAt, readAt: notification.reads[0]?.readAt || null, sale: serializeSale(notification.order) })), pagination: { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) } } });
});

export const markNotificationRead = asyncHandler(async (request, response) => {
  const notification = await prisma.saleNotification.findUnique({ where: { id: request.params.id }, select: { id: true } });
  if (!notification) throw new ApiError(404, 'SALE_NOTIFICATION_NOT_FOUND', 'No encontramos esa notificación.');
  const read = await prisma.saleNotificationRead.upsert({ where: { notificationId_userId: { notificationId: notification.id, userId: request.auth.userId } }, create: { notificationId: notification.id, userId: request.auth.userId }, update: {} });
  await pruneReadSaleNotifications();
  response.json({ success: true, data: { notificationId: notification.id, readAt: read.readAt } });
});

const statusSchema = z.object({ status: z.enum(['PAYMENT_APPROVED', 'PREPARING', 'SHIPPED', 'DELIVERED']), comment: z.string().trim().max(1000).optional() });
export const updateSaleStatus = asyncHandler(async (request, response) => {
  const input = statusSchema.parse(request.body);
  const order = await prisma.$transaction(async (tx) => {
    const current = await tx.order.findFirst({ where: { id: request.params.id, status: { in: CONFIRMED_SALE_STATUSES } } });
    if (!current) throw new ApiError(404, 'SALE_NOT_FOUND', 'No encontramos esa venta confirmada.');
    if (current.status === input.status) throw new ApiError(422, 'SALE_STATUS_UNCHANGED', 'Selecciona un estado diferente para actualizar la venta.');
    const updated = await tx.order.update({ where: { id: current.id }, data: { status: input.status } });
    await tx.orderStatusHistory.create({ data: { orderId: current.id, actorId: request.auth.userId, previousStatus: current.status, newStatus: input.status, comment: input.comment || null } });
    return updated;
  });
  response.json({ success: true, data: { id: order.id, status: order.status, updatedAt: order.updatedAt } });
});
