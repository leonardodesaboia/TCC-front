import type { StorageRef } from './api';

export interface ServiceArea {
  id: string;
  name: string;
  iconUrl?: string;
  active: boolean;
  createdAt?: string;
}

export interface ServiceCategory {
  id: string;
  areaId: string;
  name: string;
  iconUrl?: string;
  active: boolean;
  createdAt?: string;
}

export interface ServiceAreaDto {
  id: string;
  name: string;
  icon?: StorageRef | null;
  active?: boolean | null;
  createdAt?: string | null;
}

export interface CreateServiceAreaRequest {
  name: string;
}

export interface UpdateServiceAreaRequest {
  name?: string;
}

export interface ServiceCategoryDto {
  id: string;
  areaId: string;
  name: string;
  icon?: StorageRef | null;
  active?: boolean | null;
  createdAt?: string | null;
}

export interface CreateServiceCategoryRequest {
  areaId: string;
  name: string;
}

export interface UpdateServiceCategoryRequest {
  areaId?: string;
  name?: string;
}
