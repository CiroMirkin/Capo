# Registro de uso

## Resumen

Mide cuánto tiempo **activo** pasa el usuario en un tablero y lo muestra en
`/time/[id]` agrupado por día y, dentro de cada día, por **sesiones** (períodos
de actividad separados por pausas largas). El conteo corre en segundo plano
mientras la app está abierta y se guarda solo, sin que el usuario haga nada. El
`Header` y el `NavRail` muestran además el cronómetro de la sesión en curso.

**Cada cuánto se guarda:** el registro durable (`usageHistory`) se persiste
mientras haya un tablero abierto y se haya acumulado tiempo activo desde el
último guardado, en tres momentos:

- **por intervalo** — cada **20 min** con sesión iniciada (`UPDATE` a Postgres
  del campo `Board.usageHistory` completo, ~3/hora por tablero abierto); cada
  **60,5 s** en modo invitado (escritura a `localStorage`, sin costo de red).
- **al ver el contador** — cuando se abre el menú del `Header` o se despliega
  el `NavRail` (evento `capo:usage-flush`), para dejar el dato fresco por si el
  usuario sigue hasta `/time/[id]`.
- **al ocultar la pestaña** — `visibilitychange → hidden`, para acotar la
  pérdida con el intervalo largo.

El reloj vivo de la pestaña (`sessionStorage`, alimenta el cronómetro del
`Header`/`NavRail`) es otra cosa: se guarda cada 60 s y, además, al ocultar o
cerrar la pestaña.

- **Código:** `web-app/src/features/usage-history/` + `app/providers.tsx`
  (monta el guardado), `app/_components/{Header,NavRail}.tsx` (cronómetro en
  vivo), `app/time/[id]/TimeTracking.tsx` (pantalla).
- **Alcance:** acumular tiempo activo, cortarlo en sesiones, persistirlo por
  tablero y listarlo.
- **Fuera de alcance:** editar o borrar registros a mano, metas de tiempo,
  exportar, tiempo por tarea o por columna.

## Diagrama C4 — código

![Diagrama C4 (código) de la feature de registro de uso](../diagramas/usage-history-c4.svg)

![Diagrama de secuencia del guardado del registro de uso](../diagramas/usage-history-secuencia.svg)

Fuentes editables: `docs/diagramas/usage-history-c4.html` (skill
`diagram-design`, tipo "UML class") y `docs/diagramas/usage-history-secuencia.html`
(tipo "sequence"). Re-exportar los `.svg` tras editar los `.html`. Fuera de los
diagramas por presupuesto: `useLastDurationPeriod` (+ `getCurrentTimeFromStorage`)
que alimenta el cronómetro en vivo del `Header`/`NavRail` leyendo `sessionStorage`
directo; los dos repositorios (`nextjsUsageHistoryRepository` /
`localStorageUsageHistoryRepository`) y las server actions detrás de
`useUsageHistoryQuery` (ver *Persistencia y modelo*).

### `useSaveTimeTracking` — `hooks/useSaveTimeTracking.tsx`

Único punto de montaje del guardado. Se instancia una sola vez en
`providers.tsx` (`ClientOnlyInit`). Con un `board_id` activo y sin un guardado
en curso, toma el incremento de tiempo desde el último guardado y lo empuja al
historial. Tres disparadores comparten la misma función `save`: el
`setInterval` (20 min logueado / 60,5 s invitado), el listener del evento
`USAGE_FLUSH_EVENT` (`capo:usage-flush`, que disparan `Header`/`NavRail` vía el
helper `requestUsageHistoryFlush` al mostrar el contador) y `visibilitychange`
cuando la pestaña pasa a `hidden`. Resetea el cronómetro cuando cambia la
sesión o el tablero, para no mezclar tiempo de un tablero en otro.

### `updateDailyUsageRecord` — `useCase/updateDailyUsageRecord.ts`

El corazón de la feature: función pura que decide **dónde** cae el incremento
de tiempo (día nuevo, sesión nueva o extensión de la última sesión). No toca
red ni React; se testea sola.

### `useUsageHistoryQuery` — `hooks/useUsageHistoryQuery.tsx`

Fachada de datos con TanStack Query. Expone `usageHistory` +
`updateUsageHistory` y esconde si el origen es Postgres (sesión + tablero) o
`localStorage` (invitado). La clave de query incluye `userId` y `boardId`, así
que cambiar de tablero cambia el dato sin trabajo extra.

