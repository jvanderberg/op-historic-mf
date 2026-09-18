import { Table2 } from 'lucide-react';
import { useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { BuildingTable } from './components/BuildingTable';
import { DistrictChart } from './components/DistrictChart';
import { Kpis } from './components/Kpis';
import { SizeLegend } from './components/SizeLegend';
import { Button } from './components/ui/button';
import { Segmented } from './components/ui/segmented';
import {
	aggregate,
	type BinWidth,
	beforeAfter,
	binIndex,
	type Metric,
	makeBins,
	matchesFilter,
	maxTotal,
} from './lib/bins';
import { type ExplorerData, SIZE_CLASSES } from './lib/data';
import { useExplorerStore } from './store';

export interface AppProps {
	readonly data: ExplorerData;
}

type BinKey = '1' | '5' | '10';
const METRICS: readonly { value: Metric; label: string }[] = [
	{ value: 'units', label: 'Units' },
	{ value: 'buildings', label: 'Buildings' },
];
const BINS: readonly { value: BinKey; label: string }[] = [
	{ value: '1', label: 'Year' },
	{ value: '5', label: '5 yrs' },
	{ value: '10', label: 'Decade' },
];
const SCALES: readonly { value: 'own' | 'shared'; label: string }[] = [
	{ value: 'own', label: 'Own scale' },
	{ value: 'shared', label: 'Same scale' },
];

function toBinWidth(v: BinKey): BinWidth {
	if (v === '1') {
		return 1;
	}
	return v === '5' ? 5 : 10;
}

export function App({ data }: AppProps) {
	const sizes = useExplorerStore((s) => s.sizes);
	const metric = useExplorerStore((s) => s.metric);
	const binWidth = useExplorerStore((s) => s.binWidth);
	const sharedScale = useExplorerStore((s) => s.sharedScale);
	const selectedBin = useExplorerStore((s) => s.selectedBin);
	const hoveredBin = useExplorerStore((s) => s.hoveredBin);
	const showTable = useExplorerStore((s) => s.showTable);
	const actions = useExplorerStore(
		useShallow((s) => ({
			toggleSize: s.toggleSize,
			setSizes: s.setSizes,
			setMetric: s.setMetric,
			setBinWidth: s.setBinWidth,
			setSharedScale: s.setSharedScale,
			setSelectedBin: s.setSelectedBin,
			setHoveredBin: s.setHoveredBin,
			setShowTable: s.setShowTable,
		})),
	);

	const bins = useMemo(() => makeBins(binWidth), [binWidth]);
	const filters = useMemo(() => ({ sizes, metric, binWidth }), [sizes, metric, binWidth]);
	const perDistrict = useMemo(
		() =>
			data.districts.map((d) => {
				const rows = aggregate(data.buildings, d.slug, filters);
				return {
					district: d,
					rows,
					max: maxTotal(rows),
					ba: d.localYear === null ? null : beforeAfter(data.buildings, d.slug, d.localYear, sizes),
				};
			}),
		[data, filters, sizes],
	);
	const globalMax = Math.max(1, ...perDistrict.map((p) => p.max));

	const tableRows = useMemo(
		() =>
			data.buildings
				.filter((b) => matchesFilter(b, sizes))
				.filter(
					(b) =>
						selectedBin === null || (b.year !== null && binIndex(b.year, binWidth) === selectedBin),
				)
				.slice()
				.sort((a, b) => (a.year ?? 9999) - (b.year ?? 9999) || a.address.localeCompare(b.address)),
		[data, sizes, selectedBin, binWidth],
	);
	const selectedLabel = selectedBin === null ? null : (bins[selectedBin]?.label ?? null);

	return (
		<main className="mx-auto max-w-5xl px-3 py-4 text-ink sm:px-5 sm:py-6">
			<h1 className="text-lg font-semibold tracking-tight sm:text-xl">
				Multi-family buildings in Oak Park's historic districts, by year built
			</h1>

			<div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
				<SizeLegend
					sizes={sizes}
					onToggle={actions.toggleSize}
					onAll={() => actions.setSizes(SIZE_CLASSES)}
					onNone={() => actions.setSizes([])}
				/>
			</div>
			<div className="mt-2 flex flex-wrap items-center gap-2">
				<Segmented label="Count" value={metric} options={METRICS} onChange={actions.setMetric} />
				<Segmented
					label="Group by"
					value={String(binWidth) as BinKey}
					options={BINS}
					onChange={(v) => actions.setBinWidth(toBinWidth(v))}
				/>
				<Segmented
					label="Y scale"
					value={sharedScale ? 'shared' : 'own'}
					options={SCALES}
					onChange={(v) => actions.setSharedScale(v === 'shared')}
				/>
			</div>

			<div className="mt-6 flex flex-col gap-7">
				{perDistrict.map((p) => (
					<section key={p.district.slug} className="flex flex-col gap-2">
						<DistrictChart
							district={p.district}
							rows={p.rows}
							bins={bins}
							binWidth={binWidth}
							metric={metric}
							yMax={sharedScale ? globalMax : Math.max(1, p.max)}
							sizes={sizes}
							hoveredBin={hoveredBin}
							selectedBin={selectedBin}
							onHover={actions.setHoveredBin}
							onSelect={actions.setSelectedBin}
						/>
						{p.district.localYear === null || p.ba === null ? null : (
							<Kpis district={p.district} cutYear={p.district.localYear} ba={p.ba} />
						)}
					</section>
				))}
			</div>

			<div className="mt-6 flex flex-wrap items-center gap-3">
				<Button onClick={() => actions.setShowTable(!showTable)} aria-expanded={showTable}>
					<Table2 className="size-3.5" aria-hidden="true" />
					{showTable ? 'Hide' : 'Show'} buildings
				</Button>
				<span className="text-sm text-ink-2">
					{tableRows.length.toLocaleString()} buildings
					{selectedLabel === null ? '' : ` built ${selectedLabel}`}
				</span>
				{selectedBin === null ? null : (
					<button
						type="button"
						className="text-sm text-accent underline-offset-2 hover:underline"
						onClick={() => actions.setSelectedBin(null)}
					>
						clear
					</button>
				)}
			</div>
			{showTable ? (
				<div className="mt-2">
					<BuildingTable buildings={tableRows} districts={data.districts} />
				</div>
			) : null}

			<footer className="mt-8 border-t border-grid pt-3 text-xs text-ink-2">
				Cook County Assessor 2026 roll and Village of Oak Park GIS, via{' '}
				<a
					className="text-accent underline-offset-2 hover:underline"
					href="https://github.com/jvanderberg/op-block-typology"
				>
					op-block-typology
				</a>
				. Buildings standing in 2026 only. Dashed line: local designation; dotted: National Register
				listing.
			</footer>
		</main>
	);
}
