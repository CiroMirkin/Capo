'use client'

import { forwardRef, useCallback, type AnchorHTMLAttributes } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface TransitionLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
	to: string
	title?: string
}

const supportsViewTransitions = typeof document !== 'undefined' && 'startViewTransition' in document

// forwardRef: permite usar <DropdownMenuItem asChild> para que Radix ate sus handlers directamente al <a>, en vez de envolverlo en un div (eso causaba el doble tap en mobile).
export const TransitionLink = forwardRef<HTMLAnchorElement, TransitionLinkProps>(
	function TransitionLink({ to, onClick, children, title, ...props }, ref) {
		const router = useRouter()

		const handleClick = useCallback(
			(e: React.MouseEvent<HTMLAnchorElement>) => {
				if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
					return
				}

				e.preventDefault()
				onClick?.(e)

				if (supportsViewTransitions) {
					document.startViewTransition(() => router.push(to))
				} else {
					router.push(to)
				}
			},
			[to, router, onClick]
		)

		return (
			<Link ref={ref} href={to} onClick={handleClick} title={title} {...props}>
				{children}
			</Link>
		)
	}
)
