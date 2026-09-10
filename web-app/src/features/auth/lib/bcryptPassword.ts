import bcrypt from 'bcryptjs'

/*
 Override de hashing para Better Auth. Por defecto usa scrypt; los hashes que ya
 están en la DB son bcrypt ($2a$). Con esto los logins existentes siguen andando
 sin reset. Es el punto más frágil de la migración a Better Auth → tiene test.
*/
export const bcryptPassword = {
	hash: (password: string) => bcrypt.hash(password, 12),
	verify: ({ hash, password }: { hash: string; password: string }) =>
		bcrypt.compare(password, hash),
}
