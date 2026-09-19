import { UsageHistory } from '../../model/usageHistory'
import { UsageHistoryRepository } from './usageHistoryRepository'

export class NextjsUsageHistoryRepository implements UsageHistoryRepository {
	async getAll(boardId: string): Promise<UsageHistory> {
		const { getUsageHistory } = await import('../actions/getUsageHistory')
		return getUsageHistory({ boardId })
	}

	async save(history: UsageHistory, boardId: string): Promise<UsageHistory> {
		const { saveUsageHistory } = await import('../actions/saveUsageHistory')
		return saveUsageHistory({ boardId, history })
	}

	/** Solo lo usan usuarios logueados - el modo invitado no pasa por acá */
	async incrementSession(params: {
		boardId: string
		incrementDuration: number
		now: number
		dayStart: number
	}): Promise<void> {
		const { incrementUsageSession } = await import('../actions/incrementUsageSession')
		return incrementUsageSession(params)
	}
}

export const nextjsUsageHistoryRepository = new NextjsUsageHistoryRepository()
