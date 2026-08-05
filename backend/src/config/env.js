import 'dotenv/config';
import { z } from 'zod';

const environmentSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().url(),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
});

const parsedEnvironment = environmentSchema.safeParse(process.env);

if (!parsedEnvironment.success) {
  const fields = parsedEnvironment.error.issues.map((issue) => issue.path.join('.')).join(', ');
  throw new Error(`Configuración de entorno inválida. Revisa: ${fields}`);
}

export const env = parsedEnvironment.data;
export const allowedOrigins = env.CORS_ORIGIN.split(',').map((origin) => origin.trim()).filter(Boolean);
