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
			screen.getByRole('img', { name: /^Frank Lloyd Wright: multi-family units by/ }),
		).toBeInTheDocument();
		expect(
			screen.getByRole('img', {
				name: /Rest of Oak Park \(outside the historic districts\): multi-family units by/,
			}),
		).toBeInTheDocument();
		expect(screen.queryByRole('img', { name: /^Ridgeland/ })).not.toBeInTheDocument();
		expect(screen.getAllByText('local district 1972')).toHaveLength(2);
		expect(screen.getAllByText('Before 1972')).toHaveLength(2);
		await user.click(screen.getByRole('radio', { name: 'Ridgeland - Oak Park' }));
		expect(
			screen.getByRole('img', { name: /^Ridgeland - Oak Park: multi-family units by/ }),
		).toBeInTheDocument();
		expect(screen.getAllByText('Before 1994')).toHaveLength(2);
		expect(screen.getAllByText('local district 1994')).toHaveLength(2);
	});
	it('filtering by size changes the building count', async () => {
		const user = userEvent.setup();
		render(<App data={fixture} />);
		expect(screen.getByText('8 buildings')).toBeInTheDocument();
		await user.click(screen.getByRole('button', { name: '7+ units' }));
		expect(screen.getByRole('button', { name: '7+ units' })).toHaveAttribute(
			'aria-pressed',
			'false',
		);
		expect(screen.getByText('4 buildings')).toBeInTheDocument();
	});
	it('offers a per-square-mile metric', async () => {
		const user = userEvent.setup();
		render(<App data={fixture} />);
		await user.click(screen.getByRole('radio', { name: 'Units / sq mi' }));
		expect(screen.getAllByRole('img', { name: /units \/ sq mi by year built/ })).toHaveLength(2);
	});
	it("double-clicking a bar lists that bar's buildings", async () => {
		const user = userEvent.setup();
		render(<App data={fixture} />);
		const flwBar = screen.getByRole('button', { name: '1970-74: 81 units' });
		await user.dblClick(flwBar);
		expect(screen.getByRole('table')).toBeInTheDocument();
		expect(screen.getByText('1 buildings built 1970-74 in Frank Lloyd Wright')).toBeInTheDocument();
		expect(screen.getByText('3 A ST')).toBeInTheDocument();
		expect(screen.queryByText('11 B ST')).not.toBeInTheDocument();
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
