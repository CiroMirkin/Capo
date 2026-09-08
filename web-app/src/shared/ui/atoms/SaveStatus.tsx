'use client'

import { useTranslation } from 'react-i18next'
import { cn } from '@/shared/lib/utils'

export type SaveState = 'saved' | 'saving' | 'unsaved'

/** Línea discreta de estado de guardado. Reemplaza al botón de guardar. */
export function SaveStatus({ state, className }: { state: SaveState; className?: string }) {
	const { t } = useTranslation()
	return (
		<span
			className={cn('text-xs text-muted-foreground transition-opacity', className)}
			aria-live='polite'
		>
			{t(`save_status.${state}`)}
		</span>
	)
}
