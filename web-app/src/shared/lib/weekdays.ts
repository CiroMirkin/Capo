/**
 * Iniciales de los días de la semana, empezando el domingo.
 * El índice coincide con `Date.prototype.getDay()` (domingo = 0).
 */
const WEEKDAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const

const WEEKDAY_INITIALS: Record<'es' | 'en', readonly string[]> = {
	es: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
	en: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
}

export interface Weekday {
	/** Clave estable para el `key` de React (las iniciales se repiten). */
	key: string
	label: string
}

/** Días de la semana (domingo → sábado) para el idioma dado. */
export const weekdays = (language: string): Weekday[] => {
	const initials = WEEKDAY_INITIALS[language === 'en' ? 'en' : 'es']
	return WEEKDAY_KEYS.map((key, i) => ({ key, label: initials[i] }))
}
