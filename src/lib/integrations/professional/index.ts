import type {
  ProfessionalIntegration,
  ProfessionalOrdersIntegration,
  ProfessionalProfileIntegration,
} from './contracts';
import { defaultProfessionalIntegration } from './default-professional-integration';
import { mockProfessionalIntegration } from './mock-professional-integration';
import { USE_MOCKS_ENABLED } from '@/lib/constants/config';

let current: ProfessionalIntegration = USE_MOCKS_ENABLED
  ? mockProfessionalIntegration
  : defaultProfessionalIntegration;

export function setProfessionalIntegration(integration: ProfessionalIntegration) {
  current = integration;
}

function orders(): ProfessionalOrdersIntegration {
  return current.orders;
}

function profile(): ProfessionalProfileIntegration {
  return current.profile;
}

export const professionalIntegration = {
  orders: {
    getOrders: (...args: Parameters<ProfessionalOrdersIntegration['getOrders']>) =>
      orders().getOrders(...args),
    getById: (...args: Parameters<ProfessionalOrdersIntegration['getById']>) =>
      orders().getById(...args),
    respond: (...args: Parameters<ProfessionalOrdersIntegration['respond']>) =>
      orders().respond(...args),
    complete: (...args: Parameters<ProfessionalOrdersIntegration['complete']>) =>
      orders().complete(...args),
    cancel: (...args: Parameters<ProfessionalOrdersIntegration['cancel']>) =>
      orders().cancel(...args),
  },
  profile: {
    getMyProfile: (...args: Parameters<ProfessionalProfileIntegration['getMyProfile']>) =>
      profile().getMyProfile(...args),
  },
};

export type { ProfessionalIntegration } from './contracts';
