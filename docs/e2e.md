# Tests e2e (Playwright)

Qué tener en cuenta al escribir o correr las pruebas end to end. Los specs viven
en `web-app/e2e/` y los comandos se corren desde `web-app/`.

- Docs de Playwright: <https://playwright.dev/docs/intro>
- Skill `playwright-cli` para manejar el browser y estos tests desde el agente.
  - Instalar: `npm install -g @playwright/cli@latest` y después `playwright-cli install --skills`.
  - Si ya la tenés, vive en `.claude/skills/playwright-cli/SKILL.md` (proyecto) o `~/.claude/skills/playwright-cli/SKILL.md` (global).
  - El paquete es <https://www.npmjs.com/package/@playwright/cli>.

## Al correr las pruebas

- **CI corre contra un build de producción**, no `next dev`: en CI el `webServer`
  de Playwright hace `npm run build` + `npm run start`; en local sigue con
  `npm run dev` reutilizando el server que tengas levantado. Una prueba que
  dependa de comportamiento de dev (HMR, error overlay, compilación lazy) no vale
  en CI.
- **Reproducir CI en local** (desde `web-app/`):

  ```bash
  DATABASE_URL=postgresql://u:p@localhost:5432/dummy \
    AUTH_SECRET=e2e-ci-not-a-real-secret AUTH_TRUST_HOST=true CI=1 \
    npx playwright test --project=chromium
  ```

- `DATABASE_URL` es de descarte a propósito: el modo invitado no toca la DB y el
  adapter de Prisma no abre conexión al instanciarse. No hace falta una DB real.
- Estado conocido: **chromium 20/20 verde**. **firefox es flaky** y todavía no
  está confirmado en CI.

## Al escribir pruebas

- **El idioma sigue a `navigator.language`**: `'en'` → inglés, cualquier otro →
  español. Si la prueba fija `navigator.language`, los textos matchean ese idioma.
  Si el invitado ya eligió idioma (`localStorage['language']`), eso gana y la
  sync no hace nada.
- **Los textos de UI son i18n**, no hardcodeados. Ej.: el botón del WelcomeDialog
  es `t('welcome_dialog.start')` ("Empezar" / "Get started"). No hardcodees
  strings de UI en los locators sin controlar el idioma primero.
- **Navegación (rail vs. mobile): decidir por ancho de viewport, no por
  `isVisible()`.** Al cerrarse el WelcomeDialog, Radix deja el rail ~200ms dentro
  de un contenedor con `aria-hidden`; un `isVisible()` puntual lo da por ausente y
  la lógica cae a la rama mobile (`NavBtn`, que es `md:hidden` en escritorio) →
  timeout de 30s. Usá `e2e/utils/navigation.ts` (`navigateToMenuItem`), que ya
  decide por viewport y deja que `click()` auto-espere.
- **Evitá chequeos puntuales sin espera** (`isVisible()`, `count()` inmediato)
  justo después de transiciones de Radix. Preferí locators con auto-wait.
- **Si asertás "cero errores de consola", filtrá el ruido de navegación.**
  next-auth reintenta `GET /api/auth/session`; cada `page.goto()` aborta el fetch
  en vuelo y authjs lo loguea como `Failed to fetch`
  (`errors.authjs.dev#autherror`). No es un error de la app — el modo invitado no
  tiene sesión. `board-scoped-navigation.spec.ts` lo descarta con un guard
  `isNavigationAbort`.

## Relación con las animaciones (motion / AnimatePresence)

La lista de cada columna vive dentro de un `<AnimatePresence mode='popLayout'>`
(`TaskList.tsx`) y cada `Task` es un `m.div`. Eso tiene un efecto que hay que
tener presente al escribir pruebas:

- **`popLayout` mantiene montado el nodo que sale** mientras corre su animación
  de salida. Al mover una tarea entre columnas, durante ~250 ms la tarjeta
  existe en **dos columnas a la vez**: la nueva (entrando) y la vieja (saliendo).
- Un locator global de texto (`page.getByText(nombreTarea)`) matchea las dos en
  esa ventana → Playwright tira `strict mode violation: resolved to 2 elements`.
  Es una carrera: a veces la prueba gana y pasa, a veces no.
- **Regla: después de mover/arrastrar una tarea, scopeá el locator a la columna
  donde debería estar ahora**, no uses `page.getByText(...)` a secas.

  ```ts
  // mal: matchea el fantasma de la columna de origen durante la animación
  await page.getByText(nombreTarea).click()
  // bien
  await page.locator('[aria-label="Procesando"]').getByText(nombreTarea).click()
  ```

  Los `expect(...).toBeVisible()` scopeados por columna ya seguían este patrón;
  lo que faltaba era aplicarlo también a los `.click()` / `.dragTo()`.

- Del lado de la app, `Task` **solo anima la salida en la última columna**
  (cascada al archivar). En las demás, una tarea que "sale" es una que se movió,
  así que se desmonta al instante y no deja fantasma. Si esto cambia (p. ej. se
  agrega animación de borrado en cualquier columna), las pruebas de movimiento
  vuelven a necesitar locators scopeados por columna sí o sí.

## Historia

El diagnóstico y arreglo de por qué los e2e fallaban todos en CI (i18n arrancaba
en inglés, carrera con el `aria-hidden` de Radix, `next dev` compilando lazy) está
en los commits `f2a9bba4`, `76341809` y `de97ceb6`.
