import { sortTasksByPriority } from './sortTasksByPriority'
import type { taskModel } from '@/features/tasks/model/task'

const task = (id: string, priorities: (number | undefined)[]): taskModel => ({
	id,
	descriptionText: id,
	tags: priorities.map((priority, i) => ({ id: `${id}-${i}`, name: '', priority })),
})

describe('sortTasksByPriority', () => {
	test('ordena por la prioridad más alta (número menor) de las etiquetas', () => {
		const sorted = sortTasksByPriority([
			task('necesaria', [3]),
			task('urgente', [1]),
			task('importante', [2]),
		])
		expect(sorted.map((t) => t.id)).toEqual(['urgente', 'importante', 'necesaria'])
	})

	test('las tareas sin prioridad van al final y conservan su orden', () => {
		const sorted = sortTasksByPriority([
			task('sin-tags', []),
			task('urgente', [1]),
			task('tag-sin-prioridad', [undefined]),
		])
		expect(sorted.map((t) => t.id)).toEqual(['urgente', 'sin-tags', 'tag-sin-prioridad'])
	})
})
