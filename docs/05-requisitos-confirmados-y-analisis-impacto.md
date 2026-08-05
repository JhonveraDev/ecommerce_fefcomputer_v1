# Requisitos confirmados y análisis de impacto

## Decisiones confirmadas

| Área | Decisión | Implicación de diseño |
| --- | --- | --- |
| Marca | FEFCOMPUTER | Nombre temporal de la tienda y fuente de dummy data. |
| Checkout | Invitado y autenticado | `Order.userId` permanece opcional; el pedido conserva email y snapshots de dirección. |
| Mercado | Colombia y COP | Dirección con departamento y municipio; formatos, impuestos y proveedores locales. |
| Pagos | Mercado Pago o Wompi | Se requiere una interfaz de proveedor de pagos, sin acoplar pedidos a una pasarela. |
| Envíos | Cobertura configurable | Se modelará cobertura por departamento, ciudad y zona, con habilitación, restricción y reglas de tarifa. |
| Catálogo | Variantes por producto | Variantes con SKU, precio, stock, imágenes y estado propios. |
| Imágenes | Locales inicialmente | Se requiere un adaptador de almacenamiento para sustituir disco local por Cloudinary o S3 sin cambiar los módulos de catálogo. |
| Contenido | Dummy data | La interfaz y las pruebas de desarrollo usarán datos ficticios, separados de configuración real. |
| Base de datos | PostgreSQL existente `ecommerce_fefcomputer` | No se realizarán cambios estructurales hasta inspeccionar el esquema actual, comparar impactos y aprobar una migración. |

## Checkout de invitado

El invitado podrá añadir productos al carrito, proporcionar correo y dirección, y crear un pedido sin cuenta. El sistema deberá:

- Asociar el carrito a un identificador aleatorio seguro, no a datos personales en el navegador.
- Guardar `customerEmail` y los snapshots de dirección directamente en el pedido.
- Consultar un pedido de invitado mediante enlace seguro enviado al correo o combinación de número de pedido y token; nunca sólo por número consecutivo.
- Permitir crear una cuenta después de la compra y reclamar pedidos cuando el correo haya sido verificado.
- Aplicar las mismas validaciones de precio, inventario, cobertura y pago que a un cliente autenticado.

## Abstracción de pagos

El pedido no conocerá detalles específicos de Wompi o Mercado Pago. La capa de aplicación definirá un contrato interno de proveedor con estas operaciones:

- Crear intención o enlace de pago.
- Consultar el estado de una transacción.
- Verificar y procesar un webhook firmado.
- Reembolsar o anular cuando el proveedor y la política comercial lo permitan.

Cada intento se registra con proveedor, referencia externa, importe, moneda, estado y metadatos mínimos seguros. Los webhooks deben ser idempotentes: un mismo evento recibido más de una vez no puede duplicar pagos, movimientos de inventario ni cambios de pedido.

Mercado Pago y Wompi se implementarán como adaptadores independientes. La selección inicial se hará por configuración; una futura estrategia de múltiples pasarelas no requiere cambiar el modelo de pedido.

## Cobertura y tarifas de envío

Se recomienda incorporar un módulo de cobertura antes de implementar checkout. La unidad de configuración será la ciudad/municipio, con herencia opcional desde departamento.

| Concepto | Datos necesarios | Regla |
| --- | --- | --- |
| Departamento | Código, nombre, activo | Agrupa ciudades y permite reglas generales. |
| Ciudad/Municipio | Código oficial, departamento, nombre, activo | Determina si se puede entregar. |
| Zona de cobertura | Ciudad, estado, tarifa base, entrega estimada, monto de envío gratis opcional | Permite habilitar, restringir o personalizar cobertura. |
| Restricción | Zona, motivo y vigencia opcional | Impide checkout o muestra mensaje comercial claro. |

La validación ocurre antes de iniciar el pago y se repite al crear el pedido. El cliente verá un mensaje claro cuando una ubicación no esté cubierta. Las zonas sin cobertura nunca deben ofrecerse como opción de envío.

Esta adición es una mejora significativa y justificada: evita pedidos imposibles de entregar, permite ampliar cobertura sin despliegues y mantiene separada la futura integración con transportadoras. Se propondrá como migración independiente después de inspeccionar la base existente.

## Variantes y atributos

El modelo actual de variante cubre SKU, precio sobrescrito, estado, inventario e imágenes propias. Los atributos se mantendrán inicialmente como estructura flexible, por ejemplo color, memoria o capacidad, porque cada categoría tecnológica requiere combinaciones distintas.

Reglas adicionales:

- Una variante activa requiere SKU único y una combinación de atributos única dentro del producto.
- El precio efectivo es el de variante cuando exista; de lo contrario, el precio base del producto.
- El stock se controla en el SKU vendible: producto simple o variante, nunca ambos.
- Las imágenes de variante complementan las generales del producto.
- Peso se almacena en gramos para cálculo de envío; tamaño puede expresarse inicialmente como atributo estructurado.

## Imágenes locales con proveedor intercambiable

Durante el MVP, los archivos se guardarán bajo un directorio de contenido no versionado, por ejemplo `backend/storage/`. La base de datos guardará referencias lógicas —clave, URL pública relativa, tamaño, MIME, orden y texto alternativo— y no rutas absolutas del sistema operativo.

El módulo de almacenamiento tendrá operaciones de subir, obtener URL y eliminar. Su primera implementación será local; una futura implementación para Cloudinary o S3 respetará el mismo contrato. Los controladores y servicios de producto no deben conocer el proveedor de almacenamiento.

No se deben guardar imágenes dummy en Git si son pesadas o si sus licencias no están claras. Deben usarse recursos propios, con licencia apropiada o placeholders controlados.

## Próximo paso obligatorio

Inspeccionar de manera sólo de lectura el esquema real de la base PostgreSQL `ecommerce_fefcomputer`: tablas, relaciones, migraciones previas y convenciones de nombres. Con ese inventario se podrá producir una propuesta de migración justificada, sin alterar todavía la estructura.
