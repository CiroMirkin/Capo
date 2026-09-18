'use client'

import { cn } from '@/shared/lib/utils'

interface NavRailBackdropProps {
	column: string
	isRight: boolean
	active: boolean
}

/** Respaldo temporal: entra ~200ms después de que aparece la escala (paso 2 → 3). */
export function NavRailBackdrop({ column, isRight, active }: NavRailBackdropProps) {
	return (
		<span
			aria-hidden
			className={cn(
				'pointer-events-none absolute inset-0 transition-opacity duration-200 motion-reduce:transition-none shadow-sm',
				column,
				isRight ? 'rounded-l-lg' : 'rounded-r-lg',
				active ? 'opacity-100 delay-200' : 'opacity-0 delay-0'
			)}
		/>
	)
}
