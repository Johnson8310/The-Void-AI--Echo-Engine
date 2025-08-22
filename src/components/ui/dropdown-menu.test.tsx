import React from 'react';
import { render, screen } from '@testing-library/react';
import { DropdownMenu } from './dropdown-menu'; // Adjust import path as needed

describe('DropdownMenu', () => {
  it('renders without crashing', () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Item 1</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
    expect(screen.getByText('Open')).toBeInTheDocument();
  });

  // Add more tests here to cover different scenarios:
  // - Test opening and closing the dropdown
  // - Test selecting an item
  // - Test different props and variations of the component
});