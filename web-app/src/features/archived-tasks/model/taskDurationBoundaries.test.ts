import { getTaskDurationBoundaries } from './taskDurationBoundaries'
import { TaskTimelineHistory } from '@/features/tasks'

const columnNames = ['Por Hacer', 'En Progreso', 'Hecho']

describe('getTaskDurationBoundaries', () => {
	test('Tarea creada directo en el tablero: arranca en el entry 1 (sale de la 1ª columna).', () => {
		const timelineHistory: TaskTimelineHistory = [
			{ date: new Date(0), columnName: 'Por Hacer' },
			{ date: new Date(100), columnName: 'En Progreso' },
			{ date: new Date(200), columnName: 'Archivado' },
		]

		const result = getTaskDurationBoundaries({ timelineHistory, columnNames })

		expect(result.start).toEqual(new Date(100))
		expect(result.untilArchived).toEqual(new Date(200))
	})

	test('Tarea que viene del limbo: la etiqueta "Desde el limbo" no cuenta como columna real, arranca en el entry 2.', () => {
		const timelineHistory: TaskTimelineHistory = [
			{ date: new Date(0), columnName: 'Desde el limbo' },
			{ date: new Date(50), columnName: 'Por Hacer' },
			{ date: new Date(150), columnName: 'En Progreso' },
			{ date: new Date(250), columnName: 'Archivado' },
		]

		const result = getTaskDurationBoundaries({ timelineHistory, columnNames })

		expect(result.start).toEqual(new Date(150))
	})

	test('Sin haber pasado por la última columna, untilLastColumn es null.', () => {
		const timelineHistory: TaskTimelineHistory = [
			{ date: new Date(0), columnName: 'Por Hacer' },
			{ date: new Date(100), columnName: 'Archivado' },
		]

		const result = getTaskDurationBoundaries({ timelineHistory, columnNames })

		expect(result.untilLastColumn).toBeNull()
	})

	test('Si entra y sale de la última columna varias veces, toma la última ocurrencia antes de archivar.', () => {
		const timelineHistory: TaskTimelineHistory = [
			{ date: new Date(0), columnName: 'Por Hacer' },
			{ date: new Date(100), columnName: 'Hecho' },
			{ date: new Date(200), columnName: 'En Progreso' },
			{ date: new Date(300), columnName: 'Hecho' },
			{ date: new Date(400), columnName: 'Archivado' },
		]

		const result = getTaskDurationBoundaries({ timelineHistory, columnNames })

		expect(result.untilLastColumn).toEqual(new Date(300))
	})

	test('Archivada directo desde la primera columna sin moverse: start === untilArchived.', () => {
		const timelineHistory: TaskTimelineHistory = [
			{ date: new Date(0), columnName: 'Por Hacer' },
			{ date: new Date(100), columnName: 'Archivado' },
		]

		const result = getTaskDurationBoundaries({ timelineHistory, columnNames })

		expect(result.start).toEqual(result.untilArchived)
		expect(result.start).toEqual(new Date(100))
	})
})
