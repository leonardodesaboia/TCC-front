import { apiClient } from './client';
import { toNumber, unwrapItem } from './utils';
import type { ApiResponse } from '@/types/api';
import { getAuthenticatedUserId } from './auth';
import { UserRole, type CreateUserRequest, type RegisterClientRequest, type UpdateUserRequest, type User, type UserResponseDto } from '@/types/user';

function mapUser(dto: UserResponseDto): User {
  return {
    id: dto.id,
    name: dto.name,
    email: dto.email,
    phone: dto.phone,
    role: dto.role,
    avatar: dto.avatar ?? null,
    profileImage: dto.avatar?.downloadUrl ?? undefined,
    active: dto.active,
    isActive: dto.active,
    banReason: dto.banReason ?? null,
    averageRating: toNumber(dto.averageRating),
    reviewCount: toNumber(dto.reviewCount),
    notificationsEnabled: dto.notificationsEnabled ?? undefined,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
    scheduledDeletionAt: dto.scheduledDeletionAt ?? null,
  };
}

function toCreateUserPayload(data: RegisterClientRequest): CreateUserRequest {
  return {
    cpf: data.cpf,
    name: data.name,
    email: data.email,
    phone: data.phone,
    password: data.password,
    role: UserRole.CLIENT,
  };
}

export const usersApi = {
  mapUser,

  async createClient(data: RegisterClientRequest): Promise<User> {
    const response = await apiClient.post<ApiResponse<UserResponseDto> | UserResponseDto>(
      '/api/users',
      toCreateUserPayload(data),
    );

    return mapUser(unwrapItem(response.data));
  },

  async getById(id: string): Promise<User> {
    const response = await apiClient.get<ApiResponse<UserResponseDto> | UserResponseDto>(`/api/users/${id}`);
    return mapUser(unwrapItem(response.data));
  },

  async updateMe(payload: UpdateUserRequest): Promise<User> {
    const userId = await getAuthenticatedUserId();
    const response = await apiClient.put<ApiResponse<UserResponseDto> | UserResponseDto>(
      `/api/users/${userId}`,
      payload,
    );
    return mapUser(unwrapItem(response.data));
  },

  async deleteMe(): Promise<User> {
    const userId = await getAuthenticatedUserId();
    const response = await apiClient.delete<ApiResponse<UserResponseDto> | UserResponseDto>(
      `/api/users/${userId}`,
    );
    return mapUser(unwrapItem(response.data));
  },

  async uploadAvatar(formData: FormData): Promise<User> {
    const userId = await getAuthenticatedUserId();
    const response = await apiClient.post<ApiResponse<UserResponseDto> | UserResponseDto>(
      `/api/users/${userId}/avatar`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return mapUser(unwrapItem(response.data));
  },

  async deleteAvatar(): Promise<User> {
    const userId = await getAuthenticatedUserId();
    const response = await apiClient.delete<ApiResponse<UserResponseDto> | UserResponseDto>(
      `/api/users/${userId}/avatar`,
    );
    return mapUser(unwrapItem(response.data));
  },
};
