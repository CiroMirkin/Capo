'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { Dialog } from '@radix-ui/react-dialog'
import {
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/shared/ui/molecules/dialog'
import { Button } from '@/shared/ui/atoms/button'
import { SquareTextIcon } from '@/shared/ui/atoms/icons'
import { MinimalTiptapEditor } from '@/shared/ui/organisms/MinimalTiptapEditor'
import { SaveStatus, type SaveState } from '@/shared/ui/atoms/SaveStatus'
import { checkMaxLengthOfNotesAndComments } from '@/features/tasks'
import { useLimboQuery } from '../hooks/useLimboQuery'
import { updateLimboTaskNotes } from '../useCase/updateLimboTaskNotes'
import { LimboTask } from '../model/limboTask'

export function LimboNotesDialog({ task }: { task: LimboTask }) {
	const { t } = useTranslation()
	const { limbo, updateLimbo, isSaving } = useLimboQuery()
	const [text, setText] = useState(task.notesAndComments || '')
	const [savedText, setSavedText] = useState(task.notesAndComments || '')

	const saveState: SaveState = isSaving ? 'saving' : text !== savedText ? 'unsaved' : 'saved'

	const save = () => {
		if (!checkMaxLengthOfNotesAndComments(text)) {
			toast.error(t('task_notes.max_length_toast'))
			return
		}
		updateLimbo(updateLimboTaskNotes({ limbo, taskId: task.id, notes: text }))
		setSavedText(text)
	}

	useEffect(() => {
		if (text === savedText || !checkMaxLengthOfNotesAndComments(text)) return
		const id = setTimeout(() => setSavedText(text), 1000)
		return () => clearTimeout(id)
	}, [text, savedText])

	return (
		<Dialog onOpenChange={(open) => !open && save()}>
			<DialogTrigger asChild title={t('limbo.notes_title')}>
				<Button size='sm' variant='ghost' className='flex-1'>
					<SquareTextIcon />
				</Button>
			</DialogTrigger>
			<DialogContent className='!max-w-3xl p-4 pb-4'>
				<DialogHeader className='px-2 pt-2'>
					<DialogTitle>{task.descriptionText}</DialogTitle>
					<DialogDescription></DialogDescription>
				</DialogHeader>
				<MinimalTiptapEditor
					value={text}
					onChange={setText}
					placeholder={t('task_notes.placeholder')}
					className='min-h-60'
					onSave={() => {
						save()
						toast.success(t('task_notes.save_toast'))
					}}
				/>
				<div className='flex justify-end pt-1'>
					<SaveStatus state={saveState} />
				</div>
			</DialogContent>
		</Dialog>
	)
}
