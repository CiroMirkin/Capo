import { Button, buttonVariants, type ButtonProps } from '@/shared/ui/atoms/button'
import { cn } from '@/shared/lib/utils'

interface StyleProps {
	className?: string
	/** Muestra la etiqueta junto al icono */
	showLabel?: boolean
	variant?: ButtonProps['variant']
}

const kebabMenuItemClasses = ({ showLabel, className }: Omit<StyleProps, 'variant'>) =>
	cn('px-2 h-7', showLabel && 'gap-2', className)

/**
 * Clases de un item de KebabMenu (icono + etiqueta opcional), para triggers que no pueden usar `KebabMenuItem`/`Button` directo (p.ej. `DatePicker`, que renderiza su propio `<button>` con contenido dinámico).
 */
export function kebabMenuItemClassName({ className, showLabel, variant = 'ghost' }: StyleProps) {
	return buttonVariants({
		variant,
		size: 'sm',
		className: kebabMenuItemClasses({ showLabel, className }),
	})
}

interface Props extends Omit<ButtonProps, 'size'>, Pick<StyleProps, 'showLabel'> {}

/** Botón para un item de `KebabMenu`: mismo tamaño/spacing en todos los items del menú. */
export function KebabMenuItem({ variant = 'ghost', showLabel, className, ...props }: Props) {
	return (
		<Button
			size='sm'
			variant={variant}
			className={kebabMenuItemClasses({ showLabel, className })}
			{...props}
		/>
	)
}
