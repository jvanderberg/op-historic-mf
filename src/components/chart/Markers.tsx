import { type Geometry, MARGIN } from './geometry';

export interface MarkerYears {
	readonly localYear: number;
	readonly nrYear: number;
}

/** Designation markers: dashed line for the local district, dotted for the National Register. */
export function Markers({ g, years }: { readonly g: Geometry; readonly years: MarkerYears }) {
	const district = years;
	const xl = g.yearX(district.localYear);
	const xn = g.yearX(district.nrYear);
	const nrAfter = district.nrYear > district.localYear;
	const localFlip = xl > g.width - 120;
	return (
		<g>
			<line
				x1={xn}
				x2={xn}
				y1={MARGIN.top - 4}
				y2={MARGIN.top + g.plotH}
				stroke="var(--text-muted)"
				strokeWidth={1}
				strokeDasharray="2 3"
			/>
			<line
				x1={xl}
				x2={xl}
				y1={MARGIN.top - 4}
				y2={MARGIN.top + g.plotH}
				stroke="var(--text-primary)"
				strokeWidth={1.5}
				strokeDasharray="5 3"
			/>
			<text
				x={localFlip ? xl - 5 : xl + 5}
				y={MARGIN.top - 10}
				fontSize={11}
				fill="var(--text-primary)"
				textAnchor={localFlip ? 'end' : 'start'}
			>
				local district {district.localYear}
			</text>
			{district.nrYear === district.localYear ? null : (
				<text
					x={xn + (nrAfter ? 5 : -5)}
					y={MARGIN.top + 4}
					fontSize={10}
					fill="var(--text-muted)"
					textAnchor={nrAfter ? 'start' : 'end'}
				>
					National Register {district.nrYear}
				</text>
			)}
		</g>
	);
}
