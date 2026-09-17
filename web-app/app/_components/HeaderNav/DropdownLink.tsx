'use client'

import { DropdownMenuItem, DropdownMenuSeparator } from '@/shared/ui/molecules/dropdown-menu'
import { TransitionLink } from '@/shared/ui/atoms/TransitionLink'
import type { LinkItem } from '../navLinks'

/** El `group` del item indica un corte de sección: antepone el separador. */
export function DropdownLink({ item }: { item: LinkItem }) {
	const Icon = item.icon
	let control: React.ReactNode
	if (item.onClick) {
		control = (
			<DropdownMenuItem asChild>
				<button type='button' onClick={item.onClick} className='w-full px-2 py-1.5 flex items-center'>
					<Icon className='mr-2' /> {item.label}
				</button>
			</DropdownMenuItem>
		)
	} else if (item.external) {
		control = (
			<DropdownMenuItem asChild>
				<a href={item.to} target='_blank' rel='noreferrer' className='px-2 py-1.5 flex items-center'>
					<Icon className='mr-2' /> {item.label}
				</a>
			</DropdownMenuItem>
		)
	} else {
		control = (
			<DropdownMenuItem asChild disabled={item.current}>
				<TransitionLink to={item.to as string} title={item.title} className='px-2 py-1.5 flex items-center'>
					<Icon className='mr-2' /> {item.label}
				</TransitionLink>
			</DropdownMenuItem>
		)
	}
	return (
		<>
			{item.group && <DropdownMenuSeparator />}
			{control}
		</>
	)
}
