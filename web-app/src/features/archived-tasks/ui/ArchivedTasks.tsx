import { useArchive } from '@/features/archived-tasks/hooks/useArchive'
import { useTranslation } from 'react-i18next'
import { Content } from './Content'
import { EmptySpaceText } from '@/shared/ui/atoms/EmptySpaceText'
import Footer from './Footer'

export function ArchivedTasks() {
	const { t } = useTranslation()
	const boardArchive = useArchive()

	return (
		<>
			<div className='w-full min-h-[calc(100vh-7.8rem)] grid justify-items-center py-2 pt-2 pb-6 '>
				{boardArchive.length === 0 ? (
					<EmptySpaceText> {t('archive.empty_archive')} </EmptySpaceText>
				) : (
					<div className='w-full max-w-3xl flex flex-col gap-y-2'>
						<Content />
						<Footer />
					</div>
				)}
			</div>
		</>
	)
}
