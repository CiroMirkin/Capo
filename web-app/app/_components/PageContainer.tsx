import { useTheme } from '@/shared/hooks/useTheme'
import { cn } from '@/shared/lib/utils'
import { usePageSurface, type PageId } from '@/shared/preferences/page-surface'
import { Header } from './Header'
import { NavRail } from './NavRail'
import { USER_IS_IN } from '@/shared/ui/organisms/userIsIn'
import { ReactNode } from 'react'

interface PageContainerProps {
	children: ReactNode
	whereUserIs: USER_IS_IN
	title?: string
	className?: string
	showBoardNavigation?: boolean
	/** Permite cambiar el color del fondo ente bg y column */
	allowSurface?: boolean
	/** Identifica la página para guardar su fondo. */
	pageId?: PageId
}

export default function PageContainer({
	children,
	whereUserIs,
	title = 'Capo',
	className = '',
	showBoardNavigation = true,
	allowSurface = false,
	pageId = { boardId: '', whereUserIs },
}: PageContainerProps) {
	const { bg, text, column, columnText } = useTheme()
	const [surface] = usePageSurface(pageId)
	const showRail = showBoardNavigation && whereUserIs !== USER_IS_IN.DASHBOARD
	const isColumnSurface = allowSurface && surface === 'column'

	return (
		<div className={cn(isColumnSurface ? [column, columnText] : [bg, text])}>
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