## Modelo / lógica

Tipos y funciones puras en `model/`; la transformación de estado en `useCase/`.

### `updateDailyUsageRecord({ duration, usageHistory }) → UsageHistory`

`useCase/`, pura, no muta el input (todo por spread). Test:
`useCase/updateDailyUsageRecord.test.ts` (Vitest, con mocks de
`needsNewUsageSession` e `isTheSameDay`). Cuatro ramas, en orden:

| Situación | Resultado |
| --- | --- |
| `usageHistory` vacío | primer día con una sesión de `duration` |
| último día ≠ hoy (`isTheSameDay` → `false`) | día nuevo con una sesión |
| mismo día y `needsNewUsageSession` → `true` | sesión nueva dentro del día de hoy |
| mismo día y `needsNewUsageSession` → `false` | extiende la última sesión: `duration += incremento`, `endTimestamp = now` |

### `needsNewUsageSession(lastDay) → boolean`

`model/`. `true` si el día no tiene períodos, o si pasaron **más de 25 min**
(`TIME_LIMIT = 1_500_000` ms) entre `lastPeriod.startTimestamp +
lastPeriod.duration` y `Date.now()`. Es lo que separa "seguí trabajando" de
"volví después de un rato".

### `migrateUsageHistory(history) → UsageHistory`

`model/`. Rellena `endTimestamp` en registros viejos que no lo tienen
(`startTimestamp + duration`). Se aplica **en cada lectura y escritura** del
servidor (`get/saveUsageHistory`) y en el repo de `localStorage`.

### Acumulación del cronómetro — `hooks/useTimeTracking.tsx`

Mantiene `UserSessionTracking` en `sessionStorage` (`totalAccumulatedTime` +
`sessionStartTime`). Se auto-guarda cada 60 s y, además, en `visibilitychange`
y `beforeunload`. Opción `pauseOnTabHidden` (por defecto `true`): con la
pestaña oculta congela el conteo. **`useSaveTimeTracking` lo instancia con
`pauseOnTabHidden: false`** — el guardado de fondo sigue contando con la
pestaña en segundo plano.

- `getTotalTime()` — tiempo activo total de la sesión de pestaña en curso.
- `getCurrentTimeFromStorage()` — igual, pero leyendo `sessionStorage` sin
  hook (lo usa `useLastDurationPeriod` para el cronómetro del `Header`).
- `parseDuration(ms) → "HH:MM:SS"` — vía `new Date(ms)` en UTC.

## Persistencia y modelo

- **Tipos** (`model/usageHistory.ts`):
  - `UsageDuration = number` (milisegundos).
  - `UsageSession { startTimestamp, endTimestamp, duration }`.
  - `DailyUsage { date: number, periods: UsageSession[] }`.
  - `UsageHistory = DailyUsage[]`.
- **Prisma:** `Board.usageHistory Json @default("[]")`. **No tiene migración
  propia** — nació con el schema base (`prisma/migrations/20260828142204/migration.sql`,
  `"usageHistory" JSONB NOT NULL DEFAULT '[]'`). Las migraciones las corre el
  usuario.
- **Server actions** (`api/actions/`): `getUsageHistory({ boardId })` y
  `saveUsageHistory({ boardId, history })`. Ambas validan con
  `requireBoardAccess(boardId)` y devuelven el historial pasado por
  `migrateUsageHistory`. `saveUsageHistory` hace `prisma.board.update` del
  campo completo (no hay merge incremental server-side).
- **Cadencia de guardado:** `useSaveTimeTracking` guarda si hay `board_id`
  activo, no hay un guardado en curso (`isSaving`) y el incremento de tiempo
  desde el último guardado es `> 0`. Disparadores: `setInterval` de
  `LOGGED_IN_SAVE_INTERVAL` (**1 200 000 ms = 20 min**) con sesión o
  `GUEST_SAVE_INTERVAL` (**60 500 ms**) sin ella; el evento `capo:usage-flush`
  (menú/rail visible); y `visibilitychange → hidden`. Como se instancia con
  `pauseOnTabHidden: false`, el reloj del intervalo sigue avanzando con la
  pestaña en segundo plano. No hay guardado en `beforeunload`: si se cierra la
  pestaña sin ocultarla antes se pierde lo acumulado desde el último guardado
  (a lo sumo ~20 min logueado).
