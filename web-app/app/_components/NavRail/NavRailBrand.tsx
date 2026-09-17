'use client'

import { cn } from '@/shared/lib/utils'
import { APP_NAME } from '../navLinks'

interface NavRailBrandProps {
	session: boolean
	active: boolean
}

/** Nombre de la app: visible solo sin sesión. */
export function NavRailBrand({ session, active }: NavRailBrandProps) {
	if (session) return null

	return (
		<span
			className={cn(
				'relative z-10 overflow-hidden whitespace-nowrap px-2 pb-1 text-sm font-medium transition-[max-width,opacity] duration-150 motion-reduce:transition-none',
				active ? 'max-w-[15rem] opacity-100 delay-200' : 'max-w-0 opacity-0 delay-0'
			)}
		>
			{APP_NAME}
		</span>
	)
}
