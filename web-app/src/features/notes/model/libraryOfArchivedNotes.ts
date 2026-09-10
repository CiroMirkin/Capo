import { ArchivedNote } from './archivedNote'

export interface LibraryOfArchivedNotes {
	archive: ArchivedNote[]
}

export const defaultLibraryOfArchivedNotes = {
	archive: [],
}

/**
 * Tope de notas archivadas. Al llegar al tope, archivar pide confirmación para
 * descartar la más antigua (FIFO); si se rechaza, no se archiva.
 */
export const maxArchivedNotes = 30
