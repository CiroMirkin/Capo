import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { MinimalTiptapViewer } from './MinimalTiptapViewer'

describe('Componente MinimalTiptapViewer', () => {
	it('Debe renderizar headings, cita y lista de tareas del contenido HTML', () => {
		const html =
			'<h1>Título</h1><blockquote><p>Cita</p></blockquote>' +
			'<ul data-type="taskList"><li data-type="taskItem" data-checked="true"><div><p>Hecho</p></div></li></ul>'

		const { container } = render(<MinimalTiptapViewer value={html} />)

		expect(container.querySelector('h1')).toBeInTheDocument()
		expect(container.querySelector('blockquote')).toBeInTheDocument()
		expect(container.querySelector('ul[data-type="taskList"]')).toBeInTheDocument()
	})

	it('No debe renderizar barra de herramientas', () => {
		const { container } = render(<MinimalTiptapViewer value='<p>hola</p>' />)
		expect(container.querySelector('button')).not.toBeInTheDocument()
	})
})
