import { useTranslation } from 'react-i18next'
import { useCheckIfTaskIsInTheLastColumn } from '@/features/tasks/ui/Columns/hooks/useCheckIfTaskIsInTheLastColumn'
import { Button } from '@/shared/ui/atoms/button'
import { useDataOfTheTask } from '../hooks/useDataOfTheTask'
import { ArrowRightIcon } from '@/shared/ui/atoms/icons'
import { useMoveTaskToNextColumn } from '../hooks/useMoveTaskToNextColumn'

interface Props {
	handleClick: (action: () => void) => void
	className?: string
}

export function MoveNextTaskButton({ handleClick, className }: Props) {
	const { t } = useTranslation()
	const data = useDataOfTheTask()
	const isTheTaskInTheLastColumn = useCheckIfTaskIsInTheLastColumn(data)
	const moveTaskToNextColumn = useMoveTaskToNextColumn()

	return (
		<Button
			size='sm'
			disabled={isTheTaskInTheLastColumn}
			variant='ghost'
			className={className}
			data-testid='BotonParaAvanzarTarea'
			onClick={() => handleClick(() => moveTaskToNextColumn(data))}
			title={t('task_buttons.next_btn')}
		>
			<ArrowRightIcon size='xs' />
		</Button>
	)
}
