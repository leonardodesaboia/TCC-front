import { apiClient } from './client';
import { unwrapItem, unwrapList } from './utils';
import type {
  AreaDto,
  AreaRef,
  GetProfessionalsByCategoryParamsDto,
  ProfessionDto,
  ProfessionRef,
  ProfessionalProfile,
  ProfessionalProfileDto,
  ProfessionalSummary,
  ProfessionalSummaryDto,
  SearchProfessionalsParamsDto,
} from '@/types/professional';
import type { ApiResponse, SpringPage } from '@/types/api';
import type { ServiceDetails, ServiceDetailsDto, ServiceSummary } from '@/types/service';

function toNumber(value: number | string | null | undefined): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return Number(value) || 0;
  return 0;
}

function mapProfession(dto: ProfessionDto): ProfessionRef {
  return {
    id: dto.id,
    name: dto.name,
  };
}

function mapArea(dto: AreaDto): AreaRef {
  return {
    id: dto.id,
    name: dto.name,
  };
}

function mapServiceSummary(dto: ServiceDetailsDto): ServiceSummary {
  const price = toNumber(dto.price);
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

function mapProfessionalSummary(dto: ProfessionalSummaryDto): ProfessionalSummary {
  const professions = (dto.professions ?? []).map(mapProfession);

  return {
    id: dto.id,
    name: dto.name,
    avatarUrl: dto.avatarUrl ?? undefined,
    profession: dto.profession ?? professions[0]?.name ?? 'Profissional',
    professions,
    areas: (dto.areas ?? []).map(mapArea),
    specialties: dto.specialties ?? [],
    neighborhood: dto.neighborhood ?? undefined,
    city: dto.city ?? undefined,
    rating: toNumber(dto.rating),
    reviewCount: toNumber(dto.reviewCount),
    availabilityLabel: dto.availabilityLabel ?? undefined,
    badgeLabel: dto.badgeLabel ?? undefined,
  };
}

function mapProfessionalProfile(dto: ProfessionalProfileDto): ProfessionalProfile {
  const summary = mapProfessionalSummary(dto);

  return {
    ...summary,
    bio: dto.bio ?? undefined,
    services: (dto.services ?? []).map(mapServiceSummary),
    yearsOfExperience: dto.yearsOfExperience ?? undefined,
  };
}

export const professionalsApi = {
  mapProfessionalProfile,

  async search(params: SearchProfessionalsParamsDto = {}): Promise<ProfessionalSummary[]> {
    const response = await apiClient.get<SpringPage<ProfessionalSummaryDto> | ApiResponse<ProfessionalSummaryDto[]> | ProfessionalSummaryDto[]>(
      '/professionals',
      { params },
    );

    return unwrapList<ProfessionalSummaryDto>(response.data).map(mapProfessionalSummary);
  },

  async getById(id: string): Promise<ProfessionalProfile> {
    const response = await apiClient.get<ApiResponse<ProfessionalProfileDto> | ProfessionalProfileDto>(
      `/professionals/${id}`,
    );

    return mapProfessionalProfile(unwrapItem(response.data));
  },

  async getByProfession(
    professionId: string,
    params: GetProfessionalsByCategoryParamsDto = {},
  ): Promise<ProfessionalSummary[]> {
    const response = await apiClient.get<SpringPage<ProfessionalSummaryDto> | ApiResponse<ProfessionalSummaryDto[]> | ProfessionalSummaryDto[]>(
      `/professions/${professionId}`,
      { params },
    );

    return unwrapList<ProfessionalSummaryDto>(response.data).map(mapProfessionalSummary);
  },

  async getByArea(
    areaId: string,
    params: GetProfessionalsByCategoryParamsDto = {},
  ): Promise<ProfessionalSummary[]> {
    const response = await apiClient.get<SpringPage<ProfessionalSummaryDto> | ApiResponse<ProfessionalSummaryDto[]> | ProfessionalSummaryDto[]>(
      `/areas/${areaId}`,
      { params },
    );

    return unwrapList<ProfessionalSummaryDto>(response.data).map(mapProfessionalSummary);
  },
};
