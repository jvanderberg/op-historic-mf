import { type Building, SIZE_CLASSES, type SizeClass } from './data';

/** Which buildings a panel covers, e.g. "in this district" or "everything else". */
export type Scope = (b: Building) => boolean;

export type Metric = 'buildings' | 'units' | 'units_per_sqmi';
export type BinWidth = 1 | 5 | 10;

export const METRIC_LABEL: Readonly<Record<Metric, string>> = {
	units: 'units',
	buildings: 'buildings',
	units_per_sqmi: 'units / sq mi',
};

export function formatValue(v: number): string {
	return v.toLocaleString(undefined, { maximumFractionDigits: v !== 0 && v < 10 ? 1 : 0 });
}

/** Fixed year domain so every chart shares the same x axis. */
export const DOMAIN_START = 1860;
export const DOMAIN_END = 2029;

export interface Bin {
	readonly start: number;
	readonly end: number;
	readonly label: string;
}

export function makeBins(width: BinWidth): readonly Bin[] {
	const bins: Bin[] = [];
	for (let start = DOMAIN_START; start <= DOMAIN_END; start += width) {
		const end = start + width - 1;
		let label: string;
		if (width === 1) {
			label = String(start);
		} else if (width === 10) {
			label = `${start}s`;
		} else {
			label = `${start}-${String(end).slice(2)}`;
		}
		bins.push({ start, end, label });
	}
	return bins;
}

export function binIndex(year: number, width: BinWidth): number | null {
	if (year < DOMAIN_START || year > DOMAIN_END) {
		return null;
	}
	return Math.floor((year - DOMAIN_START) / width);
}

export type StackRow = Readonly<Record<SizeClass, number>> & { readonly total: number };

export function emptyRow(): StackRow {
	return { '2': 0, '3': 0, '4': 0, '5': 0, '6': 0, '7+': 0, total: 0 };
}

export interface Filters {
	readonly sizes: ReadonlySet<SizeClass>;
	readonly metric: Metric;
	readonly binWidth: BinWidth;
}

export function matchesFilter(b: Building, sizes: ReadonlySet<SizeClass>): boolean {
	return sizes.has(b.size);
}

function weight(b: Building, metric: Metric, areaSqMi: number): number {
	if (metric === 'buildings') {
		return 1;
	}
	if (metric === 'units_per_sqmi') {
		return areaSqMi > 0 ? b.units / areaSqMi : 0;
	}
	return b.units;
}

/**
 * One stacked row per bin for the buildings in scope under the given filters.
 * areaSqMi is the land area of the scope, used by the per-square-mile metric.
 */
export function aggregate(
	buildings: readonly Building[],
	scope: Scope,
	filters: Filters,
	areaSqMi: number,
): readonly StackRow[] {
	const bins = makeBins(filters.binWidth);
	const rows = bins.map(() => ({ ...emptyRow() }) as Record<SizeClass, number> & { total: number });
	for (const b of buildings) {
		if (!scope(b) || b.year === null || !matchesFilter(b, filters.sizes)) {
			continue;
		}
		const i = binIndex(b.year, filters.binWidth);
		if (i === null) {
			continue;
		}
		const row = rows[i];
		if (row === undefined) {
			continue;
		}
		const w = weight(b, filters.metric, areaSqMi);
		row[b.size] += w;
		row.total += w;
	}
	return rows;
}

export interface BeforeAfter {
	readonly beforeBuildings: number;
	readonly beforeUnits: number;
	readonly afterBuildings: number;
	readonly afterUnits: number;
	readonly undatedBuildings: number;
	readonly undatedUnits: number;
}

export function beforeAfter(
	buildings: readonly Building[],
	scope: Scope,
	cutYear: number,
	sizes: ReadonlySet<SizeClass>,
): BeforeAfter {
	let beforeBuildings = 0;
	let beforeUnits = 0;
	let afterBuildings = 0;
	let afterUnits = 0;
	let undatedBuildings = 0;
	let undatedUnits = 0;
	for (const b of buildings) {
		if (!scope(b) || !matchesFilter(b, sizes)) {
			continue;
		}
		if (b.year === null) {
			undatedBuildings += 1;
			undatedUnits += b.units;
		} else if (b.year < cutYear) {
			beforeBuildings += 1;
			beforeUnits += b.units;
		} else {
			afterBuildings += 1;
			afterUnits += b.units;
		}
	}
	return {
		beforeBuildings,
		beforeUnits,
		afterBuildings,
		afterUnits,
		undatedBuildings,
		undatedUnits,
	};
}

export function maxTotal(rows: readonly StackRow[]): number {
	let m = 0;
	for (const r of rows) {
		if (r.total > m) {
			m = r.total;
		}
	}
	return m;
}

export function sizeLabel(s: SizeClass): string {
	return s === '7+' ? '7+ units' : `${s} units`;
}

export const ALL_SIZES: ReadonlySet<SizeClass> = new Set(SIZE_CLASSES);
