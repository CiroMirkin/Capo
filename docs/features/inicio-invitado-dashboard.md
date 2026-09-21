# Inicio: landing, invitado y dashboard

## Resumen

Separa el punto de entrada de la app en tres rutas según el estado de sesión:
`/home` (landing, sin guard), `/guest` (tablero de invitado en URL fija) y
`/dashboard` (el dashboard del usuario autenticado, antes servido en `/`).
`/` pasa a ser un router fino por sesión: autenticado → `/dashboard`, sin
sesión → el mismo contenido que `/home` (sin redirect de URL, estilo
vercel.com). `/home` no tiene guard: es la única forma de que un usuario ya
logueado vea la landing, ya que `/` lo manda directo a `/dashboard`.

- **Código:** `web-app/app/page.tsx`, `web-app/app/home/`, `web-app/app/guest/`,
  `web-app/app/dashboard/` (+ `web-app/middleware.ts`).
- **Alcance:** ruteo por sesión + prototipo mínimo de contenido de landing
  (hero + 2 CTAs, reusando `DescriptionOfCapo`).
- **Fuera de alcance:** contenido de marketing más elaborado (capturas,
  lista de features, pricing); detección de "invitado que vuelve" para
  saltear `/home` directo a `/guest` (ver Tips).

## Diagrama C4 — código

<!-- Pendiente: la skill `diagram-design` no estaba disponible en esta sesión (mismo caso que usage-history y paginas-navegacion). Agregar cuando esté disponible: RootPage (app/page.tsx) → useSession → Home (app/home/Home.tsx) ↔ HomeRoute (app/home/page.tsx); GuestRoute (app/guest/page.tsx) → BoardPage (app/board/[id]/BoardPage.tsx); DashboardRoute (app/dashboard/page.tsx) → UserDashboard (app/dashboard/UserDashboard.tsx); middleware (web-app/middleware.ts) → NextResponse.redirect. -->

## Modelo / lógica

Sin funciones de dominio nuevas; es lógica de ruteo repartida en tres capas:

- **`middleware.ts`** (chequeo optimista de cookie, edge): `isAuthenticated &&
  (pathname === '/' || pathname === '/auth')` → redirect `/dashboard`;
  `!isAuthenticated && pathname === '/dashboard'` → redirect `/`. `/home` y
  `/guest` no tienen entrada acá: son siempre públicas.
- **`app/page.tsx`** (client, `RootPage`): `useSession()` — con sesión hace
  `redirect('/dashboard')` (defensa en profundidad además del middleware);
  sin sesión renderiza `<Home />`, el mismo componente que usa `/home`, sin
  cambiar la URL.
- **`app/home/Home.tsx`**: sin guard, siempre visible. Hero con `DescriptionOfCapo`
  (reusado, no reescrito) + dos CTAs: "Probar como invitado" → `/guest`,
  "Crear cuenta" → `/auth`.
- **`app/guest/page.tsx`**: renderiza `<BoardPage boardId={defaultBoard.id} />`
  directamente — el mismo componente que `/board/[id]`, sin redirect. La URL
  se queda fija en `/guest` (antes: `/` redirigía a `/board/{defaultBoard.id}`).
- **`app/dashboard/UserDashboard.tsx`** (movido de `app/UserDashboard.tsx`):
  mismo guard client-side de antes, solo cambia el destino del redirect sin
  sesión (`/board/${defaultBoard.id}` → `/`).

## Persistencia y modelo

No aplica: sin cambios de modelo de datos, Prisma ni modo invitado. El guest
board sigue en `localStorage`, sin tocar `auth`.

## i18next

- Namespace nuevo `home.*` en `es.json`/`en.json`: `try_as_guest`,
  `create_account`.
- El hero reusa `board_description.p1`/`p2` vía `DescriptionOfCapo` — sin
  copy nueva.

## Tips / historia

- **2026-09-21 — `/home` sin guard, a propósito.** Es la única ruta desde la
  que un usuario autenticado puede ver la landing, porque `/` ya lo redirige
  a `/dashboard`. Modelo de referencia: cómo vercel.com separa el dominio raíz
  (session-aware) de una URL de marketing estable.
- **2026-09-21 — `/guest` es una URL fija con contenido propio, no un
  redirect.** Se descartó la alternativa de que `/guest` redirija a
  `/board/{defaultBoard.id}` (como hacía `/` antes) para evitar el salto
  extra de URL; en cambio reusa `BoardPage` directamente.
- **2026-09-21 — e2e actualizados.** Los specs que hacían `page.goto('/')`
  esperando el tablero de invitado (`translation`, `task-notes`, `task-flow`,
  `task-archive`, `local-storage`, `columns`, `board-scoped-navigation`)
  pasaron a `page.goto('/guest')`, porque `/` ya no sirve el tablero a
  usuarios sin sesión. `board-scoped-navigation.spec.ts` además dejó de
  derivar `archiveUrl`/`timeUrl` de la URL del tablero (ya no contiene
  `/board/`) y ahora las arma directo como `/archive/guest` y `/time/guest`.
- **Límite conocido / deuda aceptada — sin atajo para el invitado que
  vuelve.** Cada visita sin sesión a `/` muestra `/home`, aunque el usuario
  ya tenga actividad en el guest board. Ya existe el flag
  `capo-welcome-dialog` en `localStorage` (usado hoy por `WelcomeDialog`) que
  podría reusarse para saltar directo a `/guest`; se decidió dejarlo para una
  iteración posterior, fuera de este prototipo de ruteo.
