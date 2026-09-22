'use client'

import { FormEvent, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/shared/ui/molecules/dialog'
import { Button } from '@/shared/ui/atoms/button'
import { Input } from '@/shared/ui/atoms/input'
import { Label } from '@/shared/ui/atoms/label'
import { EyeIcon, EyeOffIcon, Link2Icon, RotateCcwIcon, TrashIcon } from '@/shared/ui/atoms/icons'
import { useTheme } from '@/shared/hooks/useTheme'
import { cn } from '@/shared/lib/utils'
import getErrorMessageForTheUser from '@/shared/lib/getErrorMessageForTheUser'
import { useBoardShares } from '../hooks/useBoardShares'
import { assertCanAddEmailShare, MAX_EMAIL_SHARES, type BoardShare } from '../model/boardShare'

const shareUrl = (token: string) => `${window.location.origin}/shared/${token}`

interface Props {
	boardId: string
	open: boolean
	onOpenChange: (open: boolean) => void
}

export function ShareBoardDialog({ boardId, open, onOpenChange }: Props) {
	const color = useTheme()
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent
				className={cn(
					'sm:max-w-xl max-h-[90vh] overflow-y-auto',
					color.column,
					color.columnText
				)}
			>
				<SharePanel boardId={boardId} />
			</DialogContent>
		</Dialog>
	)
}

function SharePanel({ boardId }: { boardId: string }) {
	const { t } = useTranslation()
	const color = useTheme()
	const [email, setEmail] = useState('')
	const { shares, isPending, ...share } = useBoardShares(boardId)

	const publicShare = shares.find((s) => s.mode === 'PUBLIC')
	const emailShares = shares.filter((s) => s.mode === 'EMAIL')

	const handleInvite = (e: FormEvent) => {
		e.preventDefault()
		try {
			assertCanAddEmailShare(shares, email)
			share.addEmailShare(email)
			setEmail('')
		} catch (error) {
			toast.error(getErrorMessageForTheUser(error))
		}
	}

	const row = (s: BoardShare, label: string) => (
		<li key={s.id} className='flex flex-col gap-2'>
			<span className={cn('text-sm flex-1 truncate opacity-70', !s.active && 'line-through opacity-50')}>
				{label}
			</span>
			<div>
				<Button
				variant='ghost'
				size='sm'
				onClick={() =>
					navigator.clipboard
						.writeText(shareUrl(s.token))
						.then(() => toast.info(t('share.link_copied')))
				}
			>
				<Link2Icon size='xs' className='mr-2' />
				{t('share.copy_link')}
			</Button>
			<Button
				variant='ghost'
				size='sm'
				disabled={isPending}
				onClick={() => share.setShareActive(s.id, !s.active)}
			>
				{s.active ? <EyeIcon size='xs' /> : <EyeOffIcon size='xs' />}
				{s.active ? t('share.deactivate') : t('share.activate')}
			</Button>
			<Button
				variant='ghost'
				size='sm'
				disabled={isPending}
				title={t('share.regenerate')}
				aria-label={t('share.regenerate')}
				onClick={() =>
					toast.warning(t('share.regenerate_warning'), {
						action: {
							label: t('share.regenerate'),
							onClick: () => share.regenerateShareToken(s.id),
						},
					})
				}
			>
				<RotateCcwIcon size='xs' />
			</Button>
			{s.mode === 'EMAIL' && (
				<Button
					variant='ghost'
					size='sm'
					disabled={isPending}
					title={t('share.remove')}
					aria-label={t('share.remove')}
					onClick={() => share.deleteShare(s.id)}
				>
					<TrashIcon size='xs' />
				</Button>
			)}
			</div>
		</li>
	)

	return (
		<>
			<DialogHeader>
				<DialogTitle>{t('share.section_title')}</DialogTitle>
				<DialogDescription>{t('share.section_description')}</DialogDescription>
			</DialogHeader>

			<section className={cn('grid gap-3 rounded-lg p-4', color.task, color.taskText)}>
				<h3 className='font-medium'>{t('share.public_title')}</h3>
				{publicShare ? (
					<ul>{row(publicShare, t('share.public_label'))}</ul>
				) : (
					<Button
						variant='outline'
						className='justify-self-start'
						disabled={isPending}
						onClick={share.enablePublicShare}
					>
						{t('share.create_public')}
					</Button>
				)}
			</section>

			<section className={cn('grid gap-3 rounded-lg p-4', color.task, color.taskText)}>
				<h3 className='font-medium'>
					{t('share.email_title', {
						count: emailShares.length,
						max: MAX_EMAIL_SHARES,
					})}
				</h3>
				<p className='text-sm opacity-75'>{t('share.email_description')}</p>
				{emailShares.length > 0 && (
					<ul className='grid gap-1'>
						{emailShares.map((s) => row(s, s.recipientEmail ?? ''))}
					</ul>
				)}
				{emailShares.length < MAX_EMAIL_SHARES && (
					<form onSubmit={handleInvite} className='flex items-end gap-2'>
						<div className='grid w-full max-w-sm gap-1.5'>
							<Label htmlFor='share-email'>{t('share.email_input_label')}</Label>
							<Input
								id='share-email'
								type='email'
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								placeholder='nombre@mail.com'
							/>
						</div>
						<Button
							type='submit'
							variant='outline'
							disabled={isPending || !email.trim()}
						>
							{t('share.invite')}
						</Button>
					</form>
				)}
			</section>
		</>
	)
}
