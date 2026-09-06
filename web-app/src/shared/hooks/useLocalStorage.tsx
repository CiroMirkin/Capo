'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

// Sincroniza instancias del mismo tab: `storage` solo cruza pestañas.
const syncEvent = 'local-storage-sync'

export function useLocalStorage<T>(
	key: string,
	initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
	const [storedValue, setStoredValue] = useState<T>(initialValue)
	const valueRef = useRef(initialValue)
	const initialRef = useRef(initialValue)

	useEffect(() => {
		valueRef.current = storedValue
	}, [storedValue])

	useEffect(() => {
		const read = () => {
			try {
				const item = window.localStorage.getItem(key)
				setStoredValue(item !== null ? JSON.parse(item) : initialRef.current)
			} catch {
				setStoredValue(initialRef.current)
			}
		}
		read()
		const onSync = (event: Event) => {
			if ((event as CustomEvent<string>).detail === key) read()
		}
		const onStorage = (event: StorageEvent) => {
			if (event.key === key) read()
		}
		window.addEventListener(syncEvent, onSync)
		window.addEventListener('storage', onStorage)
		return () => {
			window.removeEventListener(syncEvent, onSync)
			window.removeEventListener('storage', onStorage)
		}
	}, [key])

	const setValue = useCallback(
		(value: T | ((prev: T) => T)) => {
			const next = value instanceof Function ? value(valueRef.current) : value
			try {
				window.localStorage.setItem(key, JSON.stringify(next))
			} catch {
				return
			}
			valueRef.current = next
			setStoredValue(next)
			window.dispatchEvent(new CustomEvent(syncEvent, { detail: key }))
		},
		[key]
	)

	return [storedValue, setValue]
}
