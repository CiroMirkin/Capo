'use client'

import { Board } from '@/features/boards'
import {
	ColumnsFooterContentProvider,
	ColumnsFooterContent,
	AddNewTaskInput,
	TaskListInEachColumn,
	ListView,
	TableView,
	useTaskBoardQuery,
} from '@/features/tasks'
import { ArchiveTaskListButton } from '@/features/archived-tasks'
import PageContainer from '../../_components/PageContainer'
import { useBoardQuery } from '@/features/boards'
import { USER_IS_IN } from '@/shared/ui/organisms/userIsIn'
import { useTypeOfView } from '@/shared/preferences/view-mode'
import { NoteInput } from '@/features/notes'
import { useReminder } from '@/features/reminders'
import { useSession } from '@/features/auth'
import { Spinner } from '@/shared/ui/atoms/spinner'
import { useLoadingTimeout } from '@/shared/hooks/useLoadingTimeout'
import { LazyMotion, domMax } from 'motion/react'

const columnsData: ColumnsFooterContent = {
	firstColumnFooterContent: <AddNewTaskInput />,
	lastColumnFooterContent: <ArchiveTaskListButton />,
}

export function BoardPage({ boardId }: { boardId: string }) {
	const { board } = useBoardQuery(boardId)
	const typeOfView = useTypeOfView()
	const { taskBoard, isLoading: isTaskBoardLoading } = useTaskBoardQuery()
	const { session, isLoading: isLoadingSession } = useSession()

	const tasksList = taskBoard?.map((column) => column.tasks) ?? []
	useReminder(tasksList)

	const showSpinner = useLoadingTimeout({
		session,
		isLoading: isTaskBoardLoading,
		timeout: 500,
	})

	if (!taskBoard || isLoadingSession || showSpinner) {
		return (
			<PageContainer title='Capo' whereUserIs={USER_IS_IN.BOARD}>
				<div className='min-w-48 min-h-64 md:min-h-[60vh] flex items-center justify-center'>
					<Spinner size={30} />
				</div>
			</PageContainer>
		)
	}

	return (
		<PageContainer title={board?.name || 'Capo'} whereUserIs={USER_IS_IN.BOARD}>
			<Board id={boardId}>
				<LazyMotion features={domMax}>
					<ColumnsFooterContentProvider value={columnsData}>
						{typeOfView == 'LIST' && (
							<div className='p-5'>
								<ListView>{TaskListInEachColumn}</ListView>
							</div>
						)}
						{typeOfView == 'BOARD' && <TableView>{TaskListInEachColumn}</TableView>}
						{typeOfView == 'NOTE-LIST' && (
							<div className='flex md:flex-nowrap flex-wrap-reverse justify-stretch items-start gap-4 px-8 md:px-20'>
								<ListView className='my-4'>{TaskListInEachColumn}</ListView>
								<div className='w-full py-4 md:sticky static top-0'>
									<NoteInput />
								</div>
							</div>
						)}
					</ColumnsFooterContentProvider>
				</LazyMotion>
			</Board>
		</PageContainer>
	)
}
