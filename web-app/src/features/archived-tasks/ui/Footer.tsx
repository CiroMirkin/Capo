import { useTranslation } from 'react-i18next'
import { Button } from '@/shared/ui/atoms/button'
import { useTheme } from '@/shared/hooks/useTheme'
import { toast } from 'sonner'
import { downloadArchiveLikePDF } from '@/features/archived-tasks/model/downloadArchiveLikePDF'
import { useArchivedTasksQuery } from '../hooks/useArchivedTasksQuery'
import { emptyArchivedTasks } from '../model/archive'
import { useArchive } from '../hooks/useArchive'
import { useExportJson } from '@/shared/hooks/useExportJson'
import type { Archive } from '../model/archive'
import { cn } from '@/shared/lib/utils'

export default function Footer() {
	const archive = useArchive()
	const { column } = useTheme()
	const { t } = useTranslation()

	const { updateArchivedTasks } = useArchivedTasksQuery()

	const cleanTheWholeArchive = () => {
		updateArchivedTasks(emptyArchivedTasks)
	}

	const askForConfirmationToCleanTheWholeArchive = () => {
		toast.warning(t('archive.clean_archive_warning'), {
			action: {
				label: t('archive.clean_archive_btn'),
				onClick: cleanTheWholeArchive,
			},
		})
	}

	const { exportJson } = useExportJson<Archive>({
		filename: 'archived-tasks.json',
		indent: 2,
	})
	const handleExportJson = () => {
		const success = exportJson(archive)
		if (success) {
			toast.success(t('archive.export_success'))
		} else {
			toast.error(t('archive.export_error'))
		}
	}

	return (
		<footer className={cn('mb-4 p-4 rounded-lg flex gap-1 flex-wrap', column)}>
			<Button variant='outline' onClick={() => downloadArchiveLikePDF({ archive })}>
				{t('archive.archive_to_pdf_btn')}
			</Button>
			<Button variant='outline' onClick={handleExportJson}>
				{t('archive.archive_to_json_btn')}
			</Button>
			<Button variant='destructiveGhost' onClick={askForConfirmationToCleanTheWholeArchive}>
				{t('archive.clean_archive_btn')}
			</Button>
		</footer>
	)
}
