export interface ReadSource<T> {
	read(boardId: string): Promise<T | null>
}

/** `O` son opciones que cada llamada a `write` puede pasar. */
export interface SnapshotSource<T, O = void> extends ReadSource<T> {
	write(boardId: string, value: T, options?: O): Promise<void>
}
