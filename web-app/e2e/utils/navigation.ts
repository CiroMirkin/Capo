import { Page } from '@playwright/test'

/**
 * Navega a una sección desde el chrome. En escritorio (viewport ≥ md) el
 * NavRail (una <nav>) está siempre presente; en mobile se usa el menú
 * desplegable (NavBtn).
 *
 * Se decide por el ancho del viewport y no por `isVisible()`: justo después de
 * cerrar un diálogo de Radix el rail queda ~200ms dentro de un contenedor con
 * `aria-hidden`, y un chequeo puntual lo daría por ausente. `click()` ya
 * auto-espera a que el elemento sea accionable.
 */
/**
 * Marca como vistos los IntroDialog de limbo / archivo / registro de uso: son
 * modales y, abiertos, dejan el resto de la página con `aria-hidden`.
 */
export async function skipIntroDialogs(page: Page): Promise<void> {
	await page.evaluate(() => {
		for (const key of ['capo-limbo-intro', 'capo-archive-intro', 'capo-usage-history-intro'])
			localStorage.setItem(key, 'true')
	})
}

export async function navigateToMenuItem(page: Page, menuItemName: string): Promise<void> {
	await skipIntroDialogs(page)
	const isDesktop = (page.viewportSize()?.width ?? 1280) >= 768

	if (isDesktop) {
		await page
			.getByRole('navigation', { name: /Navegaci|Navigation/ })
			.getByRole('link', { name: menuItemName })
			.click()
		return
	}

	await page.getByTestId('NavBtn').click()
	await page.getByRole('link', { name: menuItemName }).click()
}
