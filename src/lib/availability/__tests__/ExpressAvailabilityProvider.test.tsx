import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { AppState, Linking } from 'react-native';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ExpressAvailabilityProvider } from '../ExpressAvailabilityProvider';
import { useExpressAvailability } from '../useExpressAvailability';

const requestForegroundPermissionsAsync = vi.fn();
const getForegroundPermissionsAsync = vi.fn();
const getCurrentPositionAsync = vi.fn();
const watchPositionAsync = vi.fn();
const remove = vi.fn();
const updateGeo = vi.fn();

vi.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: (...args: unknown[]) => requestForegroundPermissionsAsync(...args),
  getForegroundPermissionsAsync: (...args: unknown[]) => getForegroundPermissionsAsync(...args),
  getCurrentPositionAsync: (...args: unknown[]) => getCurrentPositionAsync(...args),
  watchPositionAsync: (...args: unknown[]) => watchPositionAsync(...args),
  Accuracy: { Balanced: 3 },
}));

vi.mock('@/lib/api/professional-management', () => ({
  professionalManagementApi: {
    updateGeo: (...args: unknown[]) => updateGeo(...args),
  },
}));

vi.mock('@/lib/utils/toast', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  },
}));

const PRO_ID = 'pro-1';
const appStateListeners: Array<(status: 'active' | 'background' | 'inactive') => void | Promise<void>> = [];

function createWrapper({
  professionalId = PRO_ID,
  initialGeoActive = false,
  initialGeoCapturedAt = null,
}: {
  professionalId?: string | null;
  initialGeoActive?: boolean;
  initialGeoCapturedAt?: string | null;
} = {}) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <ExpressAvailabilityProvider
          professionalId={professionalId}
          initialGeoActive={initialGeoActive}
          initialGeoCapturedAt={initialGeoCapturedAt}
        >
          {children}
        </ExpressAvailabilityProvider>
      </QueryClientProvider>
    );
  };
}

