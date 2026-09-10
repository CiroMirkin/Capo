import 'dotenv/config'
import { writeFileSync } from 'node:fs'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../generated/prisma/client'

/*
 Backup rápido a JSON antes de una migración. Lee cada tabla con SELECT crudo
 ($queryRawUnsafe) para que ande aunque el client generado ya no coincida con el
 schema de la DB (justo el caso al migrar). Read-only. Correr con:
   npx tsx prisma/dump-db.mjs
*/

// VerificationToken pasa a llamarse Verification post-migración: probamos las dos.
const TABLES = [
	'User', 'Account', 'Session', 'VerificationToken', 'Verification',
	'Board', 'Theme', 'Column', 'Task', 'Note', 'TagGroup', 'Reminder', 'Archive',
]

const prisma = new PrismaClient({
	adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
})

const dump = {}
for (const table of TABLES) {
	try {
		dump[table] = await prisma.$queryRawUnsafe(`SELECT * FROM "${table}"`)
	} catch (err) {
		if (err?.code === 'P2010' || /does not exist/i.test(err?.message ?? '')) continue
		throw err
	}
}

const file = `db-backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`
writeFileSync(
	file,
	JSON.stringify(dump, (_, v) => (typeof v === 'bigint' ? Number(v) : v), 2)
)

console.log(
	`${file}\n` +
		Object.entries(dump)
			.map(([t, rows]) => `  ${t}: ${rows.length}`)
			.join('\n')
)

await prisma.$disconnect()
