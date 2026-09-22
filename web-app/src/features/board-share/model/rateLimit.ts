/**
 * Contador de ventana fija por clave. Devuelve `true` si el hit está permitido.
 * ponytail: vive en memoria del proceso — en serverless cada instancia cuenta por
 * su lado. Pasar a una tabla si hace falta un límite global.
 */
export const createRateLimiter = ({ max, windowMs }: { max: number; windowMs: number }) => {
	const hits = new Map<string, { count: number; start: number }>()

	return (key: string, now: number = Date.now()): boolean => {
		const entry = hits.get(key)
		if (!entry || now - entry.start >= windowMs) {
			// Barrido perezoso para que el Map no crezca sin límite.
			if (hits.size > 10_000) {
				for (const [k, v] of hits) if (now - v.start >= windowMs) hits.delete(k)
			}
			hits.set(key, { count: 1, start: now })
			return true
		}
		entry.count++
		return entry.count <= max
	}
}
