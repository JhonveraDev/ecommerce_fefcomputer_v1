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
import { healthRouter } from './routes/health.routes.js';

export const app = express();

app.disable('x-powered-by');
app.use(requestId);
app.use(helmet());
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 500, standardHeaders: 'draft-7', legacyHeaders: false }));

app.get('/', (_request, response) => response.json({ success: true, data: { name: 'FEFCOMPUTER API', version: 'v1' } }));
app.use('/api/v1/health', healthRouter);
app.use('/api/v1/auth', authRouter);

app.use(notFoundHandler);
app.use(errorHandler);
