import type {
  OrderDetails,
  OrderFiltersDto,
  OrderSummary,
  ProposeNewPriceRequestDto,
  ProposeServiceChangeRequestDto,
  ProRespondRequest,
} from '@/types/order';
import type { ProfessionalSpecialty } from '@/types/professional-management';

export interface ProfessionalProfileData {
  id: string;
  userId: string;
  bio?: string;
  yearsOfExperience?: number;
  baseHourlyRate?: number;
  verificationStatus?: string;
  rejectionReason?: string;
  geoActive?: boolean;
  geoCapturedAt?: string;
  geoAccuracyMeters?: number;
  averageRating: number;
  reviewCount: number;
  createdAt: string;
  specialties: ProfessionalSpecialty[];
}

export interface ProfessionalOrdersIntegration {
  getOrders(params?: OrderFiltersDto): Promise<OrderSummary[]>;
  getById(id: string): Promise<OrderDetails>;
  respond(orderId: string, payload: ProRespondRequest): Promise<OrderDetails>;
  respondOnDemand(orderId: string, accepted: boolean): Promise<OrderDetails>;
  complete(orderId: string, formData: FormData): Promise<OrderDetails>;
  cancel(orderId: string, reason: string): Promise<OrderDetails>;
  reportScopeMismatch(orderId: string, description: string): Promise<OrderDetails>;
  proposeNewPrice(orderId: string, payload: ProposeNewPriceRequestDto): Promise<OrderDetails>;
  proposeServiceChange(orderId: string, payload: ProposeServiceChangeRequestDto): Promise<OrderDetails>;
}

export interface ProfessionalProfileIntegration {
  getMyProfile(): Promise<ProfessionalProfileData>;
}

export interface ProfessionalIntegration {
  orders: ProfessionalOrdersIntegration;
  profile: ProfessionalProfileIntegration;
}
