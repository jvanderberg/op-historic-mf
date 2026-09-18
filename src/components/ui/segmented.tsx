import { useId } from 'react';
import { cn } from '@/lib/utils';

export interface SegmentedOption<T extends string> {
	readonly value: T;
	readonly label: string;
}

export interface SegmentedProps<T extends string> {
	readonly label: string;
	readonly value: T;
	readonly options: readonly SegmentedOption<T>[];
	readonly onChange: (v: T) => void;
}

/** Single-choice control: a visually grouped set of radio inputs. */
export function Segmented<T extends string>({
	label,
	value,
	options,
	onChange,
}: SegmentedProps<T>) {
	const name = useId();
	return (
		<fieldset className="inline-flex rounded-md border border-grid bg-surface-1 p-0.5">
			<legend className="sr-only">{label}</legend>
			{options.map((o) => {
				const active = o.value === value;
				return (
					<label
						key={o.value}
						className={cn(
							'flex h-8 cursor-pointer items-center rounded px-3 text-sm transition-colors has-focus-visible:outline-2 has-focus-visible:outline-offset-1 has-focus-visible:outline-accent',
							active ? 'bg-ink text-surface-1' : 'text-ink-2 hover:bg-surface-2 hover:text-ink',
						)}
					>
						<input
							type="radio"
							name={name}
							value={o.value}
							checked={active}
							onChange={() => onChange(o.value)}
							className="sr-only"
						/>
						{o.label}
					</label>
				);
			})}
		</fieldset>
	);
}
