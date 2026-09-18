import { fixture } from '@/test/fixture';
import { ALL_SIZES, aggregate, beforeAfter, binIndex, makeBins, maxTotal } from './bins';

function idx(year: number, width: 1 | 5 | 10): number {
	const i = binIndex(year, width);
	if (i === null) {
		throw new Error(`year ${year} outside domain`);
	}
	return i;
}

describe('makeBins', () => {
	it('covers the fixed domain with aligned edges', () => {
		const b1 = makeBins(1);
		const b5 = makeBins(5);
		const b10 = makeBins(10);
		expect(b1[0]?.start).toBe(1860);
		expect(b1.at(-1)?.start).toBe(2029);
		expect(b5.length).toBe(34);
		expect(b10.map((b) => b.label).slice(0, 2)).toEqual(['1860s', '1870s']);
		expect(b5[1]?.label).toBe('1865-69');
	});
	it('places years in bins', () => {
		expect(binIndex(1860, 10)).toBe(0);
		expect(binIndex(1972, 5)).toBe(22);
		expect(binIndex(1859, 1)).toBeNull();
		expect(binIndex(2030, 1)).toBeNull();
	});
});

describe('aggregate', () => {
	const inFlw = (b: { district: string }) => b.district === 'flw';
	it('stacks units by size class per bin and respects the filter', () => {
		const rows = aggregate(
			fixture.buildings,
			inFlw,
			{ sizes: ALL_SIZES, metric: 'units', binWidth: 10 },
			1,
		);
		expect(rows[idx(1910, 10)]?.['2']).toBe(2);
		expect(rows[idx(1910, 10)]?.['3']).toBe(3);
		expect(rows[idx(1910, 10)]?.total).toBe(5);
		expect(rows[idx(1973, 10)]?.['7+']).toBe(81);
		expect(maxTotal(rows)).toBe(81);
		const only2 = aggregate(
			fixture.buildings,
			inFlw,
			{ sizes: new Set(['2']), metric: 'buildings', binWidth: 10 },
			1,
		);
		expect(only2[idx(1910, 10)]?.total).toBe(1);
		expect(only2[idx(1973, 10)]?.total).toBe(0);
	});
	it('a scope can be everything outside the districts', () => {
		const rows = aggregate(
			fixture.buildings,
			(b) => b.district === 'rest',
			{ sizes: ALL_SIZES, metric: 'buildings', binWidth: 1 },
			1,
		);
		expect(rows.reduce((a, r) => a + r.total, 0)).toBe(1);
	});
	it('ignores undated buildings and other districts', () => {
		const rows = aggregate(
			fixture.buildings,
			(b) => b.district === 'ridgeland',
			{ sizes: ALL_SIZES, metric: 'buildings', binWidth: 1 },
			1,
		);
		expect(rows.reduce((a, r) => a + r.total, 0)).toBe(2);
	});
	it('divides units by the scope area for the per-square-mile metric', () => {
		const rows = aggregate(
			fixture.buildings,
			inFlw,
			{ sizes: ALL_SIZES, metric: 'units_per_sqmi', binWidth: 10 },
			0.5,
		);
		expect(rows[idx(1973, 10)]?.['7+']).toBe(162);
		expect(rows[idx(1910, 10)]?.total).toBe(10);
	});
});

describe('beforeAfter', () => {
	it('splits at the cut year and reports undated separately', () => {
		const ba = beforeAfter(fixture.buildings, (b) => b.district === 'ridgeland', 1994, ALL_SIZES);
		expect(ba).toEqual({
			beforeBuildings: 1,
			beforeUnits: 12,
			afterBuildings: 1,
			afterUnits: 32,
			undatedBuildings: 1,
			undatedUnits: 2,
		});
		const flw = beforeAfter(fixture.buildings, (b) => b.district === 'flw', 1972, new Set(['7+']));
		expect(flw.beforeBuildings).toBe(0);
		expect(flw.afterUnits).toBe(81);
	});
});
