import { ArchivedNote } from './archivedNote'

export interface LibraryOfArchivedNotes {
	archive: ArchivedNote[]
}

export const defaultLibraryOfArchivedNotes = {
	archive: [],
}

/** Tope de notas archivadas: al superarlo se descarta la más antigua (FIFO). */
export const maxArchivedNotes = 30
