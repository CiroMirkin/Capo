import type { Metadata } from 'next'
import './globals.css'
import Providers from './providers'
import { baseUrl } from '@/shared/lib/appUrl'

const metadataBase = new URL(baseUrl)

export const metadata: Metadata = {
	metadataBase,
	title: { default: 'Capo — Tablero Kanban personal para tu semana', template: '%s · Capo' },
	description:
		'Organizá tu semana en un tablero Kanban simple: columnas, prioridades, notas de contexto y registro de tiempo exportable. Probalo sin crear cuenta.',
	applicationName: 'Capo',
	icons: { icon: '/capo.svg' },
	verification: { google: 'pwlYgKlJxKA42emXKygcUADc1BVq6nr6C0BcFtMNfKQ' },
	openGraph: {
		title: 'Capo — Tablero Kanban personal para tu semana',
		description:
			'Organizá tu semana en un tablero Kanban simple: columnas, prioridades, notas de contexto y registro de tiempo exportable. Probalo sin crear cuenta.',
		siteName: 'Capo',
		type: 'website',
		locale: 'es',
		images: ['/Capo_OG.png'],
	},
	twitter: {
		card: 'summary_large_image',
		title: 'Capo — Tablero Kanban personal para tu semana',
		description:
			'Organizá tu semana en un tablero Kanban simple: columnas, prioridades, notas de contexto y registro de tiempo exportable. Probalo sin crear cuenta.',
		images: ['/Capo_OG.png'],
	},
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang='es' suppressHydrationWarning>
			<body>
				<Providers>{children}</Providers>
			</body>
		</html>
	)
}
