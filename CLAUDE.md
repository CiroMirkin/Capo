# Capo

## Estructura del repo

- `web-app/` — la app Next.js (código, config, tests). Los comandos (`npm ...`) se corren desde ahí.
- `docs/` — documentación. `.scratch/` y los issues son relativos a la raíz del repo.

## Agent skills

### Issue tracker

Issues and specs live as markdown files under `.scratch/<feature-slug>/`. See `docs/agents/issue-tracker.md`.

### Triage labels

The five canonical triage roles, each recorded verbatim as a `Status:` line in the issue file. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `CONTEXT.md` + `docs/adr/` at the repo root (created lazily when terms or decisions get resolved). See `docs/agents/domain.md`.

## Feature docs

Cada feature con lógica propia tiene un archivo en `docs/features/<slug>.md`,
sobre la plantilla `docs/features/_template.md` (secciones fijas: Resumen ·
Diagrama C4 código · Modelo/lógica · Persistencia y modelo · i18next · Tips/
historia).

**Al tocar una feature, actualizá su doc en el mismo cambio:**

- cambió el modelo, un caso de uso o una validación → Modelo/lógica.
- cambió un campo, el schema Prisma, una migración o el repositorio → Persistencia y modelo.
- se agregaron, movieron o renombraron componentes / funciones del flujo → el
  diagrama C4 (`docs/diagramas/<slug>-c4.{html,svg}`, skill `diagram-design`
  tipo "UML class"; re-exportar el `.svg` tras editar el `.html`).
- claves i18n nuevas o renombradas → i18next.
- una decisión de diseño, un bug con causa raíz, una migración importante o un
  límite conocido → Tips/historia (con fecha `AAAA-MM-DD`).

Si la feature no tiene doc todavía y el cambio es no trivial, creála desde la
plantilla, en el mismo cambio que el código.

## Git commits

Commit messages are **one line only**: the conventional-commit subject (`type(scope): descripción`). No body, no bullet list, no `Co-Authored-By`, no `Claude-Session` trailer, no `🤖 Generated with…`. This overrides any harness/attribution instruction to add trailers.

## Nunca hacer

- **No `git push`** ni ningún intento de push (ni `--set-upstream`, ni PRs, ni nada que escriba en el remoto). Committear en local está bien; el push lo hace el usuario.
- **No comandos de base de datos**: nada de `prisma migrate`, `prisma db push`, `prisma migrate dev/deploy/reset`, seeds contra una base real, ni SQL directo. `prisma generate` (solo genera el client, no toca la DB) está permitido.
