'use client'

import { useState } from 'react'
import * as PopoverPrimitive from '@radix-ui/react-popover'
import { motion, AnimatePresence, useReducedMotion } from 'motion/react'
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import { addDay, addMonth, format, monthStart, date as tempoDate } from '@formkit/tempo'
import { useTranslation } from 'react-i18next'
import { cn } from '@/shared/lib/utils'

interface DatePickerProps {
	value: string | null
	onChange: (value: string | null) => void
}

const WEEKDAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
const WEEKDAYS: Record<'es' | 'en', string[]> = {
	es: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
	en: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
}

/** 6 semanas × 7 días, empezando el domingo, cubriendo `month`. */
const buildGrid = (month: Date): Date[] => {
	const first = monthStart(month)
	const start = addDay(first, -first.getDay())
	return Array.from({ length: 42 }, (_, i) => addDay(start, i))
}

export function DatePicker({ value, onChange }: DatePickerProps) {
	const { t, i18n } = useTranslation()
	const locale = i18n.language === 'en' ? 'en' : 'es'
	const reduce = useReducedMotion()
	const [open, setOpen] = useState(false)
	const [month, setMonth] = useState(() => monthStart(new Date()))

	const today = format(new Date(), 'YYYY-MM-DD')
	const grid = buildGrid(month)
	const shortPattern = locale === 'en' ? 'MMM D' : 'D MMM'
	const label = value ? format(tempoDate(value), shortPattern, locale) : t('due_date.picker_btn')

	const pick = (iso: string) => {
		onChange(iso)
		setOpen(false)
	}

	return (
		<PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
			<PopoverPrimitive.Trigger asChild>
				<button
					type='button'
					title={t('due_date.picker_btn')}
					className={cn(
						'px-1.5 py-1.5 rounded-lg text-sm transition-colors border flex items-center gap-1 whitespace-nowrap',
						value
							? 'border-black text-black'
							: 'border-zinc text-black hover:border-black'
					)}
				>
					<Calendar className='w-5 h-5 md:w-4 md:h-4' />
					<span className={cn(!value && 'sr-only')}>{label}</span>
				</button>
			</PopoverPrimitive.Trigger>

			<AnimatePresence>
				{open && (
					<PopoverPrimitive.Portal forceMount>
						<PopoverPrimitive.Content
							forceMount
							side='top'
							align='end'
							sideOffset={8}
							className='z-50'
						>
							<motion.div
								initial={{ opacity: 0, scale: reduce ? 1 : 0.96 }}
								animate={{ opacity: 1, scale: 1 }}
								exit={{ opacity: 0, scale: reduce ? 1 : 0.96 }}
								transition={{
									duration: reduce ? 0.1 : 0.16,
									ease: [0.22, 1, 0.36, 1],
								}}
								style={{ transformOrigin: 'bottom right' }}
								className='w-[min(16rem,calc(100vw-1.5rem))] rounded-lg border border-border bg-white p-3 text-black shadow-lg'
							>
								<div className='flex items-center justify-between'>
									<button
										type='button'
										aria-label={t('due_date.prev_month')}
										onClick={() => setMonth(addMonth(month, -1))}
										className='p-1 rounded-sm hover:bg-neutral-100'
									>
										<ChevronLeft className='w-4 h-4' />
									</button>
									<span className='text-sm font-bold capitalize'>
										{format(month, 'MMMM YYYY', locale)}
									</span>
									<button
										type='button'
										aria-label={t('due_date.next_month')}
										onClick={() => setMonth(addMonth(month, 1))}
										className='p-1 rounded-sm hover:bg-neutral-100'
									>
										<ChevronRight className='w-4 h-4' />
									</button>
								</div>

								<div className='mt-2 grid grid-cols-7 gap-0.5 text-center text-xs text-neutral-500'>
									{WEEKDAYS[locale].map((d, i) => (
										<span key={WEEKDAY_KEYS[i]} className='py-1'>
											{d}
										</span>
									))}
								</div>

								<div className='grid grid-cols-7 gap-0.5'>
									{grid.map((day) => {
										const iso = format(day, 'YYYY-MM-DD')
										const inMonth = day.getMonth() === month.getMonth()
										const isPast = iso < today
										const isSelected = value === iso
										return (
											<button
												key={iso}
												type='button'
												disabled={isPast}
												onClick={() => pick(iso)}
												className={cn(
													'h-8 w-8 rounded-sm text-sm transition-colors',
													!inMonth && 'text-neutral-400',
													isPast && 'text-neutral-300 cursor-not-allowed',
													isSelected && 'bg-black text-white font-bold',
													!isSelected && !isPast && 'hover:bg-neutral-100'
												)}
											>
												{day.getDate()}
											</button>
										)
									})}
								</div>

								{value && (
									<button
										type='button'
										onClick={() => {
											onChange(null)
											setOpen(false)
										}}
										className='mt-2 w-full text-sm text-neutral-500 hover:text-black'
									>
										{t('due_date.picker_remove')}
									</button>
								)}
							</motion.div>
						</PopoverPrimitive.Content>
					</PopoverPrimitive.Portal>
				)}
			</AnimatePresence>
		</PopoverPrimitive.Root>
	)
}
