import { AvailableTags } from '../model/tags'
import { useTranslation } from 'react-i18next'
import { translateTagGroup } from '../model/translateTagGroup'
import { useActualTagGroup } from './useActualTagGroup'

export const useAvailableTags = (): AvailableTags => {
	const { tags } = useActualTagGroup()
	const { t } = useTranslation()
	return tags.map((tagGroup) => translateTagGroup(tagGroup, t))
}
