# FEFCOMPUTER API

## Requisitos de entorno

Copiar `.env.example` a `.env` y conservar la `DATABASE_URL` ya configurada. Añadir dos secretos distintos de al menos 32 caracteres:

```env
JWT_ACCESS_SECRET="..."
JWT_REFRESH_SECRET="..."
```

## Comandos

```powershell
pnpm start
pnpm db:seed
```

## Endpoints disponibles

- `GET /api/v1/health`
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`
- `GET /api/v1/auth/me`

El refresh token se entrega exclusivamente mediante cookie `HttpOnly`; el access token se devuelve en la respuesta del login o registro.
