import { beforeEach, describe, expect, it, vi } from 'vitest';
vi.mock('../client', () => ({ apiClient: { post: vi.fn() } }));
vi.mock('../users', () => ({ usersApi: { createProfessional: vi.fn() } }));
vi.mock('../professional-management', () => ({ professionalManagementApi: { createProfile: vi.fn(), uploadDocument: vi.fn() } }));
vi.mock('@/lib/integrations/professional', () => ({ professionalIntegration: { profile: { getMyProfile: vi.fn() } } }));
vi.mock('@/lib/utils/form-data', () => ({ appendImage: vi.fn() }));
vi.mock('@/lib/utils/auth-session', () => ({ getAuthenticatedUserId: vi.fn() }));
vi.mock('@/lib/utils/token-storage', () => ({ ACCESS_TOKEN_KEY: 'access', REFRESH_TOKEN_KEY: 'refresh', setStoredValue: vi.fn() }));
import { authApi } from '../auth';
import { usersApi } from '../users';
import { apiClient } from '../client';
import { professionalManagementApi } from '../professional-management';
import { professionalIntegration } from '@/lib/integrations/professional';
import type { RegisterProfessionalRequest } from '@/types/user';

const payload = { name: 'Conta de teste', email: 'fixture@example.test', password: 'Fixture-only1!', documents: [{ docType: 'rg', docSide: 'front', uri: 'fixture-front' }, { docType: 'rg', docSide: 'back', uri: 'fixture-back' }] } as RegisterProfessionalRequest;
beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(usersApi.createProfessional).mockResolvedValue({ id: 'user-fixture' } as never);
  vi.mocked(apiClient.post).mockResolvedValue({ data: { accessToken: 'fixture', refreshToken: 'fixture' } });
  vi.mocked(professionalManagementApi.createProfile).mockResolvedValue({ id: 'professional-fixture', verificationStatus: 'pending' } as never);
});
describe('professional signup recovery', () => {
  it('reads the actual status after both uploads instead of assuming pending', async () => {
    vi.mocked(professionalIntegration.profile.getMyProfile).mockResolvedValue({ verificationStatus: 'approved' } as never);
    const result = await authApi.registerProfessional(payload);
    expect(professionalManagementApi.uploadDocument).toHaveBeenCalledTimes(2);
    expect(result).toMatchObject({ documentsUploaded: true, verificationStatus: 'approved' });
  });
  it('does not fail an already created account when status refresh is offline', async () => {
    vi.mocked(professionalIntegration.profile.getMyProfile).mockRejectedValue(new Error('offline'));
    await expect(authApi.registerProfessional(payload)).resolves.toMatchObject({ documentsUploaded: true, verificationStatus: undefined });
    expect(usersApi.createProfessional).toHaveBeenCalledTimes(1);
  });
  it('retains login and signals partial uploads without trying to recreate the account', async () => {
    vi.mocked(professionalManagementApi.uploadDocument).mockResolvedValueOnce({} as never).mockRejectedValueOnce(new Error('upload failed'));
    await expect(authApi.registerProfessional(payload)).resolves.toMatchObject({ documentsUploaded: false });
    expect(usersApi.createProfessional).toHaveBeenCalledTimes(1);
    expect(professionalIntegration.profile.getMyProfile).not.toHaveBeenCalled();
  });
});
