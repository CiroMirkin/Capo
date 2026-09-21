import * as Sentry from '@sentry/nextjs'

Sentry.init({
	dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
	// Ruido de extensiones/navegador (Firefox reader mode, wallets tipo MetaMask, etc)
	ignoreErrors: [
		/__firefox__/,
		/window\.ethereum/,
	],
})

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart
