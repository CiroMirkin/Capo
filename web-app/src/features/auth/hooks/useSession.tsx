'use client'

import { useMemo } from 'react'
import { authClient } from '../lib/authClient'
import type { SessionType } from '../types'

export const useSession = () => {
	const { data, isPending, refetch } = authClient.useSession()

	const session: SessionType = useMemo(
		() =>
			data?.user
				? {
						user: {
							id: data.user.id,
							email: data.user.email,
							name: data.user.name,
							image: data.user.image,
						},
						expires: new Date(data.session.expiresAt).toISOString(),
					}
				: null,
		[data]
	)

	return { session, isLoading: isPending, update: refetch }
}
