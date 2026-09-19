'use client'

import { useVisibilityChange } from '@/shared/hooks/useVisibilityChange'
import { useLastDurationPeriod } from '@/features/usage-history'

/** Duración del item de tiempo: solo se pide mientras el rail está activo y la pestaña visible. */
export function useNavRailDuration(active: boolean) {
	const documentVisible = useVisibilityChange()
	const isVisible = active && documentVisible
	return useLastDurationPeriod({ isVisible })
}
