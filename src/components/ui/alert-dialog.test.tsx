import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from './alert-dialog'; // Adjust the import path as needed

describe('AlertDialog', () => {
  test('renders AlertDialogTrigger', () => {
    render(
      <AlertDialog>
        <AlertDialogTrigger>Open</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              account and remove your data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );

    expect(screen.getByRole('button', { name: /open/i })).toBeInTheDocument();
  });

  // Add more tests here to cover AlertDialog functionality,
  // such as opening and closing the dialog,
  // interacting with the cancel and action buttons, etc.
});