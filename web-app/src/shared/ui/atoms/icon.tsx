import type { LucideIcon } from 'lucide-react'

export type IconSize = 'default' | 'xs'

const sizes: Record<IconSize, number> = { default: 20, xs: 15 }

export interface IconProps {
	className?: string
	/** 'default' = 20px, 'xs' = 10px. Ignorado si se pasa `customSize`. */
	size?: IconSize
	/** Tamaño puntual en px, para cuando ninguno de los dos tamaños estándar sirve. */
	customSize?: string | number
	strokeWidth?: string | number
}

export const icon =
	(Lucide: LucideIcon) =>
	({ className, size = 'default', customSize, strokeWidth }: IconProps) => (
		<Lucide size={customSize ?? sizes[size]} className={className} strokeWidth={strokeWidth} />
	)

export { sizes }
