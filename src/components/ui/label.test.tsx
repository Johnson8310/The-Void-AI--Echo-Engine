import React from 'react';
import { render, screen } from '@testing-library/react';
import { Label } from './label';

describe('Label', () => {
  it('renders a label with the provided text', () => {
    render(<Label>Test Label</Label>);
    const labelElement = screen.getByText('Test Label');
    expect(labelElement).toBeInTheDocument();
    expect(labelElement.tagName).toBe('LABEL');
  });

  it('renders a label with a specific htmlFor attribute', () => {
    render(<Label htmlFor="test-input">Test Label</Label>);
    const labelElement = screen.getByText('Test Label');
    expect(labelElement).toHaveAttribute('htmlFor', 'test-input');
  });

  // Add more tests here for different props or behaviors
});