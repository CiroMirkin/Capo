import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { IntroDialog } from './IntroDialog'

const KEY = 'capo-test-intro'
const Intro = () => (
	<IntroDialog storageKey={KEY} title='Título' buttonLabel='Entendido'>
		<p>Descripción</p>
	</IntroDialog>
)

describe('IntroDialog', () => {
	beforeEach(() => localStorage.clear())

	it('se muestra la primera vez', async () => {
		render(<Intro />)
		expect(await screen.findByText('Título')).toBeInTheDocument()
		expect(screen.getByText('Descripción')).toBeInTheDocument()
	})

	it('sigue visible si la página se desmonta y vuelve a montar antes de cerrarlo', async () => {
		// BoardPage cambia a spinner mientras recarga (sesión / query del tablero) y desmonta Board.
		const { unmount } = render(<Intro />)
		await screen.findByText('Título')
		unmount()
		render(<Intro />)
		expect(await screen.findByText('Título')).toBeInTheDocument()
	})

	it('al cerrarlo guarda el flag', async () => {
		render(<Intro />)
		fireEvent.click(await screen.findByText('Entendido'))
		expect(localStorage.getItem(KEY)).toBe('true')
	})

	it('el botón secundario cierra, guarda el flag y corre su acción', async () => {
		const onClick = vi.fn()
		render(
			<IntroDialog
				storageKey={KEY}
				title='Título'
				buttonLabel='Entendido'
				secondaryButton={{ label: 'Tutorial', onClick }}
			>
				<p>Descripción</p>
			</IntroDialog>
		)
		fireEvent.click(await screen.findByText('Tutorial'))
		expect(localStorage.getItem(KEY)).toBe('true')
		await waitFor(() => expect(onClick).toHaveBeenCalledOnce())
		expect(screen.queryByText('Título')).not.toBeInTheDocument()
	})

	it('no se muestra si ya se cerró antes', () => {
		localStorage.setItem(KEY, 'true')
		render(<Intro />)
		expect(screen.queryByText('Título')).not.toBeInTheDocument()
	})
})
