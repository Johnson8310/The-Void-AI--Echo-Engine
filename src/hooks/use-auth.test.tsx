import { renderHook, act } from '@testing-library/react-hooks';
import { useAuth } from './use-auth'; // Adjust the import path as necessary
import { auth } from '../lib/firebase'; // Adjust the import path as necessary
import { onAuthStateChanged, User } from 'firebase/auth';

// Mock the firebase auth module
jest.mock('../lib/firebase', () => ({
  auth: {
    onAuthStateChanged: jest.fn(),
    // Mock other auth methods if needed for future tests
  },
}));

describe('useAuth', () => {
  it('should return the initial user state as null', () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.user).toBeNull();
    expect(result.current.loading).toBe(true); // Should be loading initially
  });

  it('should update the user state when auth state changes', () => {
    let mockAuthStateChange: (user: User | null) => void;
    (onAuthStateChanged as jest.Mock).mockImplementation((auth, callback) => {
      mockAuthStateChange = callback;
      return jest.fn(); // Return an unsubscribe function
    });

    const { result } = renderHook(() => useAuth());

    const mockUser = { uid: '123', email: 'test@example.com' } as User;

    act(() => {
      mockAuthStateChange(mockUser);
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.loading).toBe(false);
  });

  it('should set user state to null and loading to false when auth state changes to null', () => {
    let mockAuthStateChange: (user: User | null) => void;
    (onAuthStateChanged as jest.Mock).mockImplementation((auth, callback) => {
      mockAuthStateChange = callback;
      return jest.fn(); // Return an unsubscribe function
    });

    const { result } = renderHook(() => useAuth());

    act(() => {
      mockAuthStateChange(null);
    });

    expect(result.current.user).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  // Add more tests as needed for specific authentication scenarios
});