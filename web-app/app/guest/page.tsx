import { BoardPage } from '../board/[id]/BoardPage'
import { defaultBoard } from '@/features/boards'

export default function GuestRoute() {
	return <BoardPage boardId={defaultBoard.id} />
}
