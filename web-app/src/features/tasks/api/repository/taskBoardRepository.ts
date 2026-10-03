import { emptyTaskBoard, TaskBoard } from '@/features/tasks/model/taskBoard'
import { diffTaskBoard, TaskBoardChange } from '@/features/tasks/model/taskBoardDiff'
import { ReadSource, Repository, SnapshotSource } from '@/shared/repository'

/** En vez de guardar snapshots aplica los cambios que calcula el repositorio. */
export interface TaskBoardSource extends ReadSource<TaskBoard> {
	/** `next` sirve a las fuentes que guardan el snapshot entero. */
	applyChanges(boardId: string, changes: TaskBoardChange[], next: TaskBoard): Promise<void>
}

/** No hereda el `save` de snapshot porque guarda solo el diff. */
export class TaskBoardRepository extends Repository<TaskBoard> {
	constructor(protected readonly source: TaskBoardSource) {
		super(source, () => emptyTaskBoard)
	}

	async save(next: TaskBoard, boardId: string, previous: TaskBoard): Promise<void> {
		const changes = diffTaskBoard(previous, next)
		if (!changes.length) return
		await this.source.applyChanges(boardId, changes, next)
	}
}

/** Guarda el tablero entero porque localStorage es local y barato. */
export class SnapshotTaskBoardSource implements TaskBoardSource {
	constructor(private readonly snapshot: SnapshotSource<TaskBoard>) {}

	read(boardId: string): Promise<TaskBoard | null> {
		return this.snapshot.read(boardId)
	}

	applyChanges(boardId: string, _changes: TaskBoardChange[], next: TaskBoard): Promise<void> {
		return this.snapshot.write(boardId, next)
	}
}

/** Con sesión manda el diff al server para que lo aplique en una transacción. */
export class ServerTaskBoardSource implements TaskBoardSource {
	async read(boardId: string): Promise<TaskBoard | null> {
		const { getTaskBoard } = await import('../actions/getTaskBoard')
		return getTaskBoard({ boardId })
	}

	async applyChanges(boardId: string, changes: TaskBoardChange[]): Promise<void> {
		const { applyTaskBoardChanges } = await import('../actions/applyTaskBoardChanges')
		await applyTaskBoardChanges({ boardId, changes })
	}
}
