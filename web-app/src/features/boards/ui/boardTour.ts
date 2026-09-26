import type { TFunction } from 'i18next'
import { driver, type Driver, type DriveStep } from 'driver.js'
import 'driver.js/dist/driver.css'

const find = (target: string) => document.querySelector<HTMLElement>(`[data-tour="${target}"]`)

function isTypingArrow() {
	const e = window.event
	return (
		e?.type === 'keyup' &&
		e.target instanceof Element &&
		!!e.target.closest('input, textarea, [contenteditable="true"]')
	)
}

const MODAL = '[role="dialog"]:not(.driver-popover)'

function next(d: Driver) {
	if (!isTypingArrow()) d.moveNext()
}

/** Si el elemento no está en el DOM (p. ej. la tarea se colapsó), driver.js muestra el popover centrado. */
export function startBoardTour(t: TFunction) {
	const step = (target: string, key: string, extra: Partial<DriveStep> = {}): DriveStep => ({
		element: `[data-tour="${target}"]`,
		...extra,
		popover: {
			title: t(`board_tour.${key}.title`),
			description: t(`board_tour.${key}.description`),
			...extra.popover,
		},
	})

	let observer: MutationObserver | undefined
	/**
	 * Paso sin "Siguiente" que avanza solo cuando el usuario hace aparecer `[data-tour="until"]` (o
	 * cuando `until()` da true).
	 */
	const waitStep = (
		target: string,
		key: string,
		until: string | (() => boolean),
		extra: Partial<DriveStep> = {}
	) =>
		step(target, key, {
			disableActiveInteraction: false,
			...extra,
			popover: {
				showButtons: ['previous', 'close'],
				onNextClick: () => {},
				...extra.popover,
			},
			onHighlighted: () => {
				const done = typeof until === 'string' ? () => !!find(until) : until
				const advance = () => {
					if (!done()) return
					observer?.disconnect()
					next(tour)
				}
				observer = new MutationObserver(advance)
				observer.observe(document.body, { childList: true, subtree: true })
				setTimeout(advance)
			},
			onDeselected: () => observer?.disconnect(),
		})

	let watcher: MutationObserver | undefined
	/**
	 * Paso donde lo resaltado se puede usar. Cierra el tour si se abre un modal (notas), que quedaría bajo el
	 * overlay bloqueando todo, y vuelve a este paso cuando se cierra (salvo `inModal`, si el paso ya vive dentro de uno).
	 * Avanza si lo resaltado sale del DOM, salvo que `onChange` ya lo haya manejado.
	 */
	const usableStep = (
		target: string,
		key: string,
		{
			inModal = false,
			onChange,
			...extra
		}: Partial<DriveStep> & {
			inModal?: boolean
			/** corre en cada cambio del DOM y devuelve true si ya lo manejó */
			onChange?: (d: Driver, index: number) => boolean
		} = {}
	) =>
		step(target, key, {
			disableActiveInteraction: false,
			...extra,
			onHighlighted: (el, _step, { driver: d }) => {
				const index = d.getActiveIndex()!
				// re-mide al terminar la animación del Sheet, que entra deslizándose sin mutar el DOM
				if (inModal)
					el
						?.closest(MODAL)
						?.addEventListener('animationend', () => d.refresh(), { once: true })
				watcher = new MutationObserver(() => {
					if (!inModal && document.querySelector(MODAL)) {
						watcher?.disconnect()
						d.destroy()
						const resume = new MutationObserver(() => {
							if (document.querySelector(MODAL)) return
							resume.disconnect()
							d.drive(index)
						})
						resume.observe(document.body, { childList: true, subtree: true })
					} else if (onChange?.(d, index)) watcher?.disconnect()
					else if (el && !el.isConnected) next(d)
					else d.refresh()
				})
				watcher.observe(document.body, { childList: true, subtree: true })
			},
			onDeselected: () => watcher?.disconnect(),
		})

	/**
	 * Sigue a la tarea movida, que se desmonta y reaparece colapsada en otra columna, y la expande para volver a
	 * resaltar sus flechas (espera la animación de layout y el colapsable).
	 */
	let archiveClick = () => {}
	let movedTask: Element | undefined
	let knownTasks = new Set<Element>()
	const columnOf = (task?: Element) =>
		[...document.querySelectorAll('[data-tour="column"]')].findIndex(
			(column) => !!task && column.contains(task)
		)
	// avanza sin "Siguiente" cuando la tarea llega a la columna `target`, y si no se queda en el paso
	const moveStep = (target: number) =>
		usableStep('task-move', 'move', {
			element: () =>
				movedTask?.querySelector<HTMLElement>('[data-tour="task-move"]') ??
				find('task-move')!,
			onHighlightStarted: (el) => {
				knownTasks = new Set(document.querySelectorAll('[data-tour="task"]'))
				movedTask ??= el?.closest('[data-tour="task"]') ?? undefined
			},
			popover: { showButtons: ['previous', 'close'], onNextClick: () => {} },
			onChange: (d, index) => {
				const moved = [...document.querySelectorAll('[data-tour="task"]')].find(
					(task) => !knownTasks.has(task)
				)
				if (!moved) return false
				movedTask = moved
				moved.querySelector<HTMLElement>('[data-tour="task-toggle"]')?.click()
				setTimeout(() => d.moveTo(columnOf(moved) >= target ? index + 1 : index), 600)
				return true
			},
		})

	// Sin tareas, los pasos de tarea no tienen sobre qué mostrarse
	// Es el usuario quien crea la primer tarea
	const mustCreateTask = !find('task')

	const tour = driver({
		showProgress: true,
		// devuelve {{current}}/{{total}} intactos a i18next para que los reemplace driver.js
		progressText: t('board_tour.progress', { current: '{{current}}', total: '{{total}}' }),
		nextBtnText: t('board_tour.next'),
		prevBtnText: t('board_tour.prev'),
		doneBtnText: t('board_tour.done'),
		overlayClickBehavior: () => {},
		// reactiva los botones del popover, que heredan (all: unset) el pointer-events: none que Radix deja en el body con el Sheet de notas abierto
		onPopoverRender: ({ wrapper }) => {
			wrapper.style.pointerEvents = 'auto'
		},
		disableActiveInteraction: true,
		onNextClick: (_el, _step, { driver: d }) => next(d),
		onPrevClick: (_el, _step, { driver: d }) => {
			if (!isTypingArrow()) d.movePrevious()
		},
		steps: [
			step('new-task', 'new_task', { disableActiveInteraction: false }),
			step('due-date', 'due_date', { disableActiveInteraction: false }),
			...(mustCreateTask ? [waitStep('new-task', 'try_it', 'task')] : []),
			waitStep('column', 'open_task', 'task-notes', {
				popover: mustCreateTask ? { showButtons: ['close'] } : undefined,
			}),
			step('task', 'not_editable', {
				popover: mustCreateTask
					? { showButtons: ['next', 'close'], onPrevClick: () => {} }
					: {
							onPrevClick: (_el, _step, { driver: d }) =>
								d.moveTo(d.getActiveIndex()! - 2),
						},
			}),
			usableStep('task-notes', 'task_notes'),
			// repite el paso dos veces para llevar la tarea de la primera columna a la tercera, donde está "Archivar"
			moveStep(1),
			moveStep(2),
			// avanza sin "Siguiente" con el click en "Archivar", que sigue su curso y archiva
			step('archive', 'archive', {
				disableActiveInteraction: false,
				popover: { showButtons: ['previous', 'close'], onNextClick: () => {} },
				onHighlighted: (el, _step, { driver: d }) => {
					archiveClick = () => setTimeout(() => d.moveNext())
					el?.addEventListener('click', archiveClick, { once: true })
				},
				onDeselected: (el) => el?.removeEventListener('click', archiveClick),
			}),
			// resalta 1s y sin popover la última columna, ya sin la tarea archivada
			{
				element: () =>
					[...document.querySelectorAll<HTMLElement>('[data-tour="column"]')].at(-1)!,
				// oculta el popover con botones que drive() de driver.js siempre arma
				popover: { onPopoverRender: ({ wrapper }) => (wrapper.style.display = 'none') },
				onHighlighted: (_el, _step, { driver: d }) => {
					const check = () => {
						if (movedTask?.isConnected) return
						gone.disconnect()
						d.refresh()
						setTimeout(() => d.isActive() && d.moveNext(), 1000)
					}
					const gone = new MutationObserver(check)
					gone.observe(document.body, { childList: true, subtree: true })
					check()
				},
			},
			...(find('board-notes-button')
				? [
						waitStep('board-notes-button', 'board_notes', 'board-notes'),
						usableStep('board-notes', 'board_notes', { inModal: true }),
					]
				: [usableStep('board-notes', 'board_notes')]),
			step('', 'end', { element: undefined, popover: { showButtons: ['next', 'close'] } }),
		],
	})
	tour.drive()
}
