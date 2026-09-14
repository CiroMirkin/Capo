import BusinessError from '@/shared/errors/businessError'
import { TaskList, taskModel } from '@/features/tasks'

export interface taskListArchived {
	date: string
	tasklist: TaskList
}

export type Archive = taskListArchived[]

/**
 * Hijas archivadas de `parentId`, en cualquier día (no solo el del padre),
 * con la fecha en que cada una se archivó — para anidarlas dentro de la card
 * del padre archivado (duplicado intencional: también aparecen en su día).
 */
export const getArchivedChildren = (
	archive: Archive,
	parentId: string
): { task: taskModel; date: string }[] =>
	archive.flatMap(({ date, tasklist }) =>
		tasklist.filter((task) => task.parentId === parentId).map((task) => ({ task, date }))
	)

export const emptyArchivedTasks = []

const archiveLimit = 60
const dailyArchiveLimit = 30

export const getDateOfTheFirstTaskListArchived = (archive: Archive): string | null => {
	const lastTaskListArchived = archive[0]
	if (lastTaskListArchived) {
		return lastTaskListArchived.date
	}
	return null
}

export const isItWithinTheArchiveLimit = (archive: Archive): true | BusinessError => {
	if (archive.length >= archiveLimit) throw new BusinessError('El archivo esta lleno :(')
	return true
}

export const isItWithinTheDailyArchiveLimit = (
	taskListArchived: TaskList
): true | BusinessError => {
	if (taskListArchived.length > dailyArchiveLimit)
		throw new BusinessError('El archivo diario esta lleno :(')
	return true
}
