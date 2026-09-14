const appUrl = process.env.NEXT_PUBLIC_APP_URL

/** URL pública de la app (`NEXT_PUBLIC_APP_URL`) */
export const baseUrl = appUrl && URL.canParse(appUrl) ? appUrl : 'http://localhost:3000'
