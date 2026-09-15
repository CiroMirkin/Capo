export type NotesAndComments = string

export const maxLengthOfNotesAndComments = 5000

/** @returns True si notesAndComments esta dentro del limite de caracteres permitido (sin contar espacios en blanco). */
export const checkMaxLengthOfNotesAndComments = (notesAndComments: NotesAndComments): boolean => {
	return notesAndComments.replace(/\s/g, '').length <= maxLengthOfNotesAndComments
}
