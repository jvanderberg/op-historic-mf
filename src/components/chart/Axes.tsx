import type { Bin } from '@/lib/bins';
import { type Geometry, MARGIN, yTicks } from './geometry';

export function Axes({ g, bins }: { readonly g: Geometry; readonly bins: readonly Bin[] }) {
	return (
		<g>
			{yTicks(g.max).map((t) => (
				<g key={t}>
					<line
						x1={MARGIN.left}
						x2={MARGIN.left + g.plotW}
						y1={g.y(t)}
						y2={g.y(t)}
						stroke="var(--grid)"
						strokeWidth={1}
					/>
					<text
						x={MARGIN.left - 8}
						y={g.y(t)}
						dy="0.32em"
						textAnchor="end"
						fontSize={11}
						fill="var(--text-secondary)"
					>
						{t.toLocaleString()}
					</text>
				</g>
			))}
			{bins.map((b, i) =>
				i % g.tickEvery === 0 ? (
					<text
						key={b.start}
						x={MARGIN.left + i * g.slot + g.slot / 2}
						y={MARGIN.top + g.plotH + 16}
						textAnchor="middle"
						fontSize={11}
						fill="var(--text-secondary)"
					>
						{b.start}
					</text>
				) : null,
			)}
			<line
				x1={MARGIN.left}
				x2={MARGIN.left + g.plotW}
				y1={MARGIN.top + g.plotH}
				y2={MARGIN.top + g.plotH}
				stroke="var(--text-muted)"
				strokeWidth={1}
			/>
		</g>
	);
}
