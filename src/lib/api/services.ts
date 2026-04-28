import { apiClient } from './client';
import { unwrapItem, unwrapList } from './utils';
import type { ApiResponse, SpringPage } from '@/types/api';
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

export const servicesApi = {
  async getAll(params: GetServicesParamsDto = {}): Promise<ServiceSummary[]> {
    const response = await apiClient.get<SpringPage<ServiceDto> | ApiResponse<ServiceDto[]> | ServiceDto[]>(
      '/services',
      { params },
    );

    return unwrapList<ServiceDto>(response.data).map(mapService);
  },

  async getById(id: string): Promise<ServiceDetails> {
    const response = await apiClient.get<ApiResponse<ServiceDetailsDto> | ServiceDetailsDto>(
      `/services/${id}`,
    );

    return mapServiceDetails(unwrapItem(response.data));
  },

  async getByProfessional(professionalId: string): Promise<ServiceSummary[]> {
    const response = await apiClient.get<SpringPage<ServiceDto> | ApiResponse<ServiceDto[]> | ServiceDto[]>(
      `/api/v1/professionals/${professionalId}/services`,
      { params: { includeInactive: false, size: 100 } },
    );

    return unwrapList<ServiceDto>(response.data).map(mapService);
  },

  async getByProfessionalAndId(professionalId: string, serviceId: string): Promise<ServiceDetails> {
    const response = await apiClient.get<ApiResponse<ServiceDetailsDto> | ServiceDetailsDto>(
      `/api/v1/professionals/${professionalId}/services/${serviceId}`,
    );

    return mapServiceDetails(unwrapItem(response.data));
  },
};
