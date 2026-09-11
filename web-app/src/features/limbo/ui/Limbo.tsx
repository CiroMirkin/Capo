'use client'

import { useMediaQuery } from '@/shared/hooks/useMediaQuery'
import { LimboCanvas } from './LimboCanvas'
import { LimboMobileGrid } from './LimboMobileGrid'

export function Limbo() {
	const isDesktop = useMediaQuery('(min-width: 768px)')
	return isDesktop ? <LimboCanvas /> : <LimboMobileGrid />
}
