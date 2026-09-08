'use client'

import { useTranslation } from 'react-i18next'
import { USER_IS_IN } from '@/shared/ui/organisms/userIsIn'
import { ChangeBoardName, DeleteBoard, ResetBoard } from '@/features/boards'
import { useSession } from '@/features/auth'
import { CanvasSelection } from '@/features/dashboard'
import { CreateReminder, ReminderList } from '@/features/reminders'
import { ThemeSelection } from '@/shared/preferences/theme'
import { ToggleSidebarSide } from '@/shared/preferences/sidebar'
import PageContainer from '../../_components/PageContainer'
import { ToggleTypeOfView } from '@/shared/preferences/view-mode'
import { EnableTags } from '@/features/tags'

import { ConfigColumns, useTaskBoardQuery } from '@/features/tasks'
import { useBoardQuery } from '@/features/boards'

const useColumnListForReminders = (): { name: string; id: string; position: string }[] => {
	const { taskBoard } = useTaskBoardQuery()
	return (taskBoard ?? []).map((list, i) => ({
		name: list.status,
		id: list.id,
		position: i + 1 + '',
	}))
}

interface Props {
	boardId: string
}

export function Settings({ boardId }: Props) {
	const { t } = useTranslation()
	const { session } = useSession()
	const columnList = useColumnListForReminders()
	useBoardQuery(boardId)

	return (
		<PageContainer
			title={t('menu.configs')}
			whereUserIs={USER_IS_IN.CONFIG}
			className='px-3 pb-6 grid place-items-center'
		>
			<div className='grid gap-4 justify-items-stretch '>
				<ChangeBoardName id={boardId} />
				<ConfigColumns />
				<CreateReminder columnList={columnList} />
				<ReminderList />
				<EnableTags />
				<ToggleTypeOfView />
				<ToggleSidebarSide />
				<ThemeSelection target='board' />
				<CanvasSelection boardId={boardId} />
				{session ? <DeleteBoard id={boardId} /> : <ResetBoard />}
			</div>
		</PageContainer>
	)
}
