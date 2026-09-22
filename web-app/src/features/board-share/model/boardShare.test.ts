import { describe, it, expect } from 'vitest'
import BusinessError from '@/shared/errors/businessError'
import {
	assertCanAddEmailShare,
	getShareAccess,
	withoutNotes,
	MAX_EMAIL_SHARES,
	type BoardShare,
} from './boardShare'

const share = (over: Partial<BoardShare> = {}): BoardShare => ({
	id: 's1',
	mode: 'EMAIL',
	token: 'tok',
	recipientEmail: 'ana@mail.com',
	active: true,
	...over,
})

describe('getShareAccess', () => {
	it('sin share o inactivo → not-found (no revela que existe)', () => {
		expect(getShareAccess(null, 'ana@mail.com')).toBe('not-found')
		expect(getShareAccess(share({ active: false }), 'ana@mail.com')).toBe('not-found')
	})

	it('público → ok sin login', () => {
		expect(getShareAccess(share({ mode: 'PUBLIC', recipientEmail: null }), null)).toBe('ok')
	})

	it('email sin login → login-required', () => {
		expect(getShareAccess(share(), null)).toBe('login-required')
	})

	it('email con otra cuenta → wrong-account', () => {
		expect(getShareAccess(share(), 'otro@mail.com')).toBe('wrong-account')
	})

	it('email coincidente (sin importar mayúsculas) → ok', () => {
		expect(getShareAccess(share(), ' Ana@Mail.com ')).toBe('ok')
	})
})

describe('assertCanAddEmailShare', () => {
	it('rechaza un email inválido', () => {
		expect(() => assertCanAddEmailShare([], 'no-es-email')).toThrow(BusinessError)
	})

	it('rechaza un email ya invitado', () => {
		expect(() => assertCanAddEmailShare([share()], 'ANA@mail.com')).toThrow(BusinessError)
	})

	it(`rechaza más de ${MAX_EMAIL_SHARES} invitados por email (el público no cuenta)`, () => {
		const shares = [
			...Array.from({ length: MAX_EMAIL_SHARES }, (_, i) =>
				share({ id: `${i}`, recipientEmail: `u${i}@mail.com` })
			),
		]
		expect(() => assertCanAddEmailShare(shares, 'nuevo@mail.com')).toThrow(BusinessError)

		const withPublic = [
			...shares.slice(1),
			share({ id: 'p', mode: 'PUBLIC', recipientEmail: null }),
		]
		expect(() => assertCanAddEmailShare(withPublic, 'nuevo@mail.com')).not.toThrow()
	})
})

describe('withoutNotes', () => {
	it('saca notesAndComments de cada tarea y deja el resto igual', () => {
		const board = [
			{
				id: 'c1',
				status: 'Todo',
				tasks: [
					{ id: 't1', descriptionText: 'a', notesAndComments: 'secreto' },
					{ id: 't2', descriptionText: 'b', parentId: 't1' },
				],
			},
		]
		expect(withoutNotes(board)).toEqual([
			{
				id: 'c1',
				status: 'Todo',
				tasks: [
					{ id: 't1', descriptionText: 'a' },
					{ id: 't2', descriptionText: 'b', parentId: 't1' },
				],
			},
		])
	})
})
