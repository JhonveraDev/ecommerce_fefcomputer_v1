# Decisiones del schema de Prisma

El schema inicial está disponible en `backend/prisma/schema.prisma`. Implementa las entidades del diagrama ER para el MVP: usuarios y roles, catálogo, variantes, imágenes, inventario, carrito, pedidos, pagos, envíos y reseñas.

## Supuestos aplicados

- Moneda inicial: COP y operación para el mercado colombiano.
- El pedido puede pertenecer a un usuario o a un invitado.
- Un pedido tiene un único envío en el MVP.
- Un producto puede ser simple o tener variantes; su inventario se asocia al SKU vendible.
- Los snapshots de pedido preservan el historial si catálogo, precio o dirección cambian después.
- Mercado Pago y Wompi se implementarán detrás de una interfaz de proveedor; el pedido conserva sólo `provider` y `providerReference`.
- Las imágenes se almacenarán localmente durante el MVP, detrás de un adaptador de almacenamiento reemplazable.

## Restricciones que Prisma no expresa por sí solo

Estas restricciones deben reforzarse mediante validación de servicio y una migración SQL posterior con `CHECK` o índices parciales:

- Cada inventario debe tener `productId` XOR `variantId`.
- Cada imagen debe estar asociada a producto o variante.
- Un producto solo puede tener una categoría marcada como principal.
- Cada usuario solo puede mantener un carrito activo.
- Las cantidades, precios y calificaciones deben tener límites y no pueden ser negativos.
- Las transiciones de estado de pedido deben validarse en la capa de servicio.

## Próximo paso técnico

Inspeccionar primero y de forma sólo lectura la estructura de la base PostgreSQL existente `ecommerce_fefcomputer`. Después se comparará con este schema y se propondrán únicamente migraciones justificadas, incluyendo cobertura configurable de envíos para Colombia.
