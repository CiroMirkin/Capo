import type { Metadata } from 'next'
import { baseUrl } from '@/shared/lib/appUrl'
import { getGithubStars } from '@/shared/lib/githubStars'
import es from '@/shared/i18n/es.json'
import { Home } from './Home'

export const metadata: Metadata = {
	alternates: { canonical: baseUrl },
}

const FAQ_KEYS = ['faq_1', 'faq_2', 'faq_3', 'faq_4', 'faq_5'] as const

const jsonLd = {
	'@context': 'https://schema.org',
	'@graph': [
		{
			'@type': 'SoftwareApplication',
			name: 'Capo',
			url: baseUrl,
			applicationCategory: 'BusinessApplication',
			operatingSystem: 'Web',
			description: es.home.footer_tagline,
			offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
		},
		{
			'@type': 'FAQPage',
			mainEntity: FAQ_KEYS.map((key) => ({
				'@type': 'Question',
				name: es.home[`${key}_q`],
				acceptedAnswer: { '@type': 'Answer', text: es.home[`${key}_a`] },
			})),
		},
	],
}

export default async function HomeRoute() {
	const stars = await getGithubStars()

	return (
		<>
			<script type='application/ld+json' dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
			<Home stars={stars} />
		</>
	)
}
