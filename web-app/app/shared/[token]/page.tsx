import type { Metadata } from 'next'
import { SharedBoardView } from '@/features/board-share'

export const metadata: Metadata = { robots: { index: false, follow: false } }

interface Props {
	params: Promise<{ token: string }>
}

export default async function SharedBoardRoute({ params }: Props) {
	const { token } = await params
	return <SharedBoardView token={token} />
}
