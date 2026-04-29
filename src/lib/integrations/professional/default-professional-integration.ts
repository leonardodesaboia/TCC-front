import { ordersApi } from '@/lib/api/orders';
import { apiClient } from '@/lib/api/client';
import { unwrapItem, unwrapList, toNumber } from '@/lib/api/utils';
import type { ApiResponse, SpringPage } from '@/types/api';
import type { ProfessionalIntegration, ProfessionalProfileData } from './contracts';

interface ProfessionalResponseDto {
  id: string;
  userId: string;
  bio?: string | null;
  yearsOfExperience?: number | null;
  baseHourlyRate?: number | string | null;
  verificationStatus?: string | null;
  geoActive?: boolean | null;
  averageRating?: number | string | null;
  reviewCount?: number | string | null;
  createdAt: string;
}

function mapProfileData(dto: ProfessionalResponseDto): ProfessionalProfileData {
  return {
    id: dto.id,
    userId: dto.userId,
    bio: dto.bio ?? undefined,
    yearsOfExperience: dto.yearsOfExperience ?? undefined,
    baseHourlyRate: dto.baseHourlyRate != null ? toNumber(dto.baseHourlyRate) : undefined,
    verificationStatus: dto.verificationStatus ?? undefined,
    geoActive: dto.geoActive ?? undefined,
    averageRating: toNumber(dto.averageRating),
    reviewCount: toNumber(dto.reviewCount),
    createdAt: dto.createdAt,
  };
}

export const defaultProfessionalIntegration: ProfessionalIntegration = {
  orders: {
    getOrders: (params) => ordersApi.getMyOrders(params),
    getById: (id) => ordersApi.getById(id),
    respond: async (orderId, payload) => {
      const response = await apiClient.post(
        `/api/v1/orders/${orderId}/express/pro-respond`,
        payload,
      );
      return unwrapItem(response.data);
    },
    respondOnDemand: (orderId, accepted) => ordersApi.respondOnDemand(orderId, accepted),
    complete: (orderId, formData) => ordersApi.complete(orderId, formData),
    cancel: (orderId, reason) => ordersApi.cancel(orderId, reason),
  },
  profile: {
    getMyProfile: async (userId) => {
      const response = await apiClient.get<SpringPage<ProfessionalResponseDto> | ApiResponse<ProfessionalResponseDto[]> | ProfessionalResponseDto[]>(
        '/api/v1/professionals',
        { params: { size: 100 } },
      );
      const all = unwrapList<ProfessionalResponseDto>(response.data);
      const mine = all.find((p) => p.userId === userId);
      if (!mine) {
        throw new Error('Perfil profissional não encontrado.');
      }
      return mapProfileData(mine);
    },
  },
};
