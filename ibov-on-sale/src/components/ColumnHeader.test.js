import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ColumnHeader from './ColumnHeader';

test('shows the field explanation when hovering the header', async () => {
  render(<ColumnHeader label="EV/EBIT" description="Valor da firma dividido pelo EBIT." />);
  expect(screen.queryByText('Valor da firma dividido pelo EBIT.')).not.toBeInTheDocument();

  userEvent.hover(screen.getByText('EV/EBIT'));
  expect(await screen.findByText('Valor da firma dividido pelo EBIT.')).toBeInTheDocument();
  expect(screen.getByLabelText('O que é EV/EBIT')).toBeInTheDocument();
});
