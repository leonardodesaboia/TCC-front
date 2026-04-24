import { apiClient } from './client';
import type { ApiResponse, PaginatedResponse } from '@/types/api';
import type {
  GetServicesParamsDto,
  ServiceDetails,
  ServiceDetailsDto,
  ServiceSummary,
  ServiceDto,
} from '@/types/service';

function toNumber(value: number | string): number {
  return typeof value === 'number' ? value : Number(value) || 0;
}

function mapService(dto: ServiceDto): ServiceSummary {
  return {
    id: dto.id,
    name: dto.name,
    description: dto.description ?? '',
    price: toNumber(dto.price),
    durationInMinutes: dto.durationInMinutes ?? undefined,
    professionId: dto.professionId ?? undefined,
  };
}

function mapServiceDetails(dto: ServiceDetailsDto): ServiceDetails {
  return {
    ...mapService(dto),
    requirements: dto.requirements ?? undefined,
    includedItems: dto.includedItems ?? undefined,
  };
}

function unwrapList<T>(payload: PaginatedResponse<T> | ApiResponse<T[]> | T[]): T[] {
  if (Array.isArray(payload)) return payload;
  if ('data' in payload && Array.isArray(payload.data)) return payload.data;
  return [];
}

function unwrapItem<T>(payload: ApiResponse<T> | T): T {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return (payload as ApiResponse<T>).data;
  }

  return payload as T;
}

export const servicesApi = {
  async getAll(params: GetServicesParamsDto = {}): Promise<ServiceSummary[]> {
    const response = await apiClient.get<PaginatedResponse<ServiceDto> | ApiResponse<ServiceDto[]> | ServiceDto[]>(
      '/services',
      { params },
    );

    return unwrapList(response.data).map(mapService);
  },

  async getById(id: string): Promise<ServiceDetails> {
    const response = await apiClient.get<ApiResponse<ServiceDetailsDto> | ServiceDetailsDto>(
      `/services/${id}`,
    );

    return mapServiceDetails(unwrapItem(response.data));
  },
};
