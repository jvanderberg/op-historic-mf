import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// Content hash of the data file, appended to its URL so a new build never
// loads a stale cached copy of the previous data file.
const dataHash = createHash('sha256')
	.update(readFileSync(path.resolve(import.meta.dirname, 'public/data/mf_buildings.json')))
	.digest('hex')
	.slice(0, 12);

export default defineConfig({
	base: '/op-historic-mf/',
	plugins: [react(), tailwindcss()],
	define: { __DATA_HASH__: JSON.stringify(dataHash) },
	resolve: {
		alias: { '@': path.resolve(import.meta.dirname, './src') },
	},
});
