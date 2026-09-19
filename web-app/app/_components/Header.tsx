'use client'

import { USER_IS_IN } from '@/shared/ui/organisms/userIsIn'
import { Notes } from '@/features/notes'
import { useTypeOfView } from '@/shared/preferences/view-mode'
import { cn } from '@/shared/lib/utils'
import { HeaderNav } from './HeaderNav'

interface HeaderProps {
	title: string
	whereUserIs?: USER_IS_IN
	showBoardNavigation?: boolean
}

export function Header({ title, whereUserIs, showBoardNavigation = true }: HeaderProps) {
	const typeOfView = useTypeOfView()

	const showBoardLinks = showBoardNavigation && whereUserIs !== USER_IS_IN.DASHBOARD
	const showNotes = showBoardNavigation && typeOfView !== 'NOTE-LIST'

	return (
		// h-20 (5rem) fijo: el resto de la app asume esta altura para calc(100vh-5rem) - (PageContainer, LimboCanvas, LimboMobileGrid, UserDashboard).
		<header className='w-full h-20 px-6 md:px-11 flex justify-between items-center'>
			<h1 className={cn('text-xl font-medium', whereUserIs === USER_IS_IN.BOARD && 'opacity-60')}>{title}</h1>
			<div className='flex gap-2 items-center'>
				{showNotes && <Notes />}
				<HeaderNav whereUserIs={whereUserIs} showBoardLinks={showBoardLinks} />
			</div>
		</header>
	)
}
