import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../generated/prisma/client'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

// Catálogo completo de temas. El cliente sólo embebe un subconjunto
// (fallback de invitado) en src/shared/preferences/theme/model/themesList.ts.
const themes = [
	{ id: 'orange', bg: 'bg-orange-400', text: 'text-black', column: 'bg-orange-100', task: 'bg-orange-300', reminder: 'bg-orange-200' },
	{ id: 'amber', bg: 'bg-[#FAC335]', text: 'text-black', column: 'bg-amber-100', task: 'bg-amber-300', reminder: 'bg-amber-200' },
	{ id: 'lime', bg: 'bg-lime-400', text: 'text-black', column: 'bg-lime-100', task: 'bg-lime-300', reminder: 'bg-lime-200' },
	{ id: 'green', bg: 'bg-green-400', text: 'text-black', column: 'bg-green-100', task: 'bg-green-300', reminder: 'bg-green-200' },
	{ id: 'teal', bg: 'bg-teal-400', text: 'text-black', column: 'bg-teal-100', task: 'bg-teal-300', reminder: 'bg-teal-200' },
	{ id: 'blue', bg: 'bg-blue-400', text: 'text-black', column: 'bg-blue-100', task: 'bg-blue-300', reminder: 'bg-blue-200' },
	{ id: 'indigo', bg: 'bg-indigo-400', text: 'text-black', column: 'bg-indigo-100', task: 'bg-indigo-300', reminder: 'bg-indigo-200' },
	{ id: 'violet', bg: 'bg-violet-400', text: 'text-black', column: 'bg-violet-100', task: 'bg-violet-300', reminder: 'bg-violet-200' },
	{ id: 'fuchsia', bg: 'bg-fuchsia-400', text: 'text-black', column: 'bg-fuchsia-100', task: 'bg-fuchsia-300', reminder: 'bg-fuchsia-200' },
	{ id: 'rose', bg: 'bg-rose-400', text: 'text-black', column: 'bg-rose-100', task: 'bg-rose-300', reminder: 'bg-rose-200' },
	{ id: 'slate', bg: 'bg-slate-400', text: 'text-black', column: 'bg-slate-100', task: 'bg-stone-300', reminder: 'bg-slate-200' },
	{ id: 'stone', bg: 'bg-stone-400', text: 'text-black', column: 'bg-stone-100', task: 'bg-slate-300', reminder: 'bg-stone-200' },
	{ id: 'stone-red-accent', bg: 'bg-stone-400', text: 'text-black', column: 'bg-stone-100', task: 'bg-red-300', reminder: 'bg-stone-200' },
	{ id: 'BMO', bg: 'bg-[#317B71]', text: 'text-black', column: 'bg-[#ECFDEDC9]', task: 'bg-[#FDEF63]', reminder: 'bg-[#FDEF63]' },
	{ id: 'fen', bg: 'bg-[#AB214F]', text: 'text-black', column: 'bg-[#FFD7DC]', task: 'bg-[#FF8F9F]', reminder: 'bg-[#FF8F9F]' },
	{ id: 'macha', bg: 'bg-[#69B125]', text: 'text-black', column: 'bg-[#F2FFE0]', task: 'bg-[#A7DE73]', reminder: 'bg-[#FEBEC7]' },
	{ id: 'matcha mori', bg: 'bg-[#7DA14A]', text: 'text-[#FFF1C1]', column: 'bg-[#FFF2C9]', columnText: 'text-black', task: 'bg-[#C3C96F]', taskText: 'text-black', reminder: 'bg-[#8CC13D]' },
	{ id: 'dream', bg: 'bg-[#F3E1A8]', text: 'text-[#3E36C4]', column: 'bg-[#E8E6F8]', columnText: 'text-[#3E36C4]', task: 'bg-[#9F99DF]', taskText: 'text-[#241F5C]', reminder: 'bg-[#8F8AD6]' },
	{ id: 'primary', bg: 'bg-[#A9784E]', text: 'text-[#F4EFE4]', column: 'bg-[#EFE8D6]', columnText: 'text-[#4A3728]', task: 'bg-[#7FB3AD]', taskText: 'text-black', reminder: 'bg-[#D98E6A]' },
	{ id: 'nube', bg: 'bg-[#98A8D2]', text: 'text-black', column: 'bg-[#F1ECDE]', task: 'bg-[#E8A990]', reminder: 'bg-[#E7D3AA]' },
	{ id: 'nube lila', bg: 'bg-[#596CAD]', text: 'text-white', column: 'bg-[#EEEAF3]', columnText: 'text-black', task: 'bg-[#DCB0C3]', taskText: 'text-black', reminder: 'bg-[#9384B6]' },
	{ id: 'nube rosa', bg: 'bg-[#9FAAD2]', text: 'text-black', column: 'bg-[#EEEAF3]', task: 'bg-[#E4D3DD]', reminder: 'bg-[#DCB0C3]' },
	{ id: 'nube menta', bg: 'bg-[#B9D9C5]', text: 'text-black', column: 'bg-[#E5ECD4]', task: 'bg-[#D2CFDC]', reminder: 'bg-[#ECDCA8]' },
	{ id: 'brisa', bg: 'bg-gradient-to-t from-[#c1dfc4] to-[#deecdd]', text: 'text-[#2F4A3A]', column: 'bg-[#FBFDFB]', columnText: 'text-black', task: 'bg-[#A7CDB0]', taskText: 'text-black', reminder: 'bg-[#E6D9A8]' },
	{ id: 'orquidea', bg: 'bg-gradient-to-b from-[#7028e4] to-[#e5b2ca]', text: 'text-white', column: 'bg-[#F3E6EF]', columnText: 'text-black', task: 'bg-[#C9A0DC]', taskText: 'text-black', reminder: 'bg-[#E5B2CA]' },
	{ id: 'algodon', bg: 'bg-gradient-to-t from-[#fad0c4] to-[#ffd1ff]', text: 'text-[#5A3A4A]', column: 'bg-[#FFF5FB]', columnText: 'text-black', task: 'bg-[#F7B8D0]', taskText: 'text-black', reminder: 'bg-[#FAD0C4]' },
	{ id: 'lavanda', bg: 'bg-gradient-to-b from-[#a18cd1] to-[#fbc2eb]', text: 'text-white', column: 'bg-[#FBEFF8]', columnText: 'text-black', task: 'bg-[#C3A9E0]', taskText: 'text-black', reminder: 'bg-[#FBC2EB]' },
	{ id: 'coral', bg: 'bg-gradient-to-tr from-[#ff9a9e] to-[#fad0c4]', text: 'text-[#5A2E2E]', column: 'bg-[#FFF3EF]', columnText: 'text-black', task: 'bg-[#FBB5A8]', taskText: 'text-black', reminder: 'bg-[#FAD0C4]' },
	{ id: 'marea', bg: 'bg-gradient-to-r from-[#243949] to-[#517fa4]', text: 'text-white', column: 'bg-[#DCE6ECE0]', columnText: 'text-[#1B2A36]', task: 'bg-[#93B2C6]', taskText: 'text-[#15242F]', reminder: 'bg-[#C3D6E0]' },
	{ id: 'bruma', bg: 'bg-gradient-to-b from-[#4E6063] via-[#9DAB9D] to-[#CBD8BF]', text: 'text-[#F0F3EC]', column: 'bg-[#EEF1E7]', columnText: 'text-[#2E3A38]', task: 'bg-[#9DAB9D]', taskText: 'text-black', reminder: 'bg-[#B4C0AE]' },
	{ id: 'amanecer', bg: 'bg-gradient-to-b from-[#050608] via-[#3A4166] to-[#F3EFE8]', text: 'text-white', column: 'bg-[#F3EFE8E0]', columnText: 'text-[#1B2036]', task: 'bg-[#9BA4C0]', taskText: 'text-[#1B2036]', reminder: 'bg-[#A9A29A]' },
	{ id: 'takasaki', bg: 'bg-gradient-to-b from-[#16120F] via-[#463174] to-[#717FBE]', text: 'text-white', column: 'bg-[#E7E4F2E0]', columnText: 'text-[#20142E]', task: 'bg-[#B9AFE0]', taskText: 'text-[#241640]', reminder: 'bg-[#EF6587]' },
	{ id: 'aurora', bg: 'bg-[radial-gradient(ellipse_420%_80%_at_50%_98%,#FDFBE8_0%,#FBF388_5%,#F3BF51_10%,#F1826F_15%,#EE6D83_19%,#D1E6F7_30%,#88AFD8_41%,#6589C5_53%,#4C4592_65%,#413581_77%,#3F2F70_89%,#412850_100%)]', text: 'text-white', column: 'bg-[#EAF2FBE0]', columnText: 'text-[#1B2540]', task: 'bg-[#8DB0DA]', taskText: 'text-[#14243A]', reminder: 'bg-[#F3BF51]' },
	{ id: 'crepusculo', bg: 'bg-gradient-to-b from-[#2A1A3A] via-[#413581] to-[#5566A8]', text: 'text-white', column: 'bg-[#E6E2F0E0]', columnText: 'text-[#211533]', task: 'bg-[#8E88C4]', taskText: 'text-[#1E1633]', reminder: 'bg-[#6589C5]' },
	{ id: 'eva-01', bg: 'bg-gradient-to-br from-[#3A1D6E] to-[#1A0B2E]', text: 'text-[#8DC63F]', column: 'bg-[#1C1C1C]', columnText: 'text-[#8DC63F]', task: 'bg-[#8DC63F]', taskText: 'text-black', reminder: 'bg-[#F58220]' },
	{ id: 'retro', bg: 'bg-[#DE6536]', text: 'text-black', column: 'bg-[#EFE8D2]', task: 'bg-[#F5B46C]', reminder: 'bg-[#F5B46C]' },
	{ id: 'Planner', bg: 'bg-[#016BFF]', text: 'text-black', column: 'bg-[#EFE8D2]', task: 'bg-[#F5B46C]', reminder: 'bg-[#F5B46C]' },
	{ id: 'soft', bg: 'bg-[#4D8BC7]', text: 'text-black', column: 'bg-[#FDEFDE]', task: 'bg-[#FFBEA8]', reminder: 'bg-[#FFBEA8]' },
	{ id: 'purple', bg: 'bg-[#8159A7]', text: 'text-black', column: 'bg-[#FDE1FF]', task: 'bg-[#db6bccc9]', reminder: 'bg-[#DB6BCC]' },
	{ id: 'dog', bg: 'bg-[#FF4DA2]', text: 'text-black', column: 'bg-[#FFE6D9]', task: 'bg-[#ffc663]', reminder: 'bg-[#F1AE2B]' },
	{ id: 'frog', bg: 'bg-[#94AE89]', text: 'text-black', column: 'bg-[#FFFAEC]', task: 'bg-[#FFCF64]', reminder: 'bg-[#FFCF64]' },
	{ id: 'sky-frog', bg: 'bg-[#B6D67B]', text: 'text-black', column: 'bg-[#FEF3E3]', task: 'bg-[#9ABFEF]', reminder: 'bg-[#9ABFEF]' },
	{ id: 'soft-bear', bg: 'bg-[#A1634F]', text: 'text-black', column: 'bg-[#EDE3D9]', task: 'bg-[#A5AFA6]', reminder: 'bg-[#A5AFA6]' },
	{ id: 'Edo', bg: 'bg-[#6E9F87]', text: 'text-black', column: 'bg-[#E3DDB6]', task: 'bg-[#C68182]' },
	{ id: 'sofy', bg: 'bg-[#AAB8DB]', text: 'text-black', column: 'bg-[#FDECF1]', task: 'bg-[#F3AAB5]', reminder: 'bg-[#F3AAB5]' },
	{ id: 'nipo', bg: 'bg-[#B3A677]', text: 'text-black', column: 'bg-[#F2E4B8]', task: 'bg-[#FF8D6B]', reminder: 'bg-[#FF8D6B]' },
	{ id: 'green-yellow', bg: 'bg-[#F3B659]', text: 'text-black', column: 'bg-[#F2E4B8]', task: 'bg-[#38b56fd4]', reminder: 'bg-[#18894ABB]' },
	{ id: 'Artaud', bg: 'bg-gradient-to-tr from-[#eab308] via-[#15803d] to-[#166534] backdrop-blur-sm', text: 'text-black', column: 'bg-[#F2E4B8]', task: 'bg-[#25b967d9]', reminder: 'bg-[#18894ABB]' },
	{ id: 'marino-lago', bg: 'bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#00a388] via-[#79bd8f] to-[#beeb9f]', text: 'text-black', column: 'bg-[#FEF3E3]', task: 'bg-[#9ABFEF]', reminder: 'bg-[#9ABFEF]' },
	{ id: 'industrial-vintage', bg: 'bg-[#C84632]', text: 'text-[#F4E8C1]', column: 'bg-[#F4E8C1]', task: 'bg-[#ffbe0cb0]', columnText: 'text-black' },
	{ id: 'violet-evergarden', bg: 'bg-[#3F73CC]', text: 'text-black', column: 'bg-[#EDE7DA]', task: 'bg-[#D3B0F5]', reminder: 'bg-[#D3B0F5]' },
	{ id: 'berry-delight', bg: 'bg-[#E98BAF]', text: 'text-black', column: 'bg-[#E8DFF0]', task: 'bg-[#d979c1]', reminder: 'bg-[#FFD4A3]', taskText: 'text-black' },
	{ id: 'gradient-violet-1', bg: 'bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-[#9d174d] via-[#d946ef] to-[#f0abfc]', text: 'text-black', column: 'bg-[#EDE7DA]', task: 'bg-[#D3B0F5]', reminder: 'bg-[#E68B70]' },
	{ id: 'retro-gaming', bg: 'bg-[#5B9AA0]', text: 'text-black', column: 'bg-[#F4E4BA]', task: 'bg-[#A8DADC]', reminder: 'bg-[#E76F51]' },
	{ id: 'mostaza', bg: 'bg-[#F3BF4B]', text: 'text-black', column: 'bg-[#F8EEDB]', task: 'bg-[#e68b70e3]', reminder: 'bg-[#E68B70]' },
	{ id: 'dan', bg: 'bg-[#C78F82]', text: 'text-black', column: 'bg-[#242424]', task: 'bg-[#D66662]', columnText: 'text-white', reminder: 'bg-[#E68B70]' },
	{ id: 'dark-taxi', bg: 'bg-[#F3BF4B]', text: 'text-black', column: 'bg-[#21273D]', columnText: 'text-white', task: 'bg-[#F8EEDB]' },
	{ id: 'corte lavanda', bg: 'bg-[#FAC335]', text: 'text-black', column: 'bg-[#ECD7AF]', columnText: 'text-black', task: 'bg-[#AE96B7]', taskText: 'text-black' },
	{ id: 'Boca', bg: 'bg-[#2F4173]', text: 'text-[#F8EEDB]', column: 'bg-[#ECD7AF]', columnText: 'text-black', task: 'bg-[#FAC335]', taskText: 'text-[#212020]' },
	{ id: 'pin', bg: 'bg-[#389078]', text: 'text-black', column: 'bg-[#21273D]', columnText: 'text-white', task: 'bg-slate-400', reminder: 'bg-slate-400', taskText: 'text-black' },
	{ id: 'dark-gray', bg: 'bg-[#21273D]', text: 'text-white', column: 'bg-slate-700', task: 'bg-slate-400', columnText: 'text-white', taskText: 'text-black' },
	{ id: 'bebop', bg: 'bg-[#1A1B1B]', text: 'text-white', column: 'bg-[#F6D89C]', task: 'bg-[#da5d4c]', columnText: 'text-black', taskText: 'text-black' },
	{ id: 'prado oscuro', bg: 'bg-[#001D21]', text: 'text-[#FAE9CF]', column: 'bg-[#DFE1CB]', task: 'bg-[#AEB17E]', taskText: 'text-black', columnText: 'text-[#001D21]' },
	{ id: 'wolf', bg: 'bg-[#0C9B99]', text: 'text-white', column: 'bg-[#363f5b]', task: 'bg-[#EADCD9]', taskText: 'text-black', columnText: 'text-white', reminder: 'bg-[#E68B70]' },
	{ id: 'grad-blink-1', bg: 'bg-gradient-to-b from-[#3d1a14] via-[#c84a1d] to-[#e8a87c]', text: 'text-[#FAE9CF]', column: 'bg-[#F6D2AC]', columnText: 'text-black', task: 'bg-[#e35e49c2]' },
	{ id: 'grad-blink-2', bg: 'bg-gradient-to-b from-[#7c2d12] via-[#d97706] to-[#fcd34d]', text: 'text-[#FAE9CF]', column: 'bg-[#1c1b1b]', columnText: 'text-white', task: 'bg-[#F3B659]' },
	{ id: 'grad-blink-3', bg: 'bg-gradient-to-b from-[#1e1b4b] via-[#6d28d9] to-[#a78bfa]', text: 'text-[#FAE9CF]', column: 'bg-[#363f5b]', columnText: 'text-[#FAE9CF]', task: 'bg-[#db6bccc9]' },
	{ id: 'grad-blink-4', bg: 'bg-gradient-to-b from-[#FA9009] via-[#95122A] to-[#150B09]', text: 'text-[#020817ff]', column: 'bg-[#020817ff]', columnText: 'text-[#FAE9CF]', task: 'bg-[#CD6242]' },
]

