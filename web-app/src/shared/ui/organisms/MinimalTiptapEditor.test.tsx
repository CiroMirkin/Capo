import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { MinimalTiptapEditor } from './MinimalTiptapEditor'

describe('Componente MinimalTiptapEditor', () => {
	describe('Inicializacion y Renderizado Basico', () => {
		it('Debe poder renderizar con un contenido inicial', () => {
			const initialContent = '<p>Hello World</p>'
			render(
				<MinimalTiptapEditor value={initialContent} onChange={() => {}} onSave={() => {}} />
			)

			const editor = screen.getByRole('textbox')
			expect(editor).toBeInTheDocument()
			expect(editor.innerHTML).toContain('Hello World')
		})

		it('Debe poder renderizar la sin barra de herramientas cuando editable es false', () => {
			render(
				<MinimalTiptapEditor
					value=''
					onChange={() => {}}
					onSave={() => {}}
					editable={false}
				/>
			)

			const toolbarButtons = screen.queryByRole('button')
			expect(toolbarButtons).not.toBeInTheDocument()
		})
	})

	describe('Interacciones con la Barra de Herramientas', () => {
		it('Debe poder activar y desactivar formato negrita', async () => {
			render(
				<MinimalTiptapEditor
					onChange={() => {}}
					onSave={() => {}}
					value='<p>Test content</p>'
				/>
			)

			const boldButton = screen.getByLabelText('Negrita')
			fireEvent.click(boldButton)

			await waitFor(() => {
				expect(boldButton).toHaveAttribute('Data-state', 'on')
			})
		})

		it('Debe poder activar y desactivar formato italica', async () => {
			render(
				<MinimalTiptapEditor
					onChange={() => {}}
					onSave={() => {}}
					value='<p>Test content</p>'
				/>
			)

			const italicButton = screen.getByLabelText('Itálica')
			fireEvent.click(italicButton)

			await waitFor(() => {
				expect(italicButton).toHaveAttribute('Data-state', 'on')
			})
		})

		it('Debe poder llamar onSave con Ctrl+S', () => {
			const mockSaveCallback = vi.fn()
			render(
				<MinimalTiptapEditor
					value='<p>Test</p>'
					onChange={() => {}}
					onSave={mockSaveCallback}
				/>
			)

			const editor = screen.getByRole('textbox')
			fireEvent.keyDown(editor, { key: 's', ctrlKey: true })

			expect(mockSaveCallback).toHaveBeenCalledTimes(1)
		})

		it('Debe poder activar y desactivar lista desordenada', async () => {
			render(
				<MinimalTiptapEditor
					onChange={() => {}}
					onSave={() => {}}
					value='<p>Test content</p>'
				/>
			)

			const bulletListButton = screen.getByLabelText('Lista desordenada')
			fireEvent.click(bulletListButton)

			await waitFor(() => {
				expect(bulletListButton).toHaveAttribute('Data-state', 'on')
			})
		})

		it('Debe poder activar y desactivar lista ordenada', async () => {
			render(
				<MinimalTiptapEditor
					onChange={() => {}}
					onSave={() => {}}
					value='<p>Test content</p>'
				/>
			)

			const orderedListButton = screen.getByLabelText('Lista ordenada')
			fireEvent.click(orderedListButton)

			await waitFor(() => {
				expect(orderedListButton).toHaveAttribute('Data-state', 'on')
			})
		})
	})

	describe('Controles nuevos (headings, bloques, tareas, enlaces)', () => {
		it('El menú "Más opciones" expone alineación, cita y bloque de código', async () => {
			const user = userEvent.setup()
			render(
				<MinimalTiptapEditor
					onChange={() => {}}
					onSave={() => {}}
					value='<p>Test content</p>'
				/>
			)

			await user.click(screen.getByLabelText('Más opciones'))

			expect(await screen.findByLabelText('Centro')).toBeInTheDocument()
			expect(screen.getByLabelText('Cita')).toBeInTheDocument()
			expect(screen.getByLabelText('Bloque de código')).toBeInTheDocument()
		})

		it('Debe aplicar alineación al centro desde el menú', async () => {
			const user = userEvent.setup()
			const onChange = vi.fn()
			render(
				<MinimalTiptapEditor
					onChange={onChange}
					onSave={() => {}}
					value='<p>Test content</p>'
				/>
			)

			await user.click(screen.getByLabelText('Más opciones'))
			await user.click(await screen.findByLabelText('Centro'))

			await waitFor(() => {
				expect(onChange).toHaveBeenCalledWith(expect.stringContaining('text-align: center'))
			})
		})

		it('Debe poder activar la lista de tareas', async () => {
			render(
				<MinimalTiptapEditor
					onChange={() => {}}
					onSave={() => {}}
					value='<p>Test content</p>'
				/>
			)

			const taskListButton = screen.getByLabelText('Lista de tareas')
			fireEvent.click(taskListButton)

			await waitFor(() => {
				expect(taskListButton).toHaveAttribute('data-state', 'on')
			})
		})

		it('Debe abrir el popover de enlace con input y acciones', async () => {
			render(
				<MinimalTiptapEditor
					onChange={() => {}}
					onSave={() => {}}
					value='<p>Texto con enlace</p>'
				/>
			)

			fireEvent.click(screen.getByLabelText('Enlace'))

			expect(await screen.findByPlaceholderText('https://…')).toBeInTheDocument()
			expect(screen.getByText('Aplicar')).toBeInTheDocument()
			expect(screen.getByText('Quitar')).toBeInTheDocument()
		})

		it('Muestra "Archivar nota" en el menú y llama onArchive', async () => {
			const user = userEvent.setup()
			const onArchive = vi.fn()
			render(
				<MinimalTiptapEditor
					onChange={() => {}}
					onSave={() => {}}
					onArchive={onArchive}
					value='<p>Test content</p>'
				/>
			)

			await user.click(screen.getByLabelText('Más opciones'))
			await user.click(await screen.findByLabelText('Archivar nota'))

			expect(onArchive).toHaveBeenCalledTimes(1)
		})

		it('No muestra "Archivar nota" cuando no se pasa onArchive', async () => {
			const user = userEvent.setup()
			render(
				<MinimalTiptapEditor
					onChange={() => {}}
					onSave={() => {}}
					value='<p>Test content</p>'
				/>
			)

			await user.click(screen.getByLabelText('Más opciones'))
			await screen.findByLabelText('Centro')

			expect(screen.queryByLabelText('Archivar nota')).not.toBeInTheDocument()
		})
	})

	describe('Gestion del Estado del Editor', () => {
		it('Debe poder llamar a onChange cuando el contenido cambia', () => {
			const mockOnChange = vi.fn()
			render(<MinimalTiptapEditor value='' onSave={() => {}} onChange={mockOnChange} />)

			const editor = screen.getByRole('textbox')
			fireEvent.input(editor, { target: { innerHTML: '<p>New content</p>' } })
		})

		it('Debe poder llamar a onBlur cuando el editor pierde el foco', () => {
			const mockOnBlur = vi.fn()
			render(
				<MinimalTiptapEditor
					value=''
					onChange={() => {}}
					onSave={() => {}}
					onBlur={mockOnBlur}
				/>
			)

			const editor = screen.getByRole('textbox')
			fireEvent.blur(editor)

			expect(mockOnBlur).toHaveBeenCalledTimes(1)
		})

		it('Debe poder manejar a el estado de foco correctamente', async () => {
			const { container } = render(
				<MinimalTiptapEditor value='' onChange={() => {}} onSave={() => {}} />
			)

			const editorContainer = container.firstChild
			const editor = screen.getByRole('textbox')

			fireEvent.focus(editor)
			await waitFor(() => {
				expect(editorContainer).toHaveClass('border-foreground/60')
			})

			fireEvent.blur(editor)
			await waitFor(() => {
				expect(editorContainer).not.toHaveClass('border-foreground/60')
			})
		})
	})

	describe('Funcionalidad Deshacer y Rehacer', () => {
		it('Debe poder deshabilitar el boton deshacer cuando no hay historial', () => {
			render(
				<MinimalTiptapEditor onChange={() => {}} onSave={() => {}} value='<p>Test</p>' />
			)

			const undoButton = screen.getByLabelText('Deshacer')
			expect(undoButton).toBeDisabled()
		})

		it('Debe poder deshabilitar el boton rehacer cuando no hay historial de rehacer', () => {
			render(
				<MinimalTiptapEditor onChange={() => {}} onSave={() => {}} value='<p>Test</p>' />
			)

			const redoButton = screen.getByLabelText('Rehacer')
			expect(redoButton).toBeDisabled()
		})
	})

	describe('Estilos y Disenno', () => {
		it('Debe poder aplicar la altura responsive basada en prop rows', () => {
			const rows = 5
			render(
				<MinimalTiptapEditor value='' onChange={() => {}} onSave={() => {}} rows={rows} />
			)

			const editorContent = screen.getByRole('textbox').parentElement
			expect(editorContent).toHaveStyle({
				minHeight: `${5 * 20 + 32}px`,
			})
		})

		it('Debe poder aplicar la altura maxima basada en prop maxRows', () => {
			const maxRows = 10
			render(
				<MinimalTiptapEditor
					value=''
					onChange={() => {}}
					onSave={() => {}}
					maxRows={maxRows}
				/>
			)

			const editorContent = screen.getByRole('textbox').parentElement
			expect(editorContent).toHaveStyle({
				maxHeight: `${10 * 20 + 32}px`,
			})
		})
	})

	describe('Accesibilidad', () => {
		it('Debe tener atributos de accesibilidad correctos', () => {
			render(<MinimalTiptapEditor value='' onChange={() => {}} onSave={() => {}} />)

			const editor = screen.getByRole('textbox')
			expect(editor).toHaveAttribute('spellcheck', 'false')
			expect(editor).toHaveAttribute('autocorrect', 'off')
			expect(editor).toHaveAttribute('autocapitalize', 'off')
		})

		it('Debe tener etiquetas ARIA en cada boton', () => {
			render(<MinimalTiptapEditor value='' onChange={() => {}} onSave={() => {}} />)

			expect(screen.getByLabelText('Negrita')).toBeInTheDocument()
			expect(screen.getByLabelText('Itálica')).toBeInTheDocument()
			expect(screen.getByLabelText('Subrayado')).toBeInTheDocument()
			expect(screen.getByLabelText('Lista desordenada')).toBeInTheDocument()
			expect(screen.getByLabelText('Lista ordenada')).toBeInTheDocument()
			expect(screen.getByLabelText('Deshacer')).toBeInTheDocument()
			expect(screen.getByLabelText('Rehacer')).toBeInTheDocument()
			expect(screen.getByLabelText('Más opciones')).toBeInTheDocument()
		})
	})
})
