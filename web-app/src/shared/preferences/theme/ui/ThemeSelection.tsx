'use client'

import { Card, CardContent } from '@/shared/ui/molecules/card'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useTheme } from '@/shared/hooks/useTheme'
import { CheckIcon } from '@/shared/ui/atoms/icons'
import { SettingSection } from '@/shared/ui/organisms/SettingSection'
import ThemePreview from './ThemePreview'
import { useThemesQuery } from '../hooks/useThemesQuery'
import { useThemeTarget } from '../hooks/useThemeTarget'

interface Props {
	target: 'board' | 'dashboard'
}

export function ThemeSelection({ target }: Props) {
	const { t } = useTranslation()
	const { themes } = useThemesQuery()
	const { setTheme } = useThemeTarget(target)
	const currentThemeId = useTheme().id

	const titleKey =
		target === 'board'
			? 'settings.board.board_theme_section_title'
			: 'settings.dashboard.theme_section_title'
	const toastKey =
		target === 'board'
			? 'settings.board.set_board_theme_toast'
			: 'settings.dashboard.set_theme_toast'

	const toggleTheme = (id: string) => {
		setTheme(id)
		toast.success(t(toastKey))
	}

	return (
		<SettingSection>
			<SettingSection.Title>{t(titleKey)}</SettingSection.Title>
			<SettingSection.Content className='py-0 px-0 grid gap-3 bg-transparent'>
				<div className='flex flex-col gap-4'>
					<ThemePreview />
					<div className='flex justify-around flex-wrap gap-2'>
						{themes.map((color) => (
							<button
								key={color.id}
								type='button'
								onClick={() => toggleTheme(color.id)}
								aria-pressed={currentThemeId == color.id}
								title={color.id}
							>
								<Card
									className={`w-[68px] h-[68px] p-3 rounded-md ${color.bg} border ${currentThemeId == color.id ? 'border-black' : 'border-transparent'}`}
								>
									<CardContent
										className={`w-full h-full rounded-md ${color.task} grid place-items-center pb-0`}
									>
										{currentThemeId == color.id && (
											<CheckIcon className='p-0' />
										)}
									</CardContent>
								</Card>
							</button>
						))}
					</div>
				</div>
			</SettingSection.Content>
		</SettingSection>
	)
}
