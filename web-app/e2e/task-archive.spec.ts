import test, { expect } from '@playwright/test'
import { navigateToMenuItem } from './utils/navigation'

test.describe('Archivar tareas', () => {
	test.beforeEach(async ({ page }) => {
		await page.context().addInitScript(() => {
			Object.defineProperty(navigator, 'language', { value: 'es-ES' })
			Object.defineProperty(navigator, 'languages', { value: ['es-ES', 'es'] })
		})

		await page.goto('/')
		await page.getByRole('button', { name: 'Empezar' }).click()
	})

	test('Puedo archivar una tarea individual', async ({ page }) => {
		const taskText = `Tarea de prueba ${Date.now()}`
		await test.step('Puedo crear una tarea', async () => {
			await page.fill('#add_new_task_btn', taskText)
			await page.click('#plus_btn')
			await expect(page.getByText(taskText)).toBeVisible()
			await page.getByText(taskText).click()
		})

		await test.step('Arrastrar la tarea a "Terminado"', async () => {
			const tareaEnPendientes = page.locator('[aria-label="Pendientes"]').getByText(taskText)
			await tareaEnPendientes.dragTo(page.locator('[aria-label="Terminado"]'))
		})

		await test.step('La tarea archivada desaparece del tablero', async () => {
			await page.locator('[aria-label="Terminado"]').getByText(taskText).click()
			await page.getByTestId('BotonParaArchivarUnaTarea').click()
			await expect(page.getByText(taskText)).not.toBeVisible()
		})

		await test.step('La tarea archivada ensta en el archivo', async () => {
			await navigateToMenuItem(page, 'Archivo')
			await expect(page.getByText(taskText)).toBeVisible()
		})
	})

	test('Puedo archivar una lista de tareas individual', async ({ page }) => {
		const taskText1 = `Tarea 1 de prueba ${Date.now()}`
		const taskText2 = `Tarea 2 de prueba ${Date.now()}`
		await test.step('Se crean dos tareas', async () => {
			await page.fill('#add_new_task_btn', taskText1)
			await page.click('#plus_btn')
			await page.fill('#add_new_task_btn', taskText2)
			await page.click('#plus_btn')
			await expect(page.getByText(taskText1)).toBeVisible()
		})

		await test.step('Arrastrar la primer tarea a la columna "Terminado"', async () => {
			await page.getByText(taskText1).click()
			const tareaEnPendientes = page.locator('[aria-label="Pendientes"]').getByText(taskText1)
			await tareaEnPendientes.dragTo(page.locator('[aria-label="Terminado"]'))
		})

		await test.step('Arrastrar la segunda tarea a la columna "Procesando" y luego a "Terminado"', async () => {
			// Hacia "Procesando"
			await page.getByText(taskText2).click()
			const tareaEnPendientes = page.locator('[aria-label="Pendientes"]').getByText(taskText2)
			await tareaEnPendientes.dragTo(page.locator('[aria-label="Procesando"]'))
			// Hacia "Terminado"
			await page.locator('[aria-label="Procesando"]').getByText(taskText2).click()
			const tareaEnProceso = page.locator('[aria-label="Procesando"]').getByText(taskText2)
			await tareaEnProceso.dragTo(page.locator('[aria-label="Terminado"]'))
		})

		await test.step('Las tarea desaparece del tablero', async () => {
			await page.getByTestId('BotonParaArchivarUnaListaDeTareas').click()
			await expect(page.getByText(taskText1)).not.toBeVisible()
			await expect(page.getByText(taskText2)).not.toBeVisible()
		})

		await test.step('La tarea archivada ensta en el archivo', async () => {
			await navigateToMenuItem(page, 'Archivo')
			await expect(page.getByText(taskText1)).toBeVisible()
			await expect(page.getByText(taskText2)).toBeVisible()
		})
	})

	test('Puedo archivar  y devolver una tarea al tablero', async ({ page }) => {
		const taskText = `Tarea de prueba ${Date.now()}`
		await test.step('Puedo crear una tarea', async () => {
			await page.fill('#add_new_task_btn', taskText)
			await page.click('#plus_btn')
			await expect(page.getByText(taskText)).toBeVisible()
			await page.getByText(taskText).click()
		})

		await test.step('Arrastrar la tarea a "Terminado"', async () => {
			const tareaEnPendientes = page.locator('[aria-label="Pendientes"]').getByText(taskText)
			await tareaEnPendientes.dragTo(page.locator('[aria-label="Terminado"]'))
		})

		await test.step('La tarea archivada desaparece del tablero', async () => {
			await page.locator('[aria-label="Terminado"]').getByText(taskText).click()
			await page.getByTestId('BotonParaArchivarUnaTarea').click()
			await expect(page.getByText(taskText)).not.toBeVisible()
		})

		await test.step('La tarea archivada esta en el archivo', async () => {
			await navigateToMenuItem(page, 'Archivo')
			await expect(page.getByText(taskText)).toBeVisible()
		})

		await test.step('Al desarchivar una tarea esta desaparece del archivo', async () => {
			const archivedTasks = page.getByText(taskText)
			archivedTasks.click()
			page.getByTestId('BotonParaDevolverUnaTareaArchivadaAlTablero').click()
			await expect(page.getByText(taskText)).not.toBeVisible()
		})

		await test.step('La tarea desarchivada esta en el tablero', async () => {
			await page.goto('/')
			await expect(page.getByText(taskText)).toBeVisible()
		})
	})
})
