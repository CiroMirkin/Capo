import { test, expect } from '@playwright/test'
import { navigateToMenuItem } from './utils/navigation'

test.describe('Persistencia de datos en localStorage', () => {
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

	test('Las tareas persisten después de recargar la página', async ({ page }) => {
		const taskName = `Tarea persistente ${Date.now()}`

		await test.step('Crear una tarea', async () => {
			await page.fill('#add_new_task_btn', taskName)
			await page.click('#plus_btn')
			await expect(page.getByText(taskName)).toBeVisible()
		})

		await test.step('Verificar que existe en localStorage', async () => {
			const storageData = await page.evaluate(() => {
				return localStorage.getItem('taskListInEachColumn') // Ajusta la key según tu app
			})
			expect(storageData).toBeTruthy()
			expect(storageData).toContain(taskName)
		})

		await test.step('La tarea sigue visible tras recargar', async () => {
			await page.reload()
			await expect(page.getByText(taskName)).toBeVisible()
		})
	})

	test('El estado de las columnas persiste tras recarga', async ({ page }) => {
		const taskName = `Tarea en progreso ${Date.now()}`

		await test.step('Crear y mover tarea a "Procesando"', async () => {
			await page.fill('#add_new_task_btn', taskName)
			await page.click('#plus_btn')
			await page.getByText(taskName).click()
			await page.getByTestId('BotonParaAvanzarTarea').click()

			await expect(
				page.locator('[aria-label="Procesando"]').getByText(taskName)
			).toBeVisible()
		})

		await test.step('Tras recargar, la tarea sigue en "Procesando"', async () => {
			await page.reload()

			await expect(
				page.locator('[aria-label="Procesando"]').getByText(taskName)
			).toBeVisible()

			await expect(
				page.locator('[aria-label="Pendientes"]').getByText(taskName)
			).not.toBeVisible()
		})
	})

	test('Las notas de tareas persisten en localStorage', async ({ page }) => {
		const taskName = `Tarea con nota ${Date.now()}`
		const noteText = `Nota persistente ${Date.now()}`

		await test.step('Crear tarea y agregar nota', async () => {
			await page.fill('#add_new_task_btn', taskName)
			await page.click('#plus_btn')
			await page.getByText(taskName).click()
			await page.getByRole('button', { name: 'Notas y comentarios' }).click()
			await page.locator('.tiptap').fill(noteText)
			await page.locator('.tiptap').press('ControlOrMeta+s')
			await page.getByTestId('CloseDialog').click()
		})

		await test.step('Verificar nota en localStorage', async () => {
			const storageData = await page.evaluate(() => {
				return localStorage.getItem('taskListInEachColumn')
			})
			expect(storageData).toContain(noteText)
		})

		await test.step('La nota persiste tras recargar', async () => {
			await page.reload()
			await page.getByText(taskName).click()
			await page.getByRole('button', { name: 'Notas y comentarios' }).click()
			await expect(page.locator('.tiptap')).toHaveText(noteText)
		})
	})

	test('Múltiples tareas persisten correctamente', async ({ page }) => {
		const tasks = [
			`Tarea 1 ${Date.now()}`,
			`Tarea 2 ${Date.now() + 1}`,
			`Tarea 3 ${Date.now() + 2}`,
		]

		await test.step('Crear múltiples tareas', async () => {
			for (const task of tasks) {
				await page.fill('#add_new_task_btn', task)
				await page.click('#plus_btn')
				await expect(page.getByText(task)).toBeVisible()
			}
		})

		await test.step('Todas las tareas persisten tras recargar', async () => {
			await page.reload()

			for (const task of tasks) {
				await expect(page.getByText(task)).toBeVisible()
			}
		})

		await test.step('Verificar cantidad correcta en localStorage', async () => {
			const storageData = await page.evaluate(() => {
				const data = localStorage.getItem('taskListInEachColumn')
				return data ? JSON.parse(data) : []
			})

			expect(storageData.length).toBeGreaterThanOrEqual(tasks.length)
		})
	})

	test('Eliminar tarea también la elimina de localStorage', async ({ page }) => {
		const taskName = `Tarea a eliminar ${Date.now()}`

		await test.step('Crear tarea', async () => {
			await page.fill('#add_new_task_btn', taskName)
			await page.click('#plus_btn')
			await expect(page.getByText(taskName)).toBeVisible()
		})

		await test.step('Verificar que existe en localStorage', async () => {
			const storageData = await page.evaluate(() => {
				return localStorage.getItem('taskListInEachColumn')
			})
			expect(storageData).toContain(taskName)
		})

		await test.step('Eliminar tarea', async () => {
			await page.getByText(taskName).click()
			await page.getByTestId('BotonEliminarTarea').click()
			await expect(page.getByText(taskName)).not.toBeVisible()
		})

		await test.step('Verificar que se eliminó de localStorage', async () => {
			const storageData = await page.evaluate(() => {
				return localStorage.getItem('taskListInEachColumn')
			})
			expect(storageData).not.toContain(taskName)
		})

		await test.step('Tras recargar, la tarea sigue eliminada', async () => {
			await page.reload()
			await expect(page.getByText(taskName)).not.toBeVisible()
		})
	})

	test('localStorage se mantiene intacto con multiples recargos', async ({ page }) => {
		const taskName = `Tarea resistente ${Date.now()}`

		await test.step('Crear tarea', async () => {
			await page.fill('#add_new_task_btn', taskName)
			await page.click('#plus_btn')
			await expect(page.getByText(taskName)).toBeVisible()
		})

		await test.step('Recargar página 3 veces', async () => {
			for (let i = 0; i < 3; i++) {
				await page.reload()
				await expect(page.getByText(taskName)).toBeVisible()
			}
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
			await page.getByText(taskText).click()
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

		await test.step('Luego de recargar la tarea sigue en el tablero', async () => {
			await page.reload()
			await expect(page.getByText(taskText)).toBeVisible()
		})

		await test.step('Luego de recargar la tarea sigue sin estar dentro del archivo', async () => {
			await page.reload()
			await navigateToMenuItem(page, 'Archivo')
			await expect(page.getByText(taskText)).not.toBeVisible()
		})
	})
})
