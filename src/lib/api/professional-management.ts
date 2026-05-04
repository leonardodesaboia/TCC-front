import { apiClient } from './client';
import { toNumber, unwrapItem, unwrapList } from './utils';
import type { ApiResponse, SpringPage } from '@/types/api';
import type {
  AssignSubscriptionPlanRequest,
  BlockedPeriod,
  BlockedPeriodDto,
  CreateBlockedPeriodRequest,
  CreateProfessionalOfferingRequest,
  CreateProfessionalRequest,
  ProfessionalDocument,
  ProfessionalDocumentDto,
  ProfessionalOffering,
  ProfessionalOfferingDto,
  ProfessionalProfileRecord,
  ProfessionalProfileRecordDto,
  ProfessionalSpecialty,
  ProfessionalSpecialtyDto,
  ProfessionalSubscription,
  ProfessionalSubscriptionDto,
  SubscriptionPlan,
  SubscriptionPlanDto,
  UpdateGeoRequest,
  UpdateProfessionalOfferingRequest,
  UpdateProfessionalRequest,
  UploadProfessionalDocumentRequest,
  VerifyProfessionalRequest,
} from '@/types/professional-management';
import type { ProfessionalProfile } from '@/types/professional';

function mapDocument(dto: ProfessionalDocumentDto): ProfessionalDocument {
  return {
    id: dto.id,
    professionalId: dto.professionalId,
    docType: dto.docType,
    docSide: dto.docSide,
    file: dto.file,
    createdAt: dto.createdAt ?? undefined,
  };
}

function mapProfessionalSpecialty(dto: ProfessionalSpecialtyDto): ProfessionalSpecialty {
  return {
    categoryId: dto.categoryId,
    categoryName: dto.categoryName ?? undefined,
    areaId: dto.areaId ?? undefined,
    areaName: dto.areaName ?? undefined,
    yearsOfExperience: toNumber(dto.yearsOfExperience),
    hourlyRate: dto.hourlyRate != null ? toNumber(dto.hourlyRate) : undefined,
  };
}

