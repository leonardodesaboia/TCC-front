import { apiClient } from './client';
import type {
  CreateOrderRequestDto,
  OrderAddressDto,
  OrderDetails,
  OrderDetailsDto,
  OrderFiltersDto,
  OrderProfessionalDto,
  OrderServiceDto,
  OrderSummary,
  OrderSummaryDto,
} from '@/types/order';
import type { Address } from '@/types/address';
import type { ProfessionalSummary } from '@/types/professional';
import type { ServiceSummary } from '@/types/service';
import type { ApiResponse, PaginatedResponse } from '@/types/api';

function toNumber(value: number | string): number {
  return typeof value === 'number' ? value : Number(value) || 0;
}

function mapService(dto: OrderServiceDto): ServiceSummary {
  return {
    id: dto.id,
    name: dto.name,
    description: dto.description ?? '',
    price: toNumber(dto.price),
  };
}

function mapProfessional(dto: OrderProfessionalDto): ProfessionalSummary {
  return {
    id: dto.id,
    name: dto.name,
    avatarUrl: dto.avatarUrl ?? undefined,
    profession: dto.profession ?? 'Profissional',
    professions: dto.profession ? [{ id: dto.id, name: dto.profession }] : [],
    areas: [],
    specialties: [],
    rating: toNumber(dto.rating ?? 0),
    reviewCount: toNumber(dto.reviewCount ?? 0),
  };
}

function mapAddress(dto: OrderAddressDto): Address {
  return {
    id: dto.id,
    street: dto.street,
    number: dto.number,
    complement: dto.complement ?? undefined,
    neighborhood: dto.neighborhood,
    city: dto.city,
    state: dto.state,
    zipCode: dto.zipCode,
    isDefault: dto.isDefault ?? false,
  };
}

function mapOrderSummary(dto: OrderSummaryDto): OrderSummary {
  return {
    id: dto.id,
    status: dto.status,
    scheduledAt: dto.scheduledAt,
    totalPrice: toNumber(dto.totalPrice),
    service: mapService(dto.service),
    professional: mapProfessional(dto.professional),
    address: mapAddress(dto.address),
  };
}

function mapOrderDetails(dto: OrderDetailsDto): OrderDetails {
  return {
    ...mapOrderSummary(dto),
    notes: dto.notes ?? undefined,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt ?? undefined,
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

export const ordersApi = {
  async getMyOrders(params: OrderFiltersDto = {}): Promise<OrderSummary[]> {
    const response = await apiClient.get<PaginatedResponse<OrderSummaryDto> | ApiResponse<OrderSummaryDto[]> | OrderSummaryDto[]>(
      '/orders/my-orders',
      { params },
    );

    return unwrapList(response.data).map(mapOrderSummary);
  },

  async getById(id: string): Promise<OrderDetails> {
    const response = await apiClient.get<ApiResponse<OrderDetailsDto> | OrderDetailsDto>(`/orders/${id}`);
    return mapOrderDetails(unwrapItem(response.data));
  },

  async create(payload: CreateOrderRequestDto): Promise<OrderDetails> {
    const response = await apiClient.post<ApiResponse<OrderDetailsDto> | OrderDetailsDto>('/orders', payload);
    return mapOrderDetails(unwrapItem(response.data));
  },
};
