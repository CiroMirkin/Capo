import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src'),
		},
	},
	test: {
		environment: 'jsdom',
		globals: true,
		exclude: ['e2e/**', '**/node_modules/**'],
		setupFiles: './src/test-setup.ts',
		// Vite tiene que procesar lowlight/highlight.js: sus imports ESM sin extensión no los resuelve Node.
		server: {
			deps: {
				inline: [/@tiptap\/extension-code-block-lowlight/, /lowlight/, /highlight\.js/],
			},
		},
	},
})
