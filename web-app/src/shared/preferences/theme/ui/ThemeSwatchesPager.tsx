'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/shared/ui/atoms/button'
import type { Theme } from '../model/themesList'
import { Swatch } from './Swatch'

const PAGE_SIZE = 12

interface Props {
	themes: Theme[]
	value: string
	onChange: (id: string) => void
}

/** Temas por páginas con Atrás/Siguiente; arranca en la página del tema elegido. */
export function ThemeSwatchesPager({ themes, value, onChange }: Props) {
	const { t } = useTranslation()
	const pageCount = Math.max(1, Math.ceil(themes.length / PAGE_SIZE))
	const [page, setPage] = useState(() =>
		Math.max(0, Math.floor(themes.findIndex((th) => th.id === value) / PAGE_SIZE))
	)
	const current = Math.min(page, pageCount - 1)
	const visible = themes.slice(current * PAGE_SIZE, (current + 1) * PAGE_SIZE)

	return (
		<div className='flex flex-col gap-3'>
			<div className='grid grid-cols-4 sm:grid-cols-6 gap-2 justify-items-center'>
				{visible.map((color) => (
					<Swatch
						key={color.id}
						theme={color}
						selected={value == color.id}
						onClick={() => onChange(color.id)}
					/>
				))}
			</div>

			{pageCount > 1 && (
				<div className='flex items-center justify-center gap-3'>
					<Button
						type='button'
						variant='secondary'
						size='sm'
						disabled={current === 0}
						onClick={() => setPage(current - 1)}
					>
						{t('theme_pager.prev')}
					</Button>
					<span className='text-sm tabular-nums' aria-live='polite'>
						{current + 1} / {pageCount}
					</span>
					<Button
						type='button'
						variant='secondary'
						size='sm'
						disabled={current === pageCount - 1}
						onClick={() => setPage(current + 1)}
					>
						{t('theme_pager.next')}
					</Button>
				</div>
			)}
		</div>
	)
}
