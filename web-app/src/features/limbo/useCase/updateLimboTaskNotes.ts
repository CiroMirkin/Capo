import { checkMaxLengthOfNotesAndComments } from '@/features/tasks'
import { Limbo } from '../model/limbo'

export const updateLimboTaskNotes = ({
	limbo,
	taskId,
	notes,
}: {
	limbo: Limbo
	taskId: string
	notes: string
}): Limbo =>
	checkMaxLengthOfNotesAndComments(notes)
		? limbo.map((task) => (task.id === taskId ? { ...task, notesAndComments: notes } : task))
		: limbo
