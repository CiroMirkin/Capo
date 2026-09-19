'use client'

import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

/** Avisa por toast cuando el navegador pierde la conexión a internet. */
export function useOfflineToast(): void {
	const { t } = useTranslation()

	useEffect(() => {
		const handleOffline = () => toast.error(t('connection.offline_toast'))
		window.addEventListener('offline', handleOffline)
		return () => window.removeEventListener('offline', handleOffline)
	}, [t])
}
