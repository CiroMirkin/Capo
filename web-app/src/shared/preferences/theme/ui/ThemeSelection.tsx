'use client'

import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useTheme } from '@/shared/hooks/useTheme'
import { SettingSection } from '@/shared/ui/organisms/SettingSection'
import ThemePreview from './ThemePreview'
import { Swatch } from './Swatch'
import { ThemeSwatchesPager } from './ThemeSwatchesPager'
import { useThemesQuery } from '../hooks/useThemesQuery'
import { useThemeTarget } from '../hooks/useThemeTarget'

interface Props {
	target: 'board' | 'dashboard'
}

export function ThemeSelection({ target }: Props) {
	const { t } = useTranslation()
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

	const applyTheme = (id: string) => {
		if (id === currentThemeId) return
		setTheme(id)
		toast.success(t(toastKey))
	}

	return (
		<SettingSection>
			<SettingSection.Title>{t(titleKey)}</SettingSection.Title>
			<SettingSection.Content className='py-0 px-0 grid gap-3 bg-transparent'>
				<div className='flex flex-col gap-4'>
					<ThemePreview />
					<ThemeSwatches value={currentThemeId} onChange={applyTheme} />
				</div>
			</SettingSection.Content>
		</SettingSection>
	)
}

interface ThemeSwatchesProps {
	value: string
	onChange: (id: string) => void
	/** Muestra los temas por páginas en vez de la grilla completa (para espacios chicos, ej. un modal). */
	paginated?: boolean
}

/** Grilla de temas controlada: no persiste nada, solo avisa el id elegido. */
export function ThemeSwatches({ value, onChange, paginated = false }: ThemeSwatchesProps) {
	const { themes } = useThemesQuery()

	if (paginated) {
		return <ThemeSwatchesPager themes={themes} value={value} onChange={onChange} />
	}

	return (
		<div className='flex justify-around flex-wrap gap-2'>
			{themes.map((color) => (
				<Swatch
					key={color.id}
					theme={color}
					selected={value == color.id}
					onClick={() => onChange(color.id)}
				/>
			))}
		</div>
	)
}
