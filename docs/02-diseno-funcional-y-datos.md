# Diseño funcional y lógico de datos

## Estado y objetivo

Este documento convierte la planeación inicial en decisiones funcionales y de datos que deben validarse con el cliente antes de crear el schema de Prisma, migraciones o código. La primera versión se orienta a una tienda B2C de tecnología.

## Decisiones que requieren aprobación del cliente

| Decisión | Propuesta inicial | Impacto |
| --- | --- | --- |
| País, moneda e impuestos | Colombia, COP y reglas tributarias configurables | Afecta checkout, facturación e importes. |
| Forma de pago MVP | Transferencia/contraentrega o una pasarela definida | Determina el flujo de confirmación del pedido. |
| Compra como invitado | Permitida, solicitando correo y datos de envío | Reduce fricción; requiere proteger consulta de pedidos. |
| Catálogo | Productos simples y variantes opcionales | Evita rediseño para capacidad, color o configuración. |
| Inventario | Control por SKU, con reserva temporal en checkout | Evita sobreventa. |
| Entregas | Tarifas manuales inicialmente; integración posterior | Define los datos de dirección y envío. |
| Devoluciones | Proceso manual administrado desde pedido | Puede evolucionar a módulo RMA. |

## Requisitos funcionales priorizados

### MVP

- Administrar categorías, marcas, productos, imágenes, precios e inventario.
- Consultar catálogo con búsqueda, filtros, ordenamiento y paginación.
- Crear cuenta, verificar correo, iniciar sesión y recuperar contraseña.
- Mantener carrito para invitados y clientes autenticados.
- Crear pedidos con dirección de entrega, resumen de importes y estado.
- Gestionar pedidos desde administración con trazabilidad de cada cambio.
- Enviar correos transaccionales: verificación, recuperación y confirmación de pedido.

### Posterior al MVP

- Pasarela de pagos, cupones, favoritos, reseñas verificadas y notificaciones.
- Integración de transportadoras, facturación electrónica y reportes avanzados.
- Multiidioma, multimoneda, multitienda y ventas B2B.

## Modelo lógico de datos

### Identidad

**Usuario**: id, nombre, email normalizado, hash de contraseña, estado, fecha de verificación, último acceso y auditoría temporal. El email es único. Un usuario puede tener varios roles, direcciones, sesiones, pedidos y reseñas.

**Rol**: id, nombre estable y descripción. Se crean `ADMIN`, `EMPLOYEE` y `CUSTOMER`. La relación con usuario es muchos a muchos para evitar rediseño cuando un empleado también compre como cliente.

**Sesión/refresh token**: id, usuario, hash del token, vencimiento, fecha de revocación, dispositivo e IP opcionales. Nunca se persiste el token en texto plano.

**Dirección**: id, usuario, destinatario, teléfono, país, departamento/estado, ciudad, dirección, complemento, referencias, código postal opcional y marcador de predeterminada. Los pedidos guardan un snapshot: modificar una dirección no altera pedidos históricos.

### Catálogo

**Categoría**: id, nombre, slug único, descripción, estado, posición, imagen y categoría padre opcional. Una categoría puede tener muchas subcategorías. Un producto puede pertenecer a varias categorías y una de ellas se marca como principal.

**Marca**: id, nombre, slug único, logo, descripción y estado. Una marca posee muchos productos.

**Producto**: id, SKU único para producto simple, nombre, slug único, descripción corta y larga, precio, precio comparativo opcional, estado, publicación, peso, atributos técnicos, marca y categoría principal. Un producto tiene muchas imágenes, categorías y potencialmente variantes.

**Variante**: id, producto, SKU único, combinación de atributos, precio opcional, estado y peso opcional. Solo existe cuando el producto tiene opciones vendibles independientes. No crear variantes para datos meramente descriptivos.

**Imagen de producto**: id, producto o variante opcional, URL, identificador del proveedor, versión, orden, alt, ancho, alto y timestamps. La primera imagen activa es portada.

**Inventario**: id, SKU vendible (producto simple o variante), cantidad física, cantidad reservada, punto de reposición y estado. El disponible se calcula como físico menos reservado; no debe recibirse como dato confiable desde el cliente.

**Movimiento de inventario**: id, inventario, tipo, cantidad, saldo resultante, motivo, referencia externa o de pedido, actor y fecha. Tipos iniciales: entrada, ajuste, reserva, liberación y salida por venta.

