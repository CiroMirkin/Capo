import { describe, it, expect, vi, beforeEach } from 'vitest'
import { emptyTaskBoard, type TaskBoard } from '@/features/tasks/model/taskBoard'
import { diffTaskBoard } from '@/features/tasks/model/taskBoardDiff'
import { LocalStorageDataSource } from '@/shared/lib/repository'
import {
	SnapshotTaskBoardSource,
	TaskBoardRepository,
	type TaskBoardSource,
} from './taskBoardRepository'

const board = (): TaskBoard => [
	{ id: 'c1', status: 'To do', tasks: [{ id: 'a', descriptionText: 'Tarea a' }] },
	{ id: 'c2', status: 'Done', tasks: [] },
]

const fakeSource = (stored: TaskBoard | null = null) =>
	({
		read: vi.fn(async () => stored),
		applyChanges: vi.fn(async () => {}),
	}) satisfies TaskBoardSource

describe('TaskBoardRepository', () => {
	it('getAll devuelve el tablero vacío si la fuente no tiene nada', async () => {
		expect(await new TaskBoardRepository(fakeSource()).getAll('b1')).toEqual(emptyTaskBoard)
	})

	it('save sin cambios no llama a la fuente', async () => {
		const source = fakeSource()

		await new TaskBoardRepository(source).save(board(), 'b1', board())

		expect(source.applyChanges).not.toHaveBeenCalled()
	})

	it('save le pasa a la fuente solo el diff entre previous y next', async () => {
		const source = fakeSource()
		const next = board()
		next[1].tasks.push(next[0].tasks.shift()!)

		await new TaskBoardRepository(source).save(next, 'b1', board())

		expect(source.applyChanges).toHaveBeenCalledWith('b1', diffTaskBoard(board(), next), next)
	})
})

describe('SnapshotTaskBoardSource', () => {
	beforeEach(() => localStorage.clear())

	it('guarda el tablero entero en localStorage y lo lee de vuelta', async () => {
		const repository = new TaskBoardRepository(
			new SnapshotTaskBoardSource(new LocalStorageDataSource<TaskBoard>({ key: 'k' }))
		)
		const next = board()
		next[0].tasks[0] = { ...next[0].tasks[0], descriptionText: 'editada' }

		await repository.save(next, 'b1', board())

		expect(JSON.parse(localStorage.getItem('k')!)).toEqual(next)
		expect(await repository.getAll('b1')).toEqual(next)
	})
})
