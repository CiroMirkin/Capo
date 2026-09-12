import { forwardRef, useImperativeHandle } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import Notes from './Notes'
import type { NoteInputHandle } from './NoteInput'

const flush = vi.fn()

vi.mock('./NoteInput', () => ({
	NoteInput: forwardRef<NoteInputHandle>(function NoteInputStub(_props, ref) {
		useImperativeHandle(ref, () => ({ flush }))
		return <div data-testid='note-input-stub' />
	}),
}))

describe('Notes — guardado al cerrar el sheet', () => {
	it('llama a flush() del NoteInput al cerrar', async () => {
		const user = userEvent.setup()
		render(<Notes />)

		await user.click(screen.getByText('notes.action_title'))
		expect(flush).not.toHaveBeenCalled()

		await user.click(screen.getByText('Close'))
		expect(flush).toHaveBeenCalledTimes(1)
	})
})
