import {
	type Bin,
	type BinWidth,
	formatValue,
	METRIC_LABEL,
	type Metric,
	type StackRow,
	sizeLabel,
} from '@/lib/bins';
import { SIZE_COLOR } from '@/lib/colors';
import { SIZE_CLASSES, type SizeClass } from '@/lib/data';
import { type Geometry, MARGIN } from './geometry';

export interface HoverCardProps {
	readonly g: Geometry;
	readonly index: number;
	readonly bin: Bin;
	readonly row: StackRow;
	readonly binWidth: BinWidth;
	readonly metric: Metric;
	readonly sizes: ReadonlySet<SizeClass>;
}

export function HoverCard({ g, index, bin, row, binWidth, metric, sizes }: HoverCardProps) {
	const left = Math.min(
		Math.max(MARGIN.left, g.xOf(index) - 80),
		Math.max(MARGIN.left, g.width - 200),
	);
	return (
		<div
			role="status"
			className="pointer-events-none absolute z-10 min-w-40 rounded-md border border-grid bg-surface-1 p-2 text-xs shadow-md"
			style={{ left, top: 4 }}
		>
			<div className="mb-1 font-semibold text-ink">
				{bin.label}
				{binWidth === 1 ? '' : ` (${bin.start}-${bin.end})`}
			</div>
			{SIZE_CLASSES.filter((s) => sizes.has(s)).map((s) => (
				<div key={s} className="flex items-center justify-between gap-3">
					<span className="flex items-center gap-1.5 text-ink-2">
						<span
							className="inline-block size-2.5 rounded-sm"
							style={{ background: SIZE_COLOR[s] }}
						/>
						{sizeLabel(s)}
					</span>
					<span className="tabular-nums text-ink">{formatValue(row[s])}</span>
				</div>
			))}
			<div className="mt-1 flex justify-between gap-3 border-t border-grid pt-1 font-medium text-ink">
				<span>total {METRIC_LABEL[metric]}</span>
				<span className="tabular-nums">{formatValue(row.total)}</span>
			</div>
		</div>
	);
}
