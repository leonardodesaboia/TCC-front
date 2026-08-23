import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAddressPin } from '../useAddressPin';

const requestForegroundPermissionsAsync = vi.fn();
const getCurrentPositionAsync = vi.fn();

vi.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: (...args: unknown[]) =>
    requestForegroundPermissionsAsync(...args),
  getCurrentPositionAsync: (...args: unknown[]) => getCurrentPositionAsync(...args),
  Accuracy: { High: 4, Balanced: 3 },
}));

const FORTALEZA_CENTER = { lat: -3.731862, lng: -38.526669 };

describe('useAddressPin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * A armadilha que esta versão fecha: antes, abrir o mapa já deixava o centro de
   * Fortaleza salvável, e o Express saía procurando profissional a quilômetros
   * do endereço real.
   */
  it('abrir o mapa não conta como escolher o ponto', () => {
    const { result } = renderHook(() => useAddressPin());

    act(() => result.current.openMap());

    expect(result.current.isMapOpen).toBe(true);
    expect(result.current.pin).toBeNull();
    expect(result.current.mapCenter).toEqual(FORTALEZA_CENTER);
    expect(result.current.toPayload()).toBeNull();
  });

  it('tocar no mapa marca o ponto como escolhido pelo usuário', () => {
    const { result } = renderHook(() => useAddressPin());

    act(() => result.current.moveTo({ lat: -3.74, lng: -38.5 }));

    expect(result.current.toPayload()).toEqual({
      lat: -3.74,
      lng: -38.5,
      coordinateSource: 'user_pin',
    });
  });

  it('captura por GPS envia origem e acurácia', async () => {
    requestForegroundPermissionsAsync.mockResolvedValue({ status: 'granted' });
    getCurrentPositionAsync.mockResolvedValue({
      coords: { latitude: -3.75, longitude: -38.51, accuracy: 8.25 },
      timestamp: Date.parse('2026-08-23T12:00:00Z'),
    });

    const { result } = renderHook(() => useAddressPin());

    await act(async () => {
      await result.current.captureFromGps();
    });

    expect(result.current.toPayload()).toEqual({
      lat: -3.75,
      lng: -38.51,
      coordinateSource: 'device_gps',
      coordinateAccuracyMeters: 8.25,
    });
  });

  it('permissão negada não escolhe ponto nenhum e não trava o fluxo', async () => {
    requestForegroundPermissionsAsync.mockResolvedValue({ status: 'denied' });

    const { result } = renderHook(() => useAddressPin());

    await act(async () => {
      await result.current.captureFromGps();
    });

    expect(result.current.gpsStatus).toBe('denied');
    expect(result.current.pin).toBeNull();
    expect(result.current.toPayload()).toBeNull();

    act(() => result.current.moveTo({ lat: -3.74, lng: -38.5 }));
    expect(result.current.toPayload()?.coordinateSource).toBe('user_pin');
  });

  it('sugestão com precisão de edifício já conta como ponto escolhido', () => {
    const { result } = renderHook(() => useAddressPin());

    act(() =>
      result.current.applySuggestion({
        lat: -3.734,
        lng: -38.494,
        displayName: 'Avenida Dom Luís, 1233',
        confidence: 'ROOFTOP',
      }),
    );

    expect(result.current.toPayload()).toEqual({
      lat: -3.734,
      lng: -38.494,
      coordinateSource: 'geocoded',
      coordinateConfidence: 'ROOFTOP',
    });
    expect(result.current.isSuggestionApproximate).toBe(false);
  });

  /**
   * O ponto certo é o do atendimento, e uma sugestão de rua não sabe qual é. Ela
   * abre o mapa no lugar certo — a pessoa só aproxima — mas não vira coordenada
   * salvável sozinha. É a mesma régua que a API usa para aceitar origem `geocoded`.
   */
  it('sugestão de rua abre o mapa mas não conta como escolha', () => {
    const { result } = renderHook(() => useAddressPin());

    act(() =>
      result.current.applySuggestion({
        lat: -3.71722,
        lng: -38.54306,
        displayName: 'Avenida Pasteur, Fortaleza',
        confidence: 'INTERPOLATED',
      }),
    );

    expect(result.current.isMapOpen).toBe(true);
    expect(result.current.pin).toEqual({ lat: -3.71722, lng: -38.54306 });
    expect(result.current.origin).toBeNull();
    expect(result.current.isSuggestionApproximate).toBe(true);
    expect(result.current.toPayload()).toBeNull();
  });

  it('sugestão de cidade também exige confirmação', () => {
    const { result } = renderHook(() => useAddressPin());

    act(() =>
      result.current.applySuggestion({
        lat: -3.71722,
        lng: -38.54306,
        displayName: 'Fortaleza, CE',
        confidence: 'CITY',
      }),
    );

    expect(result.current.isSuggestionApproximate).toBe(true);
    expect(result.current.toPayload()).toBeNull();
  });

  it('aproximar o pin depois da sugestão vira escolha manual', () => {
    const { result } = renderHook(() => useAddressPin());

    act(() =>
      result.current.applySuggestion({ lat: -3.71722, lng: -38.54306, confidence: 'CITY' }),
    );
    act(() => result.current.moveTo({ lat: -3.74, lng: -38.5 }));

    expect(result.current.toPayload()).toEqual({
      lat: -3.74,
      lng: -38.5,
      coordinateSource: 'user_pin',
    });
    expect(result.current.isSuggestionApproximate).toBe(false);
  });

  it('endereço legado abre no mapa mas exige reconfirmação para salvar', () => {
    const { result } = renderHook(() => useAddressPin());

    act(() => result.current.hydrate({ lat: -3.71722, lng: -38.54306 }, 'legacy'));

    expect(result.current.isMapOpen).toBe(true);
    expect(result.current.pin).toEqual({ lat: -3.71722, lng: -38.54306 });
    expect(result.current.toPayload()).toBeNull();
  });

  it('endereço com pin confirmado continua salvável sem reconfirmar', () => {
    const { result } = renderHook(() => useAddressPin());

    act(() => result.current.hydrate({ lat: -3.74, lng: -38.5 }, 'user_pin'));

    expect(result.current.toPayload()).toEqual({
      lat: -3.74,
      lng: -38.5,
      coordinateSource: 'user_pin',
    });
  });
});
