# Paleta de colores de tags

## Resumen

Catálogo de colores disponibles para `Tag.variant` (`id`, `bg`, `text`),
hoy la única fuente de los 17 colores fijos que puede tener un tag. Antes
vivían como una unión de strings escrita a mano en `model/tags.ts`, sin
relación con los valores reales (`bg-[...]`/`text-[...]`) que ya estaban
hardcodeados en `badgeVariants` (entonces en `shared/ui/atoms/badge.tsx`).
Este cambio mueve esos valores a un modelo propio, los siembra en la DB
(siguiendo el mismo patrón que `Theme`/`themesList.ts`) y de paso mueve
`Badge`/`CheckboxBadge` a `features/tags` (ver Tips/historia).

- **Código:** `web-app/src/features/tags/model/tagVariants.ts` (+
  `model/tags.ts`, tocado), `features/tags/ui/Badge.tsx` y
  `features/tags/ui/CheckboxBadge.tsx` (movidos desde `shared/ui/`) y
  `prisma/schema.prisma`/`prisma/seed.ts`.
- **Alcance:** el catálogo `{id, bg, text}` en código y sembrado en la DB
  (modelo `TagVariant`); `Badge`/`CheckboxBadge` viviendo en la feature que
  los usa.
- **Fuera de alcance:** nada todavía lee el modelo `TagVariant` de la DB ni
  lo expone a un picker de colores (eso es la feature de tags
  personalizados, deliberadamente independiente de este cambio — ver
  Tips/historia).

## Diagrama C4 — código

Sin diagrama: sigue siendo un solo array consumido directamente (tipo en
`tags.ts`, valores en `ui/Badge.tsx`), no un flujo con varios pasos. Se
agrega cuando algo más lo consuma (picker de color, por ejemplo).

## Modelo / lógica

- **`tagVariantsList`** (`model/tagVariants.ts`): array `as const satisfies
  readonly { id, bg, text }[]` — `as const` en vez de `readonly TagVariant[]`
  a propósito, para que `id` quede como unión de literales (no `string`
  ancho) y pueda derivarse un tipo desde ahí.
- **`TagVariants`** (`model/tags.ts`): antes una unión de 17 literales
  escrita a mano (y desincronizada de `badgeVariants` — le faltaba
  `'teal-subtle'`); ahora `type TagVariants = (typeof tagVariantsList)[number]['id']`.
  Única fuente de verdad para los valores válidos de `Tag.variant`.
- **17 ids, no 19:** el catálogo replica exactamente los ids que ya tenía
  `TagVariants` (los colores pensados para tags). No incluye `turbo`
  (variante de `badgeVariants` para otro uso, no relacionado a tags) ni
  `teal-subtle` (nunca estuvo en la unión original; ver Tips/historia).
- **`badgeVariants`** (`ui/Badge.tsx`): deriva sus 17 colores de tag desde
  `tagVariantsList` (`bg`+`text`, con `fill-*` calculado con un
  `replace('text-', 'fill-')` — mismo valor que antes estaba hardcodeado) y
  solo mantiene hardcodeados los dos casos ajenos a tags: `teal-subtle`
  (nunca fue color de tag válido) y `turbo`.

## Persistencia y modelo

- **Prisma (`schema.prisma`):** modelo nuevo `TagVariant { id, bg, text }`,
  sin relaciones — igual que `Theme`, no hay FK real posible porque
  `Tag.variant` vive dentro del `Json` de `TagGroup.tags`/`Task.tags`, no en
  una columna. **La migración la corre el usuario** — no se ejecutó `prisma
  migrate`, solo `prisma generate`.
- **Seed (`prisma/seed.ts`):** `tagVariants` (mismos 17 valores que
  `tagVariantsList`, duplicados a mano igual que `themes` respecto de
  `themesList.ts` — el seed no importa de `src/`) + upsert por `id` en
  `main()`, mismo patrón que el seeding de `themes`.
- **Modo invitado:** sin cambios — `tagVariantsList` ya vive en el bundle del
  cliente (no es un fetch), así que no hace falta un fallback separado como
  el de `themesList.ts`.

## i18next

Sin claves nuevas — son ids de color, no texto visible.

## Tips / historia

- **2026-09-16 — alta.** Pedido explícito: extraer `TagVariants` (unión de
  literales sin datos) a un modelo `{id, bg, text}` con seed en DB, como paso
  previo e independiente a la feature de tags personalizados (por eso se
  resetió esa rama antes de este cambio: no se quería mezclar ambos).
- **Bug preexistente corregido de paso.** La unión `TagVariants` no incluía
  `'teal-subtle'` pese a que `badgeVariants` sí la define — mismo bug que ya
  se había encontrado y corregido en la rama de tags personalizados
  (descartada). Se corrige de nuevo acá porque ahora el catálogo es la única
  fuente: si `teal-subtle` faltaba en `tagVariantsList`, tampoco iba a
  aparecer en `TagVariants`.
- **2026-09-16 — `Badge` y `CheckboxBadge` movidos a `features/tags/ui/`.**
  Vivían en `shared/ui/atoms/badge.tsx` y `shared/ui/molecules/
  CheckboxBadge.tsx`; al pasar `Badge` a depender de `tagVariantsList` (un
  modelo de la feature `tags`) se movieron ambos a la feature en vez de
  dejarlos en `shared` importando de una feature — `CheckboxBadge` solo
  envuelve `Badge` y sus dos únicos consumidores ya eran de tags
  (`TagGroupSelect`, `AddTagButton`), así que no tenía sentido dejarlo en
  `shared` solo. Exportados desde el barrel `features/tags` (`Badge`,
  `badgeVariants`, `badgeSizes`, `CheckboxBadge`). Consumidores
  actualizados: imports relativos dentro de `features/tags/ui/`
  (`EnableTags`, `TagGroupSelect`) y vía el barrel desde otras features
  (`features/tasks/ui/BlankTask.tsx`,
  `features/tasks/ui/taskList/components/AddTagButton.tsx`) — cross-feature
  `tasks` → `tags`, mismo patrón ya usado en el resto de `tasks`.
