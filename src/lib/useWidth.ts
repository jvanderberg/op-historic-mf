import { type RefObject, useEffect, useState } from 'react';

/** Current content width of the referenced element, tracked with ResizeObserver. */
export function useWidth(ref: RefObject<HTMLElement | null>, fallback = 900): number {
	const [width, setWidth] = useState(fallback);
	useEffect(() => {
		const el = ref.current;
		if (el === null) {
			return;
		}
		const update = () => {
			const w = el.getBoundingClientRect().width;
			if (w > 0) {
				setWidth(w);
			}
		};
		update();
		if (typeof ResizeObserver === 'undefined') {
			return;
		}
		const ro = new ResizeObserver(update);
		ro.observe(el);
		return () => ro.disconnect();
	}, [ref]);
	return width;
}
