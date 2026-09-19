import { TFunction } from 'i18next'
import { eisenhowerTagGroup, devTagGroup, studyTagGroup, kanoTagGroup } from './defaultTags'
import { TagGroup } from './tags'

export const translateTagGroup = (tagGroup: TagGroup, t: TFunction) => {
	if (tagGroup.id == eisenhowerTagGroup.id) {
		const [importantTag, necessaryTag, urgentTeg] = tagGroup.tags
		return {
			...tagGroup,
			tags: [
				{
					...importantTag,
					name: t('tags.important_tag'),
				},
				{
					...necessaryTag,
					name: t('tags.necessary_tag'),
				},
				{
					...urgentTeg,
					name: t('tags.urgent_tag'),
				},
			],
		}
	}

	if (tagGroup.id == devTagGroup.id) {
		const [importantTag, necessaryTag, urgentTeg, explorarTag, resolverTag] = tagGroup.tags
		return {
			...tagGroup,
			tags: [
				{
					...importantTag,
					name: t('dev_tags.important_tag'),
				},
				{
					...necessaryTag,
					name: t('dev_tags.necessary_tag'),
				},
				{
					...urgentTeg,
					name: t('dev_tags.urgent_tag'),
				},
				{
					...explorarTag,
					name: t('dev_tags.explore_tag'),
				},
				{
					...resolverTag,
					name: t('dev_tags.resolve_tag'),
				},
			],
		}
	}

	if (tagGroup.id == studyTagGroup.id) {
		const [importantTag, necessaryTag, urgentTeg, repasarTag, practicarTag] = tagGroup.tags
		return {
			...tagGroup,
			tags: [
				{
					...importantTag,
					name: t('study_tags.important_tag'),
				},
				{
					...necessaryTag,
					name: t('study_tags.necessary_tag'),
				},
				{
					...urgentTeg,
					name: t('study_tags.urgent_tag'),
				},
				{
					...repasarTag,
					name: t('study_tags.review_tag'),
				},
				{
					...practicarTag,
					name: t('study_tags.practice_tag'),
				},
			],
		}
	}

	if (tagGroup.id == kanoTagGroup.id) {
		const [basicoTag, desempenoTag, atractivoTag, indiferenteTag, reversoTag] = tagGroup.tags
		return {
			...tagGroup,
			tags: [
				{
					...basicoTag,
					name: t('kano_tags.basic_tag'),
				},
				{
					...desempenoTag,
					name: t('kano_tags.performance_tag'),
				},
				{
					...atractivoTag,
					name: t('kano_tags.attractive_tag'),
				},
				{
					...indiferenteTag,
					name: t('kano_tags.indifferent_tag'),
				},
				{
					...reversoTag,
					name: t('kano_tags.reverse_tag'),
				},
			],
		}
	}
	return tagGroup
}
