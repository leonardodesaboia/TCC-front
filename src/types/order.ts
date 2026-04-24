import type { Address } from './address';
import type { ProfessionalSummary } from './professional';
import type { ServiceSummary } from './service';

export enum OrderStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  IN_PROGRESS = 'IN_PROGRESS',
  PENDING_COMPLETION = 'PENDING_COMPLETION',
  COMPLETED = 'COMPLETED',
  DISPUTED = 'DISPUTED',
  CANCELED = 'CANCELED',
}

export interface OrderSummary {
  id: string;
  status: OrderStatus;
  scheduledAt: string;
  totalPrice: number;
  service: ServiceSummary;
  professional: ProfessionalSummary;
  address: Address;
}

export interface OrderDetails extends OrderSummary {
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface OrderFiltersDto {
  status?: OrderStatus;
  page?: number;
  limit?: number;
}

export interface CreateOrderRequestDto {
  serviceId: string;
  addressId: string;
  scheduledAt: string;
  notes?: string;
}

export interface OrderServiceDto {
  id: string;
  name: string;
  description?: string | null;
  price: number | string;
}

export interface OrderProfessionalDto {
  id: string;
  name: string;
  avatarUrl?: string | null;
  profession?: string | null;
  rating?: number | string | null;
  reviewCount?: number | string | null;
}

export interface OrderAddressDto {
  id: string;
  street: string;
  number: string;
  complement?: string | null;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  isDefault?: boolean | null;
}

export interface OrderSummaryDto {
  id: string;
  status: OrderStatus;
  scheduledAt: string;
  totalPrice: number | string;
  service: OrderServiceDto;
  professional: OrderProfessionalDto;
  address: OrderAddressDto;
}

export interface OrderDetailsDto extends OrderSummaryDto {
  notes?: string | null;
  createdAt: string;
  updatedAt?: string | null;
}
