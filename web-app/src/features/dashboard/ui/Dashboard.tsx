import BoardCard from './BoardCard'
import { useDashboardQuery } from '../hooks/useDashboardQuery'
import CreateBoardDialog from './CreateBoardDialog'
import { SharedWithMe } from './SharedWithMe'
import { Spinner } from '@/shared/ui/atoms/spinner'
import { LayoutIcon } from '@/shared/ui/atoms/icons'
import { useTheme } from '@/shared/hooks/useTheme'
import { useTranslation } from 'react-i18next'

function Dashboard() {
	const { t } = useTranslation()
	const { boards, isLoading } = useDashboardQuery()
	const hasNoBoards = boards.length === 0
	const colors = useTheme()

	if (isLoading) {
		return (
			<section className='w-full min-h-64 md:min-h-[60vh] grid place-items-center'>
				<Spinner size={30} />
			</section>
		)
	}

	return (
		<section className={`min-w-48 pt-4 h-full ${colors.text}`}>
			{hasNoBoards && (
				<div className='grid place-items-center h-full px-4 md:pt-12 gap-2 text-center'>
					<div className='relative mb-4'>
						<div className='w-32 h-32 rounded-3xl bg-secondary/20 backdrop-blur-sm flex items-center justify-center md:animate-float'>
							<LayoutIcon className='w-16 h-16 text-secondary' strokeWidth={1.5} />
						</div>
						<div className='absolute -bottom-2 left-1/2 -translate-x-1/2 w-24 h-4 bg-primary/30 rounded-full blur-xl' />
					</div>
					<div>
						<h2 className='opacity-90 text-3xl font-semibold text-foreground mb-3'>
							{t('dashboard.title')}
						</h2>
						<p className='opacity-70 max-w-md mb-8 text-lg'>
							{t('dashboard.description')}
						</p>
					</div>
					<CreateBoardDialog hasNoBoards />
				</div>
			)}

			<ul className='px-2 list-none flex justify-center md:justify-start flex-wrap gap-6'>
				{boards.map((board) => (
					<BoardCard board={board} key={board.id} />
				))}

				{!hasNoBoards && (
					<li className='self-end '>
						<CreateBoardDialog />
					</li>
				)}
			</ul>

			<SharedWithMe />
		</section>
	)
}

export default Dashboard
