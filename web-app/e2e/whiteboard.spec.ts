import { test, expect } from '@playwright/test'
import { navigateToMenuItem } from './utils/navigation'

test.describe('Pizarra del tablero', () => {
	test.beforeEach(async ({ page }) => {
		await page.context().addInitScript(() => {
			Object.defineProperty(navigator, 'language', { value: 'es-ES' })
			Object.defineProperty(navigator, 'languages', { value: ['es-ES', 'es'] })
		})

		await page.goto('/guest')
		await page.getByRole('button', { name: 'Empezar' }).click()
		await expect(page.locator('#add_new_task_btn')).toBeVisible()
	})

	test.afterEach(async ({ page }) => {
		await page.evaluate(() => localStorage.clear())
	})

	test('Un rectángulo dibujado sigue ahí después de recargar', async ({ page }) => {
		// La primera compilación de Excalidraw en dev tarda.
		test.slow()
		const canvas = page.locator('canvas.interactive')

		await test.step('Entro a la pizarra desde el menú', async () => {
			await navigateToMenuItem(page, 'Pizarra')
			await expect(page).toHaveURL(/\/whiteboard\//, { timeout: 30000 })
			await expect(canvas).toBeVisible({ timeout: 30000 })
		})

		await test.step('Dibujo un rectángulo', async () => {
			await page.getByTitle('Rectángulo — R o 2').click()
			await page.mouse.move(400, 300)
			await page.mouse.down()
			await page.mouse.move(600, 450, { steps: 5 })
			await page.mouse.up()
			await expect
				.poll(() => page.evaluate(() => localStorage.getItem('capo-whiteboard') ?? ''))
				.toContain('"type":"rectangle"')
		})

		await test.step('Recargo y el rectángulo sigue en la pizarra', async () => {
			await page.reload()
			await expect(canvas).toBeVisible({ timeout: 15000 })
			// Con algo seleccionado aparece el panel de propiedades; con la pizarra vacía, no.
			await canvas.click({ position: { x: 10, y: 10 } })
			await page.keyboard.press('ControlOrMeta+a')
			await expect(page.getByText('Trazo', { exact: true })).toBeVisible()
		})
	})
})
