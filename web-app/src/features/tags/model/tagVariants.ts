// Catálogo completo sembrado en la DB desde 'prisma/seed.ts'
export const tagVariantsList = [
	{ id: 'gray', bg: 'bg-[#8f8f8f]', text: 'text-white' },
	{
		id: 'gray-subtle',
		bg: 'bg-[#ebebeb] dark:bg-[#1f1f1f]',
		text: 'text-[#171717] dark:text-[#ededed]',
	},
	{ id: 'blue', bg: 'bg-[#006bff]', text: 'text-white' },
	{
		id: 'blue-subtle',
		bg: 'bg-[#e9f4ff] dark:bg-[#022248]',
		text: 'text-[#005ff2] dark:text-[#47a8ff]',
	},
	{ id: 'purple', bg: 'bg-[#a000f8]', text: 'text-white' },
	{
		id: 'purple-subtle',
		bg: 'bg-[#f9f0ff] dark:bg-[#341142]',
		text: 'text-[#7d00cc] dark:text-[#c472fb]',
	},
	{ id: 'amber', bg: 'bg-[#ffae00]', text: 'text-black' },
	{
		id: 'amber-subtle',
		bg: 'bg-[#fff4cf] dark:bg-[#361900]',
		text: 'text-[#aa4d00] dark:text-[#ff9300]',
	},
	{ id: 'red', bg: 'bg-[#fc0035]', text: 'text-white' },
	{
		id: 'red-subtle',
		bg: 'bg-[#ffe8ea] dark:bg-[#440d13]',
		text: 'text-[#d8001b] dark:text-[#ff565f]',
	},
	{ id: 'pink', bg: 'bg-[#f22782]', text: 'text-white' },
	{
		id: 'pink-subtle',
		bg: 'bg-[#ffdfeb] dark:bg-[#571032]',
		text: 'text-[#c41562] dark:text-[#ff4d8d]',
	},
	{ id: 'green', bg: 'bg-[#28a948]', text: 'text-white' },
	{
		id: 'green-subtle',
		bg: 'bg-[#e5fce7] dark:bg-[#00320b]',
		text: 'text-[#107d32] dark:text-[#00ca50]',
	},
	{ id: 'teal', bg: 'bg-[#00ac96]', text: 'text-white' },
	{
		id: 'inverted',
		bg: 'bg-[#171717] dark:bg-[#ededed]',
		text: 'text-[#f2f2f2] dark:text-[#1a1a1a]',
	},
	{
		id: 'trial',
		bg: 'bg-gradient-to-br from-[#0070F3] to-[#F81CE5]',
		text: 'text-white',
	},
] as const satisfies readonly { id: string; bg: string; text: string }[]

export type TagVariant = (typeof tagVariantsList)[number]
