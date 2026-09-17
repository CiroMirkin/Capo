import { Button } from '@/shared/ui/atoms/button'
import { useTranslation } from 'react-i18next'
import { useDataOfTheTask } from '@/features/tasks'
import { ArchiveIcon } from '@/shared/ui/atoms/icons'
import { useCallback } from 'react'
import { useArchiveTask } from '../hooks/useArchiveTask'

interface ArchiveTaskButtonProps {
	handleClick: (action: () => void) => void
	className?: string
}

export function ArchiveTaskButton({ handleClick, className }: ArchiveTaskButtonProps) {
	const { t } = useTranslation()
	const data = useDataOfTheTask()
	const archiveTask = useArchiveTask()

	const archiveTaskAction = useCallback(() => archiveTask(data), [archiveTask, data])

	return (
		<Button
			size='sm'
			variant='ghost'
			className={className}
			data-testid='BotonParaArchivarUnaTarea'
			onClick={() => handleClick(archiveTaskAction)}
			title={t('task_buttons.archive')}
		>
			<ArchiveIcon size='xs' className='mr-2' /> {t('task_buttons.archive')}
		</Button>
	)
}
