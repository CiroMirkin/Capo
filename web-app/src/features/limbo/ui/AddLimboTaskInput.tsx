'use client'

import { useLayoutEffect, useRef, useState } from 'react'
import {
	LazyMotion,
	animate,
	domAnimation,
	m,
	useMotionValue,
	useReducedMotion,
	type Transition,
} from 'motion/react'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { getNewTask } from '@/features/tasks'
import getErrorMessageForTheUser from '@/shared/lib/getErrorMessageForTheUser'
import { Input } from '@/shared/ui/atoms/input'
import { Button } from '@/shared/ui/atoms/button'
import { useLimboQuery } from '../hooks/useLimboQuery'
import { addTaskToLimbo } from '../model/limbo'
import { LIMBO_TASK_LIMIT } from '../model/limboTask'
import { PlusIcon } from '@/shared/ui/atoms/icons'

const jitter = () => Math.round((Math.random() - 0.5) * 80)

/** El ancho del input arranca en `w-56` y crece con el texto hasta `MAX`. */
const MIN_INPUT_WIDTH = 224
const MAX_INPUT_WIDTH = 448

/** spring sin rebote al escribir que conserva la velocidad al re-apuntar en cada tecla. */
const TYPING_TRANSITION: Transition = { type: 'spring', visualDuration: 0.3, bounce: 0 }

/** Tras crear la tarea: el texto se vacía de golpe, pero la píldora se cierra con calma. */
const AFTER_SUBMIT_TRANSITION: Transition = {
	type: 'spring',
	visualDuration: 0.6,
	bounce: 0,
	delay: 0.25,
}

export function AddLimboTaskInput({
	getSpawnPoint,
}: {
	getSpawnPoint: () => { x: number; y: number }
}) {
	const { t } = useTranslation()
	const reduce = useReducedMotion()
	const { limbo, updateLimbo } = useLimboQuery()
	const [text, setText] = useState('')
	const full = limbo.length >= LIMBO_TASK_LIMIT
	const placeholder = t('limbo.new_task_placeholder')

	// Espejo invisible con la misma tipografía y padding que el input
	// su ancho natural es el que necesita el texto.
	const mirrorRef = useRef<HTMLSpanElement>(null)
	const width = useMotionValue(MIN_INPUT_WIDTH)
	const mountedRef = useRef(false)
	const justSubmittedRef = useRef(false)

	useLayoutEffect(() => {
		const natural = mirrorRef.current?.offsetWidth ?? 0
		const target = Math.min(MAX_INPUT_WIDTH, Math.max(MIN_INPUT_WIDTH, natural))
		const afterSubmit = justSubmittedRef.current
		justSubmittedRef.current = false

		if (!mountedRef.current || reduce) {
			mountedRef.current = true
			width.jump(target)
			return
		}
		const controls = animate(
			width,
			target,
			afterSubmit ? AFTER_SUBMIT_TRANSITION : TYPING_TRANSITION
		)
		return () => controls.stop()
	}, [text, placeholder, reduce, width])

	const add = () => {
		try {
			const task = getNewTask({ descriptionText: text })
			const spawn = getSpawnPoint()
			updateLimbo(
				addTaskToLimbo({ limbo, task, x: spawn.x + jitter(), y: spawn.y + jitter() })
			)
			justSubmittedRef.current = true
			setText('')
		} catch (error) {
			toast.error(getErrorMessageForTheUser(error))
		}
	}

	return (
		<div className='fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-lg border bg-background px-2 py-1.5 shadow-lg'>
			<span
				ref={mirrorRef}
				aria-hidden
				className='pointer-events-none invisible absolute whitespace-pre px-3 text-sm'
			>
				{text || placeholder}
			</span>
			<LazyMotion features={domAnimation}>
				<m.div style={{ width }} className='max-w-[calc(100vw-9rem)]'>
					<Input
						value={text}
						onChange={(e) => setText(e.target.value)}
						onKeyDown={(e) => e.key === 'Enter' && add()}
						placeholder={placeholder}
						disabled={full}
						title={full ? t('limbo.full_hint') : undefined}
						className='h-8 rounded border-0 focus-visible:ring-0 text-black'
					/>
				</m.div>
			</LazyMotion>

			<span className='shrink-0 text-xs opacity-60 text-black'>
				{t('limbo.counter', { count: limbo.length, max: LIMBO_TASK_LIMIT })}
			</span>

			<Button
				size='sm'
				variant='ghost'
				className='rounded-lg text-black'
				onClick={add}
				disabled={full || !text.trim()}
			>
				<PlusIcon />
			</Button>
		</div>
	)
}
