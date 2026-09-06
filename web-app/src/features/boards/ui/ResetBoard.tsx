'use client'

import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { DestructiveBoardSection } from './DestructiveBoardSection'

/** Claves de localStorage que contienen el contenido del tablero invitado. */
const GUEST_BOARD_KEYS = [
	'board-capo',
	'taskListInEachColumn',
	'tasks-archive',
	'tags-capo',
	'capo-reminder',
	'capo-notes',
	'capo-archived-notes',
	'capo-usage-history',
]

/**
 * Reemplazo de `DeleteBoard` para el modo invitado.
 */
export function ResetBoard() {
	const { t } = useTranslation()

	const handleResetBoard = () => {
		toast.warning(t('settings.board.reset_board_confirm_toast'), {
			action: {
				label: t('settings.board.reset_board_button'),
				onClick: () => {
					GUEST_BOARD_KEYS.forEach((key) => localStorage.removeItem(key))
					toast.success(t('settings.board.reset_board_success'))
					window.location.assign('/')
				},
			},
		})
	}

	return (
		<DestructiveBoardSection
			title={t('settings.board.reset_board_section_title')}
			description={t('settings.board.reset_board_section_description')}
			confirmPhrase={t('settings.board.reset_board_confirm_phrase')}
			confirmLabel={t('settings.board.reset_board_confirm_prompt')}
			buttonLabel={t('settings.board.reset_board_button')}
			onConfirm={handleResetBoard}
			testId='BotonParaResetearElTablero'
		/>
	)
}
