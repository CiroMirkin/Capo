import { test, expect, Page } from '@playwright/test'

test.describe('Funcionalidad de notas en tareas', () => {
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

	async function crearTarea(page: Page, nombreTarea: string) {
		await page.fill('#add_new_task_btn', nombreTarea)
		await page.click('#plus_btn')
		await expect(page.getByText(nombreTarea)).toBeVisible()
	}

	async function abrirEditorNotas(page: Page, nombreTarea: string) {
		await page.getByText(nombreTarea).click()
		await page.getByRole('button', { name: 'Notas y comentarios' }).click()
	}

	async function cerrarDialogo(page: Page, nombreTarea: string) {
		await page.getByTestId('CloseDialog').click()
		await page.getByTestId('CloseDialog').waitFor({ state: 'hidden' })
		await page.getByText(nombreTarea).click()
		await page.getByRole('button', { name: 'Notas y comentarios' }).waitFor({ state: 'hidden' })
	}

	test('Puedo agregar una nota a una tarea', async ({ page }) => {
		const nombreTarea = `Tarea con nota ${Date.now()}`
		const noteText = `Nota de prueba ${Date.now()}`

		await test.step('Crear tarea', async () => {
			await crearTarea(page, nombreTarea)
		})

		await test.step('Abrir editor de notas y escribir', async () => {
			await abrirEditorNotas(page, nombreTarea)
			await page.locator('.tiptap').fill(noteText)
		})

		await test.step('Guardar la nota', async () => {
			await page.locator('.tiptap').press('ControlOrMeta+s')
			await expect(page.locator('.tiptap')).toHaveText(noteText)
		})

		await test.step('Cerrar el diálogo', async () => {
			await cerrarDialogo(page, nombreTarea)
		})
	})

	test('Las notas persisten despues de recargar la pagina', async ({ page }) => {
		const nombreTarea = `Tarea persistente ${Date.now()}`
		const noteText = `Nota persistente ${Date.now()}`

		await test.step('Crear tarea con nota', async () => {
			await crearTarea(page, nombreTarea)
			await abrirEditorNotas(page, nombreTarea)
			await page.locator('.tiptap').fill(noteText)
			await page.locator('.tiptap').press('ControlOrMeta+s')
			await cerrarDialogo(page, nombreTarea)
		})

		await test.step('Recargar página', async () => {
			await page.reload()
		})

		await test.step('Verificar que la nota persiste', async () => {
			await abrirEditorNotas(page, nombreTarea)
			await expect(page.locator('.tiptap')).toHaveText(noteText)
		})
	})

	test('Las notas se mantienen al mover la tarea entre columnas', async ({ page }) => {
		const nombreTarea = `Tarea móvil ${Date.now()}`
		const noteText = `Nota móvil ${Date.now()}`

		await test.step('Crear tarea con nota', async () => {
			await crearTarea(page, nombreTarea)
			await page.getByText(nombreTarea).click()
			await page.getByRole('button', { name: 'Notas y comentarios' }).click()
			await page.locator('.tiptap').fill(noteText)
			await page.locator('.tiptap').press('ControlOrMeta+s')
			await cerrarDialogo(page, nombreTarea)
		})

		await test.step('Mover tarea a "Procesando"', async () => {
			await page.getByText(nombreTarea).click()
			await page.getByTestId('BotonParaAvanzarTarea').click()
			await expect(
				page.locator('[aria-label="Procesando"]').getByText(nombreTarea)
			).toBeVisible()
		})

		await test.step('Verificar que la nota se mantiene', async () => {
			await page.locator('[aria-label="Procesando"]').getByText(nombreTarea).click()
			await page.getByRole('button', { name: 'Notas y comentarios' }).click()
			await expect(page.locator('.tiptap')).toHaveText(noteText)
			await cerrarDialogo(page, nombreTarea)
		})

		await test.step('Mover tarea a "Terminado"', async () => {
			await page.locator('[aria-label="Procesando"]').getByText(nombreTarea).click()
			await page.getByTestId('BotonParaAvanzarTarea').click()
			await expect(
				page.locator('[aria-label="Terminado"]').getByText(nombreTarea)
			).toBeVisible()
		})

		await test.step('Verificar que la nota aún persiste', async () => {
			await page.locator('[aria-label="Terminado"]').getByText(nombreTarea).click()
			await page.getByRole('button', { name: 'Notas y comentarios' }).click()
			await expect(page.locator('.tiptap')).toHaveText(noteText)
		})
	})
})
