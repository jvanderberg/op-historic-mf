import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { fixture } from '@/test/fixture';
import { App } from './App';
import { useExplorerStore } from './store';

beforeEach(() => {
	useExplorerStore.getState().reset();
});

describe('App', () => {
	it('shows the selected district against the rest of the village', async () => {
		const user = userEvent.setup();
		render(<App data={fixture} />);
		expect(
			screen.getByRole('img', { name: /^Frank Lloyd Wright: multi-family units/ }),
		).toBeInTheDocument();
		expect(
			screen.getByRole('img', {
				name: /Rest of Oak Park \(outside Frank Lloyd Wright\): multi-family units/,
			}),
		).toBeInTheDocument();
		expect(screen.queryByRole('img', { name: /^Ridgeland/ })).not.toBeInTheDocument();
		expect(screen.getAllByText('local district 1972')).toHaveLength(2);
		expect(screen.getAllByText('Before 1972')).toHaveLength(2);
		await user.click(screen.getByRole('radio', { name: 'Ridgeland - Oak Park' }));
		expect(
			screen.getByRole('img', { name: /^Ridgeland - Oak Park: multi-family units/ }),
		).toBeInTheDocument();
		expect(screen.getAllByText('Before 1994')).toHaveLength(2);
		expect(screen.getAllByText('local district 1994')).toHaveLength(2);
	});
	it('filtering by size changes the building count', async () => {
		const user = userEvent.setup();
		render(<App data={fixture} />);
		expect(screen.getByText('7 buildings')).toBeInTheDocument();
		await user.click(screen.getByRole('button', { name: '7+ units' }));
		expect(screen.getByRole('button', { name: '7+ units' })).toHaveAttribute(
			'aria-pressed',
			'false',
		);
		expect(screen.getByText('3 buildings')).toBeInTheDocument();
	});
	it('shows the building table on request', async () => {
		const user = userEvent.setup();
		render(<App data={fixture} />);
		await user.click(screen.getByRole('button', { name: /Show buildings/ }));
		expect(screen.getByRole('table')).toBeInTheDocument();
		expect(screen.getByText('11 B ST')).toBeInTheDocument();
		expect(screen.getByText('undated')).toBeInTheDocument();
	});
});
