import { cn } from '@/shared/lib/utils'

interface EmptySpaceTextProps {
	className?: string
	children: string | string[]
	textSize?: 'lg' | 'xl'
}

export function EmptySpaceText({ children, className = '', textSize = 'xl' }: EmptySpaceTextProps) {
	return (
		<p className={cn('w-full opacity-50', `text-${textSize}`, 'text-black', className)}>
			{children}
		</p>
	)
}
