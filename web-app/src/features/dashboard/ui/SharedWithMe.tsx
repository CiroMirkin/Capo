import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useSession } from '@/features/auth'
import { getBoardsSharedWithMe } from '@/features/board-share'
import BoardCard from './BoardCard'

export function SharedWithMe() {
	const { t } = useTranslation()
	const { session } = useSession()
	const { data: boards = [] } = useQuery({
		queryKey: ['boards-shared-with-me', session?.user.id],
		queryFn: () => getBoardsSharedWithMe(),
		enabled: !!session,
	})

	if (boards.length === 0) return null

	return (
		<section className='mt-10'>
			<h2 className='px-2 mb-4 text-xl font-semibold opacity-80'>
				{t('dashboard.shared_with_me')}
			</h2>
			<ul className='px-2 list-none flex justify-center md:justify-start flex-wrap gap-6'>
				{boards.map((board) => (
					<BoardCard
						key={board.token}
						board={{ ...board, id: board.token }}
						href={`/shared/${board.token}`}
					/>
				))}
			</ul>
		</section>
	)
}
