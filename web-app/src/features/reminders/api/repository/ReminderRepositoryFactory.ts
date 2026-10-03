import type { SessionType } from '@/features/auth'
import {
	bySession,
	LocalStorageDataSource,
	ServerActionDataSource,
	SnapshotRepository,
} from '@/shared/repository'
import { blankReminder, Reminder } from '../../model/reminder'

const local = () => new LocalStorageDataSource<Reminder>({ key: 'capo-reminder' })

const server = () =>
	new ServerActionDataSource<Reminder>({
		read: async (boardId) =>
			(await import('../actions/getReminders')).getReminders({ boardId }),
		write: async (boardId, reminder) => {
			const { saveReminders } = await import('../actions/saveReminders')
			await saveReminders({ boardId, reminders: reminder })
		},
	})

const getReminderRepository = (session: SessionType) =>
	new SnapshotRepository(bySession(session, { server, local }), () => blankReminder)

export const fetchReminder = async (session: SessionType, boardId: string): Promise<Reminder> =>
	getReminderRepository(session).getAll(boardId)

export const saveReminder = async ({
	reminder,
	session,
	boardId,
}: {
	reminder: Reminder
	session: SessionType
	boardId: string
}): Promise<void> => {
	await getReminderRepository(session).save(reminder, boardId)
}
