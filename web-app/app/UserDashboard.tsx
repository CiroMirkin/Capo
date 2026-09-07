'use client'

import { useSession } from '@/features/auth'
import { defaultBoard } from '@/features/boards'
import { useTheme } from '@/shared/hooks/useTheme'
import { Dashboard } from '@/features/dashboard'
import { Spinner } from '@/shared/ui/atoms/spinner'
import { USER_IS_IN } from '@/shared/ui/organisms/userIsIn'
import { redirect } from 'next/navigation'
import PageContainer from './_components/PageContainer'
import { useDocumentTitle } from '@uidotdev/usehooks'

function UserDashboard() {
	useDocumentTitle('Tableros - Capo')
	const { bg } = useTheme()
	const whereUserIs = USER_IS_IN.DASHBOARD
	const { session, isLoading } = useSession()

	if (!isLoading && !session) {
		redirect(`/board/${defaultBoard.id}`)
	}

	if (isLoading) {
		return (
			<PageContainer title='Capo' whereUserIs={whereUserIs}>
				<div className='min-w-48 min-h-64 md:min-h-[60vh] flex items-center justify-center'>
					<Spinner size={30} />
				</div>
			</PageContainer>
		)
	}

	return (
		<div className={`${bg}`}>
			<PageContainer title='Capo' whereUserIs={whereUserIs} showBoardNavigation={false}>
				<section className='min-h-[calc(100vh-5rem)] px-4 md:px-8'>
					<Dashboard />
				</section>
			</PageContainer>
		</div>
	)
}

export default UserDashboard
