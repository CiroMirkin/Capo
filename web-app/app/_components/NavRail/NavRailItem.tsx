'use client'

import { TransitionLink } from '@/shared/ui/atoms/TransitionLink'
import { cn } from '@/shared/lib/utils'
import type { LinkItem } from '../navLinks'

interface NavRailItemProps {
	item: LinkItem
	active: boolean
	isLargeScreen: boolean
}

export function NavRailItem({ item, active, isLargeScreen }: NavRailItemProps) {
	const Icon = item.icon
	const body = (
		<>
			<Icon customSize={isLargeScreen ? 22 : undefined} />
			<span
				className={cn(
					'overflow-hidden whitespace-nowrap text-sm font-medium transition-[max-width,opacity] duration-150 motion-reduce:transition-none',
					active ? 'max-w-[15rem] opacity-100 delay-200' : 'max-w-0 opacity-0 delay-0'
				)}
			>
				{item.label}
			</span>
		</>
	)

	const shared =
		'flex items-center gap-3 rounded-sm px-2 py-1.5 outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:text-accent-foreground'

	let control
	if (item.current) {
		control = (
			<span aria-current='page' className={cn(shared, 'pointer-events-none opacity-40')}>
				{body}
			</span>
		)
	} else if (item.onClick) {
		control = (
			<button type='button' onClick={item.onClick} className={shared}>
				{body}
			</button>
		)
	} else if (item.external) {
		control = (
			<a href={item.to} target='_blank' rel='noreferrer' className={shared}>
				{body}
			</a>
		)
	} else {
		control = (
			<TransitionLink to={item.to as string} className={shared}>
				{body}
			</TransitionLink>
		)
	}

	return (
		<div className='contents'>
			{item.group && (
				<hr
					className={cn(
						'my-2 h-px border-0 transition-colors duration-150',
						active ? 'bg-muted' : 'bg-transparent'
					)}
				/>
			)}
			{control}
		</div>
	)
}
