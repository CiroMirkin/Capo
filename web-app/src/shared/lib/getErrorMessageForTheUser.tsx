import * as Sentry from '@sentry/nextjs'
import BusinessError from '@/shared/errors/businessError'

function getErrorMessageForTheUser(error: unknown): string {
	if (error instanceof BusinessError) {
		return error.message
	} else {
		Sentry.captureException(error)
		return 'Lo sentimos, hubo un error imprevisto :('
	}
}

export default getErrorMessageForTheUser