const eisenhowerTags = [
	{ id: '1', name: '', variant: 'purple-subtle', priority: 2 },
	{ id: '2', name: '', variant: 'green-subtle', priority: 3 },
	{ id: '3', name: '', variant: 'red-subtle', priority: 1 },
]

const devTags = [
	{ id: 'Importante', name: '', variant: 'purple-subtle', priority: 2 },
	{ id: 'Necesario', name: '', variant: 'green-subtle', priority: 3 },
	{ id: 'Urgente', name: '', variant: 'red-subtle', priority: 1 },
	{ id: 'Explorar', name: '', variant: 'blue-subtle' },
	{ id: 'Resolver', name: '', variant: 'amber-subtle', priority: 2 },
]

async function main() {
	console.log('Seeding themes...')

	await Promise.all(
		themes.map((t, order) =>
			prisma.theme.upsert({
				where: { id: t.id },
				update: { ...t, order },
				create: { ...t, order },
			})
		)
	)

	console.log('Seeding default TagGroups...')

	await prisma.tagGroup.upsert({
		where: { id: 'Eisenhower' },
		update: { tags: eisenhowerTags, name: 'Eisenhower' },
		create: { id: 'Eisenhower', name: 'Eisenhower', tags: eisenhowerTags },
	})

	await prisma.tagGroup.upsert({
		where: { id: 'Dev' },
		update: { tags: devTags, name: 'Dev' },
		create: { id: 'Dev', name: 'Dev', tags: devTags },
	})

	console.log('Seeding complete.')
}

main()
	.catch((e) => {
		console.error(e)
		process.exit(1)
	})
	.finally(async () => {
		await prisma.$disconnect()
	})
