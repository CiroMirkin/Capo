# Sentry

Error tracking con [`@sentry/nextjs`](https://docs.sentry.io/platforms/javascript/guides/nextjs/).

## Dónde vive la config

Todo en la raíz de `web-app/`:

- `instrumentation.ts` carga `sentry.server.config.ts` o `sentry.edge.config.ts` según el runtime y expone `onRequestError` para Next.js.
- `instrumentation-client.ts` init del SDK de cliente (`NEXT_PUBLIC_SENTRY_DSN`) + tracking de transiciones de router.
- `sentry.server.config.ts` / `sentry.edge.config.ts` init del SDK server/edge (`SENTRY_DSN`).
- `next.config.ts` envuelve el config con `withSentryConfig` (org, project, upload de source maps en build).

## Variables de entorno

`NEXT_PUBLIC_SENTRY_DSN` y `SENTRY_DSN` en `.env` (mismo valor para ambas, ver `.env.example`). Sin ellas el SDK no reporta nada, pero la app funciona igual.

## Tunnel route

Los eventos del cliente no van directo a `*.sentry.io` sino a `/monitoring` (`tunnelRoute` en `next.config.ts`), para que un ad-blocker que bloquea el dominio de Sentry no tape los reportes. Por eso `/monitoring` está excluido del matcher de `middleware.ts`.

## Qué se captura

- **Excepciones no manejadas de React**: `app/error.tsx` (error boundary de ruta) y `app/global-error.tsx` (boundary raíz) llaman a `Sentry.captureException`.
- **Excepciones de negocio esperadas**: `getErrorMessageForTheUser` (en `src/shared/lib/getErrorMessageForTheUser.tsx`) **no** manda a Sentry los errores que son instancias de `BusinessError` (ej. "la columna está llena", "el archivo está lleno"): son validaciones esperadas, no bugs. 

## Tips/historia
