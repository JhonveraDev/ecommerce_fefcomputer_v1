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

## Importación masiva de productos

Los usuarios con rol `ADMIN` o `EMPLOYEE` pueden importar un archivo `.xlsx` desde el panel de productos. El flujo valida el archivo antes de guardar y crea todos los productos en una única transacción.

- Descarga la plantilla desde el botón **Importar Excel** del panel.
- La plantilla incluye listas desplegables para categorías, condición, estado y destacado, una hoja de instrucciones y seis ejemplos que no se importan.
- Usa la hoja `Productos` para los datos principales y `Variantes` para las versiones por SKU.
- La importación admite hasta 500 productos y archivos de hasta 5 MB.
- No sobrescribe productos existentes: corrige o cambia cualquier SKU ya registrado antes de confirmar.

## Endpoints disponibles

- `GET /api/v1/health`
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`
- `GET /api/v1/auth/me`

El refresh token se entrega exclusivamente mediante cookie `HttpOnly`; el access token se devuelve en la respuesta del login o registro.
