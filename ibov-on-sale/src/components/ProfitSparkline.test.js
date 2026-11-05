import React from 'react';
import { render, screen } from '@testing-library/react';
import ProfitSparkline from './ProfitSparkline';

test('draws one bar per year, losses in red, with an accessible summary', () => {
  const years = [{ ano: 2023, lucro: 100e6 }, { ano: 2024, lucro: -50e6 }, { ano: 2025, lucro: 200e6 }];
  const { container } = render(<ProfitSparkline years={years} />);
  const bars = container.querySelectorAll('rect');
  expect(bars).toHaveLength(3);
  expect(bars[1]).toHaveAttribute('fill', '#B3261E');
  expect(screen.getByRole('img')).toHaveAccessibleName(/2024: R\$ -50,00 mi/);
});

test('renders a dash without data', () => {
  render(<ProfitSparkline years={[]} />);
  expect(screen.getByText('—')).toBeInTheDocument();
});
