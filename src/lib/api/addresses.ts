import { apiClient } from './client';
import { toNumber, unwrapItem, unwrapList } from './utils';
import type {
  Address,
  AddressDto,
  CreateAddressRequestDto,
  GeocodeAddressRequestDto,
  GeocodeAddressResponseDto,
  GeocodedAddress,
  UpdateAddressRequestDto,
} from '@/types/address';
import type { ApiResponse } from '@/types/api';
import { getAuthenticatedUserId } from '@/lib/utils/auth-session';
import { normalizeStateCode, normalizeZipCode } from '@/lib/utils/address-format';

function toNullableNumber(value: number | string | null | undefined): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function mapAddress(dto: AddressDto): Address {
  return {
    id: dto.id,
    userId: dto.userId,
    label: dto.label,
    street: dto.street,
    number: dto.number,
    complement: dto.complement ?? undefined,
    district: dto.district,
    city: dto.city,
    state: normalizeStateCode(dto.state),
    zipCode: normalizeZipCode(dto.zipCode),
    lat: toNullableNumber(dto.lat),
    lng: toNullableNumber(dto.lng),
    isDefault: dto.isDefault ?? false,
    createdAt: dto.createdAt ?? undefined,
    updatedAt: dto.updatedAt ?? undefined,
  };
}

function mapGeocodedAddress(dto: GeocodeAddressResponseDto): GeocodedAddress {
  const normalizedAddress = dto.normalizedAddress
    ? {
        street: dto.normalizedAddress.street ?? undefined,
        number: dto.normalizedAddress.number ?? undefined,
        district: dto.normalizedAddress.district ?? undefined,
        city: dto.normalizedAddress.city ?? undefined,
        state: dto.normalizedAddress.state
          ? normalizeStateCode(dto.normalizedAddress.state)
          : undefined,
        zipCode: dto.normalizedAddress.zipCode
          ? normalizeZipCode(dto.normalizedAddress.zipCode)
          : undefined,
      }
    : undefined;

  return {
    lat: toNumber(dto.lat),
    lng: toNumber(dto.lng),
    displayName: dto.displayName ?? undefined,
    normalizedAddress,
    confidence: dto.confidence ?? undefined,
    provider: dto.provider ?? undefined,
  };
}

function normalizeAddressPayload<
  T extends CreateAddressRequestDto | UpdateAddressRequestDto | GeocodeAddressRequestDto,
>(payload: T): T {
  return {
    ...payload,
    ...(payload.state ? { state: normalizeStateCode(payload.state) } : {}),
    ...(payload.zipCode ? { zipCode: normalizeZipCode(payload.zipCode) } : {}),
  };
}

export const addressesApi = {
  async lookup(payload: GeocodeAddressRequestDto): Promise<GeocodedAddress> {
    const response = await apiClient.post<GeocodeAddressResponseDto>(
      '/api/v1/geocoding/lookup',
      normalizeAddressPayload(payload),
    );
    return mapGeocodedAddress(response.data);
  },

  async getAll(): Promise<Address[]> {
    const userId = await getAuthenticatedUserId();
    const response = await apiClient.get<ApiResponse<AddressDto[]> | AddressDto[]>(
      `/api/users/${userId}/addresses`,
    );
    return unwrapList(response.data).map(mapAddress);
  },

  async create(payload: CreateAddressRequestDto): Promise<Address> {
    const userId = await getAuthenticatedUserId();
    const response = await apiClient.post<ApiResponse<AddressDto> | AddressDto>(
      `/api/users/${userId}/addresses`,
      normalizeAddressPayload(payload),
    );
    return mapAddress(unwrapItem(response.data));
  },

  async update(id: string, payload: UpdateAddressRequestDto): Promise<Address> {
    const userId = await getAuthenticatedUserId();
    const response = await apiClient.put<ApiResponse<AddressDto> | AddressDto>(
      `/api/users/${userId}/addresses/${id}`,
      normalizeAddressPayload(payload),
    );
    return mapAddress(unwrapItem(response.data));
  },

  async remove(id: string): Promise<void> {
    const userId = await getAuthenticatedUserId();
    await apiClient.delete(`/api/users/${userId}/addresses/${id}`);
  },

  async setDefault(id: string): Promise<Address> {
    const userId = await getAuthenticatedUserId();
    const response = await apiClient.patch<ApiResponse<AddressDto> | AddressDto>(
      `/api/users/${userId}/addresses/${id}/set-default`,
    );
    return mapAddress(unwrapItem(response.data));
  },
};
