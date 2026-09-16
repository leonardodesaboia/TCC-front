/**
 * Origem da coordenada de um endereço. A API exige este campo sempre que lat/lng
 * são enviados: o modo Express notifica profissionais num raio de 300 metros em
 * volta do ponto, então de onde ele veio importa tanto quanto o valor.
 *
 * `legacy` nunca é enviado pelo app — é a marcação que a API dá a coordenadas
 * gravadas antes desta regra, ou invalidadas por edição do endereço sem novo pin.
 */
export type CoordinateSource = 'device_gps' | 'user_pin' | 'geocoded' | 'legacy';

/** Confiança devolvida pelo lookup. Só `ROOFTOP` é aceita pelo Express. */
export type GeocodeConfidence = 'ROOFTOP' | 'INTERPOLATED' | 'CITY' | 'NOT_FOUND';

export interface Address {
  id: string;
  userId: string;
  label: string;
  street: string;
  number: string;
  complement?: string;
  district: string;
  city: string;
  state: string;
  zipCode: string;
  lat: number | null;
  lng: number | null;
  coordinateSource: CoordinateSource | null;
  coordinateAccuracyMeters: number | null;
  coordinateConfidence: GeocodeConfidence | null;
  coordinateConfirmedAt: string | null;
  /** A API já responde se esta coordenada é aceita pelo Express — não recalcular aqui. */
  expressReady: boolean;
  isDefault: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AddressDto {
  id: string;
  userId: string;
  label: string;
  street: string;
  number: string;
  complement?: string | null;
  district: string;
  city: string;
  state: string;
  zipCode: string;
  lat?: number | string | null;
  lng?: number | string | null;
  coordinateSource?: CoordinateSource | null;
  coordinateAccuracyMeters?: number | string | null;
  coordinateConfidence?: GeocodeConfidence | null;
  coordinateConfirmedAt?: string | null;
  expressReady?: boolean | null;
  isDefault?: boolean | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface CreateAddressRequestDto {
  label: string;
  street: string;
  number: string;
  complement?: string;
  district: string;
  city: string;
  state: string;
  zipCode: string;
  lat?: number;
  lng?: number;
  /** Obrigatório sempre que lat/lng forem enviados. */
  coordinateSource?: Exclude<CoordinateSource, 'legacy'>;
  /** Só com `coordinateSource: 'device_gps'`. */
  coordinateAccuracyMeters?: number;
  /** Só com `coordinateSource: 'geocoded'`. */
  coordinateConfidence?: GeocodeConfidence;
  isDefault?: boolean;
}

export interface UpdateAddressRequestDto extends Partial<CreateAddressRequestDto> {}

export interface GeocodeAddressRequestDto {
  zipCode?: string;
  street?: string;
  number?: string;
  complement?: string;
  district?: string;
  city?: string;
  state?: string;
}

export interface NormalizedAddressDto {
  street?: string | null;
  number?: string | null;
  district?: string | null;
  city?: string | null;
  state?: string | null;
  zipCode?: string | null;
}

export interface GeocodeAddressResponseDto {
  lat: number | string;
  lng: number | string;
  displayName?: string | null;
  normalizedAddress?: NormalizedAddressDto | null;
  confidence?: string | null;
  provider?: string | null;
}

export interface ReverseGeocodeRequestDto {
  lat: number;
  lng: number;
}

export interface GeocodedAddress {
  lat: number;
  lng: number;
  displayName?: string;
  normalizedAddress?: {
    street?: string;
    number?: string;
    district?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
  confidence?: string;
  provider?: string;
}
