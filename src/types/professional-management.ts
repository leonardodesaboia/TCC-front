import type { StorageRef } from './api';
import type { PricingType } from './service-meta';

export type VerificationStatus = 'pending' | 'approved' | 'rejected';
export type DocType = 'rg' | 'cnh' | 'proof_of_address' | 'profile_photo';
export type BlockType = 'recurring' | 'specific_date' | 'order';

export interface CreateProfessionalRequest {
  userId: string;
  bio: string;
  yearsOfExperience: number;
  baseHourlyRate: number;
}

export interface UpdateProfessionalRequest {
  bio?: string;
  yearsOfExperience?: number;
  baseHourlyRate?: number;
}

export interface UpdateGeoRequest {
  geoActive: boolean;
  geoLat?: number;
  geoLng?: number;
}

export interface VerifyProfessionalRequest {
  status: 'approved' | 'rejected';
  rejectionReason?: string;
}

export interface ProfessionalDocument {
  id: string;
  professionalId: string;
  docType: DocType;
  file: StorageRef;
  createdAt?: string;
}

export interface ProfessionalDocumentDto {
  id: string;
  professionalId: string;
  docType: DocType;
  file: StorageRef;
  createdAt?: string | null;
}

export interface CreateProfessionalOfferingRequest {
  categoryId: string;
  title: string;
  description: string;
  pricingType: PricingType;
  price: number;
  estimatedDurationMinutes: number;
}

export interface UpdateProfessionalOfferingRequest extends Partial<CreateProfessionalOfferingRequest> {}

export interface ProfessionalOffering {
  id: string;
  professionalId: string;
  categoryId: string;
  title: string;
  description: string;
  pricingType: PricingType;
  price: number;
  estimatedDurationMinutes: number;
  active: boolean;
  averageRating: number;
  reviewCount: number;
  createdAt: string;
}

export interface ProfessionalOfferingDto {
  id: string;
  professionalId: string;
  categoryId: string;
  title: string;
  description: string;
  pricingType: PricingType;
  price: number | string;
  estimatedDurationMinutes: number | string;
  active: boolean;
  averageRating?: number | string | null;
  reviewCount?: number | string | null;
  createdAt: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  priceMonthly: number;
  highlightInSearch: boolean;
  expressPriority: boolean;
  badgeLabel?: string;
  active: boolean;
  createdAt: string;
}

export interface SubscriptionPlanDto {
  id: string;
  name: string;
  priceMonthly: number | string;
  highlightInSearch: boolean;
  expressPriority: boolean;
  badgeLabel?: string | null;
  active: boolean;
  createdAt: string;
}

export interface AssignSubscriptionPlanRequest {
  subscriptionPlanId: string;
}

export interface ProfessionalSubscription {
  professionalId: string;
  subscriptionPlanId?: string;
  planName?: string;
  priceMonthly?: number;
  highlightInSearch?: boolean;
  expressPriority?: boolean;
  badgeLabel?: string;
  subscriptionExpiresAt?: string;
  autoRenew?: boolean;
  subscriptionCancelledAt?: string;
}

export interface ProfessionalSubscriptionDto {
  professionalId: string;
  subscriptionPlanId?: string | null;
  planName?: string | null;
  priceMonthly?: number | string | null;
  highlightInSearch?: boolean | null;
  expressPriority?: boolean | null;
  badgeLabel?: string | null;
  subscriptionExpiresAt?: string | null;
  autoRenew?: boolean | null;
  subscriptionCancelledAt?: string | null;
}

export interface BlockedPeriod {
  id: string;
  professionalId: string;
  blockType: BlockType;
  startAt?: string;
  endAt?: string;
  weekday?: number;
  createdAt?: string;
}

export interface BlockedPeriodDto {
  id: string;
  professionalId: string;
  blockType: BlockType;
  startAt?: string | null;
  endAt?: string | null;
  weekday?: number | null;
  createdAt?: string | null;
}

export interface CreateBlockedPeriodRequest {
  blockType: BlockType;
  startAt?: string;
  endAt?: string;
  weekday?: number;
}
