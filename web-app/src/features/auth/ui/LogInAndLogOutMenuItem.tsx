'use client'

import { DropdownMenuItem } from '@/shared/ui/molecules/dropdown-menu'
import { USER_IS_IN } from '@/shared/ui/organisms/userIsIn'
import { TransitionLink } from '@/shared/ui/atoms/TransitionLink'
import { LogInIcon, LogOutIcon } from '@/shared/ui/atoms/icons'
import { useTranslation } from 'react-i18next'
import { signOut } from 'next-auth/react'
import { toast } from 'sonner'
import { useBoardId } from '../state/store'
import type { SessionType } from '../contexts/SessionProvider'

interface LogInAndLogOutMenuItemProps {
	whereUserIs?: USER_IS_IN
	session: SessionType
}

export default function LogInAndLogOutMenuItem({
	whereUserIs,
	session,
}: LogInAndLogOutMenuItemProps) {
	const { t } = useTranslation()
	const { board_id } = useBoardId()

	const handleOnClick = async () => {
		const logOutPromise = async () => {
			sessionStorage.removeItem('isInitialLoad')
			await signOut({ callbackUrl: '/' })
		}

		toast.promise(logOutPromise(), {
			loading: t('loading', { defaultValue: 'Cargando...' }),
			success: t('successful_log_out_toast'),
			error: (error: Error) => {
				return (
					error.message || t('log_out_error', { defaultValue: 'Error al cerrar sesión' })
				)
			},
		})
	}

	return (
		<DropdownMenuItem disabled={whereUserIs === USER_IS_IN.AUTH && true}>
			{!session ? (
				<TransitionLink to={`/auth/${board_id}`} className='px-2 py-1.5 flex items-center'>
					<LogInIcon className='mr-2' />
					{t('sing_in')}
				</TransitionLink>
			) : (
				<button
					type='button'
					onClick={handleOnClick}
					className='w-full px-2 py-1.5 flex items-center'
				>
					<LogOutIcon className='mr-2' />
					{t('log_out')}
				</button>
			)}
		</DropdownMenuItem>
	)
}
