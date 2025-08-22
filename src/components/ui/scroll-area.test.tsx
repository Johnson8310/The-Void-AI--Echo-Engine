import React from 'react';
import { render, screen } from '@testing-library/react';
import { ScrollArea } from './scroll-area'; // Adjust the import path as needed

describe('ScrollArea', () => {
  it('renders without crashing', () => {
    render(
      <ScrollArea className="h-[200px] w-[350px] rounded-md border">
        Jhonny Deep
      </ScrollArea>
    );
    expect(screen.getByText('Jhonny Deep')).toBeInTheDocument();
  });

  // Add more tests here to cover specific ScrollArea functionality
  // For example, you could test scrolling behavior, different props, etc.
});