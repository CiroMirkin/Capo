import { useUsageHistoryQuery } from '../hooks/useUsageHistoryQuery'
import UsageRecord from './UsageRecord'
import { EmptySpaceText } from '@/shared/ui/atoms/EmptySpaceText'
import { Spinner } from '@/shared/ui/atoms/spinner'
import { useTranslation } from 'react-i18next'
import UsageCalendar from './UsageCalendar'

export default function UsageHistory() {
	const { t } = useTranslation()
	const { usageHistory, isLoading } = useUsageHistoryQuery()

	if (isLoading) return <Spinner size={30} />

	const theUsageHistoryIsEmpty = !usageHistory.length
	const [today, ...usageRecords] = [...usageHistory]
		.map((usageRecord) => <UsageRecord key={usageRecord.date} usageRecord={usageRecord} />)
		.reverse()

	return (
		<div className='flex flex-col gap-4'>
			<div className='flex flex-col md:flex-row md:justify-center gap-4'>
				<UsageCalendar usageHistory={usageHistory} />
				{today}
			</div>
			<div className='flex flex-wrap gap-4'>
				{theUsageHistoryIsEmpty && <EmptySpaceText>{t('usage_history.empty')}</EmptySpaceText>}
				{usageRecords}
			</div>
		</div>
	)
}
