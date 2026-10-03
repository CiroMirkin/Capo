import type { SnapshotSource } from './dataSource'

interface LocalStorageDataSourceConfig<T> {
	/** Con una función se guarda un valor por board. */
	key: string | ((boardId: string) => string)
	/** Devuelve `null` para descartar lo leído. */
	parse?: (raw: unknown) => T | null
	serialize?: (value: T) => unknown
}

export class LocalStorageDataSource<T> implements SnapshotSource<T> {
	constructor(private readonly config: LocalStorageDataSourceConfig<T>) {}

	private keyFor(boardId: string): string {
		const { key } = this.config
		return typeof key === 'function' ? key(boardId) : key
	}

	async read(boardId: string): Promise<T | null> {
		const raw = localStorage.getItem(this.keyFor(boardId))
		if (raw === null) return null
		try {
			const parsed: unknown = JSON.parse(raw)
			return this.config.parse ? this.config.parse(parsed) : (parsed as T)
		} catch {
			return null
		}
	}

	async write(boardId: string, value: T): Promise<void> {
		const stored = this.config.serialize ? this.config.serialize(value) : value
		localStorage.setItem(this.keyFor(boardId), JSON.stringify(stored))
	}
}
