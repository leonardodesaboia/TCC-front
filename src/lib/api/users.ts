import { apiClient } from './client';
import { toNumber, unwrapItem } from './utils';
import type { ApiResponse } from '@/types/api';
import { USE_MOCKS_ENABLED } from '@/lib/constants/config';
import { deleteMockAvatar, deleteMockUser, getMockUser, updateMockUser, uploadMockAvatar } from '@/lib/mocks/runtime';
import { getAuthenticatedUserId } from '@/lib/utils/auth-session';
import { UserRole, type CreateUserRequest, type RegisterClientRequest, type RegisterProfessionalRequest, type UpdateUserRequest, type User, type UserResponseDto } from '@/types/user';

function mapUser(dto: UserResponseDto): User {
  return {
    id: dto.id,
    name: dto.name,
    email: dto.email,
    phone: dto.phone,
    birthDate: dto.birthDate ?? undefined,
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

function toApiBirthDate(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (digits.length !== 8) return value;
  return `${digits.slice(4, 8)}-${digits.slice(2, 4)}-${digits.slice(0, 2)}`;
}

function toCreateUserPayload(data: RegisterClientRequest): CreateUserRequest {
  return {
    cpf: data.cpf,
    name: data.name,
    email: data.email,
    phone: data.phone,
    birthDate: toApiBirthDate(data.birthDate),
    password: data.password,
    role: UserRole.CLIENT,
  };
}

export const usersApi = {
  mapUser,

  async createProfessional(data: RegisterProfessionalRequest): Promise<User> {
    if (USE_MOCKS_ENABLED) {
      return getMockUser();
    }

    const payload: CreateUserRequest = {
      cpf: data.cpf,
      name: data.name,
      email: data.email,
      phone: data.phone,
      birthDate: toApiBirthDate(data.birthDate),
      password: data.password,
      role: UserRole.PROFESSIONAL,
    };

    const response = await apiClient.post<ApiResponse<UserResponseDto> | UserResponseDto>(
      '/api/users',
      payload,
    );

    return mapUser(unwrapItem(response.data));
  },

  async createClient(data: RegisterClientRequest): Promise<User> {
    if (USE_MOCKS_ENABLED) {
      return getMockUser();
    }

    const response = await apiClient.post<ApiResponse<UserResponseDto> | UserResponseDto>(
      '/api/users',
      toCreateUserPayload(data),
    );

    return mapUser(unwrapItem(response.data));
  },

  async getById(id: string): Promise<User> {
    if (USE_MOCKS_ENABLED) {
      return getMockUser();
    }

    const response = await apiClient.get<ApiResponse<UserResponseDto> | UserResponseDto>(`/api/users/${id}`);
    return mapUser(unwrapItem(response.data));
  },

  async updateMe(payload: UpdateUserRequest): Promise<User> {
    if (USE_MOCKS_ENABLED) {
      return updateMockUser(payload);
    }

    const userId = await getAuthenticatedUserId();
    const response = await apiClient.put<ApiResponse<UserResponseDto> | UserResponseDto>(
      `/api/users/${userId}`,
      payload,
    );
    return mapUser(unwrapItem(response.data));
  },

  async deleteMe(): Promise<User> {
    if (USE_MOCKS_ENABLED) {
      return deleteMockUser();
    }

    const userId = await getAuthenticatedUserId();
    const response = await apiClient.delete<ApiResponse<UserResponseDto> | UserResponseDto>(
      `/api/users/${userId}`,
    );
    return mapUser(unwrapItem(response.data));
  },

  async uploadAvatar(formData: FormData): Promise<User> {
    if (USE_MOCKS_ENABLED) {
      return uploadMockAvatar();
    }

    const userId = await getAuthenticatedUserId();
    const response = await apiClient.post<ApiResponse<UserResponseDto> | UserResponseDto>(
      `/api/users/${userId}/avatar`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return mapUser(unwrapItem(response.data));
  },

  async deleteAvatar(): Promise<User> {
    if (USE_MOCKS_ENABLED) {
      return deleteMockAvatar();
    }

    const userId = await getAuthenticatedUserId();
    const response = await apiClient.delete<ApiResponse<UserResponseDto> | UserResponseDto>(
      `/api/users/${userId}/avatar`,
    );
    return mapUser(unwrapItem(response.data));
  },
};
