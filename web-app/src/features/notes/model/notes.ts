export type Notes = string
export const defaultNotes: Notes = ''
export const maxLengthOfNotes = 10000

/** @returns True si notes esta dentro del limite de caracteres permitido (sin contar espacios en blanco). */
export const checkMaxLengthOfNotes = (notes: Notes): boolean => {
	return notes.replace(/\s/g, '').length <= maxLengthOfNotes
}
