import { apiClient } from './client';
import { unwrapItem, unwrapList, toNumber } from './utils';
import type { ApiResponse, SpringPage } from '@/types/api';
import type {
  CreateOnDemandOrderRequestDto,
  CreateOrderRequestDto,
  ExpressProposal,
  ExpressProposalDto,
  OrderDetails,
  OrderDetailsDto,
  OrderFiltersDto,
  OrderPhoto,
  OrderPhotoDto,
  OrderSummary,
  OrderSummaryDto,
} from '@/types/order';
import { OrderMode } from '@/types/order';

function mapOrderPhoto(dto: OrderPhotoDto): OrderPhoto {
  return {
    id: dto.id,
    type: dto.type,
    uploaderId: dto.uploaderId,
    downloadUrl: dto.file?.downloadUrl ?? undefined,
    uploadedAt: dto.uploadedAt,
  };
}

function mapOrderSummary(dto: OrderSummaryDto): OrderSummary {
  return {
    id: dto.id,
    status: dto.status,
    mode: dto.mode === 'on_demand' ? OrderMode.ON_DEMAND : dto.mode === 'express' ? OrderMode.EXPRESS : undefined,
    categoryId: dto.categoryId,
    areaId: dto.areaId ?? undefined,
    description: dto.description,
    professionalId: dto.professionalId ?? undefined,
    professionalProResponse: dto.professionalProResponse ?? undefined,
    professionalClientResponse: dto.professionalClientResponse ?? undefined,
    professionalProposedAmount: dto.professionalProposedAmount != null
      ? toNumber(dto.professionalProposedAmount)
      : undefined,
    addressId: dto.addressId,
    addressSnapshot: dto.addressSnapshot ?? undefined,
    scheduledAt: dto.scheduledAt ?? undefined,
    urgencyFee: toNumber(dto.urgencyFee),
    baseAmount: toNumber(dto.baseAmount),
    platformFee: toNumber(dto.platformFee),
    totalAmount: toNumber(dto.totalAmount),
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  };
}

function mapOrderDetails(dto: OrderDetailsDto): OrderDetails {
  return {
    ...mapOrderSummary(dto),
    clientId: dto.clientId,
    serviceId: dto.serviceId ?? undefined,
    expiresAt: dto.expiresAt ?? undefined,
    searchRadiusKm: dto.searchRadiusKm != null ? toNumber(dto.searchRadiusKm) : undefined,
    searchAttempts: dto.searchAttempts != null ? toNumber(dto.searchAttempts) : undefined,
    proCompletedAt: dto.proCompletedAt ?? undefined,
    disputeDeadline: dto.disputeDeadline ?? undefined,
    completedAt: dto.completedAt ?? undefined,
    cancelledAt: dto.cancelledAt ?? undefined,
    cancelReason: dto.cancelReason ?? undefined,
    version: dto.version ?? undefined,
    photos: (dto.photos ?? []).map(mapOrderPhoto),
  };
}

function mapProposal(dto: ExpressProposalDto): ExpressProposal {
  return {
    professionalId: dto.professionalId,
    proposedAmount: toNumber(dto.proposedAmount),
    respondedAt: dto.respondedAt ?? undefined,
    queuePosition: dto.queuePosition ?? undefined,
  };
}

export const ordersApi = {
  async getMyOrders(params: OrderFiltersDto = {}): Promise<OrderSummary[]> {
    const response = await apiClient.get<SpringPage<OrderSummaryDto> | ApiResponse<OrderSummaryDto[]> | OrderSummaryDto[]>(
      '/api/v1/orders',
      { params },
    );

    return unwrapList(response.data).map(mapOrderSummary);
  },

  async getProfessionalExpressInbox(params: OrderFiltersDto = {}): Promise<OrderSummary[]> {
    const response = await apiClient.get<SpringPage<OrderSummaryDto> | ApiResponse<OrderSummaryDto[]> | OrderSummaryDto[]>(
      '/api/v1/orders/express/inbox',
      { params },
    );

    return unwrapList(response.data).map(mapOrderSummary);
  },

  async getById(id: string): Promise<OrderDetails> {
    const response = await apiClient.get<ApiResponse<OrderDetailsDto> | OrderDetailsDto>(`/api/v1/orders/${id}`);
    return mapOrderDetails(unwrapItem(response.data));
  },

  async getExpressProposals(id: string): Promise<ExpressProposal[]> {
    const response = await apiClient.get<ApiResponse<ExpressProposalDto[]> | ExpressProposalDto[]>(
      `/api/v1/orders/${id}/express/proposals`,
    );

    return unwrapList(response.data).map(mapProposal);
  },

  async create(payload: CreateOrderRequestDto): Promise<OrderDetails> {
    const response = await apiClient.post<ApiResponse<OrderDetailsDto> | OrderDetailsDto>(
      '/api/v1/orders/express',
      payload,
    );

    return mapOrderDetails(unwrapItem(response.data));
  },

  async createOnDemand(payload: CreateOnDemandOrderRequestDto): Promise<OrderDetails> {
    const response = await apiClient.post<ApiResponse<OrderDetailsDto> | OrderDetailsDto>(
      '/api/v1/orders/on-demand',
      payload,
    );

    return mapOrderDetails(unwrapItem(response.data));
  },

  async respondOnDemand(orderId: string, accepted: boolean): Promise<OrderDetails> {
    const response = await apiClient.post<ApiResponse<OrderDetailsDto> | OrderDetailsDto>(
      `/api/v1/orders/${orderId}/on-demand/respond`,
      null,
      { params: { accepted } },
    );

    return mapOrderDetails(unwrapItem(response.data));
  },

  async chooseProposal(orderId: string, professionalId: string): Promise<OrderDetails> {
    const response = await apiClient.post<ApiResponse<OrderDetailsDto> | OrderDetailsDto>(
      `/api/v1/orders/${orderId}/express/client-respond`,
      { selectedProfessionalId: professionalId },
    );

    return mapOrderDetails(unwrapItem(response.data));
  },

  async cancel(orderId: string, reason: string): Promise<OrderDetails> {
    const response = await apiClient.post<ApiResponse<OrderDetailsDto> | OrderDetailsDto>(
      `/api/v1/orders/${orderId}/cancel`,
      { reason },
    );

    return mapOrderDetails(unwrapItem(response.data));
  },

  async confirm(orderId: string): Promise<OrderDetails> {
    const response = await apiClient.post<ApiResponse<OrderDetailsDto> | OrderDetailsDto>(
      `/api/v1/orders/${orderId}/confirm`,
    );

    return mapOrderDetails(unwrapItem(response.data));
  },

  async complete(orderId: string, formData: FormData): Promise<OrderDetails> {
    const response = await apiClient.post<ApiResponse<OrderDetailsDto> | OrderDetailsDto>(
      `/api/v1/orders/${orderId}/complete`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );

    return mapOrderDetails(unwrapItem(response.data));
  },

  async uploadPhoto(orderId: string, formData: FormData): Promise<void> {
    await apiClient.post(`/api/v1/orders/${orderId}/photos`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};
