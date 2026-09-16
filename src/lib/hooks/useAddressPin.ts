import { useCallback, useMemo, useRef, useState } from 'react';
import type { Coordinates } from '@/components/maps/PinLocationPicker';
import { useCurrentPosition, type CurrentPositionStatus } from '@/lib/hooks/useCurrentPosition';
import type { CoordinateSource, GeocodeConfidence, GeocodedAddress } from '@/types/address';

/** Centro de Fortaleza. Serve só para abrir o mapa em algum lugar. */
const MAP_FALLBACK_CENTER: Coordinates = { lat: -3.731862, lng: -38.526669 };

export type PinOrigin = 'gps' | 'lookup' | 'manual';

export interface CoordinatePayload {
  lat: number;
  lng: number;
  coordinateSource: Exclude<CoordinateSource, 'legacy'>;
  coordinateAccuracyMeters?: number;
  coordinateConfidence?: GeocodeConfidence;
}

interface UseAddressPinResult {
  /** Ponto escolhido. `null` enquanto ninguém escolheu nada. */
  pin: Coordinates | null;
  /** Onde o mapa abre. Nunca é `null` — mas não conta como escolha. */
  mapCenter: Coordinates;
  /** `true` quando o mapa está visível na tela. */
  isMapOpen: boolean;
  origin: PinOrigin | null;
  gpsStatus: CurrentPositionStatus;
  isCapturingGps: boolean;
  lookupDisplayName: string | null;
  lookupConfidence: GeocodeConfidence | null;
  /** `true` quando a sugestão do lookup é aproximada demais para o Express. */
  isSuggestionApproximate: boolean;

  openMap: () => void;
  captureFromGps: () => Promise<Coordinates | null>;
  /**
   * Aplica uma sugestão da API. Só conta como ponto escolhido quando a precisão é
   * de edifício — é a mesma régua que a API usa para aceitar origem `geocoded`.
   */
  applySuggestion: (result: GeocodedAddress, revision?: number) => boolean;
  getRevision: () => number;
  /** Toque ou arrasto no mapa. Sempre vira origem manual. */
  moveTo: (coordinates: Coordinates) => void;
  hydrate: (coordinates: Coordinates | null, source: CoordinateSource | null,
    confidence?: GeocodeConfidence | null, accuracy?: number | null) => void;
  invalidate: () => void;
  clearSuggestion: () => void;

  /** Payload pronto para create/update, ou `null` quando não há ponto escolhido. */
  toPayload: () => CoordinatePayload | null;
}

function toApiSource(origin: PinOrigin): Exclude<CoordinateSource, 'legacy'> {
  switch (origin) {
    case 'gps':
      return 'device_gps';
    case 'lookup':
      return 'geocoded';
    case 'manual':
      return 'user_pin';
  }
}

/**
 * Estado do pin de um endereço, junto com a procedência dele.
 *
 * <p>A procedência não é enfeite: a API recusa coordenada sem origem, e o Express
 * só aceita ponto de GPS, pin marcado à mão, ou sugestão com precisão de edifício.
 *
 * <p>Detalhe que parece bobo e não é: o centro de Fortaleza serve para <b>abrir</b>
 * o mapa, nunca como escolha. Antes, abrir o mapa e salvar sem tocar em nada
 * gravava esse ponto como se fosse o endereço da pessoa — e o Express saía
 * procurando profissional a quilômetros de distância.
 */