- **Repositorio dual:** no hay archivo-fábrica; `useUsageHistoryQuery` elige
  inline. Interfaz `api/repository/usageHistoryRepository.ts` +
  `nextjsUsageHistoryRepository` (import dinámico de las actions, cuando hay
  `session` **y** `boardId`) y `localStorageUsageHistoryRepository` (clave
  `capo-usage-history`).
- **Modo invitado / `localStorage`:** todo el `UsageHistory` como JSON en
  `capo-usage-history`. `ResetBoard` (`features/boards/ui/ResetBoard.tsx`) la
  borra junto con el resto del tablero invitado.
- **`sessionStorage`:** clave `timeTracking` (`UserSessionTracking`). Efímera,
  por pestaña; no viaja al servidor. `useSaveTimeTracking` la resetea
  (`resetTimeTracking`) al cambiar de sesión o de tablero.

## i18next

- Namespace **`usage_history.*`** en `src/shared/i18n/es.json` y `en.json`:
  - `title` — "Registro de uso" / "Usage history" (título de `/time/[id]`).
  - `empty` — texto de `EmptySpaceText` cuando no hay registros.
- **Sin par ES/EN:** el atributo `title='Total de tiempo'` en
  `ui/UsageRecord.tsx` está hardcodeado en español (tooltip del total diario).

## Tips / historia

- **2026-09-09 — doc creada.** La feature ya existía; se documentó y se
  agregaron los dos diagramas (`diagram-design`: "UML class" + "sequence").
- **Decisión — guardado incremental en el cliente.** El cliente calcula
  `totalTime - lastSaved` y `updateDailyUsageRecord` decide la forma; el server
  action solo persiste el array entero. Mantiene la lógica en funciones puras
  testeables y el backend tonto, al precio de reescribir todo el `usageHistory`
  en cada guardado.
- **2026-09-09 — cadencia logueado a 20 min + flush oportunista.** Antes el
  intervalo era 60,5 s para todos → ~60 `UPDATE` a Postgres por hora y tablero
  abierto, sin que el dato lo justifique. Ahora: 20 min con sesión (invitado
  sigue en 60,5 s, localStorage es barato) + guardado al abrir el menú / rail
  (evento `capo:usage-flush`, suele preceder a `/time/[id]`) + al ocultar la
  pestaña. Efecto secundario aceptado: con guardados espaciados, el punto de
  referencia de `needsNewUsageSession` (`startTimestamp + duration`) queda
  ~20 min por delante de `now` en actividad continua, así que el umbral
  efectivo para cortar una sesión nueva sube de ~26 min de inactividad a
  ~45 min. Se eligió 20 min (< `TIME_LIMIT` de 25 min) para evitar además
  cualquier corte espurio en actividad continua.
- **Decisión — dos relojes.** `sessionStorage` (`timeTracking`) es el reloj
  vivo de la pestaña; `usageHistory` (DB / `localStorage`) es el registro
  durable. `useLastDurationPeriod` lee el primero; `UsageHistory` el segundo.
- **Ventana de sesión = 25 min.** `TIME_LIMIT` en `needsNewUsageSession`. Ojo:
  los **nombres** de los tests de `updateDailyUsageRecord.test.ts` dicen "15
  minutos" y "1 hora" — quedaron de valores viejos, la constante es 25 min.
- **`pauseOnTabHidden` vs. `casos-de-uso.md`.** `docs/casos-de-uso.md` dice
  "el registro se pausa al cerrar la pestaña"; el guardado de fondo usa
  `pauseOnTabHidden: false`, así que **no** pausa el conteo con la pestaña
  oculta, pero sí fuerza un guardado a DB al ocultarse (`visibilitychange →
  hidden`). No guarda en `beforeunload`. El que puede pausar el conteo es el
  hook base con su default.
- **Límite conocido — `parseDuration` y las 24 h.** Formatea con
  `new Date(ms)` en UTC: a partir de 24 h el `HH` vuelve a 00. Un total diario
  no debería llegar ahí, pero no está acotado.
- **Rama muerta.** `updateDailyUsageRecord.ts` repite `usageHistory.length === 0`
  en el segundo `if` (ya cubierto por el primer `return`). Inofensivo.
- **Docs relacionados:** `docs/casos-de-uso.md` (§ Registro de uso),
  `docs/modelo-datos.md` (campo `Board.usageHistory`), `docs/arquitectura.md`
  (`ClientOnlyInit` en el montaje).
