import type { SnapshotSource } from './dataSource'

interface ServerActionDataSourceConfig<T, O> {
	read: (boardId: string) => Promise<T | null | undefined>
	write: (boardId: string, value: T, options?: O) => Promise<void>
}

/** Quien la configura importa las actions dinámicamente. */
export class ServerActionDataSource<T, O = void> implements SnapshotSource<T, O> {
	constructor(private readonly config: ServerActionDataSourceConfig<T, O>) {}

	async read(boardId: string): Promise<T | null> {
		return (await this.config.read(boardId)) ?? null
	}

	write(boardId: string, value: T, options?: O): Promise<void> {
		return this.config.write(boardId, value, options)
	}
}
