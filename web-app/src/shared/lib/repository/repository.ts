import type { ReadSource, SnapshotSource } from './dataSource'

/** No sabe si la fuente es localStorage o el server. `fallback` cubre el caso sin nada guardado. */
export class Repository<T> {
	constructor(
		protected readonly source: ReadSource<T>,
		private readonly fallback: () => T
	) {}

	async getAll(boardId: string): Promise<T> {
		return (await this.source.read(boardId)) ?? this.fallback()
	}
}

/** Guarda el agregado entero en cada `save`. */
export class SnapshotRepository<T, O = void> extends Repository<T> {
	constructor(
		protected readonly source: SnapshotSource<T, O>,
		fallback: () => T
	) {
		super(source, fallback)
	}

	save(value: T, boardId: string, options?: O): Promise<void> {
		return this.source.write(boardId, value, options)
	}
}
