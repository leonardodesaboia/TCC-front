import type {
  OrderDetails,
  OrderFiltersDto,
  OrderSummary,
  ProRespondRequest,
} from '@/types/order';

export interface ProfessionalProfileData {
  id: string;
  userId: string;
  bio?: string;
  yearsOfExperience?: number;
  baseHourlyRate?: number;
  verificationStatus?: string;
  geoActive?: boolean;
  geoCapturedAt?: string;
  geoAccuracyMeters?: number;
  averageRating: number;
  reviewCount: number;
  createdAt: string;
}

export interface ProfessionalOrdersIntegration {
  getOrders(params?: OrderFiltersDto): Promise<OrderSummary[]>;
  getById(id: string): Promise<OrderDetails>;
  respond(orderId: string, payload: ProRespondRequest): Promise<OrderDetails>;
  respondOnDemand(orderId: string, accepted: boolean): Promise<OrderDetails>;
  complete(orderId: string, formData: FormData): Promise<OrderDetails>;
  cancel(orderId: string, reason: string): Promise<OrderDetails>;
}

export interface ProfessionalProfileIntegration {
  getMyProfile(): Promise<ProfessionalProfileData>;
}

export interface ProfessionalIntegration {
  orders: ProfessionalOrdersIntegration;
  profile: ProfessionalProfileIntegration;
}
