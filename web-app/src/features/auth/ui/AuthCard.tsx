'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/shared/ui/molecules/card'
import { Button } from '@/shared/ui/atoms/button'
import { AuthForm } from './AuthForm'
import { OAuthProviders } from './OAuthProviders'
import { useAuth } from '../hooks/useAuth'

export default function AuthCard() {
	const [isRegister, setIsRegister] = useState(false)
	const [isSubmitted, setIsSubmitted] = useState(false)

	const { t } = useTranslation()

	const { loading, formData, handleAuth, handleGitHubAuth, resetForm } = useAuth(
		isRegister,
		setIsSubmitted
	)

	const toggleAuthMode = () => {
		setIsRegister(!isRegister)
		resetForm()
	}

	if (isSubmitted) {
		return null
	}

	const title = isRegister ? t('log_in_form_title') : t('sing_in')
	const toggleText = isRegister ? t('already_have_an_account') : t('dont_have_an_account')

	return (
		<Card className='rounded-lg px-6 py-2  shadow-2xl p-8 md:p-12 w-full max-w-md'>
			<CardHeader>
				<CardTitle>{title}</CardTitle>
			</CardHeader>
			<CardContent>
				<AuthForm
					isRegister={isRegister}
					loading={loading}
					formData={formData}
					onSubmit={handleAuth}
				/>
				<OAuthProviders loading={loading} onGitHubAuth={handleGitHubAuth} />
			</CardContent>
			<CardFooter className='flex justify-center'>
				<Button onClick={toggleAuthMode} variant='link' disabled={loading} type='button'>
					{toggleText}
				</Button>
			</CardFooter>
		</Card>
	)
}
