import { apiClient } from './client';
import { professionalManagementApi } from './professional-management';
import { toNumber, unwrapItem, unwrapList } from './utils';
import { usersApi } from './users';
import type {
  GetProfessionalsByCategoryParamsDto,
  ProfessionalProfile,
  ProfessionalSummary,
  SearchProfessionalsParamsDto,
} from '@/types/professional';
import type { ApiResponse, SpringPage } from '@/types/api';
import type {
  ProfessionalProfileRecord,
  ProfessionalProfileRecordDto,
  SubscriptionPlan,
} from '@/types/professional-management';
import type { User } from '@/types/user';

function mapProfessionalProfileRecord(dto: ProfessionalProfileRecordDto): ProfessionalProfileRecord {
  return {
    id: dto.id,
    userId: dto.userId,
    bio: dto.bio ?? undefined,
    yearsOfExperience: dto.yearsOfExperience ?? undefined,
    baseHourlyRate: dto.baseHourlyRate != null ? toNumber(dto.baseHourlyRate) : undefined,
    specialties: (dto.specialties ?? []).map((specialty) => ({
      categoryId: specialty.categoryId,
      categoryName: specialty.categoryName ?? undefined,
      areaId: specialty.areaId ?? undefined,
      areaName: specialty.areaName ?? undefined,
      yearsOfExperience: toNumber(specialty.yearsOfExperience),
      hourlyRate: specialty.hourlyRate != null ? toNumber(specialty.hourlyRate) : undefined,
    })),
    verificationStatus: dto.verificationStatus,
    rejectionReason: dto.rejectionReason ?? undefined,
    geoActive: dto.geoActive,
    subscriptionPlanId: dto.subscriptionPlanId ?? undefined,
    subscriptionExpiresAt: dto.subscriptionExpiresAt ?? undefined,
    averageRating: toNumber(dto.averageRating),
    reviewCount: toNumber(dto.reviewCount),
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  };
}

function normalize(value?: string) {
  return value?.trim().toLowerCase() ?? '';
}

function uniqueById<T extends { id: string; name: string }>(items: T[]): T[] {
  return items.filter((item, index, array) => array.findIndex((candidate) => candidate.id === item.id) === index);
}

function uniqueStrings(values: string[]): string[] {
  return values.filter((value, index, array) => array.indexOf(value) === index);
}

function getProfessions(record: ProfessionalProfileRecord) {
  return uniqueById(
    record.specialties
      .filter((specialty): specialty is typeof specialty & { categoryName: string } => !!specialty.categoryName)
      .map((specialty) => ({
        id: specialty.categoryId,
        name: specialty.categoryName,
      })),
  );
}

function getAreas(record: ProfessionalProfileRecord) {
  return uniqueById(
    record.specialties
      .filter(
        (specialty): specialty is typeof specialty & { areaId: string; areaName: string } =>
          !!specialty.areaId && !!specialty.areaName,
      )
      .map((specialty) => ({
        id: specialty.areaId,
        name: specialty.areaName,
      })),
  );
}

function getSpecialties(record: ProfessionalProfileRecord) {
  return uniqueStrings(
    record.specialties
      .map((specialty) => specialty.categoryName)
      .filter((value): value is string => !!value),
  );
}

function mapProfessionalSummary(
  record: ProfessionalProfileRecord,
  user?: User,
  badgeLabel?: string,
): ProfessionalSummary {
  const professions = getProfessions(record);
  const areas = getAreas(record);

  return {
    id: record.id,
    name: user?.name ?? 'Profissional',
    avatarUrl: user?.profileImage ?? undefined,
    profession: professions[0]?.name ?? 'Profissional',
    professions,
    areas,
    specialties: getSpecialties(record),
    neighborhood: undefined,
    city: undefined,
    rating: user?.averageRating ?? record.averageRating ?? 0,
    reviewCount: user?.reviewCount ?? record.reviewCount ?? 0,
    availabilityLabel: record.geoActive ? 'Disponivel agora' : undefined,
    badgeLabel,
  };
}

function mapProfessionalProfile(
  record: ProfessionalProfileRecord,
  user?: User,
  badgeLabel?: string,
): ProfessionalProfile {
  return {
    ...mapProfessionalSummary(record, user, badgeLabel),
    bio: record.bio ?? undefined,
    services: [],
    yearsOfExperience: record.yearsOfExperience ?? undefined,
  };
}

