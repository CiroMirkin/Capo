import { useTheme } from '@/shared/hooks/useTheme'
import { TransitionLink } from '@/shared/ui/atoms/TransitionLink'
import { useTranslation } from 'react-i18next'
import { heros } from './heros'

interface Board {
	name: string
	id: string
	cardCanvas?: number
}

function BoardCard({ board }: { board: Board }) {
	const { t } = useTranslation()
	const color = useTheme()
	const hero = heros[board.cardCanvas ?? 0] ?? heros[0]

	const boardUrl = `/board/${board.id}`

	return (
		<li
			className={`w-[18rem] flex flex-col rounded-md shadow-lg hover:shadow-xl transition-shadow ease-in group`}
		>
			<div className={`h-28 w-full ${color.column} rounded-t-md`}>
				<TransitionLink
					to={boardUrl}
					title={t('dashboard.open_board', { boardName: board.name })}
				>
					{hero}
				</TransitionLink>
			</div>
			<div className={`text-left ${color.task} ${color.taskText} rounded-b-md`}>
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
