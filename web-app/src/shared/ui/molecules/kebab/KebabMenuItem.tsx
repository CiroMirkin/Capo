import { Button, type ButtonProps } from '@/shared/ui/atoms/button'
import { kebabMenuItemClasses, type KebabMenuItemStyleProps } from './kebabMenuItemClassName'

interface Props extends Omit<ButtonProps, 'size'>, Pick<KebabMenuItemStyleProps, 'showLabel'> {}

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
