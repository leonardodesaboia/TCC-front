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
import { appendImage } from '@/lib/utils/form-data';
import { professionalIntegration } from '@/lib/integrations/professional';

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

  /**
   * Cria a conta, o perfil e envia os documentos.
   * A conta já existe depois do primeiro passo, então uma falha no envio dos documentos
   * não pode virar erro do cadastro inteiro (tentar de novo daria "e-mail já cadastrado").
   * Nesse caso o cadastro termina normalmente e `documentsUploaded` volta false, para o app
   * orientar o reenvio em Perfil > Documentos.
   */
  async registerProfessional(data: RegisterProfessionalRequest): Promise<{ tokens: AuthTokens; documentsUploaded: boolean; verificationStatus?: string }> {
    const user = await usersApi.createProfessional(data);
    const tokens = await this.login({ email: data.email, password: data.password });
    const professional = await professionalManagementApi.createProfile({
      userId: user.id,
      bio: data.bio,
      specialties: data.specialties,
    });

    try {
      for (const document of data.documents) {
        const formData = new FormData();
        await appendImage(formData, 'file', document, `${document.docType}-${document.docSide}.jpg`);

        await professionalManagementApi.uploadDocument(professional.id, {
          docType: document.docType,
          docSide: document.docSide,
          formData,
        });
      }
    } catch {
      return { tokens, documentsUploaded: false };
    }

    // Re-read after uploads: the environment may activate the account immediately.
    // A failed status refresh must not turn an already-created account into a signup error.
    let verificationStatus: string | undefined;
    try {
      verificationStatus = (await professionalIntegration.profile.getMyProfile()).verificationStatus;
    } catch { /* The dashboard will refresh the status. */ }
    return { tokens, documentsUploaded: true, verificationStatus };
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
