import { create } from 'zustand';
import { ALL_SIZES, type BinWidth, type Metric } from './lib/bins';
import { type DistrictSlug, isSizeClass, type SizeClass } from './lib/data';

export type SelectableDistrict = Exclude<DistrictSlug, 'rest'>;

export interface UrlState {
	readonly district: SelectableDistrict;
	readonly sizes: ReadonlySet<SizeClass>;
	readonly metric: Metric;
	readonly binWidth: BinWidth;
	readonly sharedScale: boolean;
	readonly showTable: boolean;
}

export interface ExplorerState extends UrlState {
	readonly selectedBin: number | null;
	readonly hoveredBin: number | null;
	setDistrict: (d: SelectableDistrict) => void;
	toggleSize: (s: SizeClass) => void;
	setSizes: (s: readonly SizeClass[]) => void;
	setMetric: (m: Metric) => void;
	setBinWidth: (w: BinWidth) => void;
	setSharedScale: (v: boolean) => void;
	setSelectedBin: (i: number | null) => void;
	setHoveredBin: (i: number | null) => void;
	setShowTable: (v: boolean) => void;
	reset: () => void;
}

const DEFAULTS: UrlState = {
	district: 'flw',
	sizes: ALL_SIZES,
	metric: 'units',
	binWidth: 5,
	sharedScale: false,
	showTable: false,
};

function isBinWidth(n: number): n is BinWidth {
	return n === 1 || n === 5 || n === 10;
}

export function parseUrlState(search: string): UrlState {
	const p = new URLSearchParams(search);
	const sizesParam = p.get('sizes');
	let sizes: ReadonlySet<SizeClass> = DEFAULTS.sizes;
	if (sizesParam !== null) {
		sizes = new Set(sizesParam.split(',').filter(isSizeClass));
	}
	const binParam = Number(p.get('bin'));
	return {
		district: p.get('district') === 'ridgeland' ? 'ridgeland' : 'flw',
		sizes,
		metric: p.get('metric') === 'buildings' ? 'buildings' : 'units',
		binWidth: isBinWidth(binParam) ? binParam : DEFAULTS.binWidth,
		sharedScale: p.get('scale') === 'shared',
		showTable: p.get('table') === '1',
	};
}

export function serializeUrlState(s: UrlState): string {
	const p = new URLSearchParams();
	if (s.district !== DEFAULTS.district) {
		p.set('district', s.district);
	}
	const sizes = [...s.sizes];
	if (sizes.length !== ALL_SIZES.size) {
		p.set('sizes', sizes.join(','));
	}
	if (s.metric !== DEFAULTS.metric) {
		p.set('metric', s.metric);
	}
	if (s.binWidth !== DEFAULTS.binWidth) {
		p.set('bin', String(s.binWidth));
	}
	if (s.sharedScale) {
		p.set('scale', 'shared');
	}
	if (s.showTable) {
		p.set('table', '1');
	}
	const q = p.toString();
	return q === '' ? '' : `?${q}`;
}

export function createExplorerStore(initial: UrlState = DEFAULTS) {
	return create<ExplorerState>()((set) => ({
		...initial,
		selectedBin: null,
		hoveredBin: null,
		setDistrict: (district) => set({ district, selectedBin: null, hoveredBin: null }),
		toggleSize: (s) =>
			set((st) => {
				const next = new Set(st.sizes);
				if (next.has(s)) {
					next.delete(s);
				} else {
					next.add(s);
				}
				return { sizes: next, selectedBin: null };
			}),
		setSizes: (s) => set({ sizes: new Set(s), selectedBin: null }),
		setMetric: (metric) => set({ metric }),
		setBinWidth: (binWidth) => set({ binWidth, selectedBin: null, hoveredBin: null }),
		setSharedScale: (sharedScale) => set({ sharedScale }),
		setSelectedBin: (selectedBin) => set({ selectedBin }),
		setHoveredBin: (hoveredBin) => set({ hoveredBin }),
		setShowTable: (showTable) => set({ showTable }),
		reset: () => set({ ...DEFAULTS, selectedBin: null, hoveredBin: null }),
	}));
}

export const useExplorerStore = createExplorerStore(
	typeof window === 'undefined' ? DEFAULTS : parseUrlState(window.location.search),
);

/** Keep the address bar in sync with the shareable part of the state. */
export function bindUrlSync(store: typeof useExplorerStore): () => void {
	return store.subscribe((s) => {
		const q = serializeUrlState(s);
		const url = `${window.location.pathname}${q}${window.location.hash}`;
		if (`${window.location.pathname}${window.location.search}${window.location.hash}` !== url) {
			window.history.replaceState(null, '', url);
		}
	});
}
