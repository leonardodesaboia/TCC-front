import type { StorageRef } from './api';

export enum UserRole {
  CLIENT = 'client',
  PROFESSIONAL = 'professional',
  ADMIN = 'admin',
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar?: StorageRef | null;
  profileImage?: string;
  active: boolean;
  isActive: boolean;
  banReason?: string | null;
  averageRating?: number;
  reviewCount?: number;
  notificationsEnabled?: boolean;
  createdAt: string;
  updatedAt: string;
  scheduledDeletionAt?: string | null;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  tokenType?: string;
  expiresIn: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterClientRequest {
  cpf: string;
  name: string;
  email: string;
  phone: string;
  birthDate: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  code: string;
  newPassword: string;
}

export interface CreateUserRequest {
  cpf: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  role: UserRole;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  phone?: string;
}

export interface UserResponseDto {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar?: StorageRef | null;
  active: boolean;
  banReason?: string | null;
  averageRating?: number | string | null;
  reviewCount?: number | string | null;
  notificationsEnabled?: boolean | null;
  createdAt: string;
  updatedAt: string;
  scheduledDeletionAt?: string | null;
}
