import { buttonVariants, type ButtonProps } from '@/shared/ui/atoms/button'
import { cn } from '@/shared/lib/utils'

export interface KebabMenuItemStyleProps {
	className?: string
	/** Muestra la etiqueta junto al icono */
	showLabel?: boolean
	variant?: ButtonProps['variant']
}

export const kebabMenuItemClasses = ({
	showLabel,
	className,
}: Omit<KebabMenuItemStyleProps, 'variant'>) =>
	cn('px-2 h-7', showLabel && 'w-full justify-start gap-2', className)

/**
 * Clases de un item de KebabMenu (icono + etiqueta opcional), para triggers que no pueden usar `KebabMenuItem`/`Button` directo (p.ej. `DatePicker`, que renderiza su propio `<button>` con contenido dinámico).
 */
export function kebabMenuItemClassName({
	className,
	showLabel,
	variant = 'ghost',
}: KebabMenuItemStyleProps) {
	return buttonVariants({
		variant,
		size: 'sm',
		className: kebabMenuItemClasses({ showLabel, className }),
	})
}
