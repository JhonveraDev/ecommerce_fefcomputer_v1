# Datos semilla de FEFCOMPUTER

El script `backend/prisma/seed.js` carga datos ficticios e idempotentes para desarrollo. Puede ejecutarse varias veces: actualiza los mismos registros en lugar de duplicarlos.

Incluye:

- Roles administrativos y de cliente.
- Cuatro departamentos y cuatro municipios de ejemplo de Colombia.
- Zonas urbanas habilitadas con tarifa y umbral de envío gratis ficticios.
- Categorías, marcas y tres productos tecnológicos ficticios.
- Variantes de portátiles y SSD con SKU, precio y stock propio.
- Inventario e imágenes locales de referencia.

No incluye usuarios de acceso, pedidos ni pagos; así se evita introducir contraseñas de demostración, transacciones ficticias o estados operativos engañosos.

Las URLs de imagen bajo `/storage/` son referencias locales planificadas. Los archivos reales se añadirán cuando se construya el módulo de almacenamiento local.
