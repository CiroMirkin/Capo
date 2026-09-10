import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { nextCookies } from 'better-auth/next-js'
import { prisma } from '@/shared/lib/prisma'
import { bcryptPassword } from '@/features/auth/lib/bcryptPassword'

export const auth = betterAuth({
	database: prismaAdapter(prisma, { provider: 'postgresql' }),
	emailAndPassword: {
		enabled: true,
		minPasswordLength: 6,
		password: bcryptPassword,
	},
	socialProviders: {
		github: {
			clientId: process.env.AUTH_GITHUB_ID!,
			clientSecret: process.env.AUTH_GITHUB_SECRET!,
		},
	},
	session: { expiresIn: 60 * 60 * 24 * 30 },
	rateLimit: { enabled: true, window: 60, max: 10 },
	plugins: [nextCookies()], // debe ir último
})
