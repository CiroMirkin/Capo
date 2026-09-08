import { test, expect } from '@playwright/test'

test.describe('Navegación entre páginas board-scoped', () => {
	test.beforeEach(async ({ page }) => {
		await page.context().addInitScript(() => {
			Object.defineProperty(navigator, 'language', { value: 'es-ES' })
			Object.defineProperty(navigator, 'languages', { value: ['es-ES', 'es'] })
		})

		await page.goto('/')
		await page.getByRole('button', { name: 'Empezar' }).click()
	})

	test.afterEach(async ({ page }) => {
		await page.evaluate(() => localStorage.clear())
	})

	test('Archivo y Registro de uso resuelven el tablero al entrar directo por su URL', async ({
		page,
	}) => {
		const consoleErrors: string[] = []
		// next-auth reintenta GET /api/auth/session; cada page.goto() aborta el fetch
		// en vuelo y authjs lo loguea como "Failed to fetch". Es ruido de la
		// navegación rápida del test, no un error de la app (el modo invitado ni
		// siquiera tiene sesión).
		const isNavigationAbort = (text: string) =>
			text.includes('errors.authjs.dev') && text.includes('Failed to fetch')
		page.on('console', (msg) => {
			if (msg.type() === 'error' && !isNavigationAbort(msg.text()))
				consoleErrors.push(msg.text())
		})
		page.on('pageerror', (err) => {
			if (!isNavigationAbort(err.message)) consoleErrors.push(err.message)
		})

		const taskText = `Tarea de prueba ${Date.now()}`
		await test.step('Creo una tarea en el tablero', async () => {
			await page.fill('#add_new_task_btn', taskText)
			await page.click('#plus_btn')
			await expect(page.getByText(taskText)).toBeVisible()
		})

		const boardUrl = page.url()
		const archiveUrl = boardUrl.replace('/board/', '/archive/')
		const timeUrl = boardUrl.replace('/board/', '/time/')

		await test.step('Entro a Archivo por URL', async () => {
			await page.goto(archiveUrl, { waitUntil: 'domcontentloaded' })
			await expect(page).toHaveURL(archiveUrl)
			await expect(page.getByRole('tablist')).toBeVisible()
		})

		await test.step('Entro a Registro de uso por URL', async () => {
			await page.goto(timeUrl, { waitUntil: 'domcontentloaded' })
			await expect(page).toHaveURL(timeUrl)
			await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
		})

		await test.step('Vuelvo al tablero y la tarea sigue ahí', async () => {
			await page.goto(boardUrl, { waitUntil: 'domcontentloaded' })
			await expect(page.getByText(taskText)).toBeVisible({ timeout: 15000 })
		})

		expect(consoleErrors).toEqual([])
	})
})
