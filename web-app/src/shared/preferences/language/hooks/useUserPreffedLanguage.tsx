import { useEffect } from 'react'
import { usePreferredLanguage } from '@/shared/hooks/usePreferredLanguage'
import { useTranslation } from 'react-i18next'
import { LANGUAGE_LOCALSTORAGE_KEY } from '../model/language'

export const useUserPreffedLanguage = () => {
	const { i18n } = useTranslation()
	const userPreferredLanguage = usePreferredLanguage().slice(0, 2)

	useEffect(() => {
		// Si el usuario ya eligió un idioma, esa preferencia manda (la aplica useSetLanguageSaved).
		if (localStorage.getItem(LANGUAGE_LOCALSTORAGE_KEY)) return

		// Sin preferencia guardada: seguimos al navegador. 'en' si lo pide, 'es' en cualquier otro caso.
		const lang = userPreferredLanguage === 'en' ? 'en' : 'es'
		if (i18n.language !== lang) i18n.changeLanguage(lang)
		document.body.dir = i18n.dir()
	}, [userPreferredLanguage, i18n])
}
