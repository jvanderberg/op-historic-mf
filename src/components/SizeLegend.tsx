import { sizeLabel } from '@/lib/bins';
import { SIZE_COLOR } from '@/lib/colors';
import { SIZE_CLASSES, type SizeClass } from '@/lib/data';
import { cn } from '@/lib/utils';

export interface SizeLegendProps {
	readonly sizes: ReadonlySet<SizeClass>;
	readonly onToggle: (s: SizeClass) => void;
	readonly onAll: () => void;
	readonly onNone: () => void;
}

/** The legend is the filter: one pressable chip per unit-size class. */
export function SizeLegend({ sizes, onToggle, onAll, onNone }: SizeLegendProps) {
	return (
		<fieldset className="flex flex-wrap items-center gap-2">
			<legend className="sr-only">Filter by units per building</legend>
			<span aria-hidden="true" className="text-xs uppercase tracking-wide text-ink-3">
				Units per building
			</span>
			<div className="flex flex-wrap gap-1.5">
				{SIZE_CLASSES.map((s) => {
					const on = sizes.has(s);
					return (
						<button
							key={s}
							type="button"
							aria-pressed={on}
							onClick={() => onToggle(s)}
							className={cn(
								'inline-flex h-8 items-center gap-2 rounded-full border px-3 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent',
								on
									? 'border-grid bg-surface-1 text-ink'
									: 'border-dashed border-grid bg-surface-2 text-ink-3 line-through',
							)}
						>
							<span
								aria-hidden="true"
								className="inline-block size-3 rounded-sm"
								style={{ background: on ? SIZE_COLOR[s] : 'var(--grid)' }}
							/>
							{sizeLabel(s)}
						</button>
					);
				})}
			</div>
			<button
				type="button"
				onClick={onAll}
				className="text-xs text-ink-2 underline-offset-2 hover:underline"
			>
				all
			</button>
			<button
				type="button"
				onClick={onNone}
				className="text-xs text-ink-2 underline-offset-2 hover:underline"
			>
				none
			</button>
		</fieldset>
	);
}
