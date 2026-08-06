# Inicio del proyecto FEFCOMPUTER

## Requisitos

- Node.js 20 o superior y pnpm.
- PostgreSQL en ejecución, con la base de datos `ecommerce_fefcomputer` creada.
- El archivo `backend/.env` configurado. No debe compartirse ni subirse a GitHub.

## 1. Iniciar el backend

En una terminal de PowerShell:

```powershell
cd C:\Users\WELCOME\OneDrive\Desktop\IA\ecommerce_fefcomputer_v1\backend
pnpm install
pnpm prisma:generate
pnpm dev
```

La API quedará disponible en `http://localhost:3000`. Comprueba que funciona abriendo `http://localhost:3000/api/v1/health`.

Si necesitas cargar los datos de prueba de la base de datos, ejecuta una sola vez:

```powershell
pnpm db:seed
```

## 2. Iniciar el frontend

Abre otra terminal de PowerShell y ejecuta:

```powershell
cd C:\Users\WELCOME\OneDrive\Desktop\IA\ecommerce_fefcomputer_v1\frontend
pnpm install
pnpm dev
```

Abre la dirección que muestre Vite; normalmente es `http://localhost:5173`.

## Comprobaciones opcionales

```powershell
# Desde frontend
pnpm typecheck
pnpm build

# Desde backend
pnpm prisma:validate
```
