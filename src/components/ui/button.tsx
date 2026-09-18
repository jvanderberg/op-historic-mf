import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
	'inline-flex items-center justify-center gap-1.5 rounded-md text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:pointer-events-none disabled:opacity-50',
	{
		variants: {
			variant: {
				default: 'bg-ink text-surface-1 hover:opacity-90',
				outline: 'border border-grid bg-surface-1 text-ink hover:bg-surface-2',
				ghost: 'text-ink-2 hover:bg-surface-2 hover:text-ink',
			},
			size: {
				sm: 'h-8 px-3',
				md: 'h-9 px-4',
			},
		},
		defaultVariants: { variant: 'outline', size: 'sm' },
	},
);

export type ButtonProps = ComponentProps<'button'> & VariantProps<typeof buttonVariants>;

export function Button({ className, variant, size, type = 'button', ...props }: ButtonProps) {
	return (
		<button type={type} className={cn(buttonVariants({ variant, size }), className)} {...props} />
	);
}
