'use client'

import { Dialog } from '@radix-ui/react-dialog'
import {
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/shared/ui/molecules/dialog'
import { Button } from '@/shared/ui/atoms/button'
import { MinimalTiptapEditor } from '@/shared/ui/organisms/MinimalTiptapEditor'
import { useDataOfTheTask } from '../hooks/useDataOfTheTask'
import { SquareTextIcon } from '@/shared/ui/atoms/icons'
import { checkMaxLengthOfNotesAndComments } from '../models/NotesAndComments'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { updateNotesAndCommentsOfThisTask } from '../useCase/updateNotesAndCommentsOfThisTask'
import { useTaskBoardQuery } from '@/features/tasks/hooks/useTaskBoardQuery'
import { useTaskListInEachColumn } from '../hooks/useTaskListInEachColumn'
import { useEffect, useState } from 'react'
import { SaveStatus, type SaveState } from '@/shared/ui/atoms/SaveStatus'
import { MaximizeIcon, MinimizeIcon } from '@/shared/ui/atoms/icons'

export default function ShowTaskNotesEditor() {
	const task = useDataOfTheTask()
	const { updateTaskBoard, isSaving } = useTaskBoardQuery()
	const listOfTaskInColumns = useTaskListInEachColumn()
	const { t } = useTranslation()
	const [text, setText] = useState(task.notesAndComments || '')
	const [savedText, setSavedText] = useState(task.notesAndComments || '')
	const [maximized, setMaximized] = useState(false)

	const saveState: SaveState = isSaving ? 'saving' : text !== savedText ? 'unsaved' : 'saved'

	const saveText = () => {
		if (!checkMaxLengthOfNotesAndComments(text)) {
			toast.error(t('task_notes.max_length_toast'))
			return
		}

		const updatedList = updateNotesAndCommentsOfThisTask({
			listOfTaskInColumns: listOfTaskInColumns,
			taskToUpdate: task,
			notes: text,
		})
		updateTaskBoard(updatedList)
		setSavedText(text)
	}

	// El guardado real ocurre al cerrar / Ctrl+S. 
	// Ese Effect solo hace que el indicador vuelva a "Guardado" tras 1s sin tipear.
	useEffect(() => {
		if (text === savedText || !checkMaxLengthOfNotesAndComments(text)) return
		const id = setTimeout(() => setSavedText(text), 1000)
		return () => clearTimeout(id)
	}, [text, savedText])

	const handleDialogOpenChange = (isOpen: boolean) => {
		if (!isOpen) {
			saveText()
		}
	}
	return (
		<Dialog onOpenChange={handleDialogOpenChange}>
			<DialogTrigger asChild title={t('task_notes.title')}>
				<Button size='sm' variant='ghost' className='w-full'>
					<SquareTextIcon />
				</Button>
			</DialogTrigger>
			<DialogContent
				className={
					maximized
						? '!max-w-[95vw] !w-[95vw] h-[90vh] grid-rows-[auto_1fr] p-4 pb-4'
						: '!max-w-3xl p-4 pb-4'
				}
			>
				<DialogHeader className='px-2 pt-2'>
					<DialogTitle>{task.descriptionText}</DialogTitle>
					<DialogDescription></DialogDescription>
				</DialogHeader>
				<div className={maximized ? 'flex min-h-0 flex-col' : undefined}>
					<MinimalTiptapEditor
						value={text}
						onChange={setText}
						placeholder={t('task_notes.placeholder')}
						fill={maximized}
						className={maximized ? 'min-h-0 flex-1' : 'min-h-60'}
						onSave={() => {
							saveText()
							toast.success(t('task_notes.save_toast'))
						}}
					/>
					<div className='flex justify-end pt-1'>
						<SaveStatus state={saveState} />
					</div>
				</div>
				<button
					type='button'
					onClick={(e) => {
						setMaximized((m) => !m)
						e.currentTarget.blur()
					}}
					title={t(maximized ? 'task_notes.minimize' : 'task_notes.maximize')}
					className='absolute right-12 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
				>
					{maximized ? (
						<MinimizeIcon className='h-4 w-4' />
					) : (
						<MaximizeIcon className='h-4 w-4' />
					)}
					<span className='sr-only'>
						{t(maximized ? 'task_notes.minimize' : 'task_notes.maximize')}
					</span>
				</button>
			</DialogContent>
		</Dialog>
	)
}
