'use client'

import Image from 'next/image'
import Link from 'next/link'
import { LazyMotion, domAnimation, m, useReducedMotion } from 'motion/react'
import { useTranslation } from 'react-i18next'
import { useDocumentTitle } from '@uidotdev/usehooks'
import { Button } from '@/shared/ui/atoms/button'
import { TransitionLink } from '@/shared/ui/atoms/TransitionLink'
import { Card } from '@/shared/ui/molecules/card'
import {
	ChevronDownIcon,
	ColumnsIcon,
	GithubIcon,
	GlobeIcon,
	HourglassIcon,
	LanguagesIcon,
	MessageSquareTextIcon,
	StarIcon,
	UserIcon,
	type IconProps,
} from '@/shared/ui/atoms/icons'
import { useLanguageToggle } from '@/shared/preferences/language'
import { useTheme } from '@/shared/hooks/useTheme'
import { useThemesQuery } from '@/shared/preferences/theme/hooks/useThemesQuery'
import { useThemeTarget } from '@/shared/preferences/theme/hooks/useThemeTarget'
import { cn } from '@/shared/lib/utils'
import { ComponentType } from 'react'

const HERO_THEME_IDS = ['dream', 'algodon', 'retro', 'prado oscuro', 'mostaza', 'amanecer', 'grad-blink-1']

const FEATURES: Array<{ key: string; icon: ComponentType<IconProps>; titleKey: string; descKey: string }> = [
	{ key: 'board', icon: ColumnsIcon, titleKey: 'home.feature_board_title', descKey: 'home.feature_board_desc' },
	{ key: 'notes', icon: MessageSquareTextIcon, titleKey: 'home.feature_notes_title', descKey: 'home.feature_notes_desc' },
	{ key: 'time', icon: HourglassIcon, titleKey: 'home.feature_time_title', descKey: 'home.feature_time_desc' },
	{ key: 'account', icon: UserIcon, titleKey: 'home.feature_account_title', descKey: 'home.feature_account_desc' },
	{ key: 'share', icon: GlobeIcon, titleKey: 'home.feature_share_title', descKey: 'home.feature_share_desc' },
]

const FAQS = ['faq_1', 'faq_2', 'faq_3', 'faq_4', 'faq_5']

const starsFormatter = new Intl.NumberFormat('en', { notation: 'compact' })

function formatStars(count: number) {
	return starsFormatter.format(count)
}

function HeroThemePicker() {
	const { t } = useTranslation()
	const { themes } = useThemesQuery()
	const { setTheme } = useThemeTarget('dashboard')
	const currentThemeId = useTheme().id
	const heroThemes = HERO_THEME_IDS.map((id) => themes.find((theme) => theme.id === id)).filter(
		(theme): theme is NonNullable<typeof theme> => !!theme
	)

	if (heroThemes.length === 0) return null

	return (
		<div className='flex flex-col items-center gap-2 pt-2'>
			<p className='text-sm opacity-70'>{t('home.theme_picker_label')}</p>
			<div className='flex gap-2'>
				{heroThemes.map((theme) => (
					<button
						key={theme.id}
						type='button'
						title={theme.id}
						aria-label={theme.id}
						aria-pressed={currentThemeId === theme.id}
						onClick={() => setTheme(theme.id)}
						onMouseEnter={() => setTheme(theme.id)}
						onFocus={() => setTheme(theme.id)}
						className={cn(
							'h-9 w-9 rounded-full transition-transform hover:scale-110',
							theme.bg,
							currentThemeId === theme.id && 'shadow-[0_0_0_2px_rgba(0,0,0,0.45)]'
						)}
					/>
				))}
			</div>
		</div>
	)
}

