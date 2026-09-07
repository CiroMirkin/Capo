'use client'

import { createContext, Dispatch, SetStateAction, useMemo } from 'react'
import { Theme, lightTheme } from '../model/themesList'

export type ChangeTheme = Dispatch<SetStateAction<Theme>>

interface ThemeContextContent {
	theme: Theme
	changeTheme: ChangeTheme
}

const defaultThemeContextValue: ThemeContextContent = {
	theme: lightTheme,
	changeTheme: () => {},
}

export const ThemeContext = createContext(defaultThemeContextValue)

interface ThemeProviderProps {
	children: React.ReactNode
	// value and dispatch of a useState Hook
	theme: Theme
	changeTheme: ChangeTheme
}

export const ThemeProvider = ({ children, theme, changeTheme }: ThemeProviderProps) => {
	const value = useMemo(() => ({ theme, changeTheme }), [theme, changeTheme])
	return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
