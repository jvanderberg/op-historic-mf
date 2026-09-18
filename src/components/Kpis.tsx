import type { BeforeAfter } from '@/lib/bins';

export interface KpisProps {
	readonly scope: string;
	readonly cutYear: number;
	readonly ba: BeforeAfter;
	readonly areaSqMi: number;
}

interface TileProps {
	readonly label: string;
	readonly buildings: number;
	readonly units: number;
	readonly areaSqMi: number;
}

function Tile({ label, buildings, units, areaSqMi }: TileProps) {
	const density = areaSqMi > 0 ? units / areaSqMi : 0;
	return (
		<div className="rounded-md border border-grid px-3 py-2">
			<div className="text-xs text-ink-2">{label}</div>
			<div className="mt-0.5 text-sm tabular-nums">
				<span className="text-lg font-semibold text-ink">{units.toLocaleString()}</span>
				<span className="text-ink-2"> units · </span>
				<span className="font-medium text-ink">{buildings.toLocaleString()}</span>
				<span className="text-ink-2"> {buildings === 1 ? 'building' : 'buildings'}</span>
			</div>
			<div className="text-xs tabular-nums text-ink-2">
				{density.toLocaleString(undefined, { maximumFractionDigits: 0 })} units / sq mi
				<span className="text-ink-3"> ({areaSqMi.toFixed(2)} sq mi)</span>
			</div>
		</div>
	);
}

export function Kpis({ scope, cutYear, ba, areaSqMi }: KpisProps) {
	return (
		<div className="grid grid-cols-2 gap-2" data-scope={scope}>
			<Tile
				label={`Before ${cutYear}`}
				buildings={ba.beforeBuildings}
				units={ba.beforeUnits}
				areaSqMi={areaSqMi}
			/>
			<Tile
				label={`${cutYear} and after`}
				buildings={ba.afterBuildings}
				units={ba.afterUnits}
				areaSqMi={areaSqMi}
			/>
		</div>
	);
}
