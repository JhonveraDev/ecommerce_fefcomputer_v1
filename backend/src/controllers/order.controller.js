import { asyncHandler } from '../utils/async-handler.js';
import { ApiError } from '../utils/api-error.js';
import { prisma } from '../config/prisma.js';

const orderSelect = { id: true, publicNumber: true, status: true, currency: true, grandTotal: true, createdAt: true, items: { select: { id: true, nameSnapshot: true, imageUrlSnapshot: true, quantity: true, unitPrice: true, lineTotal: true } } };
export const listOrders = asyncHandler(async (request, response) => {
  const orders = await prisma.order.findMany({ where: { userId: request.auth.userId }, select: orderSelect, orderBy: { createdAt: 'desc' } });
  response.json({ success: true, data: { orders } });
});
export const orderDetail = asyncHandler(async (request, response) => {
  const order = await prisma.order.findFirst({ where: { id: request.params.id, userId: request.auth.userId }, include: { items: true, shipment: true, statusHistory: { orderBy: { createdAt: 'desc' } } } });
  if (!order) throw new ApiError(404, 'ORDER_NOT_FOUND', 'No encontramos ese pedido.');
  response.json({ success: true, data: { order } });
});