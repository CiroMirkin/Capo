# Registro de uso

## Resumen

Mide cuánto tiempo **activo** pasa el usuario en un tablero y lo muestra en
`/time/[id]` agrupado por día y, dentro de cada día, por **sesiones** (períodos
de actividad separados por pausas largas). El conteo corre en segundo plano
mientras la app está abierta y se guarda solo, sin que el usuario haga nada. El
`Header` y el `NavRail` muestran además el cronómetro de la sesión en curso.

**Umbral de la primera vez:** una sesión no deja rastro en el `usageHistory`
hasta acumular **10 min** de tiempo activo (`MIN_DURATION_BEFORE_FIRST_SAVE`);
por debajo de eso no se guarda nada, ni por intervalo ni por flush. Evita que
una visita de "entré a mirar algo" de 1-2 min ensucie el historial con una
entrada. Una vez cruzado el umbral, el guardado sigue con la cadencia normal.

**Cada cuánto se guarda:** logueado, cada **2 min** (antes 20 min — ver Tips
2026-09-18); invitado cada **60,5 s** (`localStorage`, sin costo de red). Antes
también se guardaba al ver el contador (abrir el menú del `Header` o desplegar
el `NavRail`, evento `capo:usage-flush`); se sacó — ver Tips 2026-09-19.

Logueado, el guardado **no** reescribe `Board.usageHistory` en cada tick:
incrementa de forma atómica una "sesión abierta" en columnas escalares de
`Board` (`currentSessionStart/End/Duration/Day`) vía `{ increment }` de
Prisma — un solo `UPDATE` sobre 2 campos, sin tocar el JSON. Solo cuando esa
sesión cierra (gap > 25 min o cambio de día) se vuelca una vez a
`usageHistory` (mismo costo de reescritura completa que antes, pero con
**menos** frecuencia que los 20 min viejos, no más). Ver *Persistencia y
modelo* para el detalle y la concurrencia entre pestañas/dispositivos.

El registro durable solo avanza su punto de referencia cuando el guardado
**confirmó** (`onSuccess` de la mutación); si falla, el próximo intento reenvía
el incremento completo en vez de perderlo.

El reloj vivo de la pestaña (`sessionStorage`, alimenta el cronómetro del
`Header`/`NavRail`) es otra cosa: se guarda cada 60 s y, además, al ocultar o
cerrar la pestaña.

- **Código:** `web-app/src/features/usage-history/` + `app/providers.tsx`
  (monta el guardado), `app/_components/{Header,NavRail}.tsx` (cronómetro en
  vivo), `app/time/[id]/TimeTracking.tsx` (pantalla).
- **Alcance:** acumular tiempo activo, cortarlo en sesiones, persistirlo por
  tablero, listarlo, y estimar cuánto de ese tiempo activo cae dentro de una
  ventana de fechas arbitraria (`estimateActiveDuration`, la usa
  `archived-tasks` para aproximar tiempo por tarea — ver
  `docs/features/archive.md`).
- **Fuera de alcance:** editar o borrar registros a mano, metas de tiempo,
  exportar, tiempo por columna. Tiempo por tarea: aproximado desde afuera
  (`archived-tasks`), esta feature no sabe nada de tareas.

## Diagrama C4 — código

![Diagrama C4 (código) de la feature de registro de uso](../diagramas/usage-history-c4.svg)

![Diagrama de secuencia del guardado del registro de uso](../diagramas/usage-history-secuencia.svg)

