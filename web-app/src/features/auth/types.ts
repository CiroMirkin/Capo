export type SessionUser = {
	id: string
	email?: string | null
	name?: string | null
	image?: string | null
}

export type SessionType = {
	user: SessionUser
	expires: string
} | null
