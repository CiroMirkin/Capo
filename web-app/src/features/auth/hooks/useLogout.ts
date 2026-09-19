'use client'

import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { authClient } from '../lib/authClient'

export function useLogout() {
	const { t } = useTranslation()

	return function logout() {
		const logOutPromise = async () => {
			sessionStorage.removeItem('isInitialLoad')
			await authClient.signOut()
			window.location.assign('/')
		}

		toast.promise(logOutPromise(), {
			loading: t('loading', { defaultValue: 'Cargando...' }),
			success: t('successful_log_out_toast'),
			error: (error: Error) =>
				error.message || t('log_out_error', { defaultValue: 'Error al cerrar sesión' }),
		})
	}
}
