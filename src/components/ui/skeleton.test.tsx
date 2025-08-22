import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Skeleton } from './skeleton'; // Adjust the import path as necessary

describe('Skeleton', () => {
  test('renders correctly', () => {
    render(<Skeleton />);
    const skeletonElement = screen.getByTestId('skeleton'); // Add a data-testid="skeleton" to your Skeleton component
    expect(skeletonElement).toBeInTheDocument();
  });

  test('applies additional class names', () => {
    const additionalClassName = 'custom-skeleton';
    render(<Skeleton className={additionalClassName} />);
    const skeletonElement = screen.getByTestId('skeleton'); // Add a data-testid="skeleton" to your Skeleton component
    expect(skeletonElement).toHaveClass(additionalClassName);
  });

  // Add more tests here based on the specific props and behavior of your Skeleton component
});