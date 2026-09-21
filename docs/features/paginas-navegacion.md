# Páginas de Privacidad y Seguridad

## Resumen

Dos páginas estáticas de contenido legal, `/privacy` y `/security`, con un
único punto de acceso en la navegación: un ítem "Privacidad y Seguridad" que
enlaza solo a `/privacy` (nunca hay dos entradas separadas). `/security` se
alcanza cruzando desde adentro de `/privacy` (§5) y viceversa (link al
principio de cada página). Ambas páginas están completamente traducidas
(ES/EN).

- **Código:** `web-app/app/privacy/`, `web-app/app/security/`, `SECURITY.md`
  (raíz del repo, la detecta GitHub automáticamente). Nav:
  `web-app/app/_components/navLinks.ts` (`getPrivacyLink`),
  `HeaderNav/HeaderNav.tsx`, `NavRail/getNavRailItems.ts`,
  `web-app/app/UserDashboard.tsx` (link de pie, abajo a la izquierda). i18n:
  `web-app/src/shared/i18n/{policy.es.json,policy.en.json,index.ts,server.ts}`.
- **Alcance:** mostrar contenido legal estático y traducido; enlazarlo desde
  el dropdown de `HeaderNav`, el `NavRail` y el Dashboard.
- **Fuera de alcance:** banner de cookies, aceptación/consentimiento
  explícito (checkbox en signup), versionado legal auditado.

## Diagrama C4 — código

<!-- Pendiente: la skill `diagram-design` no estaba disponible en esta sesión (mismo caso que usage-history, 2026-09-13). Agregar cuando esté disponible: PrivacyRoute/SecurityRoute (app/{privacy,security}/page.tsx) → Header (whereUserIs=PRIVACY) → HeaderNav/NavRail → getPrivacyLink (navLinks.ts) → USER_IS_IN.PRIVACY. -->

## Modelo / lógica

Sin lógica de dominio: son páginas de contenido estático. La única pieza de
comportamiento es `getPrivacyLink(t, whereUserIs)` (`navLinks.ts`), que arma
un único `LinkItem` hacia `/privacy`. Tanto `PrivacyRoute` como `SecurityRoute`
pasan `whereUserIs={USER_IS_IN.PRIVACY}` a `Header` — el mismo valor para las
dos páginas, a propósito: es un solo destino de nav conceptual, así que el
ítem "Privacidad y Seguridad" queda marcado como activo (`current`) estando en
cualquiera de las dos páginas, aunque el link solo apunte a `/privacy`.

## Persistencia y modelo

No aplica: no hay modelo de datos, schema de Prisma ni modo invitado
involucrados. Contenido 100% estático.

## i18next

- El texto legal vive en un par de archivos **separados** del resto de las
  traducciones —`src/shared/i18n/policy.es.json` / `policy.en.json`— bajo los
  namespaces `privacy.*` y `security.*`, para no mezclar contenido legal largo
  con las claves cortas de UI de `es.json`/`en.json` (pedido explícito del
  usuario).
- Se mergean en el namespace `translation` por defecto en `index.ts` y
  `server.ts`: `{ ...en, ...policyEn }` / `{ ...es, ...policyEs }`. Con esto
  `useTranslation()` sigue funcionando igual en toda la app, sin pasar un
  namespace explícito.
- Primer uso de `<Trans>` de `react-i18next` en el código (el resto de la app
  solo usa `t()` con strings planos): necesario para los párrafos con
  `<strong>`, `<code>` o links (`<mail>`, `<securityLink>`, `<privacyLink>`,
  `<githubLink>`, `<githubRepoLink>`) embebidos en el medio del texto legal.
- `menu.privacy` — clave corta del label de nav ("Privacidad y Seguridad" /
  "Privacy & Security") — sí vive en `es.json`/`en.json`, junto al resto de
  `menu.*`, porque es un string de UI corto, no contenido legal.

## Tips / historia

- **2026-09-19 — un solo link de nav, no dos.** `Privacy` ya enlaza a
  `/security` en su §5 y viceversa (link al principio de cada página), así
  que se decidió no duplicar el ítem de nav: una sola entrada
  "Privacidad y Seguridad" apunta a `/privacy`, `/security` se llega
  navegando desde adentro. Menos ítems en un dropdown ya cargado
  (Help/Github/Login/idioma).
- **2026-09-19 — i18n en archivo aparte, mergeado a mano.** Se evaluó usar un
  namespace real de i18next (`useTranslation('legal')`) para separar el
  contenido legal, pero se prefirió mantener un solo namespace `translation`
  y mergear los JSON en el objeto de `resources` (`{ ...en, ...policyEn }`):
  menos superficie nueva, `useTranslation()` sigue igual en toda la app.
- **2026-09-19 — bug de un edit externo: `page.tsx` sin `export default`.**
  Durante la sesión, un edit fuera de banda aplanó `Privacy`/`Security` (antes
  componentes separados en `Privacy.tsx`/`Security.tsx`) directo dentro de
  `page.tsx`, pero como export nombrado (`export function Privacy`), no
  default. El App Router de Next.js exige un default export en `page.tsx` —
  las rutas hubieran roto en build/dev. Se corrigió a
  `export default function PrivacyRoute/SecurityRoute`.
- **`SECURITY.md` en la raíz.** Duplica un subconjunto del contenido de
  `/security` (reporte de vulnerabilidades) porque GitHub lo detecta
  automáticamente y lo muestra en la tab "Security" del repo. La URL
  `https://cappo.vercel.app/security` (con doble "p") es correcta, confirmada
  por el usuario — no es un typo.
