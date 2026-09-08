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
import { MessageSquareTextIcon } from '@/shared/ui/atoms/icons'
import { checkMaxLengthOfNotesAndComments } from '../models/NotesAndComments'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { updateNotesAndCommentsOfThisTask } from '../useCase/updateNotesAndCommentsOfThisTask'
import { useTaskBoardQuery } from '@/features/tasks/hooks/useTaskBoardQuery'
import { useTaskListInEachColumn } from '../hooks/useTaskListInEachColumn'
import { useState } from 'react'
import { SaveStatus, type SaveState } from '@/shared/ui/atoms/SaveStatus'

export default function ShowTaskNotesEditor() {
	const task = useDataOfTheTask()
	const { updateTaskBoard, isSaving } = useTaskBoardQuery()
	const listOfTaskInColumns = useTaskListInEachColumn()
	const { t } = useTranslation()
	const [text, setText] = useState(task.notesAndComments || '')

	const saveState: SaveState = isSaving
		? 'saving'
		: text !== (task.notesAndComments || '')
			? 'unsaved'
			: 'saved'

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
	}

	const handleDialogOpenChange = (isOpen: boolean) => {
		if (!isOpen) {
			saveText()
		}
	}
	return (
		<Dialog onOpenChange={handleDialogOpenChange}>
			<DialogTrigger asChild title={t('task_notes.title')}>
				<Button size='sm' variant='ghost' className='w-full'>
					<MessageSquareTextIcon />
				</Button>
			</DialogTrigger>
			<DialogContent className='!max-w-3xl'>
				<DialogHeader>
					<DialogTitle>{task.descriptionText}</DialogTitle>
					<DialogDescription></DialogDescription>
				</DialogHeader>
				<div>
					<MinimalTiptapEditor
						value={text}
						onChange={setText}
						placeholder={t('task_notes.placeholder')}
						onSave={() => {
							saveText()
							toast.success(t('task_notes.save_toast'))
						}}
					/>
					<div className='flex justify-end pt-1'>
						<SaveStatus state={saveState} />
					</div>
				</div>
			</DialogContent>
		</Dialog>
	)
}
