export const queryKeys = {
  user: ['user'] as const,
  orders: {
    all: ['orders'] as const,
    mine: (params?: object) => ['orders', 'my-orders', params] as const,
    detail: (id: string) => ['orders', id] as const,
    proposals: (id: string) => ['orders', id, 'proposals'] as const,
  },
  professionals: {
    all: ['professionals'] as const,
    detail: (id: string) => ['professionals', id] as const,
    search: (params: object) => ['professionals', 'search', params] as const,
    myProfile: ['professionals', 'my-profile'] as const,
  },
  services: {
    all: ['services'] as const,
    list: (params?: object) => ['services', 'list', params] as const,
    detail: (id: string) => ['services', id] as const,
  },
  professions: {
    all: ['professions'] as const,
    detail: (id: string) => ['professions', id] as const,
  },
  areas: {
    all: ['areas'] as const,
    detail: (id: string) => ['areas', id] as const,
  },
  categories: {
    all: ['categories'] as const,
    list: (areaId?: string) => ['categories', areaId ?? 'all'] as const,
  },
  addresses: {
    all: ['addresses'] as const,
  },
  professionalOrders: {
    all: ['professional-orders'] as const,
    list: (params?: object) => ['professional-orders', 'list', params] as const,
    detail: (id: string) => ['professional-orders', id] as const,
  },
} as const;
