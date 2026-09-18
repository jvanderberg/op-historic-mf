import type { BeforeAfter } from '@/lib/bins';
import type { District } from '@/lib/data';

export interface KpisProps {
	readonly district: District;
	readonly ba: BeforeAfter;
}

function Tile({ label, buildings, units }: { label: string; buildings: number; units: number }) {
	return (
		<div className="rounded-md border border-grid px-3 py-2">
			<div className="text-xs text-ink-2">{label}</div>
			<div className="mt-0.5 text-sm tabular-nums">
				<span className="text-lg font-semibold text-ink">{units.toLocaleString()}</span>
				<span className="text-ink-2"> units · </span>
				<span className="font-medium text-ink">{buildings.toLocaleString()}</span>
				<span className="text-ink-2"> {buildings === 1 ? 'building' : 'buildings'}</span>
			</div>
		</div>
	);
}

export function Kpis({ district, ba }: KpisProps) {
	return (
		<div className="grid grid-cols-2 gap-2">
			<Tile
				label={`Before ${district.localYear}`}
				buildings={ba.beforeBuildings}
				units={ba.beforeUnits}
			/>
			<Tile
				label={`${district.localYear} and after`}
				buildings={ba.afterBuildings}
				units={ba.afterUnits}
			/>
		</div>
	);
}
