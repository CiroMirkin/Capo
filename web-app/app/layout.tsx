import type { Metadata } from 'next'
import './globals.css'
import Providers from './providers'
import { baseUrl } from '@/shared/lib/appUrl'

const metadataBase = new URL(baseUrl)

export const metadata: Metadata = {
	metadataBase,
	title: { default: 'Capo', template: '%s · Capo' },
	description: 'Tablero Kanban',
	applicationName: 'Capo',
	icons: { icon: '/capo.svg' },
	openGraph: {
		title: 'Capo',
		description: 'Tablero Kanban',
		siteName: 'Capo',
		type: 'website',
		locale: 'es',
		images: ['/Capo_OG.png'],
	},
	twitter: {
		card: 'summary_large_image',
		title: 'Capo',
		description: 'Tablero Kanban',
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
