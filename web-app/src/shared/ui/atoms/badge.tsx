'use client'

import { useEffect } from 'react'

export const badgeVariants = {
	gray: 'bg-[#8f8f8f] text-white fill-white',
	'gray-subtle':
		'bg-[#ebebeb] dark:bg-[#1f1f1f] text-[#171717] dark:text-[#ededed] fill-[#171717] dark:fill-[#ededed]',
	blue: 'bg-[#006bff] text-white fill-white',
	'blue-subtle':
		'bg-[#e9f4ff] dark:bg-[#022248] text-[#005ff2] dark:text-[#47a8ff] fill-[#005ff2] dark:fill-[#47a8ff]',
	purple: 'bg-[#a000f8] text-white fill-white',
	'purple-subtle':
		'bg-[#f9f0ff] dark:bg-[#341142] text-[#7d00cc] dark:text-[#c472fb] fill-[#7d00cc] dark:fill-[#c472fb]',
	amber: 'bg-[#ffae00] text-black fill-black',
	'amber-subtle':
		'bg-[#fff4cf] dark:bg-[#361900] text-[#aa4d00] dark:text-[#ff9300] fill-[#aa4d00] dark:fill-[#ff9300]',
	red: 'bg-[#fc0035] text-white fill-white',
	'red-subtle':
		'bg-[#ffe8ea] dark:bg-[#440d13] text-[#d8001b] dark:text-[#ff565f] fill-[#d8001b] dark:fill-[#ff565f]',
	pink: 'bg-[#f22782] text-white fill-white',
	'pink-subtle':
		'bg-[#ffdfeb] dark:bg-[#571032] text-[#c41562] dark:text-[#ff4d8d] fill-[#c41562] dark:fill-[#ff4d8d]',
	green: 'bg-[#28a948] text-white fill-white',
	'green-subtle':
		'bg-[#e5fce7] dark:bg-[#00320b] text-[#107d32] dark:text-[#00ca50] fill-[#107d32] dark:fill-[#00ca50]',
	teal: 'bg-[#00ac96] text-white fill-white',
	'teal-subtle':
		'bg-[#ccf9f1] dark:bg-[#003d34] text-[#007f70] dark:text-[#00cfb7] fill-[#007f70] dark:fill-[#00cfb7]',
	inverted:
		'bg-[#171717] dark:bg-[#ededed] text-[#f2f2f2] dark:text-[#1a1a1a] fill-[#f2f2f2] dark:fill-[#1a1a1a]',
	trial: 'bg-gradient-to-br from-[#0070F3] to-[#F81CE5] text-white fill-white',
	turbo: 'bg-gradient-to-br from-[#ff1e56] to-[#0096ff] text-white fill-white',
}

export const badgeSizes = {
	sm: 'text-base h-5 px-1.5 tracking-[0.2px] gap-[3px]',
	md: 'text-[12px] h-6 px-2.5 tracking-normal gap-1',
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
	size = 'md',
	capitalize = true,
	icon,
}) => {
	useEffect(() => {
		injectStyles()
	}, [])

	const className = `inline-flex justify-center items-center shrink-0 rounded text-sm font-semibold whitespace-nowrap tabular-nums ${badgeVariants[variant]} ${badgeSizes[size]}${capitalize ? ' capitalize' : ''}`

	return (
		<div className={className}>
			{icon && <span className={`${size}IconContainer`}>{icon}</span>}
			{children}
		</div>
	)
}
