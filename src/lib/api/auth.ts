import { apiClient } from './client';
import { usersApi } from './users';
import { professionalManagementApi } from './professional-management';
import type {
  AuthTokens,
  LoginRequest,
  RegisterClientRequest,
  RegisterProfessionalRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
} from '@/types/user';
import {
  ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  getStoredValue,
  setStoredValue,
} from '@/lib/utils/token-storage';
import { getAuthenticatedUserId } from '@/lib/utils/auth-session';

export const authApi = {
  async login(data: LoginRequest): Promise<AuthTokens> {
    const response = await apiClient.post('/api/auth/login', data);
    const tokens: AuthTokens = response.data;
    await setStoredValue(ACCESS_TOKEN_KEY, tokens.accessToken);
    await setStoredValue(REFRESH_TOKEN_KEY, tokens.refreshToken);
    return tokens;
  },

  async register(data: RegisterClientRequest): Promise<AuthTokens> {
    await usersApi.createClient(data);
    return this.login({ email: data.email, password: data.password });
  },

  async registerProfessional(data: RegisterProfessionalRequest): Promise<AuthTokens> {
    const user = await usersApi.createProfessional(data);
    const professional = await professionalManagementApi.createProfile({
      userId: user.id,
      bio: data.bio,
      specialties: data.specialties,
    });
    const tokens = await this.login({ email: data.email, password: data.password });

    for (const document of data.documents) {
      const formData = new FormData();
      formData.append('file', {
        uri: document.uri,
        type: document.mimeType ?? 'image/jpeg',
        name: document.fileName ?? `${document.docType}-${document.docSide}.jpg`,
      } as any);

      await professionalManagementApi.uploadDocument(professional.id, {
        docType: document.docType,
        docSide: document.docSide,
        formData,
      });
    }

    return tokens;
  },

  async getProfile() {
    const userId = await getAuthenticatedUserId();
    return usersApi.getById(userId);
  },

  async logout(): Promise<void> {
    const refreshToken = await getStoredValue(REFRESH_TOKEN_KEY);
    if (refreshToken) {
      await apiClient.post('/api/auth/logout', { refreshToken });
    }
  },

  async forgotPassword(data: ForgotPasswordRequest): Promise<void> {
    await apiClient.post('/api/auth/forgot-password', data);
  },

  async resetPassword(data: ResetPasswordRequest): Promise<void> {
    await apiClient.post('/api/auth/reset-password', data);
  },
};
