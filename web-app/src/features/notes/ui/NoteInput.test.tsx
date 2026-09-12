import { createRef } from 'react'
import { render, fireEvent, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NoteInput, type NoteInputHandle } from './NoteInput'

const updateNotes = vi.fn()
let mockNotes = 'texto guardado'

vi.mock('../hooks/useNotesQuery', () => ({
	useNotesQuery: () => ({
		notes: mockNotes,
		updateNotes,
		isLoading: false,
		isSaving: false,
	}),
}))

vi.mock('../hooks/useArchiveNote', () => ({
	useArchiveNote: () => vi.fn(),
}))

// Editor real (Tiptap) de lado: acá solo importa que `onChange` llegue con
// el texto nuevo, que es lo que dispara (o no) el guardado.
vi.mock('@/shared/ui/organisms/MinimalTiptapEditor', () => ({
	MinimalTiptapEditor: ({
		value,
		onChange,
	}: {
		value: string
		onChange: (v: string) => void
	}) => (
		<textarea data-testid='editor' value={value} onChange={(e) => onChange(e.target.value)} />
	),
}))

describe('NoteInput — flush al cerrar', () => {
	beforeEach(() => {
		updateNotes.mockClear()
		mockNotes = 'texto guardado'
	})

	it('no guarda nada si no hubo cambios', () => {
		const ref = createRef<NoteInputHandle>()
		render(<NoteInput ref={ref} />)

		act(() => ref.current?.flush())

		expect(updateNotes).not.toHaveBeenCalled()
	})

	it('guarda el cambio pendiente al hacer flush, sin esperar el debounce', () => {
		const ref = createRef<NoteInputHandle>()
		const { getByTestId } = render(<NoteInput ref={ref} />)

		fireEvent.change(getByTestId('editor'), { target: { value: 'texto nuevo' } })

		act(() => ref.current?.flush())

		expect(updateNotes).toHaveBeenCalledWith('texto nuevo')
		expect(updateNotes).toHaveBeenCalledTimes(1)
	})
})
