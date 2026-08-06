# Sistema de diseño FEFCOMPUTER

## Paleta semántica

- Primario: `--color-primary` / `--color-primary-hover`.
- Base: `--color-navy`, `--color-text`, `--color-text-muted`, `--color-text-subtle`.
- Acento y estados: `--color-accent`, `--color-success`, `--color-warning`, `--color-danger`, `--color-info`.
- Superficies: `--color-surface`, `--color-surface-soft`, `--color-surface-blue`.
- Bordes: `--color-border`, `--color-border-strong`.

## Tokens de interfaz

- Espaciado: escala de 4, 8, 12, 16, 20, 24, 32 y 40 px.
- Radios: `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-xl`.
- Elevación: `--shadow-card`, `--shadow-float`.
- Interacción: `--transition-fast` y `--transition-base`.

## Reglas de uso

- Los CTA principales usan el azul primario y su hover.
- Las acciones secundarias o de éxito usan el acento verde.
- Las tarjetas usan superficie blanca, borde semántico y elevación al interactuar.
- Los estados de foco emplean el anillo azul global y los elementos deshabilitados reducen su opacidad.
- La única fuente es `--font-sans`; los títulos usan azul marino y el contenido utiliza la escala de texto base o sus variantes muted/subtle.
