import { render, screen } from '@testing-library/react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs'; // Adjust the import path as necessary

describe('Tabs', () => {
  it('renders tabs and content', () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content for Tab 1</TabsContent>
        <TabsContent value="tab2">Content for Tab 2</TabsContent>
      </Tabs>
    );

    // Check if the tabs are rendered
    expect(screen.getByRole('tab', { name: /tab 1/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /tab 2/i })).toBeInTheDocument();

    // Check if the default tab content is visible
    expect(screen.getByText(/Content for Tab 1/i)).toBeVisible();
    expect(screen.queryByText(/Content for Tab 2/i)).not.toBeVisible(); // Assuming initial state hides inactive content
  });

  // Add more tests here to cover interactions, accessibility, etc.
});