import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 4 : 2,
  reporter: 'html',
  timeout: 30000,
  expect: {
    timeout: 5000,
  },
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    }
  ],
  webServer: {
    // En CI corremos contra un build de producción (`next build` en un step
    // aparte del workflow) servido con `next start`: sin compilación lazy, cada
    // ruta responde al instante y ningún `goto`/`reload` se come 30 s de compile.
    // En local seguimos con `next dev` reutilizando el server que ya esté levantado.
    command: process.env.CI ? 'npm run start' : 'npm run dev',
    url: 'http://localhost:3000/board/guest',
    reuseExistingServer: !process.env.CI,
    // `next start` levanta en segundos; `next dev` en local se come el compile en
    // frío de `/board/[id]` una sola vez (hasta ~2 min en Windows).
    timeout: process.env.CI ? 60_000 : 240_000,
  },
});
