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
