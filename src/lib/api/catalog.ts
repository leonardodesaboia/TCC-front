import { apiClient } from './client';
import { unwrapItem, unwrapList } from './utils';
import type { ApiResponse, SpringPage } from '@/types/api';
import type {
  CreateServiceAreaRequest,
  CreateServiceCategoryRequest,
  ServiceArea,
  ServiceAreaDto,
  ServiceCategory,
  ServiceCategoryDto,
  UpdateServiceAreaRequest,
  UpdateServiceCategoryRequest,
} from '@/types/catalog';

function mapServiceArea(dto: ServiceAreaDto): ServiceArea {
  return {
    id: dto.id,
    name: dto.name,
    iconUrl: dto.icon?.downloadUrl ?? undefined,
    active: dto.active ?? true,
    createdAt: dto.createdAt ?? undefined,
  };
}

function mapServiceCategory(dto: ServiceCategoryDto): ServiceCategory {
  return {
    id: dto.id,
    areaId: dto.areaId,
    name: dto.name,
    iconUrl: dto.icon?.downloadUrl ?? undefined,
    active: dto.active ?? true,
    createdAt: dto.createdAt ?? undefined,
  };
}

export const catalogApi = {
  async getAreas(): Promise<ServiceArea[]> {
    const response = await apiClient.get<SpringPage<ServiceAreaDto> | ApiResponse<ServiceAreaDto[]> | ServiceAreaDto[]>(
      '/api/v1/service-areas',
      { params: { size: 100, includeInactive: false } },
    );

    return unwrapList(response.data).map(mapServiceArea);
  },

  async getCategories(areaId?: string): Promise<ServiceCategory[]> {
    const response = await apiClient.get<SpringPage<ServiceCategoryDto> | ApiResponse<ServiceCategoryDto[]> | ServiceCategoryDto[]>(
      '/api/v1/service-categories',
      { params: { size: 200, includeInactive: false, ...(areaId ? { areaId } : {}) } },
    );

    return unwrapList(response.data).map(mapServiceCategory);
  },

  async createArea(payload: CreateServiceAreaRequest): Promise<ServiceArea> {
    const response = await apiClient.post<ApiResponse<ServiceAreaDto> | ServiceAreaDto>(
      '/api/v1/service-areas',
      payload,
    );
    return mapServiceArea(unwrapItem(response.data));
  },

  async updateArea(id: string, payload: UpdateServiceAreaRequest): Promise<ServiceArea> {
    const response = await apiClient.put<ApiResponse<ServiceAreaDto> | ServiceAreaDto>(
      `/api/v1/service-areas/${id}`,
      payload,
    );
    return mapServiceArea(unwrapItem(response.data));
  },

  async createCategory(payload: CreateServiceCategoryRequest): Promise<ServiceCategory> {
    const response = await apiClient.post<ApiResponse<ServiceCategoryDto> | ServiceCategoryDto>(
      '/api/v1/service-categories',
      payload,
    );
    return mapServiceCategory(unwrapItem(response.data));
  },

  async updateCategory(id: string, payload: UpdateServiceCategoryRequest): Promise<ServiceCategory> {
    const response = await apiClient.put<ApiResponse<ServiceCategoryDto> | ServiceCategoryDto>(
      `/api/v1/service-categories/${id}`,
      payload,
    );
    return mapServiceCategory(unwrapItem(response.data));
  },
};
