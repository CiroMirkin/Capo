export async function getGithubStars(): Promise<number | undefined> {
	try {
		const res = await fetch('https://api.github.com/repos/CiroMirkin/Capo', {
			next: { revalidate: 3600 },
		})
		if (!res.ok) return undefined
		const { stargazers_count } = await res.json()
		return typeof stargazers_count === 'number' ? stargazers_count : undefined
	} catch {
		return undefined
	}
}
