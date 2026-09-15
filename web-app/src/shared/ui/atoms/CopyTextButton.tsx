import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { CopyIcon } from '@/shared/ui/atoms/icons'
import { KebabMenuItem } from '@/shared/ui/molecules/KebabMenuItem'

interface Props {
	text: string
	className?: string
	/** Muestra la etiqueta junto al icono (item de menú en vez de botón compacto). */
	showLabel?: boolean
}

export function CopyTextButton({ text, className, showLabel }: Props) {
	const { t } = useTranslation()

	const copyTextToClipboard = () => {
		navigator.clipboard.writeText(text).then(() => {
			toast.info(t('task_buttons.copy_text_toast'))
		})
	}

	return (
		<KebabMenuItem
			showLabel={showLabel}
			className={className}
			onClick={() => copyTextToClipboard()}
			title={t('task_buttons.copy_text')}
		>
			<CopyIcon size='xs' />
			{showLabel && t('task_buttons.copy_text')}
		</KebabMenuItem>
	)
}
