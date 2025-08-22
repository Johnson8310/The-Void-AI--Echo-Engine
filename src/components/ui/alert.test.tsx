import { render, screen } from '@testing-library/react';
import { Alert, AlertTitle, AlertDescription } from './alert'; // Adjust the import path as necessary

describe('Alert', () => {
  it('renders the alert with title and description', () => {
    render(
      <Alert>
        <AlertTitle>Test Title</AlertTitle>
        <AlertDescription>Test Description</AlertDescription>
      </Alert>
    );

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('renders only the alert title', () => {
    render(
      <Alert>
        <AlertTitle>Test Title</AlertTitle>
      </Alert>
    );

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { level: 5 })).toBeInTheDocument(); // Adjust selector based on how AlertTitle is rendered
  });

  it('renders only the alert description', () => {
    render(
      <Alert>
        <AlertDescription>Test Description</AlertDescription>
      </Alert>
    );

    expect(screen.getByText('Test Description')).toBeInTheDocument();
    expect(screen.queryByText('Test Title')).not.toBeInTheDocument();
  });

  // Add more tests for different variants, sizes, or other props if applicable
});