'use client'

import { useEffect, useState } from 'react'

interface UseLoadingTimeoutParams {
	isLoading: boolean
	timeout?: number
}

export function useLoadingTimeout({ isLoading, timeout = 0 }: UseLoadingTimeoutParams) {
	const [showSpinner, setShowSpinner] = useState(true)

	const shouldShowSpinner = isLoading

	useEffect(() => {
		const timer = setTimeout(() => {
			setShowSpinner(false)
		}, timeout)

		if (!shouldShowSpinner) {
			setShowSpinner(false)
			clearTimeout(timer)
		}

		return () => clearTimeout(timer)
	}, [shouldShowSpinner, timeout])

	return shouldShowSpinner && showSpinner
}
