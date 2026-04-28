import { addressesApi } from '@/lib/api/addresses';
import { ordersApi } from '@/lib/api/orders';
import { professionalsApi } from '@/lib/api/professionals';
import { servicesApi } from '@/lib/api/services';
import type { ClientIntegration } from './contracts';

export const defaultClientIntegration: ClientIntegration = {
  professionals: {
    search: (params) => professionalsApi.search(params),
    getById: (id) => professionalsApi.getById(id),
    getByProfession: (professionId, params) =>
      professionalsApi.getByProfession(professionId, params),
    getByArea: (areaId, params) => professionalsApi.getByArea(areaId, params),
  },
  services: {
    getAll: (params) => servicesApi.getAll(params),
    getById: (id) => servicesApi.getById(id),
    getByProfessional: (professionalId) => servicesApi.getByProfessional(professionalId),
    getByProfessionalAndId: (professionalId, serviceId) =>
      servicesApi.getByProfessionalAndId(professionalId, serviceId),
  },
  orders: {
    getMyOrders: (params) => ordersApi.getMyOrders(params),
    getById: (id) => ordersApi.getById(id),
    getExpressProposals: (id) => ordersApi.getExpressProposals(id),
    create: (payload) => ordersApi.create(payload),
    chooseProposal: (orderId, professionalId) => ordersApi.chooseProposal(orderId, professionalId),
    cancel: (orderId, reason) => ordersApi.cancel(orderId, reason),
    confirm: (orderId) => ordersApi.confirm(orderId),
    uploadPhoto: (orderId, formData) => ordersApi.uploadPhoto(orderId, formData),
  },
  addresses: {
    getAll: () => addressesApi.getAll(),
    create: (payload) => addressesApi.create(payload),
    update: (id, payload) => addressesApi.update(id, payload),
    remove: (id) => addressesApi.remove(id),
    setDefault: (id) => addressesApi.setDefault(id),
  },
};
