import { useDashboardQuery } from '../hooks/useDashboardQuery'
import { PlusIcon, TrashIcon } from '@/shared/ui/atoms/icons'
import { Button } from '@/shared/ui/atoms/button'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/shared/ui/molecules/dialog'
import { Label } from '@/shared/ui/atoms/label'
import { Input } from '@/shared/ui/atoms/input'
import { useState } from 'react'
import { useTheme } from '@/shared/hooks/useTheme'
import {
	ThemePreview,
	ThemeProvider,
	ThemeSwatches,
	resolveTheme,
	useThemesQuery,
} from '@/shared/preferences/theme'
import { DEFAULT_COLUMN_IDS } from '@/features/tasks/model/taskBoard'
import { MAX_COLUMNS } from '@/features/tasks/model/taskColumn'
import { HERO_COUNT } from '../model/heros'
import { CanvasGrid } from './CanvasSelection'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { cn } from '@/shared/lib/utils'
import { LazyMotion, domMax, m, AnimatePresence, useReducedMotion } from 'motion/react'

interface CreateBoardDialogProps {
	hasNoBoards?: boolean
}

const SETUP_STEPS = ['name', 'columns', 'theme', 'canvas'] as const
const LAST_STEP = SETUP_STEPS.length - 1

const initialState = (themeId: string) => ({
	isOpen: false,
	step: 0,
	/** 1 = avanza, -1 = retrocede */
	dir: 1,
	name: '',
	columns: DEFAULT_COLUMN_IDS.map(newColumn),
	themeId,
	cardCanvas: Math.floor(Math.random() * HERO_COUNT),
})

