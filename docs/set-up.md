# Set up

Pasos para levantar el proyecto después de clonar el repo. La app vive en `web-app/`;
todos los comandos se corren desde ahí.

## Requisitos

- **Node 24** + npm — fijado en `web-app/.nvmrc`; con nvm: `nvm use 24`. CI corre `lts/*`.
- Una base **PostgreSQL**. Lo más rápido: [Prisma Postgres](https://console.prisma.io)
  gratis (crear DB → copiar la connection string). Alternativa: Postgres local.

## 1. Dependencias

```bash
cd web-app
nvm use 24        # o instalá Node 24 a mano (ver .nvmrc)
npm install
```

`npm install` también instala los git hooks de Husky (script `prepare`): lint + format
antes de cada commit, tests antes de cada push.

## 2. Variables de entorno

```bash
cp .env.example .env
```

Completá `.env`:

| Variable | Qué poner |
|---|---|
| `DATABASE_URL` | Connection string de tu Postgres. Prisma Postgres: `prisma+postgres://…` con tu API key. Directo: `postgresql://user:pass@localhost:5432/capo`. |
| `AUTH_SECRET` | `npx auth secret` (o `openssl rand -base64 32`). |
| `AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET` | Solo si querés login con GitHub. Creá una OAuth App en <https://github.com/settings/developers> con callback `http://localhost:3000/api/auth/callback/github`. Si no, dejá los placeholders y usá email + contraseña. |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` |

## 3. Base de datos

```bash
npx prisma generate        # genera el client en generated/prisma (está gitignored)
npx prisma migrate deploy  # aplica las migraciones a la DB
npm run seed               # carga el catálogo de temas + grupos de etiquetas
```

- `prisma7.config.ts` se carga solo — no hace falta `--config`.
- En desarrollo, si vas a **modificar** el schema, usá `npx prisma migrate dev --name <nombre>`
  en lugar de `deploy`.
- El seed llena el catálogo completo de temas (~60) y los grupos `Eisenhower` / `Dev`.
  Sin él la app arranca igual pero sin temas para elegir.

## 4. Levantar la app

```bash
npm run dev
```

→ <http://localhost:3000>. Registrate con email + contraseña (o GitHub si configuraste el OAuth).

## 5. Tests (opcional)

```bash
npx playwright install chromium firefox   # una sola vez
npm test              # unitarios (Vitest)
npm run test:e2e      # end to end (Playwright, levanta la app solo)
```

## Más

- Comandos del día a día: `docs/comandos.md`.
- Convenciones de commits: `CONTRIBUTING.md`.
- Arquitectura y modelo de datos: `docs/arquitectura.md`, `docs/modelo-datos.md`.
