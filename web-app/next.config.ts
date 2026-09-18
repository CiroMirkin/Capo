import type { NextConfig } from 'next'
import { withSentryConfig } from '@sentry/nextjs/config'

const nextConfig: NextConfig = {
	serverExternalPackages: ['pg', '@prisma/adapter-pg'],
	experimental: {
		serverActions: {
			allowedOrigins: ['localhost:3000'],
		},
	},
}

export default withSentryConfig(nextConfig, {
	org: 'vaguyo-estudio',
	project: 'capo',

	silent: !process.env.CI,

	// Alcance de solo error tracking: no hace falta subir el set ancho de source maps
	widenClientFileUpload: false,

	// Ruta propia para que los errores de cliente no se pierdan por ad-blockers que bloquean *.sentry.io
	// Excluida del matcher de middleware.ts
	tunnelRoute: '/monitoring',

	webpack: {
		automaticVercelMonitors: false,
		treeshake: {
			removeDebugLogging: true,
		},
	},
})
