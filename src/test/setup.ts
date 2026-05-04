import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// Minimal react-native shim. The Provider we will test only uses AppState and Linking.
// No native rendering happens in Provider tests, so we can stub the bridge entirely.
vi.mock('react-native', () => ({
  AppState: {
    currentState: 'active' as 'active' | 'background' | 'inactive',
    addEventListener: vi.fn(() => ({ remove: vi.fn() })),
  },
  Linking: {
    openSettings: vi.fn(),
  },
}));
