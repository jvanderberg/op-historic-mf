import type { SizeClass } from './data';

/**
 * Categorical palette in fixed slot order (validated for adjacent-pair
 * colour-vision-deficiency separation, light and dark). Text never wears a
 * series colour; identity is carried by the swatch beside it.
 */
export const SIZE_COLOR: Readonly<Record<SizeClass, string>> = {
	'2': 'var(--series-1)',
	'3': 'var(--series-2)',
	'4': 'var(--series-3)',
	'5': 'var(--series-4)',
	'6': 'var(--series-5)',
	'7+': 'var(--series-6)',
};
