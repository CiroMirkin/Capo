export interface boardModel {
	id: string
	name: string
	themeId?: string
	cardCanvas?: number
}

export const defaultBoard: boardModel = {
	id: 'guest',
	name: 'Tablero básico',
}

export const isThisBoardNameWithinTheLimitOfLetters = (boardName: string): boolean => {
	return boardName.length < 30
}

export const isDefaultBoardName = (boardName: string): boolean => {
	return boardName === defaultBoard.name
}
