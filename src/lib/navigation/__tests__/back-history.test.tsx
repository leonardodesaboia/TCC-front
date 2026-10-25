import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
const state = vi.hoisted(() => ({ segments: ['(professional)', '(orders)', '[orderId]'], router: { navigate: vi.fn(), back: vi.fn(), canGoBack: vi.fn(() => true) } }));
vi.mock('expo-router', () => ({ useRouter: () => state.router, useSegments: () => state.segments }));
import { resetNavigationHistory, useGoBack } from '../back-history';

beforeEach(() => { vi.clearAllMocks(); resetNavigationHistory(); });
describe('order navigation recovery', () => {
  it.each(['professional', 'client'])('returns a %s order detail to its own list even when opened directly', (role) => {
    state.segments = [`(${role})`, '(orders)', '[orderId]'];
    const { result } = renderHook(() => useGoBack());
    act(() => result.current());
    expect(state.router.navigate).toHaveBeenCalledWith(`/(${role})/(orders)`);
    expect(state.router.back).not.toHaveBeenCalled();
  });
  it('recovers a directly opened form to the root of its tab', () => {
    state.segments = ['(professional)', '(profile)', 'services', 'new'];
    const { result } = renderHook(() => useGoBack());
    act(() => result.current());
    expect(state.router.navigate).toHaveBeenCalledWith('/(professional)/(profile)');
    expect(state.router.back).not.toHaveBeenCalled();
  });
});
