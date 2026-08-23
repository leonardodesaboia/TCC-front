import type {
  ClientAddressesIntegration,
  ClientFavoritesIntegration,
  ClientIntegration,
  ClientOrdersIntegration,
  ClientProfessionalsIntegration,
  ClientServicesIntegration,
} from './contracts';
import { defaultClientIntegration } from './default-client-integration';
import { mockClientIntegration } from './mock-client-integration';
import { USE_MOCKS_ENABLED } from '@/lib/constants/config';

let currentClientIntegration: ClientIntegration = USE_MOCKS_ENABLED
  ? mockClientIntegration
  : defaultClientIntegration;

export function setClientIntegration(integration: ClientIntegration) {
  currentClientIntegration = integration;
}

function professionals(): ClientProfessionalsIntegration {
  return currentClientIntegration.professionals;
}

function services(): ClientServicesIntegration {
  return currentClientIntegration.services;
}

function orders(): ClientOrdersIntegration {
  return currentClientIntegration.orders;
}

function addresses(): ClientAddressesIntegration {
  return currentClientIntegration.addresses;
}

function favorites(): ClientFavoritesIntegration {
  return currentClientIntegration.favorites;
}

export const clientIntegration = {
  professionals: {
    search: (...args: Parameters<ClientProfessionalsIntegration['search']>) =>
      professionals().search(...args),
    getById: (...args: Parameters<ClientProfessionalsIntegration['getById']>) =>
      professionals().getById(...args),
    getByProfession: (...args: Parameters<ClientProfessionalsIntegration['getByProfession']>) =>
      professionals().getByProfession(...args),
    getByArea: (...args: Parameters<ClientProfessionalsIntegration['getByArea']>) =>
      professionals().getByArea(...args),
  },
  services: {
    getAll: (...args: Parameters<ClientServicesIntegration['getAll']>) =>
      services().getAll(...args),
    getById: (...args: Parameters<ClientServicesIntegration['getById']>) =>
      services().getById(...args),
    getByProfessional: (...args: Parameters<ClientServicesIntegration['getByProfessional']>) =>
      services().getByProfessional(...args),
    getByProfessionalAndId: (...args: Parameters<ClientServicesIntegration['getByProfessionalAndId']>) =>
      services().getByProfessionalAndId(...args),
  },
  orders: {
    getMyOrders: (...args: Parameters<ClientOrdersIntegration['getMyOrders']>) =>
      orders().getMyOrders(...args),
    getById: (...args: Parameters<ClientOrdersIntegration['getById']>) =>
      orders().getById(...args),
    getExpressProposals: (...args: Parameters<ClientOrdersIntegration['getExpressProposals']>) =>
      orders().getExpressProposals(...args),
    create: (...args: Parameters<ClientOrdersIntegration['create']>) =>
      orders().create(...args),
    createOnDemand: (...args: Parameters<ClientOrdersIntegration['createOnDemand']>) =>
      orders().createOnDemand(...args),
    chooseProposal: (...args: Parameters<ClientOrdersIntegration['chooseProposal']>) =>
      orders().chooseProposal(...args),
    cancel: (...args: Parameters<ClientOrdersIntegration['cancel']>) =>
      orders().cancel(...args),
    confirm: (...args: Parameters<ClientOrdersIntegration['confirm']>) =>
      orders().confirm(...args),
    uploadPhoto: (...args: Parameters<ClientOrdersIntegration['uploadPhoto']>) =>
      orders().uploadPhoto(...args),
  },
  addresses: {
    lookup: (...args: Parameters<ClientAddressesIntegration['lookup']>) =>
      addresses().lookup(...args),
    reverse: (...args: Parameters<ClientAddressesIntegration['reverse']>) =>
      addresses().reverse(...args),
    getAll: (...args: Parameters<ClientAddressesIntegration['getAll']>) =>
      addresses().getAll(...args),
    create: (...args: Parameters<ClientAddressesIntegration['create']>) =>
      addresses().create(...args),
    update: (...args: Parameters<ClientAddressesIntegration['update']>) =>
      addresses().update(...args),
    remove: (...args: Parameters<ClientAddressesIntegration['remove']>) =>
      addresses().remove(...args),
    setDefault: (...args: Parameters<ClientAddressesIntegration['setDefault']>) =>
      addresses().setDefault(...args),
  },
  favorites: {
    getStatus: (...args: Parameters<ClientFavoritesIntegration['getStatus']>) =>
      favorites().getStatus(...args),
    favorite: (...args: Parameters<ClientFavoritesIntegration['favorite']>) =>
      favorites().favorite(...args),
    unfavorite: (...args: Parameters<ClientFavoritesIntegration['unfavorite']>) =>
      favorites().unfavorite(...args),
    list: (...args: Parameters<ClientFavoritesIntegration['list']>) =>
      favorites().list(...args),
  },
};

export type { ClientIntegration } from './contracts';
