'use client'

import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { DestructiveBoardSection } from './DestructiveBoardSection'
import { useBoardQuery } from '../hooks/useBoardQuery'
import { useDashboardQuery } from '@/features/dashboard/hooks/useDashboardQuery'

interface Props {
	id: string
}

export function DeleteBoard({ id }: Props) {
	const { t } = useTranslation()
	const router = useRouter()
	const { board } = useBoardQuery(id)
	const { deleteBoard } = useDashboardQuery()

	const handleDeleteBoard = () => {
		toast.warning(t('dashboard.delete_warning'), {
			action: {
				label: t('dashboard.delete_button'),
				onClick: () => {
					const promise = deleteBoard(id).then(() => router.push('/'))
					toast.promise(promise, {
						loading: t('dashboard.deleting_board'),
						success: () => t('dashboard.delete_success'),
						error: (e) => e.message || t('dashboard.delete_error'),
					})
				},
			},
		})
	}

	return (
		<DestructiveBoardSection
			title={t('settings.board.delete_board_section_title')}
			description={t('settings.board.delete_board_section_description')}
			confirmPhrase={board?.name ?? ''}
			confirmLabel={
				<>
					{t('settings.board.delete_board_name_input_label')}{' '}
					{board?.name && <span className='opacity-50'>({board.name})</span>}
				</>
			}
			confirmPlaceholder={t('settings.board.delete_board_name_input_placeholder')}
			buttonLabel={t('settings.board.delete_board_button')}
			onConfirm={handleDeleteBoard}
			testId='BotonParaEliminarElTablero'
		/>
	)
}
