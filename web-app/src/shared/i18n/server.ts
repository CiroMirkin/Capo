import i18next from 'i18next'

import es from './es.json'
import en from './en.json'
import policyEs from './policy.es.json'
import policyEn from './policy.en.json'

const serverI18n = i18next.createInstance()

serverI18n.init({
	lng: 'es',
	resources: {
		en: {
			translation: { ...en, ...policyEn },
		},
		es: {
			translation: { ...es, ...policyEs },
		},
	},
})

export default serverI18n
