import { useId, useRef } from 'react';
import type { Bin, BinWidth, Metric, StackRow } from '@/lib/bins';
import type { District, SizeClass } from '@/lib/data';
import { useWidth } from '@/lib/useWidth';
import { Axes } from './chart/Axes';
import { Bars } from './chart/Bars';
import { geometry, HEIGHT, MARGIN } from './chart/geometry';
import { HoverCard } from './chart/HoverCard';
import { Markers } from './chart/Markers';

export interface DistrictChartProps {
	readonly district: District;
	readonly rows: readonly StackRow[];
	readonly bins: readonly Bin[];
	readonly binWidth: BinWidth;
	readonly metric: Metric;
	readonly yMax: number;
	readonly sizes: ReadonlySet<SizeClass>;
	readonly hoveredBin: number | null;
	readonly selectedBin: number | null;
	readonly onHover: (i: number | null) => void;
	readonly onSelect: (i: number | null) => void;
}

export function DistrictChart(props: DistrictChartProps) {
	const {
		district,
		rows,
		bins,
		binWidth,
		metric,
		yMax,
		sizes,
		hoveredBin,
		selectedBin,
		onHover,
		onSelect,
	} = props;
	const wrapRef = useRef<HTMLDivElement | null>(null);
	const width = useWidth(wrapRef);
	const titleId = useId();
	const g = geometry(width, bins, binWidth, yMax);
	const active = hoveredBin ?? selectedBin;
	const activeRow = active === null ? undefined : rows[active];
	const activeBin = active === null ? undefined : bins[active];

	return (
		<figure className="relative" aria-labelledby={titleId}>
			<figcaption id={titleId} className="mb-1 text-base font-semibold text-ink">
				{district.name}
			</figcaption>
			<div ref={wrapRef} className="relative w-full">
				<svg
					width={width}
					height={HEIGHT}
					role="img"
					aria-label={`${district.name}: multi-family ${metric} by year built`}
					className="block select-none"
				>
					<Axes g={g} bins={bins} />
					<Bars g={g} rows={rows} sizes={sizes} active={active} />
					<Markers g={g} district={district} />
					{selectedBin === null ? null : (
						<rect
							x={MARGIN.left + selectedBin * g.slot}
							y={MARGIN.top}
							width={g.slot}
							height={g.plotH}
							fill="none"
							stroke="var(--text-primary)"
							strokeWidth={1}
						/>
					)}
				</svg>
				<div
					className="absolute flex"
					style={{ left: MARGIN.left, top: MARGIN.top, width: g.plotW, height: g.plotH }}
				>
					{bins.map((b, i) => (
						<button
							key={b.start}
							type="button"
							aria-label={`${b.label}: ${rows[i]?.total ?? 0} ${metric}`}
							aria-pressed={selectedBin === i}
							tabIndex={rows[i]?.total ? 0 : -1}
							onMouseEnter={() => onHover(i)}
							onMouseLeave={() => onHover(null)}
							onFocus={() => onHover(i)}
							onBlur={() => onHover(null)}
							onClick={() => onSelect(selectedBin === i ? null : i)}
							className="h-full cursor-pointer bg-transparent focus-visible:outline-1 focus-visible:outline-accent"
							style={{ width: g.slot }}
						/>
					))}
				</div>
			</div>
			{active !== null && activeRow !== undefined && activeBin !== undefined ? (
				<HoverCard
					g={g}
					index={active}
					bin={activeBin}
					row={activeRow}
					binWidth={binWidth}
					metric={metric}
					sizes={sizes}
				/>
			) : null}
		</figure>
	);
}
