import { render, screen } from '@testing-library/react';
import { Badge } from './badge';

describe('Badge', () => {
  it('renders the badge with text content', () => {
    const badgeText = 'New';
    render(<Badge>{badgeText}</Badge>);
    const badgeElement = screen.getByText(badgeText);
    expect(badgeElement).toBeInTheDocument();
  });

  it('applies the default variant classes', () => {
    render(<Badge>Default</Badge>);
    const badgeElement = screen.getByText('Default');
    expect(badgeElement).toHaveClass('inline-flex items-center border rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2');
    expect(badgeElement).toHaveClass('border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80');
  });

  it('applies the secondary variant classes', () => {
    render(<Badge variant="secondary">Secondary</Badge>);
    const badgeElement = screen.getByText('Secondary');
    expect(badgeElement).toHaveClass('bg-secondary text-secondary-foreground hover:bg-secondary/80');
  });

  it('applies the destructive variant classes', () => {
    render(<Badge variant="destructive">Destructive</Badge>);
    const badgeElement = screen.getByText('Destructive');
    expect(badgeElement).toHaveClass('bg-destructive text-destructive-foreground shadow hover:bg-destructive/80');
  });

  it('applies the outline variant classes', () => {
    render(<Badge variant="outline">Outline</Badge>);
    const badgeElement = screen.getByText('Outline');
    expect(badgeElement).toHaveClass('text-foreground');
  });

  it('renders with additional class names', () => {
    const additionalClass = 'custom-class';
    render(<Badge className={additionalClass}>With Class</Badge>);
    const badgeElement = screen.getByText('With Class');
    expect(badgeElement).toHaveClass(additionalClass);
  });
});