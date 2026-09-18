import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { fixture } from '@/test/fixture';
import { App } from './App';
import { useExplorerStore } from './store';

beforeEach(() => {
	useExplorerStore.getState().reset();
});

describe('App', () => {
	it('renders both districts with designation years and KPIs', () => {
		render(<App data={fixture} />);
		expect(
			screen.getByRole('img', { name: /Frank Lloyd Wright: multi-family units/ }),
		).toBeInTheDocument();
		expect(
			screen.getByRole('img', { name: /Ridgeland - Oak Park: multi-family units/ }),
		).toBeInTheDocument();
		expect(screen.getAllByText('local district 1972').length).toBeGreaterThan(0);
		expect(screen.getByText('Before 1994')).toBeInTheDocument();
	});
	it('filtering by size changes the KPI and the building count', async () => {
		const user = userEvent.setup();
		render(<App data={fixture} />);
		expect(screen.getByText('6 buildings')).toBeInTheDocument();
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
