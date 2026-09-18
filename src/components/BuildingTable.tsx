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

function assessorHref(id: string): string | null {
	return id.length === 14 ? `https://www.cookcountyassessor.com/pin/${id}` : null;
}

export function BuildingTable({ buildings, districts }: BuildingTableProps) {
	const nameOf = new Map(districts.map((d) => [d.slug, d.name] as const));
	return (
		<div className="overflow-x-auto rounded-md border border-grid">
			<table className="w-full text-sm">
				<caption className="sr-only">Multi-family buildings matching the current filters</caption>
				<thead className="bg-surface-2 text-left text-xs uppercase tracking-wide text-ink-2">
					<tr>
						<th scope="col" className="px-3 py-2">
							Built
						</th>
						<th scope="col" className="px-3 py-2">
							Address
						</th>
						<th scope="col" className="px-3 py-2">
							District
						</th>
						<th scope="col" className="px-3 py-2 text-right">
							Units
						</th>
						<th scope="col" className="px-3 py-2">
							Type
						</th>
						<th scope="col" className="px-3 py-2">
							Zoning
						</th>
						<th scope="col" className="px-3 py-2">
							Year source
						</th>
						<th scope="col" className="px-3 py-2">
							Assessor
						</th>
					</tr>
				</thead>
				<tbody>
					{buildings.map((b) => {
						const href = assessorHref(b.id);
						return (
							<tr key={b.id} className="border-t border-grid">
								<td className="px-3 py-1.5 tabular-nums">{b.year ?? 'undated'}</td>
								<td className="px-3 py-1.5">{b.address}</td>
								<td className="px-3 py-1.5 text-ink-2">{nameOf.get(b.district) ?? b.district}</td>
								<td className="px-3 py-1.5 text-right tabular-nums">{b.units}</td>
								<td className="px-3 py-1.5 text-ink-2">{TYPE_LABEL[b.type]}</td>
								<td className="px-3 py-1.5 text-ink-2">{b.zone === '' ? '-' : b.zone}</td>
								<td className="px-3 py-1.5 text-ink-2">
									{SOURCE_LABEL[b.yearSource] ?? b.yearSource}
								</td>
								<td className="px-3 py-1.5">
									{href === null ? (
										<span className="text-ink-3">{b.id}</span>
									) : (
										<a
											href={href}
											target="_blank"
											rel="noreferrer"
											className="text-accent underline-offset-2 hover:underline"
										>
											{b.id}
										</a>
									)}
								</td>
							</tr>
						);
					})}
				</tbody>
			</table>
		</div>
	);
}
