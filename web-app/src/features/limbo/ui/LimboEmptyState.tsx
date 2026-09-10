import { useTranslation } from 'react-i18next'
import { EmptySpaceText } from '@/shared/ui/atoms/EmptySpaceText'
import { useTheme } from '@/shared/hooks/useTheme'
import { cn } from '@/shared/lib/utils'

export function LimboEmptyState() {
	const { t } = useTranslation()
	const { text } = useTheme()
	return (
		<EmptySpaceText className={cn('max-w-xs text-center', text)}>
			{t('limbo.empty_copy')}
		</EmptySpaceText>
	)
}
