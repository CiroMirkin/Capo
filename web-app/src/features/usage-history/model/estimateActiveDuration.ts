import { UsageHistory } from './usageHistory'

/**
 * Suma el tiempo activo (ms) que cae dentro de [start, end], según los períodos de `usageHistory` que se solapen con esa ventana.
 * Itera sobre todo el historial (no por día), así que una ventana de varios días se acumula sin caso especial.
 */
export function estimateActiveDuration({
	start,
	end,
	usageHistory,
}: {
	start: Date
	end: Date
	usageHistory: UsageHistory
}): number {
	// `start`/`end` llegan tipados como Date, pero timelineHistory puede venir de un campo Json de
	// Prisma (serializado a string) sin revivir — new Date() acepta ambos casos sin caso especial.
	const startMs = new Date(start).getTime()
	const endMs = new Date(end).getTime()

	return usageHistory
		.flatMap((day) => day.periods)
		.reduce((total, { startTimestamp, endTimestamp }) => {
			const overlap = Math.min(endMs, endTimestamp) - Math.max(startMs, startTimestamp)
			return total + Math.max(0, overlap)
		}, 0)
}
