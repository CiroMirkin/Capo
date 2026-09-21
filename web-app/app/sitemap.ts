import type { MetadataRoute } from 'next'
import { baseUrl } from '@/shared/lib/appUrl'

export default function sitemap(): MetadataRoute.Sitemap {
	return [
		{ url: baseUrl, changeFrequency: 'weekly', priority: 1 },
		{ url: `${baseUrl}/help`, changeFrequency: 'monthly', priority: 0.5 },
		{ url: `${baseUrl}/privacy`, changeFrequency: 'yearly', priority: 0.3 },
		{ url: `${baseUrl}/security`, changeFrequency: 'yearly', priority: 0.3 },
	]
}
