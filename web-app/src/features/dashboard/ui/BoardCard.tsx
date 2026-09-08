import { TransitionLink } from '@/shared/ui/atoms/TransitionLink'
import { useTranslation } from 'react-i18next'
import { useThemesQuery } from '@/shared/preferences/theme/hooks/useThemesQuery'
import { resolveTheme } from '@/shared/preferences/theme/model/resolveTheme'
import { heros } from './heros'
import { cn } from '@/shared/lib/utils'

interface Board {
	name: string
	id: string
	cardCanvas?: number
	themeId?: string
}

function BoardCard({ board }: { board: Board }) {
	const { t } = useTranslation()
	const { themes } = useThemesQuery()
	const color = resolveTheme(board.themeId, themes)
	const hero = heros[board.cardCanvas ?? 0] ?? heros[0]

	const boardUrl = `/board/${board.id}`

	return (
		<li className='w-[18rem] flex flex-col rounded-md shadow-lg hover:shadow-xl transition-shadow ease-in group'>
			<div className={cn(color.column, 'h-28 w-full rounded-t-md')}>
				<TransitionLink
					to={boardUrl}
					title={t('dashboard.open_board', { boardName: board.name })}
				>
					{hero}
				</TransitionLink>
			</div>
			<div
				className={cn(color.task, color.taskText ?? 'text-black', 'text-left rounded-b-md')}
			>
				<TransitionLink
					to={boardUrl}
					title={t('dashboard.open_board', { boardName: board.name })}
				>
					<h2 className='py-4 px-4 text-base font-semibold rounded-b-md hover:underline'>
						{board.name}
					</h2>
				</TransitionLink>
			</div>
		</li>
	)
}

export default BoardCard