async function fetchApprovedProfessionalRecords(limit?: number, page?: number): Promise<ProfessionalProfileRecord[]> {
  const response = await apiClient.get<
    SpringPage<ProfessionalProfileRecordDto> | ApiResponse<ProfessionalProfileRecordDto[]> | ProfessionalProfileRecordDto[]
  >('/api/v1/professionals', {
    params: {
      status: 'approved',
      page: page ?? 0,
      size: Math.max(limit ?? 50, 100),
    },
  });

  return unwrapList<ProfessionalProfileRecordDto>(response.data).map(mapProfessionalProfileRecord);
}

async function buildUsersById(records: ProfessionalProfileRecord[]): Promise<Map<string, User>> {
  const uniqueUserIds = uniqueStrings(records.map((record) => record.userId));
  const results = await Promise.allSettled(uniqueUserIds.map((userId) => usersApi.getById(userId)));

  return results.reduce((acc, result, index) => {
    if (result.status === 'fulfilled') {
      acc.set(uniqueUserIds[index], result.value);
    }
    return acc;
  }, new Map<string, User>());
}

async function buildBadgeLabelsByPlanId(records: ProfessionalProfileRecord[]): Promise<Map<string, string>> {
  const planIds = uniqueStrings(
    records
      .map((record) => record.subscriptionPlanId)
      .filter((planId): planId is string => !!planId),
  );

  if (planIds.length === 0) {
    return new Map();
  }

  try {
    const plans = await professionalManagementApi.getSubscriptionPlans();
    return plans.reduce((acc, plan: SubscriptionPlan) => {
      if (plan.badgeLabel && planIds.includes(plan.id)) {
        acc.set(plan.id, plan.badgeLabel);
      }
      return acc;
    }, new Map<string, string>());
  } catch {
    return new Map();
  }
}

async function enrichProfessionalSummaries(records: ProfessionalProfileRecord[]): Promise<ProfessionalSummary[]> {
  const [usersById, badgeLabelsByPlanId] = await Promise.all([
    buildUsersById(records),
    buildBadgeLabelsByPlanId(records),
  ]);

  return records.map((record) =>
    mapProfessionalSummary(
      record,
      usersById.get(record.userId),
      record.subscriptionPlanId ? badgeLabelsByPlanId.get(record.subscriptionPlanId) : undefined,
    ),
  );
}

function filterProfessionals(
  professionals: ProfessionalSummary[],
  params: SearchProfessionalsParamsDto = {},
): ProfessionalSummary[] {
  const normalizedQuery = normalize(params.query);
  const normalizedProfessionId = normalize(params.professionId);
  const normalizedAreaId = normalize(params.areaId);

  return professionals.filter((professional) => {
    if (normalizedProfessionId) {
      const matchesProfession = professional.professions.some(
        (profession) => normalize(profession.id) === normalizedProfessionId,
      );
      if (!matchesProfession) return false;
    }

    if (normalizedAreaId) {
      const matchesArea = professional.areas.some((area) => normalize(area.id) === normalizedAreaId);
      if (!matchesArea) return false;
    }

    if (!normalizedQuery) return true;

    const searchableFields = [
      professional.name,
      professional.profession,
      professional.neighborhood,
      professional.city,
      ...professional.specialties,
      ...professional.professions.map((profession) => profession.name),
      ...professional.areas.map((area) => area.name),
    ];

    return searchableFields.some((field) => normalize(field).includes(normalizedQuery));
  });
}

export const professionalsApi = {
  async search(params: SearchProfessionalsParamsDto = {}): Promise<ProfessionalSummary[]> {
    const records = await fetchApprovedProfessionalRecords(params.limit, params.page);
    const professionals = await enrichProfessionalSummaries(records);
    return filterProfessionals(professionals, params);
  },

  async getById(id: string): Promise<ProfessionalProfile> {
    const response = await apiClient.get<ApiResponse<ProfessionalProfileRecordDto> | ProfessionalProfileRecordDto>(
      `/api/v1/professionals/${id}`,
    );
    const record = mapProfessionalProfileRecord(unwrapItem(response.data));

    const [userResult, badgeLabelsByPlanId] = await Promise.all([
      usersApi.getById(record.userId).catch(() => undefined),
      buildBadgeLabelsByPlanId([record]),
    ]);

    return mapProfessionalProfile(
      record,
      userResult,
      record.subscriptionPlanId ? badgeLabelsByPlanId.get(record.subscriptionPlanId) : undefined,
    );
  },

  async getByProfession(
    professionId: string,
    params: GetProfessionalsByCategoryParamsDto = {},
  ): Promise<ProfessionalSummary[]> {
    return this.search({
      professionId,
      page: params.page,
      limit: params.limit,
    });
  },

  async getByArea(
    areaId: string,
    params: GetProfessionalsByCategoryParamsDto = {},
  ): Promise<ProfessionalSummary[]> {
    return this.search({
      areaId,
      page: params.page,
      limit: params.limit,
    });
  },
};
