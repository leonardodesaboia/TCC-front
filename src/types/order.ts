export enum OrderStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  COMPLETED_BY_PRO = 'completed_by_pro',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  DISPUTED = 'disputed',
}

export enum OrderMode {
  EXPRESS = 'express',
  ON_DEMAND = 'on_demand',
}

export interface OrderAddressSnapshot {
  label?: string;
  street: string;
  number: string;
  complement?: string | null;
  district: string;
  city: string;
  state: string;
  zipCode: string;
  lat?: number | null;
  lng?: number | null;
}

export interface OrderPhoto {
  id: string;
  type: string;
  uploaderId: string;
  downloadUrl?: string;
  uploadedAt: string;
}

export interface OrderSummary {
  id: string;
  status: OrderStatus;
  mode?: OrderMode;
  categoryId: string;
  areaId?: string;
  description: string;
  professionalId?: string | null;
  professionalProResponse?: ProResponse | null;
  professionalClientResponse?: ClientProposalResponse | null;
  professionalProposedAmount?: number | null;
  addressId: string;
  addressSnapshot?: OrderAddressSnapshot | null;
  scheduledAt?: string | null;
  urgencyFee: number;
  baseAmount: number;
  platformFee: number;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface OrderDetails extends OrderSummary {
  clientId: string;
  serviceId?: string | null;
  expiresAt?: string | null;
  searchRadiusKm?: number | null;
  searchAttempts?: number | null;
  proCompletedAt?: string | null;
  disputeDeadline?: string | null;
  completedAt?: string | null;
  cancelledAt?: string | null;
  cancelReason?: string | null;
  version?: number | null;
  photos: OrderPhoto[];
}

export interface OrderFiltersDto {
  status?: OrderStatus;
  page?: number;
  size?: number;
}

export interface CreateOrderRequestDto {
  areaId: string;
  categoryId: string;
  description: string;
  addressId: string;
  urgencyFee?: number;
}

export interface CreateOnDemandOrderRequestDto {
  serviceId: string;
  description: string;
  addressId: string;
  scheduledAt: string;
}

export interface ExpressProposal {
  professionalId: string;
  proposedAmount: number;
  respondedAt?: string | null;
  queuePosition?: number | null;
}

export interface OrderSummaryDto {
  id: string;
  clientId: string;
  professionalId?: string | null;
  serviceId?: string | null;
  areaId?: string | null;
  categoryId: string;
  professionalProResponse?: ProResponse | null;
  professionalClientResponse?: ClientProposalResponse | null;
  professionalProposedAmount?: number | string | null;
  mode?: string | null;
  status: OrderStatus;
  description: string;
  addressId: string;
  addressSnapshot?: OrderAddressSnapshot | null;
  scheduledAt?: string | null;
  expiresAt?: string | null;
  urgencyFee?: number | string | null;
  baseAmount?: number | string | null;
  platformFee?: number | string | null;
  totalAmount?: number | string | null;
  searchRadiusKm?: number | string | null;
  searchAttempts?: number | string | null;
  proCompletedAt?: string | null;
  disputeDeadline?: string | null;
  completedAt?: string | null;
  cancelledAt?: string | null;
  cancelReason?: string | null;
  version?: number | null;
  createdAt: string;
  updatedAt: string;
  photos?: OrderPhotoDto[] | null;
}

export interface OrderPhotoDto {
  id: string;
  type: string;
  uploaderId: string;
  file?: {
    downloadUrl?: string | null;
  } | null;
  uploadedAt: string;
}

export interface ExpressProposalDto {
  professionalId: string;
  proposedAmount: number | string;
  respondedAt?: string | null;
  queuePosition?: number | null;
}

export type OrderDetailsDto = OrderSummaryDto;

export type ProResponse = 'accepted' | 'rejected' | 'timeout';
export type ClientProposalResponse = 'accepted' | 'rejected';

export interface ProRespondRequest {
  response: ProResponse;
  proposedAmount?: number;
}

export interface CompleteOrderRequest {
  file: FormData;
}
