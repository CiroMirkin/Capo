'use client'

import { ReactNode, useState } from 'react'
import { Button } from '@/shared/ui/atoms/button'
import { DangerIcon, TrashIcon } from '@/shared/ui/atoms/icons'
import { Input } from '@/shared/ui/atoms/input'
import { Label } from '@/shared/ui/atoms/label'
import { SettingSection } from '@/shared/ui/organisms/SettingSection'
import { useTheme } from '@/shared/hooks/useTheme'

interface Props {
	title: ReactNode
	description: ReactNode
	confirmPhrase: string
	confirmLabel: ReactNode
	confirmPlaceholder?: string
	buttonLabel: ReactNode
	onConfirm: () => void
	testId?: string
}

export function DestructiveBoardSection({
	title,
	description,
	confirmPhrase,
	confirmLabel,
	confirmPlaceholder,
	buttonLabel,
	onConfirm,
	testId,
}: Props) {
	const { taskText } = useTheme()
	const [typed, setTyped] = useState('')
	const enabled = confirmPhrase.trim() !== '' && typed.trim() === confirmPhrase.trim()

	return (
		<SettingSection className='border-2 border-destructive shadow-sm shadow-destructive'>
			<SettingSection.Title>
				<span className='flex items-center gap-2 text-destructive'>
					<DangerIcon />
					{title}
				</span>
			</SettingSection.Title>
			<SettingSection.Description>{description}</SettingSection.Description>
			<SettingSection.Content className='flex flex-col gap-4'>
				<div className='grid w-full max-w-sm items-center gap-1.5'>
					<Label htmlFor='destructive-board-confirm' className={taskText}>
						{confirmLabel}
					</Label>
					<Input
						type='text'
						id='destructive-board-confirm'
						value={typed}
						onChange={(e) => setTyped(e.target.value)}
						placeholder={confirmPlaceholder}
						autoComplete='off'
					/>
				</div>
				<Button
					variant='destructive'
					disabled={!enabled}
					onClick={onConfirm}
					className='w-fit flex items-center gap-2'
					data-testid={testId}
				>
					<TrashIcon />
					{buttonLabel}
				</Button>
			</SettingSection.Content>
		</SettingSection>
	)
}
