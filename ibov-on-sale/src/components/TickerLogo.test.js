import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import TickerLogo, { logoUrl } from './TickerLogo';

test('shows the company logo and falls back to initials when it fails to load', () => {
  const { container } = render(<TickerLogo ticker="PETR4" />);
  const img = container.querySelector('img');
  expect(img).toHaveAttribute('src', 'https://icons.brapi.dev/icons/PETR4.svg');
  fireEvent.error(img);
  expect(container.querySelector('img')).toBeNull();
  expect(screen.getByText('PE')).toBeInTheDocument();
});

test('logo URLs are escaped', () => {
  expect(logoUrl('A/B')).toBe('https://icons.brapi.dev/icons/A%2FB.svg');
});