### Carrito y pedidos

**Carrito**: id, usuario opcional, identificador seguro de invitado opcional, moneda, estado y vencimiento. Un usuario conserva un único carrito activo. Tras iniciar sesión se fusionan ítems compatibles y se valida nuevamente stock y precio.

**Ítem de carrito**: id, carrito, SKU vendible, cantidad y precio de referencia. El precio se vuelve a calcular durante checkout.

**Pedido**: id interno, número público no secuencial predecible, usuario opcional, correo de contacto, moneda, subtotal, descuentos, envío, impuestos, total, estado, dirección de envío snapshot, dirección de facturación snapshot, notas y timestamps.

**Ítem de pedido**: id, pedido, SKU, nombre, variante, imagen, cantidad, precio unitario, descuento, impuesto y total. Es un snapshot inmutable para preservar la evidencia comercial.

**Historial de pedido**: id, pedido, estado anterior, estado nuevo, comentario, actor y fecha. Todo cambio de estado crea un registro.

**Pago**: id, pedido, proveedor, referencia externa, monto, moneda, estado, fecha y metadatos seguros mínimos. La referencia externa es única por proveedor. Los eventos externos deben ser idempotentes.

**Envío**: id, pedido, método, transportadora, costo, guía, estado y fechas relevantes. En MVP puede existir uno por pedido; el diseño admite dividir pedidos en varios envíos más adelante.

## Cardinalidades esenciales

```text
Usuario  N:M  Rol
Usuario  1:N  Dirección / Sesión / Pedido / Reseña
Categoría 1:N Categoría (padre-hija)
Producto N:M Categoría
Marca    1:N Producto
Producto 1:N Imagen / Variante / Reseña
SKU vendible 1:1 Inventario
Inventario 1:N MovimientoInventario
Carrito  1:N ÍtemCarrito
Pedido   1:N ÍtemPedido / HistorialPedido / Pago
Pedido   1:1 Envío (MVP)
```

## Estados y transiciones

### Producto

- `DRAFT`: se administra, no se muestra.
- `ACTIVE`: visible y potencialmente comprable.
- `INACTIVE`: no visible para nuevas compras, conserva historial.
- `ARCHIVED`: retirado definitivamente de operación cotidiana.

### Pedido

- `PENDING_PAYMENT` → `PAYMENT_APPROVED`, `PAYMENT_REJECTED`, `EXPIRED` o `CANCELLED`.
- `PAYMENT_APPROVED` → `PREPARING` → `SHIPPED` → `DELIVERED`.
- La cancelación se permite antes de despacho según política; después requiere flujo de devolución.

Los cambios deben efectuarse exclusivamente en backend, validando la transición y el rol del actor.

## Cálculo de importes

1. Se consultan productos, variantes activas y disponibilidad actual.
2. Se calculan precios vigentes y descuentos elegibles en el servidor.
3. Se calcula envío e impuestos con reglas configurables.
4. Se valida nuevamente stock dentro de una transacción.
5. Se persiste pedido con snapshots inmutables.

Nunca se aceptan como definitivos el total, precio, descuento, impuesto ni estado enviados por el frontend.

## Reglas de integridad e índices

- Unicidad: email normalizado, slugs, SKU, código de cupón, número de pedido y referencias de pago por proveedor.
- Claves foráneas obligatorias para todos los recursos dependientes.
- Eliminación lógica para catálogo y usuarios con historial; evitar borrado físico de datos comerciales.
- Índices para email, slug, SKU, estado y fecha de pedido, relaciones de catálogo y búsqueda de productos.
- Auditoría obligatoria para ajustes de inventario, cambios de precio, cambios de pedido y administración de usuarios.

## Criterios de aceptación de esta fase

- El cliente confirma mercado, impuestos, monedas, pagos, entrega y cancelaciones.
- Se confirma si la compra de invitado estará permitida.
- Se aprueba el modelo de catálogo: categorías múltiples y variantes opcionales.
- Se aprueba la política de reserva y descuento de inventario.
- Se aprueban los estados del pedido y responsables de cada transición.
- Se dispone de contenido inicial: categorías, marcas, productos, políticas y datos de contacto.

## Siguiente paso

Tras aprobar estas decisiones, el siguiente entregable es el diagrama entidad-relación definitivo y, únicamente después, el schema de Prisma, las migraciones y los contratos de API.
