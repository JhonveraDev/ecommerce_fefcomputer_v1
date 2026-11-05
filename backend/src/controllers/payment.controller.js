import crypto from 'node:crypto';
import { z } from 'zod';
import { env } from '../config/env.js';
import { prisma } from '../config/prisma.js';
import { ApiError } from '../utils/api-error.js';
import { asyncHandler } from '../utils/async-handler.js';

const checkoutSchema = z.object({ amount: z.number().int().positive().max(100_000_000), customerEmail: z.string().trim().email() });

const pathValue = (value, path) => path.split('.').reduce((current, key) => current == null ? undefined : current[key], value);
const equalChecksum = (expected, received) => {
  if (typeof received !== 'string' || expected.length !== received.length) return false;
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(received));
};
const verifiedEvent = (request) => {
  const signature = request.body?.signature;
  if (!signature?.timestamp || !Array.isArray(signature.properties) || !env.WOMPI_EVENTS_SECRET) return false;
  const values = signature.properties.map((property) => pathValue(request.body.data, property));
  if (values.some((value) => value === undefined || value === null)) return false;
  const checksum = crypto.createHash('sha256').update(`${values.join('')}${signature.timestamp}${env.WOMPI_EVENTS_SECRET}`).digest('hex');
  return equalChecksum(checksum, request.get('x-event-checksum') || signature.checksum);
};
const isApproved = (status) => status === 'APPROVED';
const isRejected = (status) => ['DECLINED', 'VOIDED', 'ERROR'].includes(status);

const configured = () => {
  if (!env.WOMPI_PUBLIC_KEY || !env.WOMPI_INTEGRITY_SECRET) throw new ApiError(503, 'WOMPI_NOT_CONFIGURED', 'Wompi no está configurado. Agrega las credenciales de Sandbox en backend/.env.');
  if (env.WOMPI_ENVIRONMENT !== 'sandbox' || !env.WOMPI_PUBLIC_KEY.startsWith('pub_test_')) throw new ApiError(503, 'WOMPI_SANDBOX_REQUIRED', 'Esta integración está habilitada únicamente para credenciales Sandbox.');
};

export const createWompiCheckout = asyncHandler(async (request, response) => {
  configured();
  const { amount, customerEmail } = checkoutSchema.parse(request.body);
  const currency = 'COP';
  const amountInCents = amount * 100;
  const reference = `FEF-SBX-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
  const integrity = crypto.createHash('sha256').update(`${reference}${amountInCents}${currency}${env.WOMPI_INTEGRITY_SECRET}`).digest('hex');
  const redirectUrl = new URL('/checkout', env.FRONTEND_URL);
  redirectUrl.searchParams.set('payment', 'wompi');
  const isPublicHttpsUrl = redirectUrl.protocol === 'https:' && !['localhost', '127.0.0.1'].includes(redirectUrl.hostname);
  const fields = { 'public-key': env.WOMPI_PUBLIC_KEY, currency, 'amount-in-cents': String(amountInCents), reference, 'signature:integrity': integrity, 'customer-data:email': customerEmail };
  if (isPublicHttpsUrl) fields['redirect-url'] = redirectUrl.toString();
  response.json({ success: true, data: { checkoutUrl: 'https://checkout.wompi.co/p/', fields } });
});

export const receiveWompiEvent = asyncHandler(async (request, response) => {
  if (!env.WOMPI_EVENTS_SECRET) throw new ApiError(503, 'WOMPI_EVENTS_NOT_CONFIGURED', 'Configura WOMPI_EVENTS_SECRET antes de registrar la URL de eventos en Wompi.');
  if (request.body?.event !== 'transaction.updated' || !verifiedEvent(request)) throw new ApiError(401, 'INVALID_WOMPI_EVENT', 'El evento de Wompi no es válido.');
  const transaction = request.body.data.transaction;
  const payment = await prisma.payment.findUnique({ where: { provider_providerReference: { provider: 'WOMPI', providerReference: transaction.reference } }, include: { order: { include: { items: true } } } });
  if (!payment) throw new ApiError(404, 'PAYMENT_NOT_FOUND', 'No encontramos el pago asociado a la referencia de Wompi.');
  if (transaction.currency !== payment.currency || Number(transaction.amount_in_cents) !== Number(payment.amount) * 100) throw new ApiError(422, 'WOMPI_AMOUNT_MISMATCH', 'El monto o moneda del evento no coincide con el pedido.');
  await prisma.$transaction(async (tx) => {
    if (isApproved(transaction.status)) {
      if (payment.status === 'APPROVED') return;
      for (const item of payment.order.items) {
        const inventory = await tx.inventory.findFirst({ where: { OR: [{ variant: { sku: item.skuSnapshot } }, { product: { sku: item.skuSnapshot } }] } });
        if (!inventory || inventory.physicalQuantity < item.quantity) throw new ApiError(409, 'INSUFFICIENT_STOCK', `No hay inventario suficiente para ${item.nameSnapshot}.`);
        const resultingQuantity = inventory.physicalQuantity - item.quantity;
        await tx.inventory.update({ where: { id: inventory.id }, data: { physicalQuantity: resultingQuantity } });
        await tx.inventoryMovement.create({ data: { inventoryId: inventory.id, type: 'SALE', quantity: -item.quantity, resultingQuantity, reason: `Venta confirmada ${payment.order.publicNumber}`, reference: payment.order.publicNumber } });
      }
      await tx.payment.update({ where: { id: payment.id }, data: { status: 'APPROVED', paidAt: new Date(), providerPayload: request.body } });
      if (payment.order.status === 'PENDING_PAYMENT') {
        await tx.order.update({ where: { id: payment.orderId }, data: { status: 'PAYMENT_APPROVED' } });
        await tx.orderStatusHistory.create({ data: { orderId: payment.orderId, previousStatus: 'PENDING_PAYMENT', newStatus: 'PAYMENT_APPROVED', comment: 'Pago aprobado por Wompi.' } });
      }
    } else if (isRejected(transaction.status) && payment.status === 'PENDING') {
      await tx.payment.update({ where: { id: payment.id }, data: { status: 'REJECTED', providerPayload: request.body } });
      await tx.order.update({ where: { id: payment.orderId }, data: { status: 'PAYMENT_REJECTED' } });
      await tx.orderStatusHistory.create({ data: { orderId: payment.orderId, previousStatus: 'PENDING_PAYMENT', newStatus: 'PAYMENT_REJECTED', comment: 'Pago rechazado o anulado por Wompi.' } });
    }
  });
  response.status(204).end();
});
