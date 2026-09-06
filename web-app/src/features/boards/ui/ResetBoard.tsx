'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { Button } from '@/shared/ui/atoms/button'
import { TrashIcon } from '@/shared/ui/atoms/icons'
import { SettingSection } from '@/shared/ui/organisms/SettingSection'

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

	const [phrase, setPhrase] = useState('')

	const expectedPhrase = t('settings.board.reset_board_confirm_phrase')
	const confirmed = phrase.trim().toLowerCase() === expectedPhrase.trim().toLowerCase()

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
		<SettingSection>
			<SettingSection.Title>
				{t('settings.board.reset_board_section_title')}
			</SettingSection.Title>
			<SettingSection.Description>
				{t('settings.board.reset_board_section_description')}
			</SettingSection.Description>
			<SettingSection.Content className='flex flex-col gap-4'>
				<label className='flex flex-col gap-2'>
					<span>{t('settings.board.reset_board_confirm_prompt')}</span>
					<input
						type='text'
						value={phrase}
						onChange={(e) => setPhrase(e.target.value)}
						autoComplete='off'
						className='w-fit min-w-64 rounded border border-gray-300 bg-gray-100 px-3 py-2 focus:ring-2'
					/>
				</label>
				<Button
					variant='destructive'
					disabled={!confirmed}
					onClick={handleResetBoard}
					className='w-fit flex items-center gap-2'
					data-testid='BotonParaResetearElTablero'
				>
					<TrashIcon />
					{t('settings.board.reset_board_button')}
				</Button>
			</SettingSection.Content>
		</SettingSection>
	)
}
