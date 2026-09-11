import { Button } from '@/shared/ui/atoms/button'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { CopyIcon } from '@/shared/ui/atoms/icons'
import { cn } from '@/shared/lib/utils'

interface Props {
	text: string
	className?: string
}

export function CopyTextButton({ text, className }: Props) {
	const { t } = useTranslation()

	const copyTextToClipboard = () => {
		navigator.clipboard.writeText(text).then(() => {
			toast.info(t('task_buttons.copy_text_toast'))
		})
	}

	return (
		<Button
			size='sm'
			variant='ghost'
			className={cn(className)}
			onClick={() => copyTextToClipboard()}
			title={t('task_buttons.copy_text')}
		>
			<CopyIcon />
		</Button>
	)
}
