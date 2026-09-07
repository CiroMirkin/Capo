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
    command: 'npm run dev',
    // Apuntamos al board invitado (no a `/`, que solo redirige): así el health
    // check espera al primer compile en frío de la ruta y los tests arrancan
    // contra un server ya tibio, en vez de que cada `beforeEach` se coma esos
    // ~2 min de compilación y timee out.
    url: 'http://localhost:3000/board/guest',
    reuseExistingServer: !process.env.CI,
    // Compilar `/board/[id]` en frío con `next dev` son ~2 min en Windows (menos
    // en el runner de CI). El health check de arriba se come esa compilación una
    // sola vez, así que le damos margen de sobra.
    timeout: 240_000,
  },
});
