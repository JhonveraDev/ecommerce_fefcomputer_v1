import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import morgan from 'morgan';
import { allowedOrigins, env } from './config/env.js';
import { errorHandler, notFoundHandler } from './middleware/error-handler.js';
import { requestId } from './middleware/request-id.js';
import { authRouter } from './routes/auth.routes.js';
import { accountRouter } from './routes/account.routes.js';
import { orderRouter } from './routes/order.routes.js';
import { shoppingStateRouter } from './routes/shopping-state.routes.js';
import { healthRouter } from './routes/health.routes.js';
import { adminProductRouter } from './routes/admin-product.routes.js';
import { adminSalesRouter } from './routes/admin-sales.routes.js';
import * as adminProductController from './controllers/admin-product.controller.js';
import { productRouter } from './routes/product.routes.js';
import { paymentRouter } from './routes/payment.routes.js';

export const app = express();

// This development-only monitor makes unexpected request loops visible before
// the API-wide rate limiter is exhausted. It deliberately avoids request
// bodies and authorization headers so no credentials are written to logs.
const recentRequests = new Map();
const REQUEST_ACTIVITY_WINDOW_MS = 60 * 1000;
const REQUEST_ACTIVITY_WARNING_AT = 30;
const requestSource = (request) => ({
  ip: request.ip,
  origin: request.get('origin') || null,
  referer: request.get('referer') || null,
  forwardedFor: request.get('x-forwarded-for') || null,
});

const monitorRequestActivity = (request, _response, next) => {
  if (env.NODE_ENV === 'production') return next();

  const now = Date.now();
  const key = `${request.ip}:${request.method}:${request.path}`;
  const current = recentRequests.get(key);
  const activity = !current || current.resetAt <= now
    ? { count: 1, resetAt: now + REQUEST_ACTIVITY_WINDOW_MS }
    : { ...current, count: current.count + 1 };

  recentRequests.set(key, activity);

  if (activity.count === REQUEST_ACTIVITY_WARNING_AT || activity.count % 100 === 0) {
    console.warn({
      event: 'high_request_volume',
      method: request.method,
      path: request.path,
      requestsInLastMinute: activity.count,
      ...requestSource(request),
    });
  }

  for (const [storedKey, storedActivity] of recentRequests) {
    if (storedActivity.resetAt <= now) recentRequests.delete(storedKey);
  }

  return next();
};

app.disable('x-powered-by');
app.use(requestId);
app.use(helmet());
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(monitorRequestActivity);
const apiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  // En desarrollo la recarga de Vite y React puede generar muchas consultas
  // legítimas al catálogo. Producción conserva una protección más estricta.
  limit: env.NODE_ENV === 'production' ? 500 : 5_000,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Se realizaron demasiadas solicitudes. Espera unos minutos e inténtalo nuevamente.',
      details: [],
    },
  },
  handler: (request, response, _next, options) => {
    console.warn({
      event: 'rate_limit_exceeded',
      method: request.method,
      path: request.path,
      ...requestSource(request),
    });
    response.status(options.statusCode).send(options.message);
  },
});

app.use(apiRateLimit);

app.get('/', (_request, response) => response.json({ success: true, data: { name: 'FEFCOMPUTER API', version: 'v1' } }));
app.use('/api/v1/health', healthRouter);
app.get('/api/v1/product-import-template', adminProductController.downloadImportTemplate);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/account', accountRouter);
app.use('/api/v1/orders', orderRouter);
app.use('/api/v1/account/shopping-state', shoppingStateRouter);
app.use('/api/v1/admin/products', adminProductRouter);
app.use('/api/v1/admin/sales', adminSalesRouter);
app.use('/api/v1/products', productRouter);
app.use('/api/v1/payments', paymentRouter);

app.use(notFoundHandler);
app.use(errorHandler);
