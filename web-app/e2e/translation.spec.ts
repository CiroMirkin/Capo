import { test, expect } from '@playwright/test'
import { navigateToMenuItem } from './utils/navigation'

test.describe('Traducción del nombre del tablero y las columnas', () => {
	test.beforeEach(async ({ page }) => {
		await page.context().addInitScript(() => {
			Object.defineProperty(navigator, 'language', { value: 'es-ES' })
			Object.defineProperty(navigator, 'languages', { value: ['es-ES', 'es'] })
		})

		await page.goto('/')
		await page.getByRole('button', { name: 'Empezar' }).click()
	})

	test('Al cambiar el idioma se traducen los nombres por defecto y es posible editarlos', async ({
		page,
	}) => {
		await test.step('Verificar nombres en español por defecto', async () => {
			await expect(page.getByRole('heading', { name: 'Tablero básico' })).toBeVisible()
			await expect(page.getByRole('heading', { name: 'Pendientes' })).toBeVisible()
			await expect(page.getByRole('heading', { name: 'Procesando' })).toBeVisible()
			await expect(page.getByRole('heading', { name: 'Terminado' })).toBeVisible()
		})

		await test.step('Cambiar idioma a inglés', async () => {
			const rail = page.getByRole('navigation', { name: /Navegaci|Navigation/ })
			if (await rail.isVisible().catch(() => false)) {
				await rail.getByRole('button', { name: 'Idioma' }).click()
			} else {
				await page.getByTestId('NavBtn').click()
				await page.getByRole('menuitem', { name: 'Idioma' }).click()
				await page.getByRole('menuitemradio', { name: 'English' }).click()
			}
		})

		await test.step('Verificar nombres traducidos a inglés', async () => {
			await expect(page.getByRole('heading', { name: 'Basic board' })).toBeVisible()
			await expect(page.getByRole('heading', { name: 'Pending' })).toBeVisible()
			await expect(page.getByRole('heading', { name: 'Processing' })).toBeVisible()
			await expect(page.getByRole('heading', { name: 'Finished' })).toBeVisible()
		})

		await test.step('Cambiar nombre del tablero', async () => {
			const newBoardName = `My Board ${Date.now()}`
			await navigateToMenuItem(page, 'Settings')
			await page.getByTestId('BotonParaCambiarElNombreDelTablero').click() // Habilita el input
			await page.getByLabel('Name').fill(newBoardName)
			await page.getByTestId('BotonParaCambiarElNombreDelTablero').click() // Guarda cambios
			await expect(page.getByLabel('Name')).toHaveValue(newBoardName)
		})

		await test.step('Cambiar nombre de una columna', async () => {
			const newColumnName = `Test Column ${Date.now()}`
			await page.getByTestId('BotonParaCambiarElNombreDeUnaColumna').first().click() // Habilita el input
			await page.locator('input[name="Pending"]').fill(newColumnName)
			await page.getByTestId('BotonParaCambiarElNombreDeUnaColumna').first().click() // Guarda cambios
			await expect(page.locator(`input[name="${newColumnName}"]`)).toBeVisible()
		})
	})
})
