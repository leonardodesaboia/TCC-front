import { useCallback, useRef, useState } from 'react';
import * as Location from 'expo-location';

export type CurrentPositionStatus =
  | 'idle'
  | 'requesting-permission'
  | 'capturing'
  | 'granted'
  | 'denied'
  | 'error';

export interface CapturedPosition {
  lat: number;
  lng: number;
  accuracyMeters: number | null;
  capturedAt: string;
}

interface UseCurrentPositionResult {
  status: CurrentPositionStatus;
  position: CapturedPosition | null;
  isBusy: boolean;
  /** Devolve a posição capturada, ou `null` quando a permissão foi negada ou a captura falhou. */
  capture: () => Promise<CapturedPosition | null>;
  reset: () => void;
}

/**
 * Captura única da posição do aparelho, para o cadastro de endereço.
 *
 * <p>A lógica de permissão já existia no `ExpressAvailabilityProvider`, mas lá ela
 * roda em watch contínuo, com regras de flush e de recência que não fazem sentido
 * aqui. Este hook faz só a captura pontual — e usa `Accuracy.High`, porque uma
 * leitura única pode gastar precisão que o rastreamento contínuo não pode.
 *
 * <p>Permissão negada não é erro de fluxo: quem recusa continua cadastrando pelo
 * mapa, do jeito antigo. Por isso o hook devolve `null` em vez de lançar.
 */
export function useCurrentPosition(): UseCurrentPositionResult {
  const [status, setStatus] = useState<CurrentPositionStatus>('idle');
  const [position, setPosition] = useState<CapturedPosition | null>(null);
  const inFlightRef = useRef(false);

  const capture = useCallback(async (): Promise<CapturedPosition | null> => {
    if (inFlightRef.current) return null;
    inFlightRef.current = true;

    try {
      setStatus('requesting-permission');
      const { status: permission } = await Location.requestForegroundPermissionsAsync();

      if (permission !== 'granted') {
        setStatus('denied');
        return null;
      }

      setStatus('capturing');
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const captured: CapturedPosition = {
        lat: location.coords.latitude,
        lng: location.coords.longitude,
        accuracyMeters: location.coords.accuracy ?? null,
        capturedAt: new Date(location.timestamp ?? Date.now()).toISOString(),
      };

      setPosition(captured);
      setStatus('granted');
      return captured;
    } catch (error) {
      console.warn('[current-position] falha ao capturar posição', error);
      setStatus('error');
      return null;
    } finally {
      inFlightRef.current = false;
    }
  }, []);

  const reset = useCallback(() => {
    setStatus('idle');
    setPosition(null);
  }, []);

  return {
    status,
    position,
    isBusy: status === 'requesting-permission' || status === 'capturing',
    capture,
    reset,
  };
}
