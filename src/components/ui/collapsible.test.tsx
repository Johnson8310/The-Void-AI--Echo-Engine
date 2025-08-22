import React from 'react';
import { render, screen } from '@testing-library/react';
import { Collapsible } from './collapsible'; // Adjust the import path as necessary

describe('Collapsible', () => {
  it('renders the trigger and content', () => {
    render(
      <Collapsible>
        <Collapsible.Trigger>Toggle</Collapsible.Trigger>
        <Collapsible.Content>Content</Collapsible.Content>
      </Collapsible>
    );

    expect(screen.getByText('Toggle')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  // Add more tests here to cover behavior like opening and closing
  // For example, using userEvent to click the trigger and check content visibility
});