function CreateBoardDialog({ hasNoBoards = false }: CreateBoardDialogProps) {
	const { t } = useTranslation()
	const colors = useTheme()
	const { createAnEmptyBoard } = useDashboardQuery()
	const [state, setState] = useState(() => initialState(colors.id))
	const set = (patch: Partial<typeof state>) => setState((s) => ({ ...s, ...patch }))

	// Por defecto las columnas, la carátula random y el tema del dashboard los pone el server
	const create = (withSetup: boolean) => {
		const { name, themeId, cardCanvas } = state
		const columns = state.columns.map((c) => c.name)
		const promise = createAnEmptyBoard(
			withSetup ? { name, columns, themeId, cardCanvas } : { name, themeId: colors.id }
		)

		toast.promise(promise, {
			loading: t('dashboard.creating_board'),
			success: () => {
				set({ isOpen: false })
				return t('dashboard.create_success')
			},
			error: (error) => error.message || t('dashboard.create_error'),
		})
	}

	const handleOpenChange = (open: boolean) =>
		setState(open ? { ...initialState(colors.id), isOpen: true } : { ...state, isOpen: false })

	const step = SETUP_STEPS[state.step]
	const goTo = (next: number) => set({ step: next, dir: next > state.step ? 1 : -1 })
	const reduceMotion = useReducedMotion()
	const offset = reduceMotion ? 0 : 24
	const slide = {
		enter: (dir: number) => ({ opacity: 0, x: dir * offset }),
		center: { opacity: 1, x: 0 },
		exit: (dir: number) => ({ opacity: 0, x: dir * -offset }),
	}

	return (
		<Dialog open={state.isOpen} onOpenChange={handleOpenChange}>
			<DialogTrigger asChild>
				<Button variant='secondary' className='flex items-center'>
					<PlusIcon className='mr-2' />{' '}
					{hasNoBoards ? t('dashboard.create_first_board') : t('dashboard.create_board')}
				</Button>
			</DialogTrigger>
			<DialogContent
				className={cn(
					'sm:max-w-md md:max-w-2xl max-h-[90dvh] overflow-y-auto',
					colors.column,
					colors.columnText
				)}
			>
				<DialogHeader>
					<DialogTitle>
						{t('dashboard.new_board_title')}
						{state.step > 0 && ` · ${t(`dashboard.setup_step_${step}`)}`}
					</DialogTitle>
					<DialogDescription>
						{state.step === 0
							? t('dashboard.new_board_description')
							: t('dashboard.setup_progress', { step: state.step, total: LAST_STEP })}
					</DialogDescription>
				</DialogHeader>

				<LazyMotion features={domMax}>
					{/* layout (transform, no height): el modal crece/encoge suave entre pasos. */}
					<m.div
						className='overflow-hidden -m-1'
						layout={!reduceMotion}
						transition={{ duration: 0.25, ease: 'easeInOut' }}
					>
						<div className='p-1'>
							<AnimatePresence mode='wait' initial={false} custom={state.dir}>
								<m.div
									key={step}
									layout={reduceMotion ? false : 'position'}
									custom={state.dir}
									variants={slide}
									initial='enter'
									animate='center'
									exit='exit'
									transition={{ duration: 0.18, ease: 'easeOut' }}
								>
									{step === 'name' && (
										<NameStep
											value={state.name}
											onChange={(name) => set({ name })}
											onSubmit={() => create(false)}
										/>
									)}
									{step === 'columns' && (
										<ColumnsStep
											columns={state.columns}
											onChange={(columns) => set({ columns })}
										/>
									)}
									{step === 'theme' && (
										<ThemeStep
											value={state.themeId}
											onChange={(themeId) => set({ themeId })}
										/>
									)}
									{step === 'canvas' && (
										<CanvasGrid
											value={state.cardCanvas}
											onChange={(cardCanvas) => set({ cardCanvas })}
										/>
									)}
								</m.div>
							</AnimatePresence>
						</div>
					</m.div>
				</LazyMotion>

				<DialogFooter className='sm:justify-start gap-2'>
					{state.step === 0 ? (
						<>
							<Button type='button' variant='default' onClick={() => create(false)}>
								{t('dashboard.create_default_board')}
							</Button>
							<Button
								type='button'
								variant='secondary'
								disabled={!state.name.trim()}
								onClick={() => goTo(1)}
							>
								{t('dashboard.initial_setup')}
							</Button>
						</>
					) : (
						<>
							<Button
								type='button'
								variant='secondary'
								onClick={() => goTo(state.step - 1)}
							>
								{t('dashboard.back')}
							</Button>
							{state.step < LAST_STEP ? (
								<Button
									type='button'
									variant='default'
									disabled={
										step === 'columns' &&
										state.columns.some((c) => !c.name.trim())
									}
									onClick={() => goTo(state.step + 1)}
								>
									{t('dashboard.next')}
								</Button>
							) : (
								<Button
									type='button'
									variant='default'
									onClick={() => create(true)}
								>
									{t('dashboard.create_board')}
								</Button>
							)}
						</>
					)}
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}

export default CreateBoardDialog

/** Key estable por columna: el nombre cambia al tipear y el índice al borrar. */
let nextColumnKey = 0
const newColumn = (name: string) => ({ key: nextColumnKey++, name })
type SetupColumn = ReturnType<typeof newColumn>

function NameStep({
	value,
	onChange,
	onSubmit,
}: {
	value: string
	onChange: (name: string) => void
	onSubmit: () => void
}) {
	const { t } = useTranslation()
	const colors = useTheme()
	return (
		<form
			className='grid mr-2 w-full items-center gap-1.5'
			onSubmit={(e) => {
				e.preventDefault()
				onSubmit()
			}}
		>
			<Label className={cn(colors.taskText || 'text-black', colors.columnText)}>
				{t('dashboard.name_label')}
			</Label>
			<Input
				type='text'
				placeholder={t('dashboard.name_placeholder')}
				value={value}
				onChange={(e) => onChange(e.target.value)}
				autoFocus
			/>
		</form>
	)
}

function ColumnsStep({
	columns,
	onChange,
}: {
	columns: SetupColumn[]
	onChange: (columns: SetupColumn[]) => void
}) {
	const { t } = useTranslation()
	const columnLabel = (name: string) =>
		DEFAULT_COLUMN_IDS.includes(name) ? t(`default_columns.${name}`) : name
	return (
		<div className='grid gap-2'>
			{columns.map((column, index) => (
				<div key={column.key} className='flex gap-2 items-center'>
					<Input
						type='text'
						aria-label={t('dashboard.column_label', { n: index + 1 })}
						value={columnLabel(column.name)}
						onChange={(e) =>
							onChange(
								columns.map((c) =>
									c.key === column.key ? { ...c, name: e.target.value } : c
								)
							)
						}
						maxLength={29}
					/>
					<Button
						type='button'
						variant='ghost'
						size='icon'
						aria-label={t('dashboard.remove_column')}
						disabled={columns.length === 1}
						onClick={() => onChange(columns.filter((c) => c.key !== column.key))}
					>
						<TrashIcon />
					</Button>
				</div>
			))}
			<Button
				type='button'
				variant='secondary'
				className='justify-self-start'
				disabled={columns.length >= MAX_COLUMNS}
				onClick={() => onChange([...columns, newColumn('')])}
			>
				<PlusIcon className='mr-2' /> {t('dashboard.add_column')}
			</Button>
		</div>
	)
}

function ThemeStep({ value, onChange }: { value: string; onChange: (themeId: string) => void }) {
	const { themes } = useThemesQuery()
	return (
		<div className='flex flex-col gap-4'>
			<ThemeProvider theme={resolveTheme(value, themes)} changeTheme={() => {}}>
				<ThemePreview />
			</ThemeProvider>
			<ThemeSwatches paginated value={value} onChange={onChange} />
		</div>
	)
}
