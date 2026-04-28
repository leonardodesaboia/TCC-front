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
  ProfessionalSubscription,
  ProfessionalSubscriptionDto,
  SubscriptionPlan,
  SubscriptionPlanDto,
  UpdateGeoRequest,
  UpdateProfessionalOfferingRequest,
  UpdateProfessionalRequest,
  VerifyProfessionalRequest,
} from '@/types/professional-management';
import type { ProfessionalProfile, ProfessionalProfileDto } from '@/types/professional';
import { professionalsApi } from './professionals';

function mapDocument(dto: ProfessionalDocumentDto): ProfessionalDocument {
  return {
    id: dto.id,
    professionalId: dto.professionalId,
    docType: dto.docType,
    file: dto.file,
    createdAt: dto.createdAt ?? undefined,
  };
}

function mapOffering(dto: ProfessionalOfferingDto): ProfessionalOffering {
  return {
    id: dto.id,
    professionalId: dto.professionalId,
    categoryId: dto.categoryId,
    title: dto.title,
    description: dto.description,
    pricingType: dto.pricingType,
    price: toNumber(dto.price),
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
  async createProfile(payload: CreateProfessionalRequest): Promise<ProfessionalProfile> {
    const response = await apiClient.post<ApiResponse<ProfessionalProfileDto> | ProfessionalProfileDto>(
      '/api/v1/professionals',
      payload,
    );
    return professionalsApi.mapProfessionalProfile(unwrapItem(response.data));
  },

  async updateProfile(professionalId: string, payload: UpdateProfessionalRequest): Promise<ProfessionalProfile> {
    const response = await apiClient.put<ApiResponse<ProfessionalProfileDto> | ProfessionalProfileDto>(
      `/api/v1/professionals/${professionalId}`,
      payload,
    );
    return professionalsApi.mapProfessionalProfile(unwrapItem(response.data));
  },

  async updateGeo(professionalId: string, payload: UpdateGeoRequest): Promise<ProfessionalProfile> {
    const response = await apiClient.patch<ApiResponse<ProfessionalProfileDto> | ProfessionalProfileDto>(
      `/api/v1/professionals/${professionalId}/geo`,
      payload,
    );
    return professionalsApi.mapProfessionalProfile(unwrapItem(response.data));
  },

  async verify(professionalId: string, payload: VerifyProfessionalRequest): Promise<ProfessionalProfile> {
    const response = await apiClient.patch<ApiResponse<ProfessionalProfileDto> | ProfessionalProfileDto>(
      `/api/v1/professionals/${professionalId}/verify`,
      payload,
    );
    return professionalsApi.mapProfessionalProfile(unwrapItem(response.data));
  },

  async getDocuments(professionalId: string): Promise<ProfessionalDocument[]> {
    const response = await apiClient.get<ApiResponse<ProfessionalDocumentDto[]> | ProfessionalDocumentDto[]>(
      `/api/v1/professionals/${professionalId}/documents`,
    );
    return unwrapList<ProfessionalDocumentDto>(response.data).map(mapDocument);
  },

  async uploadDocument(professionalId: string, formData: FormData): Promise<ProfessionalDocument> {
    const response = await apiClient.post<ApiResponse<ProfessionalDocumentDto> | ProfessionalDocumentDto>(
      `/api/v1/professionals/${professionalId}/documents`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
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
