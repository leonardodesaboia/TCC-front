import type { ClientIntegration } from './contracts';
import { OrderStatus, type CreateOrderRequestDto, type ExpressProposal, type OrderDetails, type OrderSummary } from '@/types/order';
import type { Address, CreateAddressRequestDto, UpdateAddressRequestDto } from '@/types/address';
import type { ProfessionalProfile, ProfessionalSummary } from '@/types/professional';
import type { ServiceDetails, ServiceSummary } from '@/types/service';

const MOCK_PROFESSIONALS: ProfessionalSummary[] = [
  {
    id: 'pro-1',
    name: 'Carlos Mendes',
    avatarUrl: undefined,
    profession: 'Eletricista',
    professions: [{ id: 'cat-1', name: 'Eletricista' }],
    areas: [{ id: 'area-1', name: 'Elétrica' }],
    specialties: ['Instalação de tomada', 'Troca de disjuntor'],
    neighborhood: 'Centro',
    city: 'Fortaleza',
    rating: 4.9,
    reviewCount: 127,
    badgeLabel: 'Top Pro',
  },
  {
    id: 'pro-2',
    name: 'João Silva',
    avatarUrl: undefined,
    profession: 'Faxineiro',
    professions: [{ id: 'cat-4', name: 'Faxina residencial' }],
    areas: [{ id: 'area-2', name: 'Limpeza' }],
    specialties: ['Limpeza pós-obra'],
    neighborhood: 'Aldeota',
    city: 'Fortaleza',
    rating: 4.7,
    reviewCount: 85,
  },
];

const MOCK_SERVICES: ServiceDetails[] = [
  {
    id: 'svc-1',
    name: 'Instalação de tomada',
    description: 'Instalação com teste de funcionamento e acabamento final.',
    price: 80,
    durationInMinutes: 30,
    professionId: 'cat-1',
    requirements: ['Tomada disponível'],
    includedItems: ['Instalação', 'Teste final'],
  },
  {
    id: 'svc-2',
    name: 'Faxina residencial',
    description: 'Limpeza geral de apartamento ou casa.',
    price: 150,
    durationInMinutes: 180,
    professionId: 'cat-4',
    requirements: [],
    includedItems: ['Limpeza de pisos', 'Banheiros', 'Cozinha'],
  },
];

let mockAddresses: Address[] = [
  {
    id: 'addr-1',
    userId: 'dev-client',
    label: 'Casa',
    street: 'Rua das Flores',
    number: '123',
    complement: 'Apto 401',
    district: 'Centro',
    city: 'Fortaleza',
    state: 'CE',
    zipCode: '60000-000',
    lat: -3.731862,
    lng: -38.526669,
    isDefault: true,
  },
  {
    id: 'addr-2',
    userId: 'dev-client',
    label: 'Trabalho',
    street: 'Av. Santos Dumont',
    number: '1500',
    complement: 'Sala 302',
    district: 'Aldeota',
    city: 'Fortaleza',
    state: 'CE',
    zipCode: '60150-160',
    lat: -3.735547,
    lng: -38.496094,
    isDefault: false,
  },
];

let mockOrders: OrderDetails[] = [
  {
    id: 'ord-1',
    clientId: 'dev-client',
    areaId: 'area-1',
    categoryId: 'cat-1',
    description: 'Trocar duas tomadas na sala e instalar uma nova na cozinha.',
    professionalId: 'pro-1',
    addressId: 'addr-1',
    addressSnapshot: {
      label: 'Casa',
      street: 'Rua das Flores',
      number: '123',
      complement: 'Apto 401',
      district: 'Centro',
      city: 'Fortaleza',
      state: 'CE',
      zipCode: '60000-000',
      lat: -3.731862,
      lng: -38.526669,
    },
    status: OrderStatus.ACCEPTED,
    urgencyFee: 15,
    baseAmount: 135,
    platformFee: 15,
    totalAmount: 150,
    createdAt: '2026-04-27T10:30:00.000Z',
    updatedAt: '2026-04-27T10:35:00.000Z',
    photos: [],
  },
  {
    id: 'ord-2',
    clientId: 'dev-client',
    areaId: 'area-2',
    categoryId: 'cat-4',
    description: 'Limpeza geral de apartamento 3 quartos.',
    addressId: 'addr-2',
    addressSnapshot: {
      label: 'Trabalho',
      street: 'Av. Santos Dumont',
      number: '1500',
      district: 'Aldeota',
      city: 'Fortaleza',
      state: 'CE',
      zipCode: '60150-160',
      lat: -3.735547,
      lng: -38.496094,
    },
    status: OrderStatus.PENDING,
    urgencyFee: 0,
    baseAmount: 0,
    platformFee: 0,
    totalAmount: 0,
    createdAt: '2026-04-27T09:15:00.000Z',
    updatedAt: '2026-04-27T09:15:00.000Z',
    photos: [],
  },
];

