import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { SettingSection } from '@/shared/ui/organisms/SettingSection'
import { cn } from '@/shared/lib/utils'
import { useSidebarSide } from '../hooks/useSidebarSide'
import { SidebarSide } from '../model/sidebarSide'

export function ToggleSidebarSide() {
	const { t } = useTranslation()
	const [side, setSide] = useSidebarSide()

	const choose = (next: SidebarSide) => {
		if (next === side) return
		setSide(next)
		toast.success(t('settings.sidebar.successful_toast'))
	}

	const options: { value: SidebarSide; label: string }[] = [
		{ value: 'left', label: t('settings.sidebar.left') },
		{ value: 'right', label: t('settings.sidebar.right') },
	]

	return (
		<SettingSection>
			<SettingSection.Title>{t('settings.sidebar.section_title')}</SettingSection.Title>
			<SettingSection.Description>
				{t('settings.sidebar.section_description')}
			</SettingSection.Description>
			<SettingSection.Content className='flex justify-center gap-4'>
				{options.map((option) => (
					<button
						key={option.value}
						type='button'
						onClick={() => choose(option.value)}
						aria-pressed={side === option.value}
						className={cn(
							'min-w-32 rounded-md border-2 px-4 py-2 text-sm font-medium transition-colors',
							side === option.value
								? 'border-black'
								: 'border-transparent opacity-70 hover:opacity-100'
						)}
					>
						{option.label}
					</button>
				))}
			</SettingSection.Content>
		</SettingSection>
	)
}
