import type {
  ClientAddressesIntegration,
  ClientIntegration,
  ClientOrdersIntegration,
  ClientProfessionalsIntegration,
  ClientServicesIntegration,
} from './contracts';
import { defaultClientIntegration } from './default-client-integration';

let currentClientIntegration: ClientIntegration = defaultClientIntegration;

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
  },
  orders: {
    getMyOrders: (...args: Parameters<ClientOrdersIntegration['getMyOrders']>) =>
      orders().getMyOrders(...args),
    getById: (...args: Parameters<ClientOrdersIntegration['getById']>) =>
      orders().getById(...args),
    create: (...args: Parameters<ClientOrdersIntegration['create']>) =>
      orders().create(...args),
  },
  addresses: {
    getAll: (...args: Parameters<ClientAddressesIntegration['getAll']>) =>
      addresses().getAll(...args),
    create: (...args: Parameters<ClientAddressesIntegration['create']>) =>
      addresses().create(...args),
    update: (...args: Parameters<ClientAddressesIntegration['update']>) =>
      addresses().update(...args),
  },
};

export type { ClientIntegration } from './contracts';