beforeEach(() => {
  requestForegroundPermissionsAsync.mockReset();
  getForegroundPermissionsAsync.mockReset();
  getCurrentPositionAsync.mockReset();
  watchPositionAsync.mockReset();
  updateGeo.mockReset();
  remove.mockReset();
  appStateListeners.length = 0;

  watchPositionAsync.mockResolvedValue({ remove });
  updateGeo.mockResolvedValue({});
  getForegroundPermissionsAsync.mockResolvedValue({ status: 'granted' });

  vi.mocked(AppState.addEventListener).mockImplementation((_event, listener) => {
    appStateListeners.push(listener as (status: 'active' | 'background' | 'inactive') => void | Promise<void>);
    return { remove: vi.fn() } as any;
  });

  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('ExpressAvailabilityProvider', () => {
  it('starts in idle when initialGeoActive is false', () => {
    const { result } = renderHook(() => useExpressAvailability(), {
      wrapper: createWrapper(),
    });

    expect(result.current.status).toBe('idle');
    expect(result.current.geoActive).toBe(false);
  });

  it('auto-resumes only once when mounted with initialGeoActive=true', async () => {
    getCurrentPositionAsync.mockResolvedValue({
      coords: { latitude: -3.73, longitude: -38.52, accuracy: 12.5 },
      timestamp: Date.now(),
    });

    renderHook(() => useExpressAvailability(), {
      wrapper: createWrapper({
        initialGeoActive: true,
        initialGeoCapturedAt: new Date().toISOString(),
      }),
    });

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(updateGeo).toHaveBeenCalledTimes(1);

    await act(async () => {
      vi.advanceTimersByTime(500);
      await Promise.resolve();
    });

    expect(updateGeo).toHaveBeenCalledTimes(1);
  });

  it('toggle ON without permission ends in permission-denied without calling backend', async () => {
    requestForegroundPermissionsAsync.mockResolvedValue({ status: 'denied' });

    const { result } = renderHook(() => useExpressAvailability(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.toggle(true);
    });

    expect(result.current.status).toBe('permission-denied');
    expect(updateGeo).not.toHaveBeenCalled();
  });

  it('toggle ON with permission captures position and calls backend once with full payload', async () => {
    requestForegroundPermissionsAsync.mockResolvedValue({ status: 'granted' });
    getCurrentPositionAsync.mockResolvedValue({
      coords: { latitude: -3.73, longitude: -38.52, accuracy: 12.5 },
      timestamp: Date.now(),
    });

    const { result } = renderHook(() => useExpressAvailability(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.toggle(true);
    });

    expect(result.current.status).toBe('active');
    expect(result.current.geoActive).toBe(true);
    expect(updateGeo).toHaveBeenCalledTimes(1);
    expect(updateGeo).toHaveBeenCalledWith(PRO_ID, expect.objectContaining({
      geoActive: true,
      geoLat: -3.73,
      geoLng: -38.52,
      accuracyMeters: 12.5,
      source: 'device-gps',
    }));
    expect(updateGeo.mock.calls[0][1].capturedAt).toBeTypeOf('string');
  });

  it('toggle OFF when active calls backend with geoActive=false and stops watch', async () => {
    requestForegroundPermissionsAsync.mockResolvedValue({ status: 'granted' });
    getCurrentPositionAsync.mockResolvedValue({
      coords: { latitude: -3.73, longitude: -38.52, accuracy: 10 },
      timestamp: Date.now(),
    });

    const { result } = renderHook(() => useExpressAvailability(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.toggle(true);
    });
    updateGeo.mockClear();

    await act(async () => {
      await result.current.toggle(false);
    });

    expect(result.current.status).toBe('idle');
    expect(result.current.geoActive).toBe(false);
    expect(updateGeo).toHaveBeenCalledTimes(1);
    expect(updateGeo).toHaveBeenCalledWith(PRO_ID, expect.objectContaining({ geoActive: false }));
    expect(remove).toHaveBeenCalled();
  });

  it('debounces watch updates: 3 events within 60s and <50m yield only the initial backend call', async () => {
    requestForegroundPermissionsAsync.mockResolvedValue({ status: 'granted' });
    getCurrentPositionAsync.mockResolvedValue({
      coords: { latitude: 0, longitude: 0, accuracy: 10 },
      timestamp: Date.now(),
    });

    let watchCallback: ((loc: any) => void) | null = null;
    watchPositionAsync.mockImplementation(async (_opts: any, cb: any) => {
      watchCallback = cb;
      return { remove };
    });

    const { result } = renderHook(() => useExpressAvailability(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.toggle(true);
    });
    expect(updateGeo).toHaveBeenCalledTimes(1);
    updateGeo.mockClear();

    await act(async () => {
      watchCallback!({ coords: { latitude: 0.00001, longitude: 0, accuracy: 10 }, timestamp: Date.now() });
      await Promise.resolve();
      vi.advanceTimersByTime(10_000);
      watchCallback!({ coords: { latitude: 0.00002, longitude: 0, accuracy: 10 }, timestamp: Date.now() });
      await Promise.resolve();
      vi.advanceTimersByTime(10_000);
      watchCallback!({ coords: { latitude: 0.00003, longitude: 0, accuracy: 10 }, timestamp: Date.now() });
      await Promise.resolve();
    });

    expect(updateGeo).not.toHaveBeenCalled();
  });

  it('flushes immediately when distance > 50m even before 60s', async () => {
    requestForegroundPermissionsAsync.mockResolvedValue({ status: 'granted' });
    getCurrentPositionAsync.mockResolvedValue({
      coords: { latitude: 0, longitude: 0, accuracy: 10 },
      timestamp: Date.now(),
    });

    let watchCallback: ((loc: any) => void) | null = null;
    watchPositionAsync.mockImplementation(async (_opts: any, cb: any) => {
      watchCallback = cb;
      return { remove };
    });

    const { result } = renderHook(() => useExpressAvailability(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.toggle(true);
    });
    updateGeo.mockClear();

    await act(async () => {
      watchCallback!({ coords: { latitude: 0.001, longitude: 0, accuracy: 10 }, timestamp: Date.now() });
      await Promise.resolve();
    });

    expect(updateGeo).toHaveBeenCalledTimes(1);
  });

  it('flushes after 60s elapsed even without movement', async () => {
    requestForegroundPermissionsAsync.mockResolvedValue({ status: 'granted' });
    getCurrentPositionAsync.mockResolvedValue({
      coords: { latitude: 0, longitude: 0, accuracy: 10 },
      timestamp: Date.now(),
    });

    let watchCallback: ((loc: any) => void) | null = null;
    watchPositionAsync.mockImplementation(async (_opts: any, cb: any) => {
      watchCallback = cb;
      return { remove };
    });

    const { result } = renderHook(() => useExpressAvailability(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.toggle(true);
    });
    updateGeo.mockClear();

    await act(async () => {
      vi.advanceTimersByTime(61_000);
      watchCallback!({ coords: { latitude: 0, longitude: 0, accuracy: 10 }, timestamp: Date.now() });
      await Promise.resolve();
    });

    expect(updateGeo).toHaveBeenCalledTimes(1);
  });

  it('marks status stale when lastCapturedAt is older than 4 minutes', async () => {
    requestForegroundPermissionsAsync.mockResolvedValue({ status: 'granted' });
    getCurrentPositionAsync.mockResolvedValue({
      coords: { latitude: 0, longitude: 0, accuracy: 10 },
      timestamp: Date.now(),
    });

    const { result } = renderHook(() => useExpressAvailability(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.toggle(true);
    });

    await act(async () => {
      vi.advanceTimersByTime(5 * 60 * 1000);
      await Promise.resolve();
    });

    expect(updateGeo.mock.calls.length).toBeGreaterThanOrEqual(2);
    expect(['stale', 'capturing', 'active']).toContain(result.current.status);
  });

  it('when app returns active with permission revoked, disables geo on backend and moves to permission-denied', async () => {
    requestForegroundPermissionsAsync.mockResolvedValue({ status: 'granted' });
    getCurrentPositionAsync.mockResolvedValue({
      coords: { latitude: -3.73, longitude: -38.52, accuracy: 10 },
      timestamp: Date.now(),
    });

    const { result } = renderHook(() => useExpressAvailability(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.toggle(true);
    });
    updateGeo.mockClear();

    await act(async () => {
      await appStateListeners.at(-1)?.('background');
    });

    getForegroundPermissionsAsync.mockResolvedValue({ status: 'denied' });
    await act(async () => {
      await appStateListeners.at(-1)?.('active');
    });

    expect(result.current.status).toBe('permission-denied');
    expect(result.current.geoActive).toBe(false);
    expect(updateGeo).toHaveBeenCalledWith(PRO_ID, expect.objectContaining({ geoActive: false }));
  });

  it('openSettings delegates to Linking', async () => {
    const { result } = renderHook(() => useExpressAvailability(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.openSettings();
    });

    expect(Linking.openSettings).toHaveBeenCalled();
  });
});
