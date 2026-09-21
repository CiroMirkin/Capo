'use client'

import { useSession } from '@/features/auth'
import { redirect } from 'next/navigation'
import { Home } from './home/Home'

export default function RootPage({ stars }: { stars?: number }) {
	const { session, isLoading } = useSession()

	if (!isLoading && session) {
		redirect('/dashboard')
	}

	return <Home stars={stars} />
}
