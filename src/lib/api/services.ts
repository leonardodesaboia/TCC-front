import { apiClient } from './client';
import { unwrapItem, unwrapList } from './utils';
import type { ApiResponse, SpringPage } from '@/types/api';
import type { ProfessionalOfferingDto } from '@/types/professional-management';
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
  const price = dto.price != null ? toNumber(dto.price) : 0;
  const effectivePrice = dto.effectivePrice != null ? toNumber(dto.effectivePrice) : price;
  return {
    id: dto.id,
    name: dto.name,
    description: dto.description ?? '',
    price,
    effectivePrice,
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

function mapProfessionalOffering(dto: ProfessionalOfferingDto): ServiceSummary {
  const price = dto.price != null ? toNumber(dto.price) : 0;
  const effectivePrice = dto.effectivePrice != null ? toNumber(dto.effectivePrice) : price;

  return {
    id: dto.id,
    name: dto.title,
    description: dto.description ?? '',
    price,
    effectivePrice,
    durationInMinutes: dto.estimatedDurationMinutes != null ? toNumber(dto.estimatedDurationMinutes) : undefined,
    professionId: dto.categoryId,
  };
}

function mapProfessionalOfferingDetails(dto: ProfessionalOfferingDto): ServiceDetails {
  return {
    ...mapProfessionalOffering(dto),
    requirements: undefined,
    includedItems: undefined,
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
    const response = await apiClient.get<
      SpringPage<ProfessionalOfferingDto> | ApiResponse<ProfessionalOfferingDto[]> | ProfessionalOfferingDto[]
    >(
      `/api/v1/professionals/${professionalId}/services`,
      { params: { includeInactive: false, size: 100 } },
    );

    return unwrapList<ProfessionalOfferingDto>(response.data).map(mapProfessionalOffering);
  },

  async getByProfessionalAndId(professionalId: string, serviceId: string): Promise<ServiceDetails> {
    const response = await apiClient.get<ApiResponse<ProfessionalOfferingDto> | ProfessionalOfferingDto>(
      `/api/v1/professionals/${professionalId}/services/${serviceId}`,
    );

    return mapProfessionalOfferingDetails(unwrapItem(response.data));
  },
};
