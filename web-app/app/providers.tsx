'use client'

import '../src/shared/i18n/index'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster as SonnerToaster } from 'sonner'
import { useState, type ReactNode } from 'react'
import { ThemeProvider } from '@/shared/preferences/theme'
import { useResolvedTheme } from '@/shared/preferences/theme'
import { useIsHydrated } from '@/shared/hooks/useIsHydrated'
import { useUserPreffedLanguage } from '@/shared/preferences/language'
import { useSetLanguageSaved } from '@/shared/preferences/language'
import { useSaveTimeTracking } from '@/features/usage-history'

function ClientOnlyInit() {
	useSaveTimeTracking()
	useSetLanguageSaved()
	useUserPreffedLanguage()
	return null
}

function AppInit({ children }: { children: ReactNode }) {
	const mounted = useIsHydrated()
	const { theme, changeTheme } = useResolvedTheme()

	return (
		<ThemeProvider theme={theme} changeTheme={changeTheme}>
			{mounted && <ClientOnlyInit />}
			{children}
			<SonnerToaster position='top-center' richColors closeButton />
		</ThemeProvider>
	)
}

export default function Providers({ children }: { children: ReactNode }) {
	const [queryClient] = useState(() => new QueryClient())

	return (
		<QueryClientProvider client={queryClient}>
			<AppInit>{children}</AppInit>
		</QueryClientProvider>
	)
}
