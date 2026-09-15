/**
 * Formatea una duración en ms como "Xd Xh Xm" (u "Xh Xm" si dura menos de un día).
 * No reusa `parseDuration` de usage-history: ese usa `new Date(ms)` en UTC y se rompe (HH vuelve a 00) a partir de 24h — acá una tarea de varios días puede superar eso fácil. */
export function formatTaskDuration(ms: number): string {
	const totalMinutes = Math.floor(ms / 60_000)
	const days = Math.floor(totalMinutes / 1440)
	const hours = Math.floor((totalMinutes % 1440) / 60)
	const minutes = totalMinutes % 60

	return days > 0 ? `${days}d ${hours}h ${minutes}m` : `${hours}h ${minutes}m`
}