const MOCK_PROPOSALS_BY_ORDER: Record<string, ExpressProposal[]> = {
  'ord-2': [
    { professionalId: 'pro-1', proposedAmount: 150, respondedAt: '2026-04-27T09:20:00.000Z', queuePosition: 1 },
    { professionalId: 'pro-2', proposedAmount: 130, respondedAt: '2026-04-27T09:28:00.000Z', queuePosition: 2 },
  ],
};

function toOrderSummary(order: OrderDetails): OrderSummary {
  return {
    id: order.id,
    status: order.status,
    categoryId: order.categoryId,
    areaId: order.areaId,
    description: order.description,
    professionalId: order.professionalId,
    addressId: order.addressId,
    addressSnapshot: order.addressSnapshot,
    scheduledAt: order.scheduledAt,
    urgencyFee: order.urgencyFee,
    baseAmount: order.baseAmount,
    platformFee: order.platformFee,
    totalAmount: order.totalAmount,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
}

function nextId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}

export const mockClientIntegration: ClientIntegration = {
  professionals: {
    async search(params) {
      const query = params?.query?.toLowerCase().trim();
      return query
        ? MOCK_PROFESSIONALS.filter((item) =>
            item.name.toLowerCase().includes(query) ||
            item.profession.toLowerCase().includes(query) ||
            item.specialties.some((tag) => tag.toLowerCase().includes(query)),
          )
        : MOCK_PROFESSIONALS;
    },
    async getById(id) {
      const base = MOCK_PROFESSIONALS.find((item) => item.id === id) ?? MOCK_PROFESSIONALS[0];
      const profile: ProfessionalProfile = {
        ...base,
        bio: 'Profissional experiente com atendimento rápido em Fortaleza.',
        services: MOCK_SERVICES.filter((service) => service.professionId === base.professions[0]?.id),
        yearsOfExperience: 6,
      };
      return profile;
    },
    async getByProfession(professionId) {
      return MOCK_PROFESSIONALS.filter((item) =>
        item.professions.some((profession) => profession.id === professionId),
      );
    },
    async getByArea(areaId) {
      return MOCK_PROFESSIONALS.filter((item) =>
        item.areas.some((area) => area.id === areaId),
      );
    },
  },
  services: {
    async getAll(params) {
      const query = params?.query?.toLowerCase().trim();
      const filtered = query
        ? MOCK_SERVICES.filter((service) => service.name.toLowerCase().includes(query))
        : MOCK_SERVICES;
      return filtered.map(({ requirements: _requirements, includedItems: _includedItems, ...service }) => service);
    },
    async getById(id) {
      return MOCK_SERVICES.find((service) => service.id === id) ?? MOCK_SERVICES[0];
    },
    async getByProfessional(professionalId) {
      const professional = MOCK_PROFESSIONALS.find((item) => item.id === professionalId);
      if (!professional) return [];
      return MOCK_SERVICES
        .filter((service) => service.professionId === professional.professions[0]?.id)
        .map(({ requirements: _requirements, includedItems: _includedItems, ...service }) => service);
    },
    async getByProfessionalAndId(professionalId, serviceId) {
      const list = await this.getByProfessional(professionalId);
      const match = list.find((service) => service.id === serviceId);
      const full = MOCK_SERVICES.find((service) => service.id === match?.id || service.id === serviceId);
      return full ?? MOCK_SERVICES[0];
    },
  },
  orders: {
    async getMyOrders(params) {
      const status = params?.status;
      return mockOrders
        .filter((order) => !status || order.status === status)
        .map(toOrderSummary);
    },
    async getById(id) {
      return mockOrders.find((order) => order.id === id) ?? mockOrders[0];
    },
    async getExpressProposals(id) {
      return MOCK_PROPOSALS_BY_ORDER[id] ?? [];
    },
    async create(payload: CreateOrderRequestDto) {
      const address = mockAddresses.find((item) => item.id === payload.addressId) ?? mockAddresses[0];
      const created: OrderDetails = {
        id: nextId('ord'),
        clientId: 'dev-client',
        areaId: payload.areaId,
        categoryId: payload.categoryId,
        description: payload.description,
        addressId: payload.addressId,
        addressSnapshot: {
          label: address.label,
          street: address.street,
          number: address.number,
          complement: address.complement,
          district: address.district,
          city: address.city,
          state: address.state,
          zipCode: address.zipCode,
          lat: address.lat,
          lng: address.lng,
        },
        status: OrderStatus.PENDING,
        urgencyFee: payload.urgencyFee ?? 0,
        baseAmount: 0,
        platformFee: 0,
        totalAmount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        photos: [],
      };
      mockOrders = [created, ...mockOrders];
      return created;
    },
    async chooseProposal(orderId, professionalId) {
      const proposal = (MOCK_PROPOSALS_BY_ORDER[orderId] ?? []).find((item) => item.professionalId === professionalId);
      mockOrders = mockOrders.map((order) =>
        order.id === orderId
          ? {
              ...order,
              professionalId,
              status: OrderStatus.ACCEPTED,
              baseAmount: proposal?.proposedAmount ?? order.baseAmount,
              totalAmount: proposal?.proposedAmount ?? order.totalAmount,
              updatedAt: new Date().toISOString(),
            }
          : order,
      );
      return mockOrders.find((order) => order.id === orderId) ?? mockOrders[0];
    },
    async cancel(orderId, reason) {
      mockOrders = mockOrders.map((order) =>
        order.id === orderId
          ? {
              ...order,
              status: OrderStatus.CANCELLED,
              cancelReason: reason,
              cancelledAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }
          : order,
      );
      return mockOrders.find((order) => order.id === orderId) ?? mockOrders[0];
    },
    async confirm(orderId) {
      mockOrders = mockOrders.map((order) =>
        order.id === orderId
          ? {
              ...order,
              status: OrderStatus.COMPLETED,
              completedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }
          : order,
      );
      return mockOrders.find((order) => order.id === orderId) ?? mockOrders[0];
    },
    async uploadPhoto() {},
  },
  addresses: {
    async getAll() {
      return mockAddresses;
    },
    async create(payload: CreateAddressRequestDto) {
      const created: Address = {
        id: nextId('addr'),
        userId: 'dev-client',
        ...payload,
        isDefault: payload.isDefault ?? mockAddresses.length === 0,
      };

      if (created.isDefault) {
        mockAddresses = mockAddresses.map((item) => ({ ...item, isDefault: false }));
      }

      mockAddresses = [created, ...mockAddresses];
      return created;
    },
    async update(id: string, payload: UpdateAddressRequestDto) {
      mockAddresses = mockAddresses.map((item) => (item.id === id ? { ...item, ...payload } : item));
      return mockAddresses.find((item) => item.id === id) ?? mockAddresses[0];
    },
    async remove(id: string) {
      mockAddresses = mockAddresses.filter((item) => item.id !== id);
    },
    async setDefault(id: string) {
      mockAddresses = mockAddresses.map((item) => ({ ...item, isDefault: item.id === id }));
      return mockAddresses.find((item) => item.id === id) ?? mockAddresses[0];
    },
  },
};
