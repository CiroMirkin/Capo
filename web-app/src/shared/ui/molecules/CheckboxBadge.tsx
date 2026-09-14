import { CheckmarkIcon } from '@/shared/ui/atoms/icons'
import { useEffect, useState } from 'react'
import { Badge, badgeSizes, badgeVariants } from '../atoms/badge'

interface CheckboxBadgeProps {
	id: string
	children: React.ReactNode
	variant?: keyof typeof badgeVariants
	size?: keyof typeof badgeSizes
	capitalize?: boolean
	icon?: React.ReactNode
	checked?: boolean
	defaultChecked?: boolean
	onChange?: (checked: boolean, id: string) => void
	disabled?: boolean
}

export const CheckboxBadge: React.FC<CheckboxBadgeProps> = ({
	id,
	children,
	variant = 'gray-subtle',
	size = 'md',
	capitalize = true,
	icon,
	checked,
	defaultChecked = false,
	onChange,
	disabled = false,
}) => {
	const [isChecked, setIsChecked] = useState(checked ?? defaultChecked)

	useEffect(() => {
		if (checked !== undefined) {
			setIsChecked(checked)
		}
	}, [checked])

	const handleClick = () => {
		if (disabled) return

		const newChecked = !isChecked
		setIsChecked(newChecked)
		onChange?.(newChecked, id)
	}

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === ' ' || e.key === 'Enter') {
			e.preventDefault()
			handleClick()
		}
	}

	return (
		<div
			role='checkbox'
			aria-checked={isChecked}
			tabIndex={disabled ? -1 : 0}
			onClick={handleClick}
			onKeyDown={handleKeyDown}
			className={`
        cursor-pointer select-none
        ${disabled && 'cursor-not-allowed opacity-50'}
        ${isChecked ? 'opacity-100' : 'opacity-70 hover:opacity-85'}
      `}
		>
			<Badge
				variant={isChecked ? variant : 'gray-subtle'}
				size={size}
				capitalize={capitalize}
				icon={isChecked ? <CheckmarkIcon /> : icon}
			>
				{children}
			</Badge>
		</div>
	)
}
