# Inventario de base existente y propuesta de primera migración

## Resultado de inspección

Fecha de inspección: 5 de agosto de 2026.

Se consultó únicamente el catálogo `information_schema` de PostgreSQL para inventariar tablas, columnas y claves foráneas del esquema `public`. No se ejecutaron comandos de escritura.

| Elemento | Resultado |
| --- | --- |
| Base inspeccionada | `ecommerce_fefcomputer` |
| Esquema inspeccionado | `public` |
| Tablas existentes | Ninguna |
| Columnas existentes | Ninguna |
| Claves foráneas existentes | Ninguna |
| Cambios aplicados | Ninguno |

La base está disponible y limpia; por tanto, no hay estructura previa que preservar, adaptar o migrar. Esto elimina el riesgo de afectar datos existentes, pero no elimina la necesidad de revisar el schema antes de aplicarlo.

## Primera migración propuesta

La primera migración crearía la estructura fundacional aprobada para FEFCOMPUTER:

- Usuarios, roles, sesiones y direcciones.
- Catálogo: categorías jerárquicas, marcas, productos, variantes e imágenes.
- Inventario y movimientos auditables.
- Carritos de invitado y clientes autenticados.
- Pedidos, snapshots, pagos, envíos e historial de estados.
- Reseñas moderables.

Antes de generar la migración se añadirá al schema el módulo de cobertura de envío para Colombia:

- Departamentos.
- Municipios/ciudades.
- Zonas de cobertura con estado, tarifa, monto de envío gratis y estimación de entrega.
- Restricciones temporales o permanentes por zona.

## Justificación

Esta estructura es necesaria para cumplir los requisitos confirmados: checkout de invitado, productos con variantes, control de stock por SKU, operación nacional con cobertura configurable y pagos intercambiables entre Wompi y Mercado Pago.

Crear las tablas en una única migración inicial es apropiado porque la base no tiene versiones ni datos previos. Cambios posteriores se dividirán por módulo y se aplicarán sólo mediante migraciones revisables.

## Riesgos y controles

| Riesgo | Control |
| --- | --- |
| Modelo demasiado amplio para MVP | Se crearán tablas fundacionales, pero se implementarán módulos por fases. |
| Restricciones no expresables sólo con Prisma | Se añadirán restricciones SQL puntuales y validaciones de servicio documentadas. |
| Datos dummy contaminan producción | Los datos semilla se separarán de las migraciones y nunca contendrán credenciales reales. |
| Error al aplicar migración | Copia de seguridad previa, revisión de SQL generado y ejecución primero en desarrollo. |

## Aprobación requerida

La siguiente acción propuesta es validar el schema con cobertura de envío y generar —sin aplicar automáticamente— la migración inicial para revisión. La aplicación de esa migración sobre PostgreSQL debe contar con confirmación explícita.
