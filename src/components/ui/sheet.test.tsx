import { render, screen } from '@testing-library/react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from './sheet'; // Adjust the import path as needed

describe('Sheet', () => {
  it('renders the SheetTrigger', () => {
    render(
      <Sheet>
        <SheetTrigger>Open</SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Sheet Title</SheetTitle>
            <SheetDescription>Sheet Description</SheetDescription>
          </SheetHeader>
          <div>Sheet Content</div>
        </SheetContent>
      </Sheet>
    );
    expect(screen.getByText('Open')).toBeInTheDocument();
  });

  // Add more tests here for opening, closing, content, etc.
});