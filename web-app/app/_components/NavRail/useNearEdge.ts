'use client'

import { useEffect, useState } from 'react'
import type { SidebarSide } from '@/shared/preferences/sidebar'

/** true cuando el puntero está a menos de 140px del borde donde vive el rail (paso 2 del reposo). */
export function useNearEdge(side: SidebarSide) {
	const [near, setNear] = useState(false)

	useEffect(() => {
		const onMove = (event: PointerEvent) => {
			const edge = side === 'right' ? window.innerWidth - event.clientX : event.clientX
			setNear(edge <= 140)
		}
		window.addEventListener('pointermove', onMove, { passive: true })
		return () => window.removeEventListener('pointermove', onMove)
	}, [side])

	return near
}
