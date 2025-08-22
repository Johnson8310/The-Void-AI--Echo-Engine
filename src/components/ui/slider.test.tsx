import { render, screen } from '@testing-library/react';
import Slider from './slider'; // Adjust the import path as needed

describe('Slider', () => {
  it('renders correctly', () => {
    render(<Slider defaultValue={[50]} />);
    // Add assertions here to check if the component renders as expected
    // For example, you might check for the presence of the slider element
  });

  // Add more tests here to cover different scenarios,
  // such as:
  // - Testing value changes
  // - Testing different props (min, max, step, disabled, etc.)
  // - Testing accessibility features
});