'use server'

import { getGithubStars } from '@/shared/lib/githubStars'
import RootPage from './RootPage'

export default async function Page() {
	const stars = await getGithubStars()
	return <RootPage stars={stars} />
}
