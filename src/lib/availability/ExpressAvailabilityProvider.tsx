import { createContext, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import * as Location from 'expo-location';
import { AppState, Linking, type AppStateStatus } from 'react-native';
import { professionalManagementApi } from '@/lib/api/professional-management';
import { queryKeys } from '@/lib/constants/query-keys';
import { toast } from '@/lib/utils/toast';
import {
  FLUSH_DISTANCE_M,
  FLUSH_TIME_MS,
  RECENCY_CHECK_INTERVAL_MS,
  STALE_THRESHOLD_MS,
  TOGGLE_OFF_RETRY_DELAYS_MS,
  WATCH_DISTANCE_INTERVAL_M,
  WATCH_TIME_INTERVAL_MS,
  type ExpressAvailabilityContextValue,
  type ExpressAvailabilityStatus,
} from './types';

export const ExpressAvailabilityContext = createContext<ExpressAvailabilityContextValue | null>(null);

interface ProviderProps {
  professionalId: string | null;
  initialGeoActive?: boolean;
  initialGeoCapturedAt?: string | null;
  initialGeoAccuracyMeters?: number | null;
  children: ReactNode;
}

interface Coords {
  lat: number;
  lng: number;
  accuracyMeters: number | null;
}

const SOURCE = 'device-gps';

function toCoords(location: { coords: { latitude: number; longitude: number; accuracy?: number | null } }): Coords {
  return {
    lat: location.coords.latitude,
    lng: location.coords.longitude,
    accuracyMeters: location.coords.accuracy ?? null,
  };
}

function haversineMeters(a: Coords, b: Coords): number {
  const R = 6_371_000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

function isStale(lastCapturedAt: Date | null, now = Date.now()): boolean {
  return !!lastCapturedAt && now - lastCapturedAt.getTime() > STALE_THRESHOLD_MS;
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function ExpressAvailabilityProvider({
  professionalId,
  initialGeoActive = false,
  initialGeoCapturedAt = null,
  initialGeoAccuracyMeters = null,
  children,
}: ProviderProps) {
  const queryClient = useQueryClient();
  const initialCapturedDate = initialGeoCapturedAt ? new Date(initialGeoCapturedAt) : null;
  const [status, setStatus] = useState<ExpressAvailabilityStatus>(
    initialGeoActive ? (isStale(initialCapturedDate) ? 'stale' : 'capturing') : 'idle',
  );
  const [geoActive, setGeoActive] = useState(initialGeoActive);
  const [lastCapturedAt, setLastCapturedAt] = useState<Date | null>(initialCapturedDate);
  const [lastAccuracyMeters, setLastAccuracyMeters] = useState<number | null>(initialGeoAccuracyMeters);

  const subscriptionRef = useRef<Location.LocationSubscription | null>(null);
  const lastFlushRef = useRef<{ at: number; coords: Coords } | null>(null);
  const consecutiveFailuresRef = useRef(0);
  const hydratedProfessionalIdRef = useRef<string | null>(null);
  const autoResumeStartedForRef = useRef<string | null>(null);
  const desiredGeoActiveRef = useRef(initialGeoActive);
  const trackingTokenRef = useRef(0);

  const invalidateProfileQueries = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.professionals.myProfile });
    if (professionalId) {
      void queryClient.invalidateQueries({ queryKey: queryKeys.professionals.detail(professionalId) });
    }
  }, [professionalId, queryClient]);

  const stopWatch = useCallback(() => {
    if (subscriptionRef.current) {
      try {
        subscriptionRef.current.remove();
      } catch (error) {
        console.warn('[express-availability] failed to remove watch subscription', error);
      }
    }
    subscriptionRef.current = null;
  }, []);

  const beginTrackingTransition = useCallback((nextActive: boolean) => {
    desiredGeoActiveRef.current = nextActive;
    trackingTokenRef.current += 1;
    return trackingTokenRef.current;
  }, []);

  const isTrackingTokenCurrent = useCallback((token: number) => {
    return desiredGeoActiveRef.current && trackingTokenRef.current === token;
  }, []);

  const applyInactiveState = useCallback((nextStatus: ExpressAvailabilityStatus = 'idle') => {
    setGeoActive(false);
    setStatus(nextStatus);
    setLastCapturedAt(null);
    setLastAccuracyMeters(null);
    lastFlushRef.current = null;
    consecutiveFailuresRef.current = 0;
  }, []);

  const flushIfNeeded = useCallback(async (
    coords: Coords,
    force = false,
    capturedAtMs = Date.now(),
    trackingToken = trackingTokenRef.current,
  ) => {
    if (!professionalId) return false;
    if (!isTrackingTokenCurrent(trackingToken)) return false;

    const last = lastFlushRef.current;
    const elapsed = last ? capturedAtMs - last.at : Infinity;
    const distance = last ? haversineMeters(last.coords, coords) : Infinity;
    if (!force && elapsed < FLUSH_TIME_MS && distance < FLUSH_DISTANCE_M) {
      return false;
    }

    const capturedAt = new Date(capturedAtMs).toISOString();
    await professionalManagementApi.updateGeo(professionalId, {
      geoActive: true,
      geoLat: coords.lat,
      geoLng: coords.lng,
      accuracyMeters: coords.accuracyMeters ?? undefined,
      capturedAt,
      source: SOURCE,
    });

    if (!isTrackingTokenCurrent(trackingToken)) {
      stopWatch();
      try {
        await professionalManagementApi.updateGeo(professionalId, { geoActive: false });
      } catch (error) {
        console.warn('[express-availability] failed to rollback stale activation', error);
      }
      invalidateProfileQueries();
      return false;
    }

    lastFlushRef.current = { at: capturedAtMs, coords };
    setGeoActive(true);
    setStatus('active');
    setLastCapturedAt(new Date(capturedAt));
    setLastAccuracyMeters(coords.accuracyMeters ?? null);
    consecutiveFailuresRef.current = 0;
    invalidateProfileQueries();
    return true;
  }, [invalidateProfileQueries, isTrackingTokenCurrent, professionalId, stopWatch]);

  const handleCaptureFailure = useCallback((error: unknown) => {
    consecutiveFailuresRef.current += 1;
    if (consecutiveFailuresRef.current >= 2) {
      setStatus('unavailable');
    }
    console.warn('[express-availability] capture failed', error);
  }, []);

  const captureOnce = useCallback(async (force = false, trackingToken = trackingTokenRef.current) => {
    try {
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      if (!isTrackingTokenCurrent(trackingToken)) {
        return null;
      }
      const coords = toCoords(position);
      await flushIfNeeded(coords, force, position.timestamp ?? Date.now(), trackingToken);
      return coords;
    } catch (error) {
      handleCaptureFailure(error);
      return null;
    }
  }, [flushIfNeeded, handleCaptureFailure, isTrackingTokenCurrent]);

  const startWatch = useCallback(async (trackingToken = trackingTokenRef.current) => {
    if (subscriptionRef.current || !isTrackingTokenCurrent(trackingToken)) return;
    subscriptionRef.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: WATCH_TIME_INTERVAL_MS,
        distanceInterval: WATCH_DISTANCE_INTERVAL_M,
      },
      (location) => {
        if (!isTrackingTokenCurrent(trackingToken)) {
          stopWatch();
          return;
        }
        const coords = toCoords(location);
        void flushIfNeeded(coords, false, location.timestamp ?? Date.now(), trackingToken).catch(handleCaptureFailure);
      },
    );
  }, [flushIfNeeded, handleCaptureFailure, isTrackingTokenCurrent, stopWatch]);

  const disableOnPermissionLoss = useCallback(async () => {
    beginTrackingTransition(false);
    stopWatch();

    if (professionalId) {
      try {
        await professionalManagementApi.updateGeo(professionalId, { geoActive: false });
      } catch (error) {
        console.warn('[express-availability] failed to disable geo after permission loss', error);
      }
      invalidateProfileQueries();
    }

    applyInactiveState('permission-denied');
  }, [applyInactiveState, beginTrackingTransition, invalidateProfileQueries, professionalId, stopWatch]);

  const resumeTracking = useCallback(async () => {
    if (!geoActive || !professionalId) return;
    const trackingToken = trackingTokenRef.current;

    const permission = await Location.getForegroundPermissionsAsync();
    if (permission.status !== 'granted') {
      await disableOnPermissionLoss();
      return;
    }

    if (isStale(lastCapturedAt)) {
      setStatus('stale');
    } else {
      setStatus('capturing');
    }

    const coords = await captureOnce(true, trackingToken);
    if (!isTrackingTokenCurrent(trackingToken)) return;
    if (!coords) return;
    await startWatch(trackingToken);
  }, [captureOnce, disableOnPermissionLoss, geoActive, isTrackingTokenCurrent, lastCapturedAt, professionalId, startWatch]);

  const toggle = useCallback(async (next: boolean) => {
    if (!professionalId) return;

    if (!next) {
      beginTrackingTransition(false);
      stopWatch();

      let lastError: unknown = null;
      for (let attempt = 0; attempt <= TOGGLE_OFF_RETRY_DELAYS_MS.length; attempt += 1) {
        try {
          await professionalManagementApi.updateGeo(professionalId, { geoActive: false });
          invalidateProfileQueries();
          lastError = null;
          break;
        } catch (error) {
          lastError = error;
          if (attempt === TOGGLE_OFF_RETRY_DELAYS_MS.length) {
            break;
          }
          await delay(TOGGLE_OFF_RETRY_DELAYS_MS[attempt]);
        }
      }

      applyInactiveState('idle');
      if (lastError) {
        toast.error('Erro ao desativar Express', 'Não foi possível sincronizar a desativação no servidor.');
      }
      return;
    }

    const trackingToken = beginTrackingTransition(true);
    setStatus('requesting-permission');
    const permission = await Location.requestForegroundPermissionsAsync();
    if (trackingTokenRef.current !== trackingToken) return;
    if (permission.status !== 'granted') {
      desiredGeoActiveRef.current = false;
      setStatus('permission-denied');
      setGeoActive(false);
      return;
    }

    setStatus('capturing');
    const coords = await captureOnce(true, trackingToken);
    if (!isTrackingTokenCurrent(trackingToken)) return;
    if (!coords) return;

    await startWatch(trackingToken);
  }, [applyInactiveState, beginTrackingTransition, captureOnce, invalidateProfileQueries, isTrackingTokenCurrent, professionalId, startWatch, stopWatch]);

  const forceCapture = useCallback(async () => {
    if (!geoActive || !professionalId) return;
    const trackingToken = trackingTokenRef.current;
    setStatus('capturing');
    const coords = await captureOnce(true, trackingToken);
    if (!isTrackingTokenCurrent(trackingToken)) return;
    if (!coords) return;
    await startWatch(trackingToken);
  }, [captureOnce, geoActive, isTrackingTokenCurrent, professionalId, startWatch]);

  const openSettings = useCallback(async () => {
    await Linking.openSettings();
  }, []);

  useEffect(() => {
    if (!professionalId || hydratedProfessionalIdRef.current === professionalId) return;

    hydratedProfessionalIdRef.current = professionalId;
    const capturedDate = initialGeoCapturedAt ? new Date(initialGeoCapturedAt) : null;
    desiredGeoActiveRef.current = initialGeoActive;
    trackingTokenRef.current += 1;

    setGeoActive(initialGeoActive);
    setLastCapturedAt(capturedDate);
    setLastAccuracyMeters(initialGeoAccuracyMeters);
    setStatus(initialGeoActive ? (isStale(capturedDate) ? 'stale' : 'capturing') : 'idle');
  }, [initialGeoAccuracyMeters, initialGeoActive, initialGeoCapturedAt, professionalId]);

  useEffect(() => {
    if (!geoActive) return;

    const intervalId = setInterval(() => {
      if (!isStale(lastCapturedAt)) return;
      setStatus((current) => (current === 'active' ? 'stale' : current));
      void captureOnce(true);
    }, RECENCY_CHECK_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [captureOnce, geoActive, lastCapturedAt]);

  useEffect(() => {
    const onChange = async (nextState: AppStateStatus) => {
      if (nextState === 'background' || nextState === 'inactive') {
        stopWatch();
        return;
      }

      if (nextState === 'active' && geoActive) {
        await resumeTracking();
      }
    };

    const subscription = AppState.addEventListener('change', onChange);
    return () => subscription.remove();
  }, [geoActive, resumeTracking, stopWatch]);

  useEffect(() => {
    if (!professionalId || !initialGeoActive) return;
    if (hydratedProfessionalIdRef.current !== professionalId) return;
    if (autoResumeStartedForRef.current === professionalId) return;
    autoResumeStartedForRef.current = professionalId;
    void resumeTracking();
  }, [initialGeoActive, professionalId, resumeTracking]);

  useEffect(() => () => stopWatch(), [stopWatch]);

  const value = useMemo<ExpressAvailabilityContextValue>(() => ({
    status,
    geoActive,
    lastCapturedAt,
    lastAccuracyMeters,
    toggle,
    forceCapture,
    openSettings,
  }), [forceCapture, geoActive, lastAccuracyMeters, lastCapturedAt, openSettings, status, toggle]);

  return (
    <ExpressAvailabilityContext.Provider value={value}>
      {children}
    </ExpressAvailabilityContext.Provider>
  );
}
