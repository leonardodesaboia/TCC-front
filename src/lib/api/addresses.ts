import { apiClient } from './client';
import type { Address, AddressDto, CreateAddressRequestDto, UpdateAddressRequestDto } from '@/types/address';
import type { ApiResponse } from '@/types/api';

function mapAddress(dto: AddressDto): Address {
  return {
    id: dto.id,
    street: dto.street,
    number: dto.number,
    complement: dto.complement ?? undefined,
    neighborhood: dto.neighborhood,
    city: dto.city,
    state: dto.state,
    zipCode: dto.zipCode,
    isDefault: dto.isDefault ?? false,
    reference: dto.reference ?? undefined,
  };
}

function unwrapItem<T>(payload: ApiResponse<T> | T): T {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return (payload as ApiResponse<T>).data;
  }

  return payload as T;
}

function unwrapList<T>(payload: ApiResponse<T[]> | T[]): T[] {
  if (Array.isArray(payload)) return payload;
  if ('data' in payload && Array.isArray(payload.data)) return payload.data;
  return [];
}

export const addressesApi = {
  async getAll(): Promise<Address[]> {
    const response = await apiClient.get<ApiResponse<AddressDto[]> | AddressDto[]>('/addresses');
    return unwrapList(response.data).map(mapAddress);
  },

  async create(payload: CreateAddressRequestDto): Promise<Address> {
    const response = await apiClient.post<ApiResponse<AddressDto> | AddressDto>('/addresses', payload);
    return mapAddress(unwrapItem(response.data));
  },

  async update(id: string, payload: UpdateAddressRequestDto): Promise<Address> {
    const response = await apiClient.put<ApiResponse<AddressDto> | AddressDto>(`/addresses/${id}`, payload);
    return mapAddress(unwrapItem(response.data));
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/addresses/${id}`);
  },
};
