import { render, screen } from '@testing-library/react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './accordion';

describe('Accordion', () => {
  it('renders the accordion', () => {
    render(
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger>Is it accessible?</AccordionTrigger>
          <AccordionContent>
            Yes. It adheres to the WAI-ARIA design pattern.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    );
    expect(screen.getByText('Is it accessible?')).toBeInTheDocument();
    expect(screen.getByText('Yes. It adheres to the WAI-ARIA design pattern.')).toBeInTheDocument();
  });

  // Add more tests here for different Accordion types, interactions, etc.
});