import { test, expect } from '@playwright/test'

test.describe('Flujo de movimiento de una tarea', () => {
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

	test('Flujo completo de una tarea', async ({ page }) => {
		const nombreTarea = `Tarea de prueba ${Date.now()}`
		await test.step('Puedo crear una tarea', async () => {
			await page.fill('#add_new_task_btn', nombreTarea)
			await page.click('#plus_btn')
			await expect(page.getByText(nombreTarea)).toBeVisible()
			await page.getByText(nombreTarea).click()
		})

		await test.step('Puedo mover una tarea a la siguiente columna ("Procesando")', async () => {
			await page.getByTestId('BotonParaAvanzarTarea').click()
			await expect(
				page.locator('[aria-label="Procesando"]').getByText(nombreTarea)
			).toBeVisible()
		})

		await test.step('La tarea ya no esta en la columna "Pendientes"', async () => {
			await expect(
				page.locator('[aria-label="Pendientes"]').getByText(nombreTarea)
			).not.toBeVisible()
		})

		await test.step('Puedo mover nuevamente la tarea a la siguiente columna', async () => {
			await page.locator('[aria-label="Procesando"]').getByText(nombreTarea).click()
			await page.getByTestId('BotonParaAvanzarTarea').click()
			await expect(
				page.locator('[aria-label="Terminado"]').getByText(nombreTarea)
			).toBeVisible()
		})

		await test.step('Puedo eliminar la tarea', async () => {
			await page.locator('[aria-label="Terminado"]').getByText(nombreTarea).click()
			await page.getByTestId('BotonEliminarTarea').click()
			await page.getByText('Eliminar', { exact: true }).click() // Toast de confirmacion
			await expect(page.getByText(nombreTarea)).not.toBeVisible()
		})
	})

	test('Puedo arrastrar una tarea de "Pendientes" a "Procesando"', async ({ page }) => {
		const nombreTarea = `Tarea arrastrable ${Date.now()}`

		await test.step('Crear una tarea en "Pendientes"', async () => {
			await page.fill('#add_new_task_btn', nombreTarea)
			await page.click('#plus_btn')
			await expect(page.getByText(nombreTarea)).toBeVisible()
		})

		await test.step('Arrastrar la tarea a "Procesando"', async () => {
			const tareaEnPendientes = page
				.locator('[aria-label="Pendientes"]')
				.getByText(nombreTarea)
			const columnaProcesando = page.locator('[aria-label="Procesando"]')
			await tareaEnPendientes.dragTo(columnaProcesando)
		})

		await test.step('Verificar que la tarea está en "Procesando"', async () => {
			await expect(
				page.locator('[aria-label="Procesando"]').getByText(nombreTarea)
			).toBeVisible()
		})

		await test.step('Verificar que la tarea ya no está en "Pendientes"', async () => {
			await expect(
				page.locator('[aria-label="Pendientes"]').getByText(nombreTarea)
			).not.toBeVisible()
		})
	})
})
