import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { Chart } from './chart'; // Adjust the import path as needed

describe('Chart', () => {
  test('renders without crashing', () => {
    render(<Chart data={[]} options={{}} />);
    // You might want to add more specific assertions here based on your Chart component's implementation
    expect(screen.getByTestId('chart-container')).toBeInTheDocument(); // Assuming your chart has a data-testid="chart-container"
  });

  // Add more test cases here to test different aspects of your Chart component
  // For example, you can test:
  // - Rendering with different data sets
  // - Rendering with different options
  // - Interaction (if your chart is interactive)
  // - Empty data states
  // - Error states
});