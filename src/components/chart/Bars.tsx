import type { StackRow } from '@/lib/bins';
import { SIZE_COLOR } from '@/lib/colors';
import { SIZE_CLASSES, type SizeClass } from '@/lib/data';
import type { Geometry } from './geometry';

interface Segment {
	readonly s: SizeClass;
	readonly y0: number;
	readonly y1: number;
}

function segmentsOf(row: StackRow, sizes: ReadonlySet<SizeClass>): readonly Segment[] {
	let acc = 0;
	const out: Segment[] = [];
	for (const s of SIZE_CLASSES) {
		if (sizes.has(s) && row[s] > 0) {
			out.push({ s, y0: acc, y1: acc + row[s] });
			acc += row[s];
		}
	}
	return out;
}

/** One stacked segment: thin mark, a surface gap below it, rounded data end on top. */
function segmentPath(
	g: Geometry,
	x: number,
	seg: Segment,
	isFirst: boolean,
	isTop: boolean,
): string {
	const top = g.y(seg.y1);
	const bottom = g.y(seg.y0) - (isFirst ? 0 : g.gap);
	const h = Math.max(0, bottom - top);
	if (!isTop) {
		return `M${x},${bottom} V${top} H${x + g.barW} V${bottom} Z`;
	}
	const r = Math.min(3, g.barW / 2, h / 2);
	return `M${x},${bottom} V${top + r} Q${x},${top} ${x + r},${top} H${x + g.barW - r} Q${x + g.barW},${top} ${x + g.barW},${top + r} V${bottom} Z`;
}

export interface BarsProps {
	readonly g: Geometry;
	readonly rows: readonly StackRow[];
	readonly sizes: ReadonlySet<SizeClass>;
	readonly active: number | null;
}

export function Bars({ g, rows, sizes, active }: BarsProps) {
	return (
		<g>
			{rows.map((row, i) => {
				const segs = segmentsOf(row, sizes);
				const x = g.xOf(i);
				const key = g.xOf(i);
				return (
					<g key={key} opacity={active === null || active === i ? 1 : 0.55}>
						{segs.map((seg, k) => (
							<path
								key={seg.s}
								d={segmentPath(g, x, seg, k === 0, k === segs.length - 1)}
								fill={SIZE_COLOR[seg.s]}
							/>
						))}
					</g>
				);
			})}
		</g>
	);
}
