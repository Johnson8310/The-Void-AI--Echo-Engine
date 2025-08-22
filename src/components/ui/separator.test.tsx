import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { Separator } from './separator';

describe('Separator', () => {
  it('renders without crashing', () => {
    render(<Separator />);
  });

  it('applies horizontal orientation by default', () => {
    const { getByRole } = render(<Separator />);
    const separator = getByRole('separator');
    expect(separator).toHaveAttribute('data-orientation', 'horizontal');
  });

  it('applies vertical orientation when specified', () => {
    const { getByRole } = render(<Separator orientation="vertical" />);
    const separator = getByRole('separator');
    expect(separator).toHaveAttribute('data-orientation', 'vertical');
  });

  it('applies provided className', () => {
    const { getByRole } = render(<Separator className="custom-class" />);
    const separator = getByRole('separator');
    expect(separator).toHaveClass('custom-class');
  });
});