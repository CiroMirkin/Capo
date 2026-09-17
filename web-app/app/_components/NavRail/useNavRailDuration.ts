'use client'

import { useEffect } from 'react'
import { useVisibilityChange } from '@/shared/hooks/useVisibilityChange'
import { useLastDurationPeriod, requestUsageHistoryFlush } from '@/features/usage-history'

/** Duración del item de tiempo: solo se pide/flushea mientras el rail está activo y la pestaña visible. */
export function useNavRailDuration(active: boolean) {
	const documentVisible = useVisibilityChange()
	const isVisible = active && documentVisible
	const duration = useLastDurationPeriod({ isVisible })

	useEffect(() => {
		if (isVisible) requestUsageHistoryFlush()
	}, [isVisible])

	return duration
}
