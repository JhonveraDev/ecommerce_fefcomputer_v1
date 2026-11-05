import { prisma } from '../config/prisma.js';
import { ApiError } from '../utils/api-error.js';
import { asyncHandler } from '../utils/async-handler.js';
import { z } from 'zod';

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
    ...(q ? { OR: [{ publicNumber: { contains: q, mode: 'insensitive' } }, { customerEmail: { contains: q, mode: 'insensitive' } }, { items: { some: { nameSnapshot: { contains: q, mode: 'insensitive' } } } }] } : {}),
  };
  const confirmedWhere = { status: { in: CONFIRMED_SALE_STATUSES } };
  const recentSince = new Date(); recentSince.setDate(recentSince.getDate() - 7);
  const [total, orders, revenue, recentSales, unreadNotifications] = await prisma.$transaction([
    prisma.order.count({ where }),
    prisma.order.findMany({ where, include: saleInclude, orderBy: { createdAt: 'desc' }, skip: (page - 1) * pageSize, take: pageSize }),
    prisma.order.aggregate({ where: confirmedWhere, _sum: { grandTotal: true }, _count: { _all: true } }),
    prisma.order.count({ where: { ...confirmedWhere, createdAt: { gte: recentSince } } }),
    prisma.saleNotification.count({ where: { reads: { none: { userId: request.auth.userId } } } }),
  ]);
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
