import { apiClient } from './client';
import { usersApi } from './users';
import type {
  AuthTokens,
  LoginRequest,
  RegisterClientRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
} from '@/types/user';
import {
  ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  getStoredValue,
  setStoredValue,
} from '@/lib/utils/token-storage';

const BASE64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

function decodeBase64(text: string): string {
  let result = '';
  for (let i = 0; i < text.length; i += 4) {
    const piece = text.slice(i, i + 4);
    let num = 0;
    let padding = 0;
    for (let p = 0; p < 4; p++) {
      num <<= 6;
      const ch = piece[p];
      if (!ch || ch === '=') {
        padding++;
      } else {
        num += BASE64_CHARS.indexOf(ch);
      }
    }
    result += String.fromCharCode((num >> 16) & 255);
    if (padding < 2) result += String.fromCharCode((num >> 8) & 255);
    if (padding < 1) result += String.fromCharCode(num & 255);
  }
  return result;
}

export function readTokenPayload(token: string): { sub: string; role: string; email?: string } {
  const parts = token.split('.');
  if (parts.length < 2) throw new Error('Token inválido');
  const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.length % 4 === 0 ? base64 : base64 + '='.repeat(4 - (base64.length % 4));
  return JSON.parse(decodeBase64(padded));
}

export async function getAuthenticatedUserId(): Promise<string> {
  const token = await getStoredValue(ACCESS_TOKEN_KEY);
  if (!token) {
    throw new Error('Sem token de acesso');
  }

  return readTokenPayload(token).sub;
}

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
