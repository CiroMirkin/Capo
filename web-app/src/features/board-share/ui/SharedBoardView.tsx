'use client'

import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useDocumentTitle } from '@uidotdev/usehooks'
import { ThemeProvider } from '@/shared/preferences/theme'
import { useTheme } from '@/shared/hooks/useTheme'
import { cn } from '@/shared/lib/utils'
import { Spinner } from '@/shared/ui/atoms/spinner'
import { TransitionLink } from '@/shared/ui/atoms/TransitionLink'
import { Button } from '@/shared/ui/atoms/button'
import { useLogout } from '@/features/auth'
import { isDefaultBoardName } from '@/features/boards'
import { getSharedBoard } from '../api/actions/getSharedBoard'
import { ReadOnlyBoard } from './ReadOnlyBoard'

export function SharedBoardView({ token }: { token: string }) {
	const { t } = useTranslation()
	const logout = useLogout()

	// Sin polling ni refetch al enfocar
	// Cada fetch cuenta para el rate limit del link público.
	const { data, isLoading } = useQuery({
		queryKey: ['shared-board', token],
		queryFn: () => getSharedBoard({ token }),
		staleTime: Infinity,
		refetchOnWindowFocus: false,
		retry: false,
	})

	const boardName =
		data?.status === 'ok'
			? isDefaultBoardName(data.boardName)
				? t('board_name')
				: data.boardName
			: 'Capo'

	useDocumentTitle(`${boardName} - Capo`)

	if (isLoading) {
		return (
			<Message>
				<Spinner size={30} />
			</Message>
		)
	}

	if (data?.status === 'ok') {
		return (
			<ThemeProvider theme={data.theme} changeTheme={() => {}}>
				<ReadOnlyBoard name={boardName} taskBoard={data.taskBoard} />
			</ThemeProvider>
		)
	}

	if (data?.status === 'rate-limited') {
		return <Message>{t('shared_board.rate_limited')}</Message>
	}

	if (data?.status === 'login-required') {
		return (
			<Message>
				<p>{t('shared_board.login_required')}</p>
				<TransitionLink to='/auth' className='underline'>
					{t('shared_board.login_button')}
				</TransitionLink>
			</Message>
		)
	}

	if (data?.status === 'wrong-account') {
		return (
			<Message>
				<p>{t('shared_board.wrong_account')}</p>
				<Button variant='outline' onClick={logout}>
					{t('shared_board.logout_button')}
				</Button>
			</Message>
		)
	}

	return <Message>{t('shared_board.not_found')}</Message>
}

function Message({ children }: { children: React.ReactNode }) {
	const { bg, text } = useTheme()
	return (
		<main
			className={cn(
				bg,
				text,
				'min-h-screen px-6 flex flex-col items-center justify-center gap-3 text-center'
			)}
		>
			{children}
		</main>
	)
}