function HomeHeader() {
	const { t } = useTranslation()
	const { column, columnText } = useTheme()

	return (
		<header
			className={cn(
				'sticky top-4 z-40 mx-auto w-[calc(100%-2rem)] max-w-3xl rounded-full shadow-lg transition-colors duration-300',
				column,
				columnText
			)}
		>
			<div className='px-4 md:px-6 h-14 flex items-center justify-between gap-4'>
				<TransitionLink to='/' className='flex items-center gap-2 shrink-0'>
					<img src='/capo.svg' alt='' className='h-6 w-6' />
					<span className='font-bold text-lg'>Capo</span>
				</TransitionLink>

				<div className='flex items-center gap-1'>
					<TransitionLink
						to='/auth'
						className='hidden sm:inline text-sm font-medium opacity-70 hover:opacity-100 px-3'
					>
						{t('sing_in')}
					</TransitionLink>
					<Button asChild size='sm'>
						<TransitionLink to='/guest'>{t('home.try_as_guest')}</TransitionLink>
					</Button>
				</div>
			</div>
		</header>
	)
}

function HomeHero() {
	const { t } = useTranslation()
	const reduce = useReducedMotion()

	return (
		<section>
			<LazyMotion features={domAnimation}>
				<m.div
					initial={{ opacity: 0, y: reduce ? 0 : 16 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: reduce ? 0.1 : 0.5, ease: [0.22, 1, 0.36, 1] }}
					className='mx-auto max-w-3xl px-4 md:px-6 pt-16 md:pt-24 pb-14 md:pb-20 text-center flex flex-col items-center gap-6'
				>
					<h1 className='text-4xl md:text-5xl font-bold tracking-tight md:whitespace-nowrap'>{t('home.hero_title')}</h1>
					<div className='flex flex-col gap-y-2 opacity-80'>
						<p>
							<span className='font-medium'>Capo</span> {t('board_description.p1')}
						</p>
						<p>{t('home.hero_subtitle')}</p>
					</div>
					<div className='flex flex-col sm:flex-row gap-3 w-full sm:w-auto pt-2'>
						<Button asChild size='lg'>
							<TransitionLink to='/guest'>{t('home.try_as_guest')}</TransitionLink>
						</Button>
						<Button asChild variant='outline' size='lg'>
							<TransitionLink to='/auth'>{t('home.create_account')}</TransitionLink>
						</Button>
					</div>
					<HeroThemePicker />
				</m.div>
			</LazyMotion>
		</section>
	)
}

function HomeScreenshot() {
	const { t } = useTranslation()

	return (
		<section className='mx-auto max-w-5xl px-4 md:px-6 pb-16 md:pb-24 text-center'>
			<h2 className='text-2xl md:text-3xl font-bold tracking-tight mb-2'>{t('home.screenshot_title')}</h2>
			<p className='opacity-70 max-w-md mx-auto mb-10'>{t('home.screenshot_subtitle')}</p>
			<div className='rounded-lg border border-border shadow-lg overflow-hidden mx-auto'>
				<Image
					src='/Capo_screenshot.png'
					alt={t('home.screenshot_title')}
					width={1280}
					height={838}
					className='w-full h-auto'
					priority
				/>
			</div>
		</section>
	)
}

function HomeFeatures() {
	const { t } = useTranslation()
	const { task, taskText } = useTheme()

	return (
		<section id='features' className='bg-muted/40'>
			<div className='mx-auto max-w-5xl px-4 md:px-6 py-16 md:py-24'>
				<h2 className='text-2xl md:text-3xl font-bold tracking-tight text-center mb-10'>
					{t('home.features_title')}
				</h2>
				<div className='grid sm:grid-cols-2 gap-4'>
					{FEATURES.map(({ key, icon: Icon, titleKey, descKey }) => (
						<Card key={key} className={cn('py-5 bg-card rounded border-none shadow-xs sm:odd:last:col-span-2', task, taskText)}>
							<Icon className='h-6 w-6 mb-3 opacity-70' />
							<h3 className='font-bold text-lg mb-1'>{t(titleKey)}</h3>
							<p className='text-sm opacity-65'>{t(descKey)}</p>
						</Card>
					))}
				</div>
			</div>
		</section>
	)
}

