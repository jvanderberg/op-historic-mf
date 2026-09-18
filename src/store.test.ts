import { createExplorerStore, parseUrlState, serializeUrlState } from './store';

describe('url state', () => {
	it('defaults serialize to an empty query', () => {
		expect(serializeUrlState(parseUrlState(''))).toBe('');
	});
	it('round-trips every field', () => {
		const q = '?sizes=2,7%2B&metric=buildings&bin=10&scale=shared&table=1';
		const s = parseUrlState(q);
		expect([...s.sizes]).toEqual(['2', '7+']);
		expect(s.metric).toBe('buildings');
		expect(s.binWidth).toBe(10);
		expect(s.sharedScale).toBe(true);
		expect(s.showTable).toBe(true);
		expect(parseUrlState(serializeUrlState(s))).toEqual(s);
	});
	it('drops unknown values', () => {
		const s = parseUrlState('?sizes=9,2&bin=7&metric=x');
		expect([...s.sizes]).toEqual(['2']);
		expect(s.binWidth).toBe(5);
		expect(s.metric).toBe('units');
	});
});

describe('store', () => {
	it('toggles sizes and clears the selected bin', () => {
		const store = createExplorerStore();
		store.getState().setSelectedBin(3);
		store.getState().toggleSize('2');
		expect(store.getState().sizes.has('2')).toBe(false);
		expect(store.getState().selectedBin).toBeNull();
		store.getState().toggleSize('2');
		expect(store.getState().sizes.has('2')).toBe(true);
	});
	it('reset restores defaults', () => {
		const store = createExplorerStore();
		store.getState().setMetric('buildings');
		store.getState().setBinWidth(1);
		store.getState().reset();
		expect(store.getState().metric).toBe('units');
		expect(store.getState().binWidth).toBe(5);
	});
});
