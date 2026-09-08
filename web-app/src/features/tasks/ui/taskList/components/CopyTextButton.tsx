import { Button } from '@/shared/ui/atoms/button'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { useDataOfTheTask } from '../hooks/useDataOfTheTask'
import { CopyIcon } from '@/shared/ui/atoms/icons'

export function CopyTextButton() {
	const { t } = useTranslation()
	const data = useDataOfTheTask()

	const copyTextToClipboard = () => {
		const text = data.descriptionText
		navigator.clipboard.writeText(text).then(() => {
			toast.info(t('task_buttons.copy_text_toast'))
		})
	}

	return (
		<Button
			size='sm'
			variant='ghost'
			className='w-full'
			onClick={() => copyTextToClipboard()}
			title={t('task_buttons.copy_text')}
		>
			<CopyIcon />
		</Button>
	)
}
