import type { MetadataRoute } from 'next'
import { baseUrl } from '@/shared/lib/appUrl'

export default function robots(): MetadataRoute.Robots {
	return {
		rules: { userAgent: '*', allow: '/' },
		sitemap: `${baseUrl}/sitemap.xml`,
	}
}
