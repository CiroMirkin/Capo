import { KeyboardEvent, useCallback, useEffect, useRef } from 'react'

interface AutoExpandTextareaProps {
	value?: string
	onChange?: (value: string) => void
	onKeyDown?: (e: KeyboardEvent<HTMLTextAreaElement>) => void
	placeholder?: string
	minHeight?: number
	disabled?: boolean
	className?: string
}

export const AutoExpandTextarea = ({
	value = '',
	onChange,
	onKeyDown,
	placeholder = 'Escribe aquí...',
	minHeight = 10,
	disabled = false,
	className = '',
}: AutoExpandTextareaProps) => {
	const textareaRef = useRef<HTMLTextAreaElement>(null)
	const maxHeight = 100

	const adjustHeight = useCallback((): void => {
		const textarea = textareaRef.current
		if (textarea) {
			textarea.style.height = 'auto'
			const newHeight = Math.min(Math.max(textarea.scrollHeight, minHeight), maxHeight)
			textarea.style.height = `${newHeight}px`
		}
	}, [minHeight])

	useEffect(() => {
		adjustHeight()
	}, [value, adjustHeight])

	const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
		const newValue = e.target.value

		if (onChange) {
			onChange(newValue)
		}

		// Ajustar altura después del cambio
		setTimeout(adjustHeight, 0)
	}

	return (
		<textarea
			ref={textareaRef}
			value={value}
			onChange={handleChange}
			onKeyDown={onKeyDown}
			placeholder={placeholder}
			disabled={disabled}
			className={`resize-none transition-all duration-200 w-full border rounded-md p-2 border-transparent focus:border-blue-200 ${className}`}
			style={{
				minHeight: `${minHeight}px`,
				maxHeight: 'auto',
				overflowY: 'hidden',
				outline: 'none',
			}}
		/>
	)
}
