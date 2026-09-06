import { Page } from '@playwright/test'

/**
 * Navega a una sección desde el chrome. En escritorio las rutas con tablero
 * muestran el NavRail (una <nav>); el resto sigue con el menú desplegable (NavBtn).
 */
export async function navigateToMenuItem(page: Page, menuItemName: string): Promise<void> {
	const rail = page.getByRole('navigation', { name: /Navegaci|Navigation/ })

	if (await rail.isVisible().catch(() => false)) {
		await rail.getByRole('link', { name: menuItemName }).click()
		return
	}

	await page.getByTestId('NavBtn').click()
	await page.getByRole('link', { name: menuItemName }).click()
}
