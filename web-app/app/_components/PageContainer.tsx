import { useTheme } from '@/shared/hooks/useTheme'
import { Header } from './Header'
import NavRail from './NavRail'
import { USER_IS_IN } from '@/shared/ui/organisms/userIsIn'
import { ReactNode } from 'react'

interface PageContainerProps {
	children: ReactNode
	whereUserIs: USER_IS_IN
	title?: string
	className?: string
	showBoardNavigation?: boolean
}

export default function PageContainer({
	children,
	whereUserIs,
	title = 'Capo',
	className = '',
	showBoardNavigation = true,
}: PageContainerProps) {
	const { bg, text } = useTheme()
	const showRail = showBoardNavigation && whereUserIs !== USER_IS_IN.DASHBOARD
	return (
		<div className={`${bg} ${text}`}>
			<Header
				title={title}
				whereUserIs={whereUserIs}
				showBoardNavigation={showBoardNavigation}
			/>
			<main className={`w-full min-h-[calc(100vh-5rem)] ${className}`}>{children}</main>
			{showRail && <NavRail whereUserIs={whereUserIs} />}
		</div>
	)
}
