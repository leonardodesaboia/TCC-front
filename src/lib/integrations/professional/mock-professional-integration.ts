import type { OrderDetails, OrderSummary, OrderFiltersDto } from '@/types/order';
import type { ProfessionalIntegration, ProfessionalProfileData } from './contracts';

const MOCK_PRO_ID = 'dev-pro';
const MOCK_USER_ID = 'dev-professional';

const mockProfile: ProfessionalProfileData = {
  id: MOCK_PRO_ID,
  userId: MOCK_USER_ID,
  bio: 'Eletricista com mais de 10 anos de experiencia.',
  yearsOfExperience: 10,
  baseHourlyRate: 80,
  verificationStatus: 'approved',
  geoActive: true,
  averageRating: 4.7,
  reviewCount: 23,
  createdAt: '2026-01-15T00:00:00.000Z',
};

let mockOrders: OrderSummary[] = [
  {
    id: 'ord-pro-1',
    status: 'pending' as any,
    categoryId: 'cat-1',
    areaId: 'area-1',
    description: 'Trocar tomadas da sala e cozinha',
    addressId: 'addr-1',
    addressSnapshot: {
      street: 'Rua das Flores',
      number: '123',
      district: 'Centro',
      city: 'Fortaleza',
      state: 'CE',
      zipCode: '60000-000',
    },
    urgencyFee: 0,
    baseAmount: 120,
    platformFee: 12,
    totalAmount: 132,
    createdAt: '2026-04-28T09:00:00.000Z',
    updatedAt: '2026-04-28T09:00:00.000Z',
  },
  {
    id: 'ord-pro-2',
    status: 'accepted' as any,
    categoryId: 'cat-1',
    areaId: 'area-1',
    description: 'Instalacao de lustre no quarto',
    professionalId: MOCK_PRO_ID,
    addressId: 'addr-2',
    addressSnapshot: {
      street: 'Av. Beira Mar',
      number: '456',
      district: 'Meireles',
      city: 'Fortaleza',
      state: 'CE',
      zipCode: '60165-000',
    },
    urgencyFee: 15,
    baseAmount: 80,
    platformFee: 8,
    totalAmount: 103,
    createdAt: '2026-04-27T14:00:00.000Z',
    updatedAt: '2026-04-27T14:30:00.000Z',
  },
  {
    id: 'ord-pro-3',
    status: 'completed' as any,
    categoryId: 'cat-2',
    areaId: 'area-1',
    description: 'Reparo em disjuntor',
    professionalId: MOCK_PRO_ID,
    addressId: 'addr-3',
    addressSnapshot: {
      street: 'Rua Jose Avelino',
      number: '789',
      district: 'Praia de Iracema',
      city: 'Fortaleza',
      state: 'CE',
      zipCode: '60060-000',
    },
    urgencyFee: 0,
    baseAmount: 150,
    platformFee: 15,
    totalAmount: 165,
    createdAt: '2026-04-25T10:00:00.000Z',
    updatedAt: '2026-04-25T12:00:00.000Z',
  },
];

export const mockProfessionalIntegration: ProfessionalIntegration = {
  orders: {
    getOrders: async (params?: OrderFiltersDto) => {
      if (params?.status) {
        return mockOrders.filter((o) => o.status === params.status);
      }
      return [...mockOrders];
    },
    getById: async (id) => {
      const order = mockOrders.find((o) => o.id === id);
      if (!order) throw new Error('Pedido nao encontrado');
      return {
        ...order,
        clientId: 'client-1',
        photos: [],
      } as OrderDetails;
    },
    respondOnDemand: async (orderId, accepted) => {
      mockOrders = mockOrders.map((o) =>
        o.id === orderId
          ? { ...o, status: accepted ? ('accepted' as any) : ('cancelled' as any), professionalId: MOCK_PRO_ID, updatedAt: new Date().toISOString() }
          : o,
      );
      const order = mockOrders.find((o) => o.id === orderId)!;
      return { ...order, clientId: 'client-1', photos: [] } as OrderDetails;
    },
    respond: async (orderId, payload) => {
      mockOrders = mockOrders.map((o) =>
        o.id === orderId
          ? { ...o, status: payload.response === 'accepted' ? ('accepted' as any) : ('cancelled' as any), professionalId: MOCK_PRO_ID, totalAmount: payload.proposedAmount ?? o.totalAmount, updatedAt: new Date().toISOString() }
          : o,
      );
      const order = mockOrders.find((o) => o.id === orderId)!;
      return { ...order, clientId: 'client-1', photos: [] } as OrderDetails;
    },
    complete: async (orderId) => {
      mockOrders = mockOrders.map((o) =>
        o.id === orderId
          ? { ...o, status: 'completed_by_pro' as any, updatedAt: new Date().toISOString() }
          : o,
      );
      const order = mockOrders.find((o) => o.id === orderId)!;
      return { ...order, clientId: 'client-1', photos: [] } as OrderDetails;
    },
    cancel: async (orderId, _reason) => {
      mockOrders = mockOrders.map((o) =>
        o.id === orderId
          ? { ...o, status: 'cancelled' as any, updatedAt: new Date().toISOString() }
          : o,
      );
      const order = mockOrders.find((o) => o.id === orderId)!;
      return { ...order, clientId: 'client-1', photos: [] } as OrderDetails;
    },
  },
  profile: {
    getMyProfile: async () => ({ ...mockProfile }),
  },
};
