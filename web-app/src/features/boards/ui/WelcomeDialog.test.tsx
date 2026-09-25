import { fireEvent, render, screen } from '@testing-library/react'
import { WelcomeDialog } from './WelcomeDialog'

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }))
vi.mock('@/shared/ui/atoms/DescriptionOfCapo', () => ({ DescriptionOfCapo: () => null }))

describe('WelcomeDialog', () => {
	beforeEach(() => localStorage.clear())

	it('se muestra la primera vez', async () => {
		render(<WelcomeDialog />)
		expect(await screen.findByText('welcome_dialog.title')).toBeInTheDocument()
	})

	it('sigue visible si el tablero se desmonta y vuelve a montar antes de cerrarlo', async () => {
		// BoardPage cambia a spinner mientras recarga (sesión / query del tablero) y desmonta Board.
		const { unmount } = render(<WelcomeDialog />)
		await screen.findByText('welcome_dialog.title')
		unmount()
		render(<WelcomeDialog />)
		expect(await screen.findByText('welcome_dialog.title')).toBeInTheDocument()
	})

	it('al cerrarlo guarda el flag', async () => {
		render(<WelcomeDialog />)
		fireEvent.click(await screen.findByText('welcome_dialog.start'))
		expect(localStorage.getItem('capo-welcome-dialog')).toBe('true')
	})

	it('no se muestra si ya se cerró antes', () => {
		localStorage.setItem('capo-welcome-dialog', 'true')
		render(<WelcomeDialog />)
		expect(screen.queryByText('welcome_dialog.title')).not.toBeInTheDocument()
	})
})
