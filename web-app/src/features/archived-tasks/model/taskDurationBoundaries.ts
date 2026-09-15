import { TaskTimelineHistory } from '@/features/tasks'

export interface TaskDurationBoundaries {
	start: Date
	untilLastColumn: Date | null
	untilArchived: Date
}

interface Params {
	timelineHistory: TaskTimelineHistory
	/** Nombres reales de las columnas del tablero, en orden (useColumnList().map(c => c.name)) */
	columnNames: string[]
}

export function getTaskDurationBoundaries({
	timelineHistory,
	columnNames,
}: Params): TaskDurationBoundaries {
	const lastColumnName = columnNames.at(-1)

	const untilArchived = timelineHistory[timelineHistory.length - 1].date

	// El primer entry que sea una columna real del tablero marca la "llegada confirmada" a la 1ª columna — para una tarea creada directo en el tablero es el entry 0.
	// para una que viene del limbo, el entry 0 es la etiqueta "Desde el limbo" (no una columna real) y la llegada real es el entry 1.
	// El entry siguiente a esa llegada es la salida real de la 1ª columna.
	const firstRealColumnIndex = timelineHistory.findIndex((change) =>
		columnNames.includes(change.columnName)
	)

	const start = (
		timelineHistory[firstRealColumnIndex + 1] ?? timelineHistory[timelineHistory.length - 1]
	).date

	const lastColumnEntry = [...timelineHistory]
		.reverse()
		.find((change) => change.columnName === lastColumnName)

	return { start, untilArchived, untilLastColumn: lastColumnEntry?.date ?? null }
}
