import { useTheme } from '@/shared/hooks/useTheme'
import { cn } from '@/shared/lib/utils'
import { ReactNode } from 'react'

export function SettingSection({
	children,
	className,
}: {
	children: ReactNode
	className?: string
}) {
	const { column, columnText } = useTheme()
	return (
		<section
			className={cn('max-w-2xl rounded-lg py-4 md:px-11 px-6', column, columnText, className)}
		>
			<div className='w-full'>{children}</div>
		</section>
	)
}

function Title({ children }: { children: ReactNode | string }) {
	return <h2 className='text-2xl'>{children}</h2>
}
SettingSection.Title = Title

function Description({ children }: { children?: ReactNode | string }) {
	return <p className='opacity-75'>{children}</p>
}
SettingSection.Description = Description

function Content({ className, children }: { children: ReactNode; className?: string }) {
	const theme = useTheme()
	return (
		<main className={cn('h-auto w-full max-w-2xl my-3 p-4 rounded-lg', theme.task, className)}>
			{children}
		</main>
	)
}
SettingSection.Content = Content
