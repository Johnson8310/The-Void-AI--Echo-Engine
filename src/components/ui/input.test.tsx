import { render, screen } from '@testing-library/react';
import { Input } from './input';

describe('Input', () => {
  it('renders an input element', () => {
    render(<Input />);
    const inputElement = screen.getByRole('textbox');
    expect(inputElement).toBeInTheDocument();
  });

  it('renders with a placeholder', () => {
    const placeholderText = 'Enter text';
    render(<Input placeholder={placeholderText} />);
    const inputElement = screen.getByPlaceholderText(placeholderText);
    expect(inputElement).toBeInTheDocument();
  });

  it('renders with a default value', () => {
    const defaultValue = 'Initial value';
    render(<Input defaultValue={defaultValue} />);
    const inputElement = screen.getByDisplayValue(defaultValue);
    expect(inputElement).toBeInTheDocument();
  });

  it('renders with a specific type', () => {
    render(<Input type="password" />);
    const inputElement = screen.getByLabelText('Password'); // Assuming a label is used for password type
    expect(inputElement).toHaveAttribute('type', 'password');
  });

  it('renders with a custom class name', () => {
    const customClassName = 'my-custom-class';
    render(<Input className={customClassName} />);
    const inputElement = screen.getByRole('textbox');
    expect(inputElement).toHaveClass(customClassName);
  });

  // Add more tests for different props and behaviors as needed
});