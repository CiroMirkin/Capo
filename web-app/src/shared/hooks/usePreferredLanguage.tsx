'use client'

import { useEffect, useState } from 'react'

export function usePreferredLanguage(): string {
	const [language, setLanguage] = useState(() =>
		typeof navigator !== 'undefined' ? navigator.language : 'en'
	)

	useEffect(() => {
		setLanguage(navigator.language)
		const handler = () => setLanguage(navigator.language)
		window.addEventListener('languagechange', handler)
		return () => window.removeEventListener('languagechange', handler)
	}, [])

	return language
}
