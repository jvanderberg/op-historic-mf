import type { Bin, BinWidth } from '@/lib/bins';

export const HEIGHT = 250;
export const MARGIN = { top: 28, right: 16, bottom: 34, left: 52 } as const;

export interface Geometry {
	readonly width: number;
	readonly plotW: number;
	readonly plotH: number;
	readonly slot: number;
	readonly barW: number;
	readonly gap: number;
	readonly max: number;
	readonly y: (v: number) => number;
	readonly xOf: (i: number) => number;
	readonly yearX: (year: number) => number;
	readonly tickEvery: number;
}

export function niceMax(v: number): number {
	if (v <= 0) {
		return 1;
	}
	const p = 10 ** Math.floor(Math.log10(v));
	const f = v / p;
	let nice = 10;
	if (f <= 1) {
		nice = 1;
	} else if (f <= 2) {
		nice = 2;
	} else if (f <= 2.5) {
		nice = 2.5;
	} else if (f <= 5) {
		nice = 5;
	}
	return nice * p;
}

export function yTicks(max: number): readonly number[] {
	const steps = max <= 5 ? max : 5;
	const out: number[] = [];
	for (let i = 0; i <= steps; i += 1) {
		out.push(Math.round((max * i) / steps));
	}
	return out;
}

function barWidth(slot: number): number {
	let trim = 0.4;
	if (slot >= 6) {
		trim = 2;
	} else if (slot >= 3) {
		trim = 1;
	}
	return Math.max(1, slot - trim);
}

function segmentGap(barW: number): number {
	if (barW >= 8) {
		return 2;
	}
	return barW >= 4 ? 1 : 0;
}

export function geometry(
	width: number,
	bins: readonly Bin[],
	binWidth: BinWidth,
	yMax: number,
): Geometry {
	const plotW = Math.max(100, width - MARGIN.left - MARGIN.right);
	const plotH = HEIGHT - MARGIN.top - MARGIN.bottom;
	const slot = plotW / bins.length;
	const barW = barWidth(slot);
	const max = niceMax(yMax);
	const start = bins[0]?.start ?? 0;
	const perDecade = 10 / binWidth;
	return {
		width,
		plotW,
		plotH,
		slot,
		barW,
		gap: segmentGap(barW),
		max,
		y: (v) => MARGIN.top + plotH - (v / max) * plotH,
		xOf: (i) => MARGIN.left + i * slot + (slot - barW) / 2,
		yearX: (year) => MARGIN.left + ((year - start) / binWidth) * slot,
		tickEvery: perDecade * (width < 600 ? 2 : 1),
	};
}
