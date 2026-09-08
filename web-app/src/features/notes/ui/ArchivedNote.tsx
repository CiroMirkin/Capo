import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/molecules/card'
import { ArchivedNote as ArchivedNoteModel } from '../model/archivedNote'
import { useTheme } from '@/shared/hooks/useTheme'
import { MinimalTiptapViewer } from '@/shared/ui/organisms/MinimalTiptapViewer'
import { format } from '@formkit/tempo'
import { useTranslation } from 'react-i18next'
import { cn } from '@/shared/lib/utils'

interface ArchivedNoteProps {
	note: ArchivedNoteModel
}

export default function ArchivedNote({ note }: ArchivedNoteProps) {
	const { column, text, taskText } = useTheme()
	const { i18n } = useTranslation()

	return (
		<Card className={cn(column, text, 'border-none md:px-6 px-4 max-w-2xl rounded-lg')}>
			<CardHeader>
				<CardTitle className='text-xl font-medium'>
					{format(note.date, { date: 'long' }, i18n.language)}
				</CardTitle>
			</CardHeader>
			<CardContent className='h-auto'>
				<MinimalTiptapViewer
					value={note.note}
					unstyled
					editorContentClassName='p-0'
					className={taskText ? taskText : text}
				/>
			</CardContent>
		</Card>
	)
}
