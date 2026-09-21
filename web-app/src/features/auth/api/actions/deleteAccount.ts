'use server'

import { prisma } from '@/shared/lib/prisma'
import { requireAuth } from '@/shared/lib/serverAuth'

export async function deleteAccount(): Promise<void> {
	const userId = await requireAuth()
	await prisma.user.delete({ where: { id: userId } })
}
