import { Button } from '@/shared/ui/atoms/button'
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/shared/ui/molecules/sheet'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/shared/hooks/useTheme'
import { NoteInput } from './NoteInput'

export default function Notes() {
	const { t } = useTranslation()
	const { column, text: textColor } = useTheme()
	return (
		<Sheet>
			<SheetTrigger asChild>
				<Button variant='link' className={`text-base ${textColor}`}>
					{t('notes.action_title')}
				</Button>
			</SheetTrigger>
			<SheetContent className={`${column} p-0`} aria-describedby={undefined}>
				<SheetTitle className='sr-only'>{t('notes.section_title')}</SheetTitle>
				<NoteInput />
			</SheetContent>
		</Sheet>
	)
}
