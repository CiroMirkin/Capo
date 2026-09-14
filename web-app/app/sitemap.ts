import type { MetadataRoute } from 'next'

const appUrl = process.env.NEXT_PUBLIC_APP_URL
const baseUrl = appUrl && URL.canParse(appUrl) ? appUrl : 'http://localhost:3000'

export default function sitemap(): MetadataRoute.Sitemap {
	return [
		{ url: baseUrl, changeFrequency: 'weekly', priority: 1 },
		{ url: `${baseUrl}/help`, changeFrequency: 'monthly', priority: 0.5 },
	]
}
