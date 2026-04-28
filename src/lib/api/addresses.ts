import { apiClient } from './client';
import { toNumber, unwrapItem, unwrapList } from './utils';
import type { Address, AddressDto, CreateAddressRequestDto, UpdateAddressRequestDto } from '@/types/address';
import type { ApiResponse } from '@/types/api';
import { getAuthenticatedUserId } from '@/lib/utils/auth-session';

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
    state: dto.state,
    zipCode: dto.zipCode,
    lat: toNumber(dto.lat),
    lng: toNumber(dto.lng),
    isDefault: dto.isDefault ?? false,
    createdAt: dto.createdAt ?? undefined,
    updatedAt: dto.updatedAt ?? undefined,
  };
}

export const addressesApi = {
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
      payload,
    );
    return mapAddress(unwrapItem(response.data));
  },

  async update(id: string, payload: UpdateAddressRequestDto): Promise<Address> {
    const userId = await getAuthenticatedUserId();
    const response = await apiClient.put<ApiResponse<AddressDto> | AddressDto>(
      `/api/users/${userId}/addresses/${id}`,
      payload,
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
