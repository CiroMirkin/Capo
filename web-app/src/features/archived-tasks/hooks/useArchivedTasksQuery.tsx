import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession, useBoardId } from '@/features/auth'
import { Archive, emptyArchivedTasks } from '../model/archive'
import { fetchArchivedTasks, saveArchivedTasks } from '../api/repository'

const archivedTasksQueryKey = ['archived-tasks']

export const useArchivedTasksQuery = () => {
	const { session } = useSession()
	const queryClient = useQueryClient()

	const userId = session?.user.id ?? 'guest'
	const boardId = useBoardId((state) => state.board_id)
	const fullQueryKey = [...archivedTasksQueryKey, userId, boardId] as const

	const { data, isLoading, isError, error } = useQuery({
		queryKey: fullQueryKey,
		queryFn: () => fetchArchivedTasks(session, boardId),
		enabled: !!boardId,
	})

	const archivedTasks = data ?? emptyArchivedTasks

	const { mutate: rawUpdateArchivedTasks, isPending: isSaving } = useMutation({
		mutationFn: (newArchivedTasks: Archive) =>
			saveArchivedTasks({
				session,
				archivedTasks: newArchivedTasks,
				boardId,
			}),
		onMutate: async (newArchivedTasks: Archive) => {
			await queryClient.cancelQueries({ queryKey: fullQueryKey })
			const previousArchivedTasks = queryClient.getQueryData<Archive>(fullQueryKey)
			queryClient.setQueryData(fullQueryKey, newArchivedTasks)
			return { previousArchivedTasks }
		},
		onError: (_err, _newArchivedTasks, context) => {
			if (context?.previousArchivedTasks) {
				queryClient.setQueryData(fullQueryKey, context.previousArchivedTasks)
			}
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: fullQueryKey })
		},
	})

	const updateArchivedTasks = (newArchivedTasks: Archive) => {
		if (data === undefined) return
		rawUpdateArchivedTasks(newArchivedTasks)
	}

	return {
		archivedTasks,
		isLoading,
		isError,
		error,
		updateArchivedTasks,
		isSaving,
	}
}
