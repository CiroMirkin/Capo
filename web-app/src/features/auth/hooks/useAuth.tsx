'use client'

import { useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { authClient } from '../lib/authClient'

interface FormState {
	loading: boolean
	email: string
	password: string
}

export interface AuthFormData {
	email: string
	password: string
	setEmail: (email: string) => void
	setPassword: (password: string) => void
}

export function useAuth(isRegister: boolean, setIsSubmitted: (submitted: boolean) => void) {
	const [formState, setFormState] = useState<FormState>({
		loading: false,
		email: '',
		password: '',
	})

	const { t } = useTranslation()

	const handleAuth = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		setFormState((prev) => ({ ...prev, loading: true }))

		const authPromise = async () => {
			const { email, password } = formState
			const { error } = isRegister
				? await authClient.signUp.email({ email, password, name: email.split('@')[0] })
				: await authClient.signIn.email({ email, password })
			if (error) throw new Error(error.message || 'Error de autenticación')

			setIsSubmitted(true)
			window.location.assign('/')
		}

		toast.promise(authPromise(), {
			loading: t('loading', { defaultValue: 'Cargando...' }),
			success: isRegister ? t('successful_log_in_toast') : t('sing_in_toast'),
			error: (error: Error) => {
				return error.message || t('auth_error', { defaultValue: 'Error de autenticación' })
			},
			finally: () => {
				setFormState((prev) => ({ ...prev, loading: false }))
			},
		})
	}

	const setEmail = (email: string) => {
		setFormState((prev) => ({ ...prev, email }))
	}

	const setPassword = (password: string) => {
		setFormState((prev) => ({ ...prev, password }))
	}

	const handleGitHubAuth = async () => {
		setFormState((prev) => ({ ...prev, loading: true }))

		const authPromise = async () => {
			const { error } = await authClient.signIn.social({
				provider: 'github',
				callbackURL: '/',
			})
			if (error) throw new Error(error.message || 'Error de autenticación')
			setIsSubmitted(true)
		}

		toast.promise(authPromise(), {
			loading: t('loading', { defaultValue: 'Cargando...' }),
			success: t('sing_in_toast'),
			error: (error: Error) => {
				return error.message || t('auth_error', { defaultValue: 'Error de autenticación' })
			},
			finally: () => {
				setFormState((prev) => ({ ...prev, loading: false }))
			},
		})
	}

	const handleSignOut = async () => {
		await authClient.signOut()
		window.location.assign('/auth')
	}

	const resetForm = () => {
		setFormState((prev) => ({ ...prev, email: '', password: '' }))
	}

	const formData: AuthFormData = {
		email: formState.email,
		password: formState.password,
		setEmail,
		setPassword,
	}

	return {
		loading: formState.loading,
		formData,
		handleAuth,
		handleGitHubAuth,
		handleSignOut,
		resetForm,
	}
}
