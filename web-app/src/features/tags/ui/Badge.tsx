'use client'

import { useEffect } from 'react'
import { cn } from '@/shared/lib/utils'
import { tagVariantsList } from '../model/tagVariants'

// fill-* espeja text-* 1:1 (mismo color, para el ícono en vez del texto)
const toFillClass = (text: string): string => text.replace(/text-/g, 'fill-')

export const badgeVariants = {
	...Object.fromEntries(
		tagVariantsList.map(({ id, bg, text }) => [id, `${bg} ${text} ${toFillClass(text)}`])
	),
	'teal-subtle':
		'bg-[#ccf9f1] dark:bg-[#003d34] text-[#007f70] dark:text-[#00cfb7] fill-[#007f70] dark:fill-[#00cfb7]',
	turbo: 'bg-gradient-to-br from-[#ff1e56] to-[#0096ff] text-white fill-white',
} as Record<(typeof tagVariantsList)[number]['id'] | 'teal-subtle' | 'turbo', string>

export const badgeSizes = {
	sm: 'text-xs font-normal h-5 px-1.5 tracking-[0.8px] gap-[3px]',
	md: 'text-[13px] h-6 px-2.5 tracking-[0.4px] gap-1',
	lg: 'text-[14px] h-8 px-3 tracking-normal gap-1.5',
}

interface BadgeProps {
	children?: React.ReactNode
	variant?: keyof typeof badgeVariants
	size?: keyof typeof badgeSizes
	capitalize?: boolean
	icon?: React.ReactNode
}

let stylesInjected = false

const injectStyles = (): void => {
	if (stylesInjected) return

	const style = document.createElement('style')
	style.textContent = `
    .smIconContainer svg {
      width: 11px;
      height: 11px;
    }
    .mdIconContainer svg {
      width: 14px;
      height: 14px;
    }
    .lgIconContainer svg {
      width: 16px;
      height: 16px;
    }
  `
	document.head.appendChild(style)
	stylesInjected = true
}

export const Badge: React.FC<BadgeProps> = ({
	children,
	variant = 'gray',
	size = 'sm',
	capitalize = true,
	icon,
}) => {
	useEffect(() => {
		injectStyles()
	}, [])

	const className = cn(
		'inline-flex justify-center items-center shrink-0 rounded text-sm font-semibold whitespace-nowrap tabular-nums',
		badgeVariants[variant],
		badgeSizes[size],
		capitalize && 'capitalize'
	)

	return (
		<div className={className}>
			{icon && <span className={`${size}IconContainer`}>{icon}</span>}
			{children}
		</div>
	)
}
