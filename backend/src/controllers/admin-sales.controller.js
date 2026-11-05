import { prisma } from '../config/prisma.js';
import { ApiError } from '../utils/api-error.js';
import { asyncHandler } from '../utils/async-handler.js';

export const CONFIRMED_SALE_STATUSES = ['PAYMENT_APPROVED', 'PREPARING', 'SHIPPED', 'DELIVERED'];
const saleInclude = {
  user: { select: { name: true, lastName: true, email: true, phone: true } },
  items: { select: { id: true, skuSnapshot: true, nameSnapshot: true, imageUrlSnapshot: true, quantity: true, unitPrice: true, lineTotal: true } },
};
const number = (value) => Number(value);
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
};

const pagination = (query) => {
  const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
  const pageSize = Math.min(50, Math.max(1, Number.parseInt(query.pageSize, 10) || 12));
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
  const notifications = await prisma.saleNotification.findMany({ include: { order: { include: saleInclude }, reads: { where: { userId: request.auth.userId }, select: { readAt: true } } }, orderBy: { createdAt: 'desc' }, take: 30 });
  response.json({ success: true, data: { notifications: notifications.map((notification) => ({ id: notification.id, createdAt: notification.createdAt, readAt: notification.reads[0]?.readAt || null, sale: serializeSale(notification.order) })) } });
});

export const markNotificationRead = asyncHandler(async (request, response) => {
  const notification = await prisma.saleNotification.findUnique({ where: { id: request.params.id }, select: { id: true } });
  if (!notification) throw new ApiError(404, 'SALE_NOTIFICATION_NOT_FOUND', 'No encontramos esa notificación.');
  const read = await prisma.saleNotificationRead.upsert({ where: { notificationId_userId: { notificationId: notification.id, userId: request.auth.userId } }, create: { notificationId: notification.id, userId: request.auth.userId }, update: {} });
  response.json({ success: true, data: { notificationId: notification.id, readAt: read.readAt } });
});
