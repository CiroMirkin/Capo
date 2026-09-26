import { LibraryOfArchivedNotes as LibraryOfArchiveNotes } from '@/features/notes'
import { ArchivedTasks } from '@/features/archived-tasks'
import { USER_IS_IN } from '@/shared/ui/organisms/userIsIn'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/atoms/tabs'
import { useTranslation } from 'react-i18next'
import { IntroDialog } from '@/shared/ui/molecules/IntroDialog'
import PageContainer from '../../_components/PageContainer'
import { useSyncBoardIdFromRoute } from '@/features/auth'

export function BoardArchive() {
	const { t } = useTranslation()
	useSyncBoardIdFromRoute()
	return (
		<PageContainer
			title={t('menu.archive')}
			whereUserIs={USER_IS_IN.ARCHIVE}
			className='flex flex-col items-center'
		>
			<Tabs defaultValue='tareas-archivadas'>
				<TabsList className='self-center justify-self-stretch'>
					<TabsTrigger value='tareas-archivadas'>{t('archive_page.tasks')}</TabsTrigger>
					<TabsTrigger value='notas-archivadas'>{t('archive_page.notes')}</TabsTrigger>
				</TabsList>
				<TabsContent value='tareas-archivadas'>
					<ArchivedTasks />
				</TabsContent>
				<TabsContent value='notas-archivadas'>
					<LibraryOfArchiveNotes />
				</TabsContent>
			</Tabs>
			<IntroDialog
				storageKey='capo-archive-intro'
				title={t('menu.archive')}
				buttonLabel={t('intro_dialog.got_it')}
			>
				<p>{t('intro_dialog.archive')}</p>
			</IntroDialog>
		</PageContainer>
	)
}
