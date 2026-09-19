'use client'

import i18next from 'i18next'
import { useLocalStorage } from '@/shared/hooks/useLocalStorage'
import { LANGUAGE_LOCALSTORAGE_KEY } from '../model/language'

/** Alterna entre 'es'/'en': usado por los toggles simples del NavRail y el HeaderNav. */
export function useLanguageToggle() {
	const [, setLanguage] = useLocalStorage(LANGUAGE_LOCALSTORAGE_KEY, 'es')

	return function toggleLanguage() {
		const next = (i18next.language || 'es').startsWith('en') ? 'es' : 'en'
		setLanguage(next)
		i18next.changeLanguage(next)
		document.body.dir = i18next.dir()
	}
}
