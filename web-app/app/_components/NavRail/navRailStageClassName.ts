import { cn } from '@/shared/lib/utils'

interface NavRailStageParams {
	isRight: boolean
	near: boolean
	active: boolean
	text: string
	columnText?: string
}

/** Clases del `<nav>` para las 3 etapas. */
export function getNavRailStageClassName({ isRight, near, active, text, columnText }: NavRailStageParams) {
	return cn(
		'pointer-events-auto relative flex flex-col gap-1 p-2 transition-[transform,padding] duration-150 ease-out motion-reduce:transition-none',
		// etapa 3 (activo)
		active ? columnText : text,
		near || active ? 'scale-100' : 'scale-[0.55] lg:scale-[0.7]',
		// etapa 2 (zoom)
		near && !active && (isRight ? 'pr-0' : 'pl-1'),
		// etapa 1 (reposo)
		!near && !active && 'pl-5 opacity-80',
		isRight ? 'origin-right' : 'origin-left'
	)
}
