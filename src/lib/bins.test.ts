import { fixture } from '@/test/fixture';
import { ALL_SIZES, aggregate, beforeAfter, binIndex, makeBins, maxTotal } from './bins';

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
	it('stacks units by size class per bin and respects the filter', () => {
		const rows = aggregate(fixture.buildings, 'flw', {
			sizes: ALL_SIZES,
			metric: 'units',
			binWidth: 10,
		});
		const i1910 = binIndex(1910, 10);
		const i1970 = binIndex(1973, 10);
		expect(i1910).not.toBeNull();
		expect(i1970).not.toBeNull();
		if (i1910 === null || i1970 === null) {
			throw new Error('unreachable');
		}
		expect(rows[i1910]?.['2']).toBe(2);
		expect(rows[i1910]?.['3']).toBe(3);
		expect(rows[i1910]?.total).toBe(5);
		expect(rows[i1970]?.['7+']).toBe(81);
		expect(maxTotal(rows)).toBe(81);
		const only2 = aggregate(fixture.buildings, 'flw', {
			sizes: new Set(['2']),
			metric: 'buildings',
			binWidth: 10,
		});
		expect(only2[i1910]?.total).toBe(1);
		expect(only2[i1970]?.total).toBe(0);
	});
	it('ignores undated buildings and other districts', () => {
		const rows = aggregate(fixture.buildings, 'ridgeland', {
			sizes: ALL_SIZES,
			metric: 'buildings',
			binWidth: 1,
		});
		expect(rows.reduce((a, r) => a + r.total, 0)).toBe(2);
	});
});

describe('beforeAfter', () => {
	it('splits at the cut year and reports undated separately', () => {
		const ba = beforeAfter(fixture.buildings, 'ridgeland', 1994, ALL_SIZES);
		expect(ba).toEqual({
			beforeBuildings: 1,
			beforeUnits: 12,
			afterBuildings: 1,
			afterUnits: 32,
			undatedBuildings: 1,
			undatedUnits: 2,
		});
		const flw = beforeAfter(fixture.buildings, 'flw', 1972, new Set(['7+']));
		expect(flw.beforeBuildings).toBe(0);
		expect(flw.afterUnits).toBe(81);
	});
});