export function useAddressPin(): UseAddressPinResult {
  const currentPosition = useCurrentPosition();
  const revisionRef = useRef(0);
  const getRevision = useCallback(() => revisionRef.current, []);

  const [pin, setPin] = useState<Coordinates | null>(null);
  const [origin, setOrigin] = useState<PinOrigin | null>(null);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [accuracyMeters, setAccuracyMeters] = useState<number | null>(null);
  const [lookupDisplayName, setLookupDisplayName] = useState<string | null>(null);
  const [lookupConfidence, setLookupConfidence] = useState<GeocodeConfidence | null>(null);

  const mapCenter = pin ?? MAP_FALLBACK_CENTER;

  const clearSuggestion = useCallback(() => {
    setLookupDisplayName(null);
    setLookupConfidence(null);
  }, []);

  const openMap = useCallback(() => {
    setIsMapOpen(true);
  }, []);

  const captureFromGps = useCallback(async () => {
    const revision = ++revisionRef.current;
    const captured = await currentPosition.capture();
    if (!captured || revision !== revisionRef.current) return null;

    const coordinates: Coordinates = { lat: captured.lat, lng: captured.lng };
    setPin(coordinates);
    setOrigin('gps');
    setAccuracyMeters(captured.accuracyMeters);
    setIsMapOpen(true);
    clearSuggestion();
    return coordinates;
  }, [clearSuggestion, currentPosition]);

  const applySuggestion = useCallback((result: GeocodedAddress, revision?: number) => {
    if (revision !== undefined && revision !== revisionRef.current) return false;
    revisionRef.current += 1;
    const confidence = (result.confidence as GeocodeConfidence | undefined) ?? null;

    setPin({ lat: result.lat, lng: result.lng });
    // Precisão de rua ou de bairro abre o mapa no lugar certo, mas não conta como
    // escolha: o pin fica apagado até alguém tocar nele. Assim a tela mostra a
    // mesma coisa que o servidor pensa, em vez de deixar a pessoa descobrir na
    // hora do pedido que o ponto não servia.
    setOrigin(confidence === 'ROOFTOP' ? 'lookup' : null);
    setAccuracyMeters(null);
    setIsMapOpen(true);
    setLookupDisplayName(result.displayName ?? null);
    setLookupConfidence(confidence);
    return true;
  }, []);

  const moveTo = useCallback((coordinates: Coordinates) => {
    revisionRef.current += 1;
    setPin(coordinates);
    setOrigin('manual');
    setAccuracyMeters(null);
    setLookupDisplayName(null);
    setLookupConfidence(null);
  }, []);

  /**
   * Carrega um endereço já salvo. Coordenada `legacy` entra como ponto de partida
   * no mapa, mas sem origem — a pessoa precisa reconfirmar para poder salvar.
   */
  const hydrate = useCallback((coordinates: Coordinates | null, source: CoordinateSource | null,
    confidence: GeocodeConfidence | null = null, accuracy: number | null = null) => {
    revisionRef.current += 1;
    setPin(coordinates);
    setIsMapOpen(!!coordinates);
    setAccuracyMeters(source === 'device_gps' ? accuracy : null);
    setLookupDisplayName(null);
    setLookupConfidence(source === 'geocoded' ? confidence : null);

    if (!coordinates || !source || source === 'legacy' || (source === 'geocoded' && confidence !== 'ROOFTOP')) {
      setOrigin(null);
      return;
    }
    setOrigin(source === 'device_gps' ? 'gps' : source === 'geocoded' ? 'lookup' : 'manual');
  }, []);

  const invalidate = useCallback(() => {
    revisionRef.current += 1;
    setOrigin(null);
    setAccuracyMeters(null);
    clearSuggestion();
  }, [clearSuggestion]);

  const toPayload = useCallback((): CoordinatePayload | null => {
    if (!pin || !origin) return null;
    if (!Number.isFinite(pin.lat) || !Number.isFinite(pin.lng)) return null;
    if (Math.abs(pin.lat) > 90 || Math.abs(pin.lng) > 180) return null;
    if (origin === 'lookup' && lookupConfidence !== 'ROOFTOP') return null;

    const payload: CoordinatePayload = {
      lat: pin.lat,
      lng: pin.lng,
      coordinateSource: toApiSource(origin),
    };

    if (origin === 'gps' && accuracyMeters !== null && Number.isFinite(accuracyMeters)) {
      payload.coordinateAccuracyMeters = accuracyMeters;
    }
    if (origin === 'lookup' && lookupConfidence) {
      payload.coordinateConfidence = lookupConfidence;
    }
    return payload;
  }, [accuracyMeters, lookupConfidence, origin, pin]);

  /** Sugestão que abriu o mapa mas ainda espera confirmação. */
  const isSuggestionApproximate = useMemo(
    () => origin === null && lookupConfidence !== null && lookupConfidence !== 'ROOFTOP',
    [lookupConfidence, origin],
  );

  return {
    pin,
    mapCenter,
    isMapOpen,
    origin,
    gpsStatus: currentPosition.status,
    isCapturingGps: currentPosition.isBusy,
    lookupDisplayName,
    lookupConfidence,
    isSuggestionApproximate,
    openMap,
    captureFromGps,
    applySuggestion,
    getRevision,
    moveTo,
    hydrate,
    invalidate,
    clearSuggestion,
    toPayload,
  };
}