function mapProfessionalProfileRecord(dto: ProfessionalProfileRecordDto): ProfessionalProfileRecord {
  return {
    id: dto.id,
    userId: dto.userId,
    bio: dto.bio ?? undefined,
    yearsOfExperience: dto.yearsOfExperience ?? undefined,
    baseHourlyRate: dto.baseHourlyRate != null ? toNumber(dto.baseHourlyRate) : undefined,
    specialties: (dto.specialties ?? []).map(mapProfessionalSpecialty),
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

function mapOffering(dto: ProfessionalOfferingDto): ProfessionalOffering {
  const price = dto.price != null ? toNumber(dto.price) : null;
  const effectivePrice = dto.effectivePrice != null ? toNumber(dto.effectivePrice) : (price ?? 0);
  return {
    id: dto.id,
    professionalId: dto.professionalId,
    categoryId: dto.categoryId,
    title: dto.title,
    description: dto.description,
    pricingType: dto.pricingType,
    price,
    effectivePrice,
    estimatedDurationMinutes: toNumber(dto.estimatedDurationMinutes),
    active: dto.active,
    averageRating: toNumber(dto.averageRating),
    reviewCount: toNumber(dto.reviewCount),
    createdAt: dto.createdAt,
  };
}

function mapSubscriptionPlan(dto: SubscriptionPlanDto): SubscriptionPlan {
  return {
    id: dto.id,
    name: dto.name,
    priceMonthly: toNumber(dto.priceMonthly),
    highlightInSearch: dto.highlightInSearch,
    expressPriority: dto.expressPriority,
    badgeLabel: dto.badgeLabel ?? undefined,
    active: dto.active,
    createdAt: dto.createdAt,
  };
}

function mapProfessionalSubscription(dto: ProfessionalSubscriptionDto): ProfessionalSubscription {
  return {
    professionalId: dto.professionalId,
    subscriptionPlanId: dto.subscriptionPlanId ?? undefined,
    planName: dto.planName ?? undefined,
    priceMonthly: dto.priceMonthly != null ? toNumber(dto.priceMonthly) : undefined,
    highlightInSearch: dto.highlightInSearch ?? undefined,
    expressPriority: dto.expressPriority ?? undefined,
    badgeLabel: dto.badgeLabel ?? undefined,
    subscriptionExpiresAt: dto.subscriptionExpiresAt ?? undefined,
    autoRenew: dto.autoRenew ?? undefined,
    subscriptionCancelledAt: dto.subscriptionCancelledAt ?? undefined,
  };
}

function mapBlockedPeriod(dto: BlockedPeriodDto): BlockedPeriod {
  return {
    id: dto.id,
    professionalId: dto.professionalId,
    blockType: dto.blockType,
    startAt: dto.startAt ?? undefined,
    endAt: dto.endAt ?? undefined,
    weekday: dto.weekday ?? undefined,
    createdAt: dto.createdAt ?? undefined,
  };
}

export const professionalManagementApi = {
  async createProfile(payload: CreateProfessionalRequest): Promise<ProfessionalProfileRecord> {
    const response = await apiClient.post<ApiResponse<ProfessionalProfileRecordDto> | ProfessionalProfileRecordDto>(
      '/api/v1/professionals',
      payload,
    );
    return mapProfessionalProfileRecord(unwrapItem(response.data));
  },

  async updateProfile(professionalId: string, payload: UpdateProfessionalRequest): Promise<ProfessionalProfileRecord> {
    const response = await apiClient.put<ApiResponse<ProfessionalProfileRecordDto> | ProfessionalProfileRecordDto>(
      `/api/v1/professionals/${professionalId}`,
      payload,
    );
    return mapProfessionalProfileRecord(unwrapItem(response.data));
  },

  async updateGeo(professionalId: string, payload: UpdateGeoRequest): Promise<ProfessionalProfileRecord> {
    const response = await apiClient.patch<ApiResponse<ProfessionalProfileRecordDto> | ProfessionalProfileRecordDto>(
      `/api/v1/professionals/${professionalId}/geo`,
      payload,
    );
    return mapProfessionalProfileRecord(unwrapItem(response.data));
  },

  async verify(professionalId: string, payload: VerifyProfessionalRequest): Promise<ProfessionalProfileRecord> {
    const response = await apiClient.patch<ApiResponse<ProfessionalProfileRecordDto> | ProfessionalProfileRecordDto>(
      `/api/v1/professionals/${professionalId}/verify`,
      payload,
    );
    return mapProfessionalProfileRecord(unwrapItem(response.data));
  },

  async getDocuments(professionalId: string): Promise<ProfessionalDocument[]> {
    const response = await apiClient.get<ApiResponse<ProfessionalDocumentDto[]> | ProfessionalDocumentDto[]>(
      `/api/v1/professionals/${professionalId}/documents`,
    );
    return unwrapList<ProfessionalDocumentDto>(response.data).map(mapDocument);
  },

  async uploadDocument(
    professionalId: string,
    payload: UploadProfessionalDocumentRequest,
  ): Promise<ProfessionalDocument> {
    const response = await apiClient.post<ApiResponse<ProfessionalDocumentDto> | ProfessionalDocumentDto>(
      `/api/v1/professionals/${professionalId}/documents`,
      payload.formData,
      {
        params: { docType: payload.docType, docSide: payload.docSide },
      },
    );
    return mapDocument(unwrapItem(response.data));
  },

  async deleteDocument(professionalId: string, documentId: string): Promise<void> {
    await apiClient.delete(`/api/v1/professionals/${professionalId}/documents/${documentId}`);
  },

  async getOfferings(professionalId: string): Promise<ProfessionalOffering[]> {
    const response = await apiClient.get<SpringPage<ProfessionalOfferingDto> | ApiResponse<ProfessionalOfferingDto[]> | ProfessionalOfferingDto[]>(
      `/api/v1/professionals/${professionalId}/services`,
      { params: { size: 100, includeInactive: false } },
    );
    return unwrapList<ProfessionalOfferingDto>(response.data).map(mapOffering);
  },

  async createOffering(professionalId: string, payload: CreateProfessionalOfferingRequest): Promise<ProfessionalOffering> {
    const response = await apiClient.post<ApiResponse<ProfessionalOfferingDto> | ProfessionalOfferingDto>(
      `/api/v1/professionals/${professionalId}/services`,
      payload,
    );
    return mapOffering(unwrapItem(response.data));
  },

  async updateOffering(professionalId: string, offeringId: string, payload: UpdateProfessionalOfferingRequest): Promise<ProfessionalOffering> {
    const response = await apiClient.put<ApiResponse<ProfessionalOfferingDto> | ProfessionalOfferingDto>(
      `/api/v1/professionals/${professionalId}/services/${offeringId}`,
      payload,
    );
    return mapOffering(unwrapItem(response.data));
  },

  async deleteOffering(professionalId: string, offeringId: string): Promise<void> {
    await apiClient.delete(`/api/v1/professionals/${professionalId}/services/${offeringId}`);
  },

  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    const response = await apiClient.get<SpringPage<SubscriptionPlanDto> | ApiResponse<SubscriptionPlanDto[]> | SubscriptionPlanDto[]>(
      '/api/v1/subscription-plans',
      { params: { size: 50, includeInactive: false } },
    );
    return unwrapList<SubscriptionPlanDto>(response.data).map(mapSubscriptionPlan);
  },

  async getProfessionalSubscription(professionalId: string): Promise<ProfessionalSubscription> {
    const response = await apiClient.get<ApiResponse<ProfessionalSubscriptionDto> | ProfessionalSubscriptionDto>(
      `/api/v1/professionals/${professionalId}/subscription`,
    );
    return mapProfessionalSubscription(unwrapItem(response.data));
  },

  async assignProfessionalSubscription(professionalId: string, payload: AssignSubscriptionPlanRequest): Promise<ProfessionalSubscription> {
    const response = await apiClient.put<ApiResponse<ProfessionalSubscriptionDto> | ProfessionalSubscriptionDto>(
      `/api/v1/professionals/${professionalId}/subscription`,
      payload,
    );
    return mapProfessionalSubscription(unwrapItem(response.data));
  },

  async cancelProfessionalSubscription(professionalId: string): Promise<ProfessionalSubscription> {
    const response = await apiClient.post<ApiResponse<ProfessionalSubscriptionDto> | ProfessionalSubscriptionDto>(
      `/api/v1/professionals/${professionalId}/subscription/cancel`,
    );
    return mapProfessionalSubscription(unwrapItem(response.data));
  },

  async getCalendarBlocks(professionalId: string): Promise<BlockedPeriod[]> {
    const response = await apiClient.get<ApiResponse<BlockedPeriodDto[]> | BlockedPeriodDto[]>(
      `/api/v1/professionals/${professionalId}/calendar/blocks`,
    );
    return unwrapList<BlockedPeriodDto>(response.data).map(mapBlockedPeriod);
  },

  async createCalendarBlock(professionalId: string, payload: CreateBlockedPeriodRequest): Promise<BlockedPeriod> {
    const response = await apiClient.post<ApiResponse<BlockedPeriodDto> | BlockedPeriodDto>(
      `/api/v1/professionals/${professionalId}/calendar/blocks`,
      payload,
    );
    return mapBlockedPeriod(unwrapItem(response.data));
  },

  async deleteCalendarBlock(professionalId: string, blockId: string): Promise<void> {
    await apiClient.delete(`/api/v1/professionals/${professionalId}/calendar/blocks/${blockId}`);
  },
};
