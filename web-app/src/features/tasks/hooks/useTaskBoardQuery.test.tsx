import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { toast } from 'sonner'
import { useTaskBoardQuery } from './useTaskBoardQuery'
import { fetchTaskBoard, saveTaskBoard } from '@/features/tasks/api/repository'
import { useBoardId } from '@/features/auth/state/store'
import type { TaskBoard } from '../model/taskBoard'

vi.mock('@/features/tasks/api/repository', () => ({
	fetchTaskBoard: vi.fn().mockResolvedValue([]),
	saveTaskBoard: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('sonner', () => ({
	toast: { warning: vi.fn(), success: vi.fn(), error: vi.fn(), info: vi.fn() },
}))

// Mock liviano de la barrel: evita arrastrar AuthCard real (que pega a Better
// Auth) solo para leer useSession/useBoardId en este hook.
vi.mock('@/features/auth', async () => ({
	useSession: () => ({ session: { user: { id: 'u1' } }, isLoading: false }),
	useBoardId: (await import('@/features/auth/state/store')).useBoardId,
}))

// El componente de tablero monta `useBoardQuery(boardId)` (que sincroniza el store en
// un efecto) y `useTaskBoardQuery()` (que lee ese store) en el mismo render: al entrar
// a un tablero por primera vez en la sesión, el store todavía tiene el `board_id`
// default ('') en ese primer render, antes de que el efecto lo actualice.
describe('useTaskBoardQuery', () => {
	beforeEach(() => {
		vi.mocked(fetchTaskBoard).mockClear()
		vi.mocked(saveTaskBoard).mockClear()
		vi.mocked(toast.warning).mockClear()
		useBoardId.setState({ board_id: '' })
	})

	it('no pega al servidor mientras el boardId del store todavía es el default', async () => {
		const queryClient = new QueryClient()
		const wrapper = ({ children }: { children: ReactNode }) => (
			<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
		)

		renderHook(() => useTaskBoardQuery(), { wrapper })

		// Nada debería dispararse todavía: no hay boardId real.
		expect(fetchTaskBoard).not.toHaveBeenCalled()

		// El efecto de useBoardQuery corrige el store un instante después.
		act(() => {
			useBoardId.getState().setBoardId('real-board-id')
		})

		await waitFor(() =>
			expect(fetchTaskBoard).toHaveBeenCalledWith(expect.anything(), 'real-board-id')
		)
		expect(fetchTaskBoard).not.toHaveBeenCalledWith(expect.anything(), '')
	})

	it('pide confirmación por toast antes de vaciar un tablero que tenía tareas, y no lo persiste hasta confirmar', async () => {
		const boardWithTasks: TaskBoard = [
			{
				id: 'col-1',
				status: 'To do',
				tasks: [
					{ id: 't1', descriptionText: 'Tarea 1' },
					{ id: 't2', descriptionText: 'Tarea 2' },
				],
			},
		]
		vi.mocked(fetchTaskBoard).mockResolvedValue(boardWithTasks)

		const queryClient = new QueryClient()
		const wrapper = ({ children }: { children: ReactNode }) => (
			<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
		)

		const { result } = renderHook(() => useTaskBoardQuery(), { wrapper })

		act(() => {
			useBoardId.getState().setBoardId('board-with-tasks')
		})

		await waitFor(() => expect(result.current.taskBoard).toEqual(boardWithTasks))

		const emptiedBoard: TaskBoard = [{ id: 'col-1', status: 'To do', tasks: [] }]

		act(() => {
			result.current.updateTaskBoard(emptiedBoard)
		})

		// El vaciado no se persiste solo: se pide confirmación primero.
		expect(saveTaskBoard).not.toHaveBeenCalled()
		expect(toast.warning).toHaveBeenCalledTimes(1)

		const confirmAction = vi.mocked(toast.warning).mock.calls[0][1]?.action as
			| { onClick: () => void }
			| undefined

		act(() => {
			confirmAction?.onClick()
		})

		await waitFor(() => expect(saveTaskBoard).toHaveBeenCalledTimes(1))
		expect(saveTaskBoard).toHaveBeenCalledWith(
			expect.objectContaining({ taskBoard: emptiedBoard })
		)
	})

	it('borrar/archivar la única tarea del tablero (TaskListInEachColumn) se persiste sin pedir confirmación', async () => {
		const boardWithOneTask: TaskBoard = [
			{ id: 'col-1', status: 'To do', tasks: [{ id: 't1', descriptionText: 'Tarea 1' }] },
		]
		vi.mocked(fetchTaskBoard).mockResolvedValue(boardWithOneTask)

		const queryClient = new QueryClient()
		const wrapper = ({ children }: { children: ReactNode }) => (
			<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
		)

		const { result } = renderHook(() => useTaskBoardQuery(), { wrapper })

		act(() => {
			useBoardId.getState().setBoardId('board-with-one-task')
		})

		await waitFor(() => expect(result.current.taskBoard).toEqual(boardWithOneTask))

		// Update incremental (lo que emiten DeleteTaskButton/useArchiveTask): un
		// TaskListInEachColumn, no un TaskBoard completo.
		const listWithTaskDeleted = [[]]

		act(() => {
			result.current.updateTaskBoard(listWithTaskDeleted)
		})

		expect(toast.warning).not.toHaveBeenCalled()
		await waitFor(() => expect(saveTaskBoard).toHaveBeenCalledTimes(1))
	})

	const renderWithBoard = async (board: TaskBoard) => {
		vi.mocked(fetchTaskBoard).mockResolvedValue(board)
		const queryClient = new QueryClient()
		const wrapper = ({ children }: { children: ReactNode }) => (
			<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
		)
		const hook = renderHook(() => useTaskBoardQuery(), { wrapper })
		act(() => {
			useBoardId.getState().setBoardId('board-diff')
		})
		await waitFor(() => expect(hook.result.current.taskBoard).toEqual(board))
		return hook
	}

	const initialBoard: TaskBoard = [
		{ id: 'col-1', status: 'To do', tasks: [{ id: 't1', descriptionText: 'Tarea 1' }] },
		{ id: 'col-2', status: 'Done', tasks: [] },
	]

	it('saveTaskBoard recibe como previous la cache de antes del update optimista', async () => {
		const { result } = await renderWithBoard(initialBoard)
		const next: TaskBoard = [
			{ ...initialBoard[0], tasks: [{ id: 't1', descriptionText: 'editada' }] },
			initialBoard[1],
		]

		act(() => {
			result.current.updateTaskBoard(next)
		})

		await waitFor(() => expect(saveTaskBoard).toHaveBeenCalledTimes(1))
		expect(saveTaskBoard).toHaveBeenCalledWith(
			expect.objectContaining({ taskBoard: next, previous: initialBoard })
		)
	})

	it('TaskListInEachColumn arma el tablero completo con joinTaskListsAndTaskBoard', async () => {
		const { result } = await renderWithBoard(initialBoard)

		act(() => {
			result.current.updateTaskBoard([[], [{ id: 't1', descriptionText: 'Tarea 1' }]])
		})

		await waitFor(() => expect(saveTaskBoard).toHaveBeenCalledTimes(1))
		expect(saveTaskBoard).toHaveBeenCalledWith(
			expect.objectContaining({
				taskBoard: [
					{ ...initialBoard[0], tasks: [] },
					{ ...initialBoard[1], tasks: [{ id: 't1', descriptionText: 'Tarea 1' }] },
				],
				previous: initialBoard,
			})
		)
	})

	it('dos updateTaskBoard seguidos se guardan en serie y el previous del segundo es el next del primero', async () => {
		const { result } = await renderWithBoard(initialBoard)
		let releaseFirst = () => {}
		vi.mocked(saveTaskBoard).mockImplementationOnce(
			() => new Promise<void>((resolve) => (releaseFirst = resolve))
		)
		const first: TaskBoard = [
			{
				...initialBoard[0],
				tasks: [...initialBoard[0].tasks, { id: 'p', descriptionText: 'Padre' }],
			},
			initialBoard[1],
		]
		const second: TaskBoard = [
			{
				...first[0],
				tasks: [...first[0].tasks, { id: 'h', descriptionText: 'Hija', parentId: 'p' }],
			},
			first[1],
		]

		act(() => {
			result.current.updateTaskBoard(first)
			result.current.updateTaskBoard(second)
		})

		await waitFor(() => expect(saveTaskBoard).toHaveBeenCalledTimes(1))
		// La segunda espera a que termine la primera (scope de mutación).
		await new Promise((r) => setTimeout(r, 20))
		expect(saveTaskBoard).toHaveBeenCalledTimes(1)

		act(() => releaseFirst())

		await waitFor(() => expect(saveTaskBoard).toHaveBeenCalledTimes(2))
		expect(vi.mocked(saveTaskBoard).mock.calls[1][0]).toEqual(
			expect.objectContaining({ taskBoard: second, previous: first })
		)
	})
})
