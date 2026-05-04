export type ExpressAvailabilityStatus =
  | 'idle'
  | 'requesting-permission'
  | 'permission-denied'
  | 'capturing'
  | 'active'
  | 'stale'
  | 'unavailable';

export interface ExpressAvailabilityState {
  status: ExpressAvailabilityStatus;
  geoActive: boolean;
  lastCapturedAt: Date | null;
  lastAccuracyMeters: number | null;
}

export interface ExpressAvailabilityActions {
  toggle: (next: boolean) => Promise<void>;
  forceCapture: () => Promise<void>;
  openSettings: () => Promise<void>;
}

export type ExpressAvailabilityContextValue = ExpressAvailabilityState & ExpressAvailabilityActions;

export const STALE_THRESHOLD_MS = 4 * 60 * 1000;
export const RECENCY_CHECK_INTERVAL_MS = 30 * 1000;
export const FLUSH_TIME_MS = 60 * 1000;
export const FLUSH_DISTANCE_M = 50;
export const WATCH_TIME_INTERVAL_MS = 60 * 1000;
export const WATCH_DISTANCE_INTERVAL_M = 25;
export const TOGGLE_OFF_RETRY_DELAYS_MS = [1000, 2000, 4000] as const;
