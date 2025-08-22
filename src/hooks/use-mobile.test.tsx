import { renderHook } from '@testing-library/react-hooks';
import { useMobile } from './use-mobile';

describe('useMobile', () => {
  it('should return true when the window width is less than 768', () => {
    global.innerWidth = 700;
    const { result } = renderHook(() => useMobile());
    expect(result.current).toBe(true);
  });

  it('should return false when the window width is 768 or greater', () => {
    global.innerWidth = 800;
    const { result } = renderHook(() => useMobile());
    expect(result.current).toBe(false);
  });

  // You might want to add tests for resizing the window
  // This requires more advanced testing setup with event listeners or mocking
});