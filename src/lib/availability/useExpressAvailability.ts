import { useContext } from 'react';
import { ExpressAvailabilityContext } from './ExpressAvailabilityProvider';
import type { ExpressAvailabilityContextValue } from './types';

export function useExpressAvailability(): ExpressAvailabilityContextValue {
  const ctx = useContext(ExpressAvailabilityContext);
  if (!ctx) {
    throw new Error('useExpressAvailability must be used inside ExpressAvailabilityProvider');
  }
  return ctx;
}
