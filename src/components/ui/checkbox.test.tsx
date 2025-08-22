import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Checkbox } from './checkbox'; // Adjust the import path as needed

describe('Checkbox', () => {
  it('renders a checkbox', () => {
    render(<Checkbox data-testid="my-checkbox" />);
    const checkbox = screen.getByTestId('my-checkbox');
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).toHaveAttribute('type', 'checkbox');
  });

  it('renders with a label', () => {
    render(<Checkbox id="my-checkbox-with-label" />);
    render(<label htmlFor="my-checkbox-with-label">My Checkbox Label</label>);
    const label = screen.getByText('My Checkbox Label');
    expect(label).toBeInTheDocument();
  });

  // Add more tests here for different props and states
  // For example, testing the 'checked' state, 'disabled' state, etc.
});