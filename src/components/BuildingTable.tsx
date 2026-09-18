import type { Building, District } from '@/lib/data';

export interface BuildingTableProps {
	readonly buildings: readonly Building[];
	readonly districts: readonly District[];
}

const TYPE_LABEL: Readonly<Record<Building['type'], string>> = {
	small_mf: '2-6 unit building',
	large_mf: '7+ unit building',
	condo: 'condominium building',
};

const SOURCE_LABEL: Readonly<Record<string, string>> = {
	char_yrblt: 'assessor',
	condo_chars: 'assessor (condo)',
	commval: 'assessor (commercial)',
	char_yrblt_anyyear: 'assessor (earlier year)',
	class_history: 'roll history',
	manual: 'published source',
	unknown: 'unknown',
};

const HEADERS = [
	'Built',
	'Address',
	'District',
	'Units',
	'Type',
	'Zoning',
	'Year source',
	'Assessor',
] as const;

export function BuildingTable({ buildings, districts }: BuildingTableProps) {
	const nameOf = new Map(districts.map((d) => [d.slug, d.name] as const));
	return (
		<div className="overflow-x-auto rounded-md border border-grid">
			<table className="w-full text-sm">
				<caption className="sr-only">Multi-family buildings matching the current filters</caption>
				<thead className="bg-surface-2 text-left text-xs uppercase tracking-wide text-ink-2">
					<tr>
						{HEADERS.map((h) => (
							<th
								key={h}
								scope="col"
								className={h === 'Units' ? 'px-3 py-2 text-right' : 'px-3 py-2'}
							>
								{h}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{buildings.map((b) => {
						const isCondo = b.type === 'condo';
						return (
							<tr key={b.id} className="border-t border-grid">
								<td className="px-3 py-1.5 tabular-nums">{b.year ?? 'undated'}</td>
								<td className="px-3 py-1.5">
									{b.lat === null || b.lon === null ? (
										b.address
									) : (
										<a
											href={`https://www.google.com/maps/search/?api=1&query=${b.lat},${b.lon}`}
											target="_blank"
											rel="noreferrer"
											title="Open in Google Maps"
											className="text-ink underline decoration-grid underline-offset-2 hover:text-accent hover:decoration-accent"
										>
											{b.address}
										</a>
									)}
								</td>
								<td className="px-3 py-1.5 text-ink-2">{nameOf.get(b.district) ?? b.district}</td>
								<td className="px-3 py-1.5 text-right tabular-nums">{b.units}</td>
								<td className="px-3 py-1.5 text-ink-2">{TYPE_LABEL[b.type]}</td>
								<td className="px-3 py-1.5 text-ink-2">{b.zone === '' ? '-' : b.zone}</td>
								<td className="px-3 py-1.5 text-ink-2">
									{SOURCE_LABEL[b.yearSource] ?? b.yearSource}
								</td>
								<td className="px-3 py-1.5 whitespace-nowrap">
									<a
										href={`https://www.cookcountyassessor.com/pin/${b.linkPin}`}
										target="_blank"
										rel="noreferrer"
										className="text-accent underline-offset-2 hover:underline"
									>
										{b.id}
										{isCondo ? ' (first unit)' : ''}
									</a>
								</td>
							</tr>
						);
					})}
				</tbody>
			</table>
		</div>
	);
}
