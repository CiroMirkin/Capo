import type { TFunction } from 'i18next'
import { format, date as tempoDate, dayStart, parse } from '@formkit/tempo'
import BusinessError from '@/shared/errors/businessError'
import type { Tag } from '@/features/tags'
import { NotesAndComments } from '@/features/tasks/ui/taskList/models/NotesAndComments'
import { TaskTimelineHistory } from '@/features/tasks/ui/taskList/models/taskTimelineHistory'

export interface taskModel {
	id: string
	descriptionText: string
	/** Fecha límite opcional, `YYYY-MM-DD` (sin hora). Se setea solo al crear. */
	dueDate?: string
	tags?: Tag[]
	notesAndComments?: NotesAndComments
	timelineHistory?: TaskTimelineHistory
}

export const emptyTask: taskModel = {
	id: '',
	descriptionText: '',
	notesAndComments: '',
}

export const isThisTaskDescriptionValid = (taskDescription: string): boolean =>
	!!taskDescription.trim()

const DUE_DATE_FORMAT = /^\d{4}-\d{2}-\d{2}$/

/** Hoy en formato `YYYY-MM-DD`, hora local. */
export const todayISODate = (): string => format(new Date(), 'YYYY-MM-DD')

/** `YYYY-MM-DD` real y no anterior a hoy. */
export const isValidDueDate = (dueDate: string, today: string = todayISODate()): boolean => {
	if (!DUE_DATE_FORMAT.test(dueDate)) return false
	const parsed = tempoDate(dueDate)
	if (Number.isNaN(parsed.getTime())) return false
	if (format(parsed, 'YYYY-MM-DD') !== dueDate) return false // rechaza 2025-02-31
	return dueDate >= today
}

export const getNewTask = ({
	descriptionText,
	dueDate,
}: {
	descriptionText: string
	dueDate?: string
}): taskModel => {
	if (!isThisTaskDescriptionValid(descriptionText))
		throw new BusinessError('No se puede crear una tarea sin descripción.')
	if (descriptionText.length > 200) throw new BusinessError('El texto es demasiado largo.')

	const task: taskModel = {
		id: crypto.randomUUID(),
		descriptionText,
	}
	if (dueDate !== undefined) {
		if (!isValidDueDate(dueDate)) throw new BusinessError('La fecha límite no es válida.')
		task.dueDate = dueDate
	}
	return task
}

// --- Indicador de fecha límite en la tarjeta -------------------------------

const MS_PER_DAY = 86_400_000
const dayDiff = (from: string | Date, to: string | Date): number =>
	Math.round(
		(dayStart(tempoDate(to)).getTime() - dayStart(tempoDate(from)).getTime()) / MS_PER_DAY
	)

type Locale = 'es' | 'en'

/** Día + mes abreviado; agrega el año solo si no es el año actual. */
const shortDate = (value: string | Date, locale: Locale): string => {
	const d = tempoDate(value)
	const currentYear = d.getFullYear() === new Date().getFullYear()
	const base = locale === 'en' ? 'MMM D' : 'D MMM'
	return format(d, currentYear ? base : `${base}${locale === 'en' ? ',' : ''} YYYY`, locale)
}

const plural = (t: TFunction, base: string, count: number): string =>
	t(count === 1 ? `${base}_one` : `${base}_other`, { count })

/** Etiqueta relativa a hoy: `hoy` / `en N días` / `hace N días`. */
const relativeToToday = (target: string | Date, today: string, t: TFunction): string => {
	const diff = dayDiff(today, target)
	if (diff === 0) return t('due_date.relative.today')
	if (diff > 0) return plural(t, 'due_date.relative.future', diff)
	return plural(t, 'due_date.relative.past', -diff)
}

export type DueDateContext = 'board' | 'archive' | 'limbo'

export interface DueDateDisplay {
	/** Badge de urgencia con la tarjeta cerrada (solo contexto `board`). */
	restingLabel: string | null
	/** Línea de texto con la tarjeta cerrada (solo contexto `archive`). */
	restingLine: string | null
	/** Contenido del slot con la tarjeta abierta (ambos contextos). */
	openLine: string
}

interface DueDateDisplayInput {
	dueDate: string
	today?: string
	/** `getHighestPriority(task.tags)` — señal de prioridad que ya carga la tarea. */
	taskPriority: number | null
	/** `getHighestPriority(activeGroup.tags)` — prioridad top del grupo habilitado. */
	topPriority: number | null
	isLastColumn: boolean
	context: DueDateContext
	/** `taskListArchived.date` — fecha en que se archivó (string localizado). */
	archivedDate?: string
	locale: Locale
	t: TFunction
}

/**
 * Resuelve qué mostrar para la fecha límite de una tarea: la etiqueta en
 * reposo, la línea expandida y, en el archivo, el veredicto de término.
 */
export const getDueDateDisplay = ({
	dueDate,
	today = todayISODate(),
	taskPriority,
	topPriority,
	isLastColumn,
	context,
	archivedDate,
	locale,
	t,
}: DueDateDisplayInput): DueDateDisplay => {
	const due = shortDate(dueDate, locale)

	if (context === 'archive') {
		const dueResting = t('due_date.archive.due', { date: due })
		if (!archivedDate) {
			return { restingLabel: null, restingLine: dueResting, openLine: dueResting }
		}
		// ponytail: `archivedDate` es un string localizado (getFullDate). Se re-parsea
		// con el locale por defecto de tempo — el mismo que lo formateó en el cliente.
		let done: Date | null = null
		try {
			done = parse(archivedDate, 'full')
			if (Number.isNaN(done.getTime())) done = null
		} catch {
			done = null
		}
		if (!done) {
			return { restingLabel: null, restingLine: dueResting, openLine: dueResting }
		}

		const doneShort = shortDate(done, locale)
		const delta = dayDiff(dueDate, done)
		const verdict =
			delta < 0
				? plural(t, 'due_date.archive.verdict_early', -delta)
				: delta === 0
					? t('due_date.archive.verdict_on_time')
					: plural(t, 'due_date.archive.verdict_late', delta)

		const doneResting = t('due_date.archive.done', { date: doneShort })
		const restingLine = `${dueResting} · ${doneResting} · ${verdict}`

		const dueOpen = t('due_date.archive.due', {
			date: `${due} (${relativeToToday(dueDate, today, t)})`,
		})
		const doneOpen = t('due_date.archive.done', {
			date: `${doneShort} (${relativeToToday(done, today, t)})`,
		})
		const openLine = `${dueOpen} · ${doneOpen} · ${verdict}`

		return { restingLabel: null, restingLine, openLine }
	}

	// context === 'board'
	const daysUntil = dayDiff(today, dueDate)
	const openLine = `${due} | ${relativeToToday(dueDate, today, t)}`

	let restingLabel: string | null = null
	if (!isLastColumn) {
		// Escalera de aviso: sin señal de prioridad → 1 día · con tag → 2 · tag top → 3.
		const window = taskPriority === null ? 1 : taskPriority === topPriority ? 3 : 2
		if (daysUntil < 0) restingLabel = t('due_date.resting.overdue')
		else if (daysUntil === 0) restingLabel = t('due_date.resting.today')
		else if (daysUntil === 1 && window >= 2) restingLabel = t('due_date.resting.tomorrow')
		else if (daysUntil === 2 && window >= 3) restingLabel = t('due_date.resting.in_2_days')
	}

	return { restingLabel, restingLine: null, openLine }
}
