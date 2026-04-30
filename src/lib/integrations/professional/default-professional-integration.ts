import { ordersApi } from '@/lib/api/orders';
import { apiClient } from '@/lib/api/client';
import { unwrapItem, unwrapList, toNumber } from '@/lib/api/utils';
import type { ApiResponse, SpringPage } from '@/types/api';
import { OrderStatus } from '@/types/order';
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

const COMBINED_LIST_SIZE = 100;

export const defaultProfessionalIntegration: ProfessionalIntegration = {
  orders: {
    getOrders: async (params) => {
      const shouldIncludeInbox = !params?.status || params.status === OrderStatus.PENDING;

      if (!shouldIncludeInbox) {
        return ordersApi.getMyOrders(params);
      }

      // A combinação assigned + inbox não suporta paginação parcial: cada endpoint
      // pagina separadamente, então page/size do caller produziriam itens duplicados
      // ou ausentes. Buscamos páginas únicas grandes e mesclamos por completo.
      const listParams = { status: params?.status, page: 0, size: COMBINED_LIST_SIZE };
      const [assignedResult, inboxResult] = await Promise.allSettled([
        ordersApi.getMyOrders(listParams),
        ordersApi.getProfessionalExpressInbox(listParams),
      ]);

      if (assignedResult.status !== 'fulfilled') {
        throw assignedResult.reason;
      }

      // O inbox Express ainda pode falhar no backend; nesse caso preservamos a
      // tela com os pedidos já atribuídos em vez de derrubar todo o dashboard.
      const assignedOrders = assignedResult.value;
      const inboxOrders = inboxResult.status === 'fulfilled' ? inboxResult.value : [];

      const uniqueOrders = [...assignedOrders, ...inboxOrders].filter(
        (order, index, all) => all.findIndex((item) => item.id === order.id) === index,
      );

      return uniqueOrders.sort((left, right) =>
        new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
      );
    },
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
