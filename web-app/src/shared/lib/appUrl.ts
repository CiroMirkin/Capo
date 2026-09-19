// Fallback si falta NEXT_PUBLIC_APP_URL: URL canónica que exponen Netlify (`URL`) o Vercel (`VERCEL_PROJECT_PRODUCTION_URL`, sin protocolo) en el entorno de build.
const platformUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
	? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
	: process.env.URL

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? platformUrl

/** URL pública de la app (`NEXT_PUBLIC_APP_URL`, con fallback a la URL de la plataforma) */
export const baseUrl = appUrl && URL.canParse(appUrl) ? appUrl : 'http://localhost:3000'
