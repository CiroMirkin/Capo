import { cn } from '@/shared/lib/utils'
import { useTaskBoardQuery } from '../hooks/useTaskBoardQuery'
import { ListOfColumn, ColumnsContent } from '@/features/tasks/ui/Columns/ListOfColumns'

export function TableView({ children }: { children: () => ColumnsContent }) {
	const { taskBoard } = useTaskBoardQuery()
	const columns = (taskBoard ?? []).map((list) => ({
		name: list.status,
		id: list.id,
	}))

	return (
		<div
			className={cn(
				'h-auto pb-2 px-6 md:px-11 flex flex-wrap justify-stretch items-start gap-3'
			)}
		>
			<ListOfColumn columns={columns}>{children}</ListOfColumn>
		</div>
	)
}
