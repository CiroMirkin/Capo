import { test, expect } from '@playwright/test'
import { navigateToMenuItem } from './utils/navigation'

test.describe('Creacion y eliminacion de columnas', () => {
	test.beforeEach(async ({ page }) => {
		await page.context().addInitScript(() => {
			Object.defineProperty(navigator, 'language', { value: 'es-ES' })
			Object.defineProperty(navigator, 'languages', { value: ['es-ES', 'es'] })
		})

		await page.goto('/guest')
		await page.getByRole('button', { name: 'Empezar' }).click()
	})

	test('Puedo crear una columna', async ({ page }) => {
		await navigateToMenuItem(page, 'Ajustes')
		const columnName = `Prueba ${Date.now()}`

		await test.step('Crear una nueva columna', async () => {
			await page.getByPlaceholder('Nombre de la columna').fill(columnName)
			await page.getByTestId('BotonParaCrearUnaColumna').click()
		})

		await test.step('El nombre de la nueva columna es el correcto', async () => {
			await page.getByTestId('BotonParaCambiarElNombreDeUnaColumna').nth(3).click()
			await expect(page.locator(`input[name="${columnName}"]`)).toBeVisible()
		})

		await test.step('La nueva columna es visible en el tablero', async () => {
			await page.goto('/guest')
			await expect(page.getByRole('heading', { name: columnName })).toBeVisible()
		})
	})

	test('Crear una columna y eliminar otra', async ({ page }) => {
		await navigateToMenuItem(page, 'Ajustes')

		await test.step('Eliminar columna "Procesando"', async () => {
			await page
				.locator('li')
				.filter({
					has: page.locator('input[value="Procesando"]'),
				})
				.getByTestId('BotonParaEliminarUnaColumna')
				.click()

			// Confirmar eliminación en el toast
			await page.getByRole('button', { name: 'Eliminar', exact: true }).click()
			await expect(page.locator('input[value="Procesando"]')).not.toBeVisible()
		})

		const columnName = `Prueba ${Date.now()}`
		await test.step('Crear una nueva columna', async () => {
			await page.getByPlaceholder('Nombre de la columna').fill(columnName)
			await page.getByTestId('BotonParaCrearUnaColumna').click()
			await expect(page.locator(`input[name="${columnName}"]`)).toBeVisible()
		})

		await test.step('Verifica que la columna creada sigue existiendo', async () => {
			await expect(page.locator(`input[name="${columnName}"]`)).toBeVisible()
			await page.goto('/guest')
			await expect(page.getByRole('heading', { name: columnName })).toBeVisible()
		})
	})

	test('Al crear y eliminar tareas se mantiene la consistencia entre las tareas creadas y las columnas', async ({
		page,
	}) => {
		await navigateToMenuItem(page, 'Ajustes')
		const columnName = `Columna Prueba ${Date.now()}`
		const taskName = `Tarea Prueba ${Date.now()}`

		await test.step('Creo una nueva columna', async () => {
			await page.getByPlaceholder('Nombre de la columna').fill(columnName)
			await page.getByTestId('BotonParaCrearUnaColumna').click()
			await expect(page.locator(`input[name="${columnName}"]`)).toBeVisible()
		})

		await test.step('Creo una tarea', async () => {
			await page.goto('/guest')
			await page.fill('#add_new_task_btn', taskName)
			await page.click('#plus_btn')
			await expect(page.getByText(taskName)).toBeVisible()
			await page.getByText(taskName).click()
		})

		await test.step('Muevo la tarea hasta la tercer columna', async () => {
			const tareaEnPendientes = page.locator('[aria-label="Pendientes"]').getByText(taskName)
			const columnaProcesando = page.locator('[aria-label="Terminado"]')
			await tareaEnPendientes.dragTo(columnaProcesando)
		})

		await test.step('Elimino la segunda columna', async () => {
			await navigateToMenuItem(page, 'Ajustes')
			await page.locator('li').nth(1).getByTestId('BotonParaEliminarUnaColumna').click()
			await page.getByRole('button', { name: 'Eliminar', exact: true }).click()
			await expect(page.locator('li').nth(1)).not.toHaveText('Procesando')
		})

		await test.step('Puedo eliminar las tareas de la segunda columna', async () => {
			await page.goto('/guest')
			await expect(page.getByText(taskName)).toBeVisible()
			await page.getByText(taskName).click()
			await page.getByTestId('BotonMenuTarea').click()
			await page.getByTestId('BotonEliminarTarea').click()
			await page
				.getByLabel('Notifications alt+T')
				.getByRole('button', { name: 'Eliminar' })
				.click()
			await expect(page.getByText(taskName)).not.toBeVisible()
		})
	})
})
