import { render, screen } from '@testing-library/react';
import { Progress } from './progress';

describe('Progress', () => {
  it('renders with default value', () => {
    render(<Progress value={0} />);
    const progressElement = screen.getByRole('progressbar');
    expect(progressElement).toBeInTheDocument();
    expect(progressElement).toHaveAttribute('aria-valuenow', '0');
  });

  it('renders with a specific value', () => {
    render(<Progress value={50} />);
    const progressElement = screen.getByRole('progressbar');
    expect(progressElement).toBeInTheDocument();
    expect(progressElement).toHaveAttribute('aria-valuenow', '50');
  });

  it('renders with a maximum value', () => {
    render(<Progress value={75} max={100} />);
    const progressElement = screen.getByRole('progressbar');
    expect(progressElement).toBeInTheDocument();
    expect(progressElement).toHaveAttribute('aria-valuenow', '75');
    expect(progressElement).toHaveAttribute('aria-valuemax', '100');
  });

  it('renders with a minimum value', () => {
    render(<Progress value={25} min={0} />);
    const progressElement = screen.getByRole('progressbar');
    expect(progressElement).toBeInTheDocument();
    expect(progressElement).toHaveAttribute('aria-valuenow', '25');
    expect(progressElement).toHaveAttribute('aria-valuemin', '0');
  });

  it('applies the correct style for progress', () => {
    render(<Progress value={60} />);
    const progressElement = screen.getByRole('progressbar');
    const progressIndicator = progressElement.querySelector('div'); // Assuming the progress is indicated by an inner div
    expect(progressIndicator).toHaveStyle('transform: translateX(-40%)'); // 100 - 60 = 40
  });

  it('handles value prop as undefined', () => {
    render(<Progress />);
    const progressElement = screen.getByRole('progressbar');
    expect(progressElement).toBeInTheDocument();
    expect(progressElement).not.toHaveAttribute('aria-valuenow');
  });

  it('handles value prop as null', () => {
    render(<Progress value={null as any} />); // Testing with null explicitly
    const progressElement = screen.getByRole('progressbar');
    expect(progressElement).toBeInTheDocument();
    expect(progressElement).not.toHaveAttribute('aria-valuenow');
  });

  // Add more tests for different scenarios and edge cases as needed
});