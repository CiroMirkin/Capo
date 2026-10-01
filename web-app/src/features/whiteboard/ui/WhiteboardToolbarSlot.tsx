'use client'

import { ReactNode, RefObject, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

/*
 * Excalidraw no tiene slot en la barra de herramientas: se agrega un div al final de su fila y
 * se renderiza ahí con un portal, así los items quedan dentro de la isla (mismo fondo y posición).
 * ponytail: depende de las clases internas `.App-toolbar .Stack_horizontal` (0.18); al actualizar
 * @excalidraw/excalidraw, revisar que sigan existiendo. Solo la barra de escritorio: en mobile
 * Excalidraw usa otra (MobileMenu) y el slot no aparece.
 */
export function WhiteboardToolbarSlot({
	container,
	children,
}: {
	container: RefObject<HTMLElement | null>
	children: ReactNode
}) {
	const [slot] = useState(() =>
		typeof document === 'undefined'
			? null
			: Object.assign(document.createElement('div'), { className: 'wb-toolbar-slot' })
	)

	useEffect(() => {
		const root = container.current
		if (!root || !slot) return
		// La barra se desmonta y se vuelve a montar (modo vista, diálogo de links): se re-engancha.
		const attach = () => {
			if (slot.isConnected) return
			root.querySelector('.App-toolbar .Stack_horizontal')?.append(slot)
		}
		attach()
		const observer = new MutationObserver(attach)
		observer.observe(root, { childList: true, subtree: true })
		return () => {
			observer.disconnect()
			slot.remove()
		}
	}, [container, slot])

	return slot ? createPortal(children, slot) : null
}
