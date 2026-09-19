// Genera un resumen legible en $GITHUB_STEP_SUMMARY a partir del JSON reporter
// de Playwright, para no tener que bajar y servir el HTML report a mano.
import fs from 'fs'

const data = JSON.parse(fs.readFileSync('playwright-report/results.json', 'utf8'))
const rows = []

function walk(suite) {
	for (const s of suite.suites || []) walk(s)
	for (const spec of suite.specs || []) {
		for (const test of spec.tests) {
			const last = test.results[test.results.length - 1]
			if (last.status === 'passed' || last.status === 'skipped') continue
			const err = (last.error?.message || '')
				.split('\n')[0]
				.slice(0, 200)
				.replace(/\|/g, '\\|')
			rows.push(`| ${test.projectName} | ${spec.title} | ${last.status} | ${err} |`)
		}
	}
}

for (const s of data.suites) walk(s)

let out = '## Resultados Playwright\n\n'
if (rows.length === 0) {
	out += 'Todos los tests pasaron. ✅\n'
} else {
	out += `${rows.length} test(s) con fallas:\n\n`
	out += '| Browser | Test | Estado | Error |\n|---|---|---|---|\n'
	out += rows.join('\n') + '\n'
}

fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, out)
