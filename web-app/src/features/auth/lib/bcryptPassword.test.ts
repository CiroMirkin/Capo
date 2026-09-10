import { describe, it, expect } from 'vitest'
import bcrypt from 'bcryptjs'
import { bcryptPassword } from './bcryptPassword'

// Hash bcrypt $2a$ real (estaba en auth.ts como dummy timing-safe). Plaintext
// desconocido: sirve para probar que verify() parsea $2a$ sin explotar.
const LEGACY_2A_HASH = '$2a$12$CwTycUXWue0Thq9StjUM0uJ8Hkm7hxWQlkUdmMkQ8tQ3P8xzeqTr.'

describe('bcryptPassword', () => {
	it('verify() parsea un hash $2a$ existente y rechaza la password equivocada', async () => {
		await expect(
			bcryptPassword.verify({ hash: LEGACY_2A_HASH, password: 'no-es-esta' })
		).resolves.toBe(false)
	})

	it('hash() -> verify() hace round-trip', async () => {
		const hash = await bcryptPassword.hash('correcto-caballo-batería-grapa')
		expect(hash.startsWith('$2')).toBe(true)
		await expect(
			bcryptPassword.verify({ hash, password: 'correcto-caballo-batería-grapa' })
		).resolves.toBe(true)
		await expect(bcryptPassword.verify({ hash, password: 'otra' })).resolves.toBe(false)
	})

	it('un $2a$ generado por bcrypt directo también valida', async () => {
		const legacy = bcrypt.hashSync('hunter2', '$2a$10$abcdefghijklmnopqrstuu')
		await expect(bcryptPassword.verify({ hash: legacy, password: 'hunter2' })).resolves.toBe(
			true
		)
	})
})
