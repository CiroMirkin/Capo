'use client'

import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { DestructiveSection } from '@/shared/ui/organisms/DestructiveSection'
import { authClient } from '../lib/authClient'
import { useSession } from '../hooks/useSession'

export function DeleteAccountSection() {
	const { t } = useTranslation()
	const { session } = useSession()
	const email = session?.user?.email ?? ''

	const handleDeleteAccount = () => {
		toast.warning(t('settings.dashboard.delete_account_warning'), {
			action: {
				label: t('settings.dashboard.delete_account_button'),
				onClick: () => {
					const promise = import('../api/actions/deleteAccount')
						.then(({ deleteAccount }) => deleteAccount())
						.then(() => authClient.signOut().catch(() => {}))
						.then(() => window.location.assign('/'))
					toast.promise(promise, {
						loading: t('settings.dashboard.delete_account_loading'),
						success: t('settings.dashboard.delete_account_success'),
						error: (e: Error) =>
							e.message || t('settings.dashboard.delete_account_error'),
					})
				},
			},
		})
	}

	return (
		<DestructiveSection
			title={t('settings.dashboard.delete_account_section_title')}
			description={t('settings.dashboard.delete_account_section_description')}
			confirmPhrase={email}
			confirmLabel={
				<>
					{t('settings.dashboard.delete_account_email_input_label')}{' '}
					{email && <span className='opacity-50'>({email})</span>}
				</>
			}
			confirmPlaceholder={t('settings.dashboard.delete_account_email_input_placeholder')}
			buttonLabel={t('settings.dashboard.delete_account_button')}
			onConfirm={handleDeleteAccount}
			testId='BotonParaEliminarLaCuenta'
		/>
	)
}