Fuentes editables: `docs/diagramas/usage-history-c4.html` (skill
`diagram-design`, tipo "UML class") y `docs/diagramas/usage-history-secuencia.html`
(tipo "sequence"). Re-exportar los `.svg` tras editar los `.html`. El C4 ya
incluye `incrementUsageSession` y `foldSessionIntoHistory` (zona "POSTGRES ·
SESIÓN ABIERTA"). Fuera de los diagramas por presupuesto:
`useLastDurationPeriod` (+ `getCurrentTimeFromStorage`) que alimenta el
cronómetro en vivo del `Header`/`NavRail` leyendo `sessionStorage` directo;
los dos repositorios (`nextjsUsageHistoryRepository` /
`localStorageUsageHistoryRepository`); `currentUsageSession.ts`
(`hasOpenSession`/`toOpenSession`); y `getUsageHistory`/`saveUsageHistory` (ver
*Persistencia y modelo*). **Diagrama de secuencia sin actualizar** — todavía
describe la cadencia y el flujo viejos (20 min, un solo `useUsageHistoryQuery`
que persiste el array completo); actualizarlo la próxima vez que se edite
`usage-history-secuencia.html`.

### `useSaveTimeTracking` — `hooks/useSaveTimeTracking.tsx`

Único punto de montaje del guardado. Se instancia una sola vez en
`providers.tsx` (`ClientOnlyInit`). Con un `board_id` activo y sin un guardado
en curso, toma el incremento de tiempo desde el último guardado — salvo que
sea el primer guardado de la sesión (`lastSavedTimeRef === 0`) y todavía no se
hayan acumulado los 10 min de `MIN_DURATION_BEFORE_FIRST_SAVE`, en cuyo caso
corta antes sin llamar a nada. Un único disparador, el `setInterval` (2 min
logueado / 60,5 s invitado), llama a `save` (antes también lo disparaba el
evento `capo:usage-flush` al mostrar el contador en `Header`/`NavRail`; se
sacó — ver Tips 2026-09-19). A partir de ahí `save` bifurca: logueado llama
`incrementUsageHistory` (solo manda el incremento + `now` + `dayStart`, no
arma el array); invitado arma el array completo con `updateDailyUsageRecord` y
llama `updateUsageHistory`, como siempre. Resetea el cronómetro cuando cambia
la sesión o el tablero, para no mezclar tiempo de un tablero en otro (y para
que el umbral de 10 min vuelva a aplicar desde cero).

### `updateDailyUsageRecord` — `useCase/updateDailyUsageRecord.ts`

Función pura que decide **dónde** cae un incremento de tiempo (día nuevo,
sesión nueva o extensión de la última sesión), generando
`startTimestamp`/`endTimestamp` a partir de `Date.now()`. No toca red ni React; se
testea sola. Dos usos: (a) arma el array completo para el guardado de
invitado, y (b) el cliente la reusa para actualizar la caché local de forma
optimista tras un `incrementUsageHistory` exitoso (ver
`useUsageHistoryQuery`) — el servidor no devuelve el array fusionado.

### `foldSessionIntoHistory` — `model/foldSessionIntoHistory.ts`

Función pura hermana de `updateDailyUsageRecord`, pero para una sesión **ya
cerrada** con `startTimestamp`/`endTimestamp`/`duration` reales (no
`Date.now()`) y un `dayStart` explícito. Nunca extiende el último período —
la sesión que recibe ya está completa. La usan `getUsageHistory` (mezclar la
sesión abierta al leer, sin persistir) e `incrementUsageSession` (volcarla de
verdad al cerrar). Antes de devolver, pasa el resultado por
`limitUsageHistoryToMonths`. Ver *Persistencia y modelo*.

### `limitUsageHistoryToMonths` — `model/limitUsageHistoryToMonths.ts`

Función pura que acota `UsageHistory` a `MAX_MONTHS_STORED` (**14**) meses
calendario distintos (año+mes de `DailyUsage.date`). Si hay más, descarta
**todas** las entradas del/de los mes(es) más viejo(s) (FIFO por mes, no por
día). No muta el input. La llaman `foldSessionIntoHistory` y
`updateDailyUsageRecord` al final de cada rama que devuelven, así que corre
en los tres caminos que escriben el array completo (flush logueado, guardado
de invitado, y el merge de lectura de `getUsageHistory`) sin que los server
actions ni los repositorios tengan que saber nada del límite. Test:
`limitUsageHistoryToMonths.test.ts`.

### `useUsageHistoryQuery` — `hooks/useUsageHistoryQuery.tsx`

Fachada de datos con TanStack Query. Expone `usageHistory` +
`updateUsageHistory` (invitado: array completo) + `incrementUsageHistory`
(logueado: solo el incremento) y esconde si el origen es Postgres (sesión +
tablero) o `localStorage` (invitado). La clave de query incluye `userId` y
`boardId`, así que cambiar de tablero cambia el dato sin trabajo extra. La
mutación `incrementUsageHistory` no recibe de vuelta el array fusionado del
servidor (ver *Persistencia y modelo*, "no cruza el borde de la server
action"); su `onSuccess` actualiza la caché local llamando a
`updateDailyUsageRecord` con el mismo incremento que mandó, para no perder la
consistencia visual entre lo que el usuario ve y lo que se guardó.

### `UsageCalendar` — `ui/UsageCalendar.tsx`

Calendario del **mes en curso** que `UsageHistory` monta arriba, al lado de la
card del día más reciente (`today`).
* La semana **empieza el domingo**, igual que el `DatePicker`
(`getDay()` como offset inicial). 

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
(`TIME_LIMIT = 1_500_000` ms) entre `lastPeriod.endTimestamp` (hora real del fin
de la última actividad) y `Date.now()`. Es lo que separa "seguí trabajando" de
"volví después de un rato". Usa `endTimestamp` y no `startTimestamp + duration`
para que el umbral sea exactamente `TIME_LIMIT`, sin depender de la cadencia de
guardado ni de las pausas cortas dentro de la sesión.

### `estimateActiveDuration({ start, end, usageHistory }) → number`

`model/`, pura. Suma el tiempo activo (ms) que cae dentro de `[start, end]`,
recorriendo **todo** `usageHistory` (`flatMap` de `periods`, no por día) —
una ventana que cruza varios días se acumula sola, sin caso especial. Test:
`model/estimateActiveDuration.test.ts`. No sabe nada de tareas: la usa
`archived-tasks` (`useTaskDurationEstimate`) para aproximar cuánto tiempo
activo insumió una tarea, ver `docs/features/archive.md`.

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
- **Límite de retención — 14 meses (FIFO por mes).** `UsageHistory` queda
  acotado a `MAX_MONTHS_STORED` (14) meses calendario distintos
  (`model/limitUsageHistoryToMonths.ts`), tanto en Postgres como en
  `localStorage`. Se aplica **solo al escribir** (cuando `foldSessionIntoHistory`
  o `updateDailyUsageRecord` agregan un día nuevo); no hay backfill
  retroactivo, así que un tablero que ya tenga más de 14 meses guardados
  recién se recorta cuando vuelve a tener actividad en un mes nuevo.
- **Prisma:** `Board.usageHistory Json @default("[]")` — nació con el schema
  base (`prisma/migrations/20260828142204/migration.sql`). Además, desde
  2026-09-18: `currentSessionStart/End BigInt?`, `currentSessionDuration Int?`,
  `currentSessionDay BigInt?` (`prisma/migrations/20260918120000_add_usage_session_counter`).
  Los 4 campos de sesión van juntos: o los 4 son `null` (no hay sesión
  abierta) o los 4 tienen valor. `currentSessionStart/End/Day` son epoch-ms y
  superan el rango de `Int` (32 bits) → `BigInt`; `currentSessionDuration`
  queda acotado a <24 h por el guard de `currentSessionDay` (se vuelca al
  menos una vez por día calendario) así que `Int` alcanza de sobra. Las
  migraciones las corre el usuario.
- **Server actions** (`api/actions/`):
  - `getUsageHistory({ boardId })` — lee `usageHistory` + los 4 campos de
    sesión; si hay una sesión abierta, la mezcla con `foldSessionIntoHistory`
    **sin persistir**, así el llamador siempre ve el tiempo en curso aunque
    todavía no se haya volcado a la DB.
  - `saveUsageHistory({ boardId, history })` — sigue existiendo, la usa
    únicamente el repositorio de invitado (guarda el array completo).
  - `incrementUsageSession({ boardId, incrementDuration, now, dayStart })` —
    La usa el camino logueado. Devuelve `void` (no arma ni
    devuelve el array fusionado: cruzar un `bigint` por el borde de la server
    action es más problema que solución, y el cliente ya sabe recomponer la
    caché local con `updateDailyUsageRecord`). Dos caminos:
    1. **Rápido (el común):** `prisma.board.updateMany` con
       `WHERE id, currentSessionEnd >= now - TIME_LIMIT, currentSessionDay = dayStart`
       y `DATA currentSessionDuration: { increment }, currentSessionEnd: now`.
       Un solo `UPDATE` sobre 2 columnas escalares, sin tocar el JSON. Si el
       `WHERE` no matchea (`count === 0` — sesión expirada, inexistente o
       cambió el día), pasa al camino 2.
    2. **Flush + reinicio (raro):** transacción que relee los 4 campos +
       `usageHistory` con `SELECT ... FOR UPDATE` (lockea la fila del
       tablero), **vuelve a chequear el guard bajo la transacción**, y si
       sigue haciendo falta, vuelca la sesión vieja con
       `foldSessionIntoHistory` y arranca una nueva con los 4 campos en
       `{ now, now, incrementDuration, dayStart }`. Mismo costo que el
       guardado viejo de 20 min (reescribe el JSON completo), pero ocurre
       como mucho cada ~25 min de actividad continua o 1 vez por día —
       **menos** seguido que antes.
  Todas validan con `requireBoardAccess(boardId)`.
- **Concurrencia entre pestañas/dispositivos (mismo tablero):** el camino
  rápido ya es seguro tal cual (`{ increment }` es un único `UPDATE` que
  Postgres serializa a nivel de fila). El riesgo estaba en el flush+reinicio:
  si dos pestañas llegan a la vez con la sesión expirada, ambas leerían el
  mismo `usageHistory` viejo y la segunda pisaría el fold de la primera. El
  `FOR UPDATE` lockea la fila apenas se lee: la segunda pestaña que entra a la
  vez **espera** (no aborta) a que la primera transacción termine, y al
  retomar el lock ve el estado ya reiniciado por la ganadora — su intento se
  resuelve como un incremento normal, no como un segundo fold. Con cualquier
  número de pestañas/dispositivos, el fold ocurre **una sola vez** por cierre
  de sesión. (Antes: transacción `Serializable` + reintento acotado sobre
  conflicto `P2034` — ver Tips 2026-09-19.)
- **Cadencia de guardado:** `useSaveTimeTracking` guarda si hay `board_id`
  activo, no hay un guardado en curso (`isSaving`) y el incremento de tiempo
  desde el último guardado es `> 0`. Único disparador: `setInterval` de
  `LOGGED_IN_SAVE_INTERVAL` (**120 000 ms = 2 min**, antes 20 min — ver Tips)
  con sesión o `GUEST_SAVE_INTERVAL` (**60 500 ms**) sin ella (antes también
  el evento `capo:usage-flush` al abrir menú/rail — se sacó, ver Tips
  2026-09-19). Como se instancia con `pauseOnTabHidden: false`, el reloj del
  intervalo sigue avanzando con la pestaña en segundo plano. No hay guardado
  al ocultar ni al cerrar la pestaña: lo acumulado desde el último guardado
  se pierde si la pestaña se va antes del próximo disparador (a lo sumo ~2
  min logueado, antes ~20 min).
  El punto de referencia (`lastSavedTimeRef`) solo avanza en el `onSuccess` de
  la mutación, así que un guardado fallido se reintenta entero en el próximo
  disparo en vez de perderse.
- **Umbral de la primera vez:** antes de ese `incremento > 0`, `save()` corta
  si `lastSavedTimeRef.current === 0` (todavía no hubo ningún guardado
  confirmado en esta sesión de pestaña/tablero) y `getTotalTime() <
  MIN_DURATION_BEFORE_FIRST_SAVE` (**600 000 ms = 10 min**). Aplica igual a
  logueado e invitado. Al cruzar el umbral, el primer guardado manda el
  acumulado completo (no solo el excedente sobre 10 min).
- **Repositorio dual:** no hay archivo-fábrica; `useUsageHistoryQuery` elige
  inline. Interfaz `api/repository/usageHistoryRepository.ts` (`getAll`/`save`)
  + `nextjsUsageHistoryRepository` (import dinámico de las actions, cuando hay
  `session` **y** `boardId`) y `localStorageUsageHistoryRepository` (clave
  `capo-usage-history`). `nextjsUsageHistoryRepository.incrementSession(...)`
  es un método extra, fuera de la interfaz — solo lo usa el camino logueado de
  `useUsageHistoryQuery`, el invitado nunca lo llama.
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
  - `calendar_alt` — `aria-label` de la grilla de `UsageCalendar`; interpola
    `{{count}}` con los días con actividad del mes.
  - `today` — "hoy" / "today"; marca junto a la fecha en la card del día en
    curso (`UsageRecord`, condicionado por `isTheSameDay`).
- **Sin par ES/EN:** el atributo `title='Total de tiempo'` en
  `ui/UsageRecord.tsx` está hardcodeado en español (tooltip del total diario).

## Tips / historia

- **2026-09-19 — retención de 14 meses, FIFO por mes.** `UsageHistory` crecía sin límite; se agregó `limitUsageHistoryToMonths` para acotar el JSON a 14 meses calendario. Dos decisiones tomadas con el usuario: (a) **mes calendario** (año+mes de `date`) en vez de una ventana de ~14×30 días — encaja con cómo `UsageCalendar` ya agrupa por mes y da un límite más predecible que una ventana rodante; (b) el recorte se aplica **solo al escribir** (dentro de `foldSessionIntoHistory`/`updateDailyUsageRecord`, los únicos dos lugares que agregan un día nuevo), no en cada lectura — significa que tableros que ya superan 14 meses no se recortan retroactivamente hasta que vuelven a tener actividad en un mes nuevo, pero evita tocar `migrateUsageHistory` (que corre en cada get/save) y mantiene el cambio acotado a las dos funciones que ya eran responsables de hacer crecer el array. **Diagrama C4 actualizado** — se agregó el nodo `limitUsageHistoryToMonths` (zona "POSTGRES · SESIÓN ABIERTA", debajo de `foldSessionIntoHistory`, con una flecha desde ahí) editando el SVG a mano, porque la skill `diagram-design` no estaba disponible en esta sesión; el llamado desde `updateDailyUsageRecord` (otra zona) quedó solo mencionado en el texto de la caja, sin flecha cruzando zonas, para no complicar el layout. Revisar el diagrama la próxima vez que se use la skill.

- **2026-09-19 — `FOR UPDATE` en vez de `Serializable`+retry.** El
  flush+reinicio de `incrementUsageSession` usaba una transacción
  `Serializable` con reintento acotado (tope 3) sobre conflicto `P2034` para
  evitar que dos pestañas/dispositivos del mismo tablero pisaran el fold. Se
  cambió a `SELECT ... FOR UPDATE` (primera raw query del repo — excepción
  puntual a lo dicho en Tips 2026-09-18 sobre no meter SQL crudo, acá es solo
  para lockear la fila, no para tocar el JSON): la segunda pestaña que llega
  a la vez se bloquea en el `SELECT` hasta que la primera transacción
  termina, en vez de abortar y reintentar. Mismo resultado (el fold ocurre
  una sola vez), código más corto — se borró toda la lógica de detección de
  conflicto y reintento. Se evaluó también volver al diseño de array puro
  (sin las 4 columnas escalares) pero se descartó: reintroduciría el costo
  x10 de `UPDATE`s completos por hora que la migración del 18/9 evitó.
  Aparte, se sacó el guardado oportunista al ver el contador (evento
  `capo:usage-flush`, disparado por `Header`/`NavRail` al abrir menú/rail) —
  simplificación pedida por el usuario, ahora el único disparador es el
  `setInterval`.
- **2026-09-18 — cadencia logueada a 2 min + incremento atómico.** Bajar
  `LOGGED_IN_SAVE_INTERVAL` de 20 min a 2 min habría multiplicado por 10 los
  `UPDATE` completos de `usageHistory` (de ~3/hora a ~30/hora por tablero
  abierto). Se evaluaron dos caminos para evitarlo: SQL crudo (`jsonb_set`)
  contra el JSON, o un contador numérico aparte con `{ increment }` nativo de
  Prisma — se eligió el segundo (decisión del usuario) para no meter la
  primera query cruda del repo y mantener la lógica de decisión en funciones
  puras testeables, al precio de una migración de schema (4 columnas nuevas
  en `Board`, ver *Persistencia y modelo*). El primer diseño (transacción
  simple de lectura+fold+reinicio) tenía una condición de carrera real entre
  pestañas/dispositivos del mismo tablero: dos pestañas llegando a la vez a
  "la sesión expiró" leían el mismo estado viejo y la segunda pisaba el fold
  de la primera. Se resolvió con `isolationLevel: Serializable` + reintento
  acotado (Postgres aborta una de las dos transacciones en conflicto,
  `P2034`, en vez de dejarlas pisarse). Diagrama C4 actualizado el 2026-09-19
  con `incrementUsageSession` y `foldSessionIntoHistory` (zona nueva
  "POSTGRES · SESIÓN ABIERTA"); el diagrama de secuencia quedó pendiente (ver
  *Diagrama C4 — código*).
- **2026-09-13 — `estimateActiveDuration` (tiempo por tarea, aproximado).**
  Se agregó para que `archived-tasks` pueda estimar cuánto tiempo activo
  insumió una tarea, cruzando su `timelineHistory` (cambios de columna, sin
  `taskId` en `usageHistory`) con los períodos de esta feature. Es a
  propósito una aproximación: si en la misma ventana de uso se trabajó más
  de una tarea, todas "duran" lo mismo que esa ventana — no hay forma de
  atribuir el tiempo activo a una tarea puntual sin trackear sesiones por
  tarea (no existe hoy, sería una feature nueva). Detalle de cómo se usa:
  `docs/features/archive.md`. **Diagrama C4 sin actualizar** — la skill
  `diagram-design` no estaba disponible en esta sesión; agregar el nodo
  `estimateActiveDuration` la próxima vez que se edite `usage-history-c4.html`.
- **2026-09-12 — umbral de 10 min antes del primer guardado.** Visitas cortas
  ("entré a mirar algo" de 1-2 min) generaban una entrada en el `usageHistory`
  por cada una, sin aportar nada útil. Se agregó `MIN_DURATION_BEFORE_FIRST_SAVE`
  (10 min) como guard único dentro de `save()`, así que tanto el `setInterval`
  como `capo:usage-flush` lo respetan. Una vez cruzado el umbral, el guardado
  sigue con la cadencia normal (20 min logueado / 60,5 s invitado) — el umbral
  solo gatea el *primer* guardado de cada sesión (`lastSavedTimeRef === 0`), no
  cambia el intervalo. Antes de esto se había probado (y revertido en la misma
  tanda) bajar `LOGGED_IN_SAVE_INTERVAL` a 10 min: no resolvía el problema real,
  solo movía el número.
- **2026-09-09 — doc creada.** La feature ya existía; se documentó y se
  agregaron los dos diagramas (`diagram-design`: "UML class" + "sequence").
- **2026-09-09 — calendario del mes (`UsageCalendar`).** Se agregó un
  calendario de puntos arriba de la lista en `/time/[id]`. Tensión con
  `DESIGN.md` ("nada de streaks, medallas, contadores decorativos"): se
  resolvió del lado de la auditoría — sin números, sin racha, sin premio,
  solo puntos rellenos donde hubo actividad y solo el mes en curso. Encaja
  con el Principio 4 de producto ("el tiempo es dato"). En el C4 se metió
  dentro del nodo `UsageCalendar · UsageRecord · Period` para no rehacer el
  layout del SVG. Semana empezando el domingo + iniciales de día; las
  iniciales traducidas (`['D','L','M',…]` / `['S','M','T',…]`) se sacaron de
  `DatePicker` a `shared/lib/weekdays.ts` y ahora las comparten los dos.
  Layout final: calendario + card de hoy lado a lado; el resto de los días en
  masonry de 2 columnas en mobile (`columns-2`), un solo `flex-wrap` desde
  `sm` (`sm:contents` en los wrappers). `UsageRecord` marca la card del día en
  curso con `( hoy )` (`isTheSameDay`, clave i18n `usage_history.today`).
- **Decisión — guardado incremental en el cliente.** El cliente calcula
  `totalTime - lastSaved` y `updateDailyUsageRecord` decide la forma; el server
  action solo persiste el array entero. Mantiene la lógica en funciones puras
  testeables y el backend tonto, al precio de reescribir todo el `usageHistory`
  en cada guardado.
- **2026-09-09 — cadencia logueado a 20 min + flush oportunista.** Antes el
  intervalo era 60,5 s para todos → ~60 `UPDATE` a Postgres por hora y tablero
  abierto, sin que el dato lo justifique. Ahora: 20 min con sesión (invitado
  sigue en 60,5 s, localStorage es barato) + guardado al abrir el menú / rail
  (evento `capo:usage-flush`, suele preceder a `/time/[id]`). Se eligió 20 min
  (< `TIME_LIMIT` de 25 min) para evitar cualquier corte espurio de sesión en
  actividad continua.
- **2026-09-09 — fixes de la revisión (code-review medium).** Tres puntos:
  (1) `lastSavedTimeRef` avanzaba apenas se disparaba la mutación fire-and-forget;
  si el guardado fallaba se perdían hasta ~20 min. Ahora avanza solo en el
  `onSuccess`, con `pendingSaveTargetRef` guardando el objetivo pendiente, así
  que un fallo se reintenta entero. (2) `needsNewUsageSession` medía la
  inactividad desde `startTimestamp + duration`, que depende de la cadencia de
  guardado y de las pausas cortas ya absorbidas en la sesión; pasó a
  `lastPeriod.endTimestamp` (hora real del fin de actividad) → el umbral vuelve a
  ser exactamente `TIME_LIMIT`. (3) el flush en `visibilitychange → hidden`
  llamaba al mismo server action async sin `keepalive`/`sendBeacon`, así que no
  llegaba a completarse justo en el caso de cierre de pestaña que decía cubrir;
  se quitó (era "guardado optimista"). El flush por `capo:usage-flush`
  (menú/rail) sí funciona y se mantiene.
- **Decisión — dos relojes.** `sessionStorage` (`timeTracking`) es el reloj
  vivo de la pestaña; `usageHistory` (DB / `localStorage`) es el registro
  durable. `useLastDurationPeriod` lee el primero; `UsageHistory` el segundo.
- **Ventana de sesión = 25 min.** `TIME_LIMIT` en `needsNewUsageSession`. Ojo:
  los **nombres** de los tests de `updateDailyUsageRecord.test.ts` dicen "15
  minutos" y "1 hora" — quedaron de valores viejos, la constante es 25 min.
- **`pauseOnTabHidden` vs. `casos-de-uso.md`.** `docs/casos-de-uso.md` dice
  "el registro se pausa al cerrar la pestaña"; el guardado de fondo usa
  `pauseOnTabHidden: false`, así que **no** pausa el conteo con la pestaña
  oculta y tampoco fuerza un guardado a DB al ocultar ni al cerrar la pestaña
  (solo por intervalo o por `capo:usage-flush`). El que puede pausar el conteo
  es el hook base (`useTimeTracking`) con su default, que además sí se
  auto-guarda a `sessionStorage` en `visibilitychange`/`beforeunload`.
- **Límite conocido — `parseDuration` y las 24 h.** Formatea con
  `new Date(ms)` en UTC: a partir de 24 h el `HH` vuelve a 00. Un total diario
  no debería llegar ahí, pero no está acotado.
- **Rama muerta.** `updateDailyUsageRecord.ts` repite `usageHistory.length === 0`
  en el segundo `if` (ya cubierto por el primer `return`). Inofensivo.
- **Docs relacionados:** `docs/casos-de-uso.md` (§ Registro de uso),
  `docs/modelo-datos.md` (campo `Board.usageHistory`), `docs/arquitectura.md`
  (`ClientOnlyInit` en el montaje).
