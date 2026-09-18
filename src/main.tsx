import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './index.css';
import { loadExplorerData } from './lib/data';
import { bindUrlSync, useExplorerStore } from './store';

const container = document.getElementById('root');
if (container === null) {
	throw new Error('missing #root');
}
const root = createRoot(container);
bindUrlSync(useExplorerStore);

loadExplorerData(`${import.meta.env.BASE_URL}data/mf_buildings.json?v=${__DATA_HASH__}`)
	.then((data) => {
		root.render(
			<StrictMode>
				<App data={data} />
			</StrictMode>,
		);
	})
	.catch((err: unknown) => {
		const message = err instanceof Error ? err.message : String(err);
		root.render(
			<div className="p-6 text-ink">
				<h1 className="text-lg font-semibold">Could not load the data file</h1>
				<pre className="mt-2 text-sm text-ink-2">{message}</pre>
			</div>,
		);
	});