function HomeFaq() {
	const { t } = useTranslation()

	return (
		<section id='faq' className='mx-auto max-w-2xl px-4 md:px-6 py-16 md:py-24'>
			<h2 className='text-2xl md:text-3xl font-bold tracking-tight text-center mb-8'>
				{t('home.faq_title')}
			</h2>
			<div className='flex flex-col'>
				{FAQS.map((key) => (
					<details key={key} className='group border-b-black border-border py-4 [&::-webkit-details-marker]:hidden'>
						<summary className='flex items-center justify-between gap-4 cursor-pointer list-none font-medium'>
							{t(`home.${key}_q`)}
							<ChevronDownIcon className='h-4 w-4 shrink-0 opacity-50 transition-transform group-open:rotate-180' />
						</summary>
						<p className='pt-3 text-sm opacity-70'>
							{t(`home.${key}_a`)}
							{key === 'faq_5' && (
								<>
									{' '}
									<TransitionLink to='/privacy' className='underline underline-offset-2 hover:opacity-100'>
										{t('menu.privacy')}
									</TransitionLink>
									.
								</>
							)}
						</p>
					</details>
				))}
			</div>
		</section>
	)
}

function HomeCta() {
	const { t } = useTranslation()

	return (
		<section className='mx-auto max-w-2xl px-4 md:px-6 pb-16 md:pb-24 text-center flex flex-col items-center gap-6'>
			<h2 className='text-2xl md:text-3xl font-bold tracking-tight'>{t('home.cta_repeat_title')}</h2>
			<div className='flex flex-col sm:flex-row gap-3 w-full sm:w-auto'>
				<Button asChild size='lg'>
					<TransitionLink to='/guest'>{t('home.try_as_guest')}</TransitionLink>
				</Button>
				<Button asChild variant='outline' size='lg'>
					<TransitionLink to='/auth'>{t('home.create_account')}</TransitionLink>
				</Button>
			</div>
		</section>
	)
}

function HomeFooter({ stars }: { stars?: number }) {
	const { t } = useTranslation()
	const toggleLanguage = useLanguageToggle()
	const year = new Date().getFullYear()

	return (
		<footer>
			<div className='mx-auto max-w-5xl px-4 md:px-6 py-10 flex flex-col md:flex-row gap-6 md:items-center md:justify-between'>
				<div className='flex items-center gap-2'>
					<img src='/capo.svg' alt='' className='h-5 w-5' />
					<div>
						<p className='font-bold'>Capo</p>
						<p className='text-sm opacity-60'>{t('home.footer_tagline')}</p>
					</div>
				</div>
				<nav className='flex flex-wrap items-center gap-x-6 gap-y-2 text-sm'>
					<TransitionLink to='/privacy' className='opacity-70 hover:opacity-100'>
						{t('menu.privacy')}
					</TransitionLink>
					<Link
						href='https://github.com/CiroMirkin/Capo'
						target='_blank'
						rel='noreferrer'
						className='opacity-70 hover:opacity-100 inline-flex items-center gap-1.5'
					>
						<GithubIcon className='h-4 w-4' />
						GitHub
						{typeof stars === 'number' && (
							<span className='inline-flex items-center gap-0.5'>
								<StarIcon className='h-3.5 w-3.5' />
								{formatStars(stars)}
							</span>
						)}
					</Link>
					<button
						type='button'
						onClick={toggleLanguage}
						title={t('menu.language')}
						aria-label={t('menu.language')}
						className='opacity-70 hover:opacity-100 inline-flex items-center gap-1.5'
					>
						<LanguagesIcon className='h-4 w-4' />
						{t('menu.language')}
					</button>
				</nav>
			</div>
			<div>
				<div className='mx-auto max-w-5xl px-4 md:px-6 py-4 text-xs opacity-50 flex flex-wrap gap-x-4 gap-y-1 justify-between'>
					<span>© {year} Ciro Mirkin — {t('home.footer_rights')}</span>
					<span>MIT License</span>
				</div>
			</div>
		</footer>
	)
}

export function Home({ stars }: { stars?: number } = {}) {
	useDocumentTitle('Capo')
	const { bg, text } = useTheme()

	return (
		<div className={cn('min-h-screen flex flex-col transition-colors duration-300', bg, text)}>
			<div className={bg}>
				<HomeHeader />
				<HomeHero />
				<HomeScreenshot />
			</div>
			<HomeFeatures />
			<div className={bg}>
				<HomeFaq />
				<HomeCta />
				<HomeFooter stars={stars} />
			</div>
		</div>
	)
}
