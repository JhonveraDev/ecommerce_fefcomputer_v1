import crypto from 'node:crypto';
import { z } from 'zod';
import { env } from '../config/env.js';
import { ApiError } from '../utils/api-error.js';
import { asyncHandler } from '../utils/async-handler.js';

const checkoutSchema = z.object({ amount: z.number().int().positive().max(100_000_000), customerEmail: z.string().trim().email() });

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
  response.json({ success: true, data: { checkoutUrl: 'https://checkout.wompi.co/p/', fields: { 'public-key': env.WOMPI_PUBLIC_KEY, currency, 'amount-in-cents': String(amountInCents), reference, 'signature:integrity': integrity, 'redirect-url': redirectUrl.toString(), 'customer-data:email': customerEmail } } });
});

export const receiveWompiEvent = asyncHandler(async (request, response) => {
  if (!env.WOMPI_EVENTS_SECRET) throw new ApiError(503, 'WOMPI_EVENTS_NOT_CONFIGURED', 'Configura WOMPI_EVENTS_SECRET antes de registrar la URL de eventos en Wompi.');
  console.info('Evento Wompi recibido', { event: request.body?.event, transactionId: request.body?.data?.transaction?.id });
  response.status(204).end();
});
