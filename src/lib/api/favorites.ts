import { apiClient } from './client';
import { mapProfessionalProfileRecord, mapProfessionalSummary } from './professionals';
import { unwrapList } from './utils';
import type { ProfessionalProfileRecordDto } from '@/types/professional-management';
import type { ProfessionalSummary } from '@/types/professional';
import type { SpringPage } from '@/types/api';

interface FavoriteStatusDto {
  professionalId: string;
  favorite: boolean;
}

interface FavoriteProfessionalDto {
  id: string;
  clientId: string;
  professional: ProfessionalProfileRecordDto;
  createdAt: string;
}

export const favoritesApi = {
  async getStatus(professionalId: string): Promise<FavoriteStatusDto> {
    const response = await apiClient.get<FavoriteStatusDto>(
      `/api/v1/professionals/${professionalId}/favorite`,
    );
    return response.data;
  },

  async favorite(professionalId: string): Promise<void> {
    await apiClient.post(`/api/v1/professionals/${professionalId}/favorite`);
  },

  async unfavorite(professionalId: string): Promise<void> {
    await apiClient.delete(`/api/v1/professionals/${professionalId}/favorite`);
  },

  async list(): Promise<ProfessionalSummary[]> {
    const response = await apiClient.get<SpringPage<FavoriteProfessionalDto>>(
      '/api/v1/favorite-professionals',
      { params: { size: 50, page: 0 } },
    );
    const items = unwrapList<FavoriteProfessionalDto>(response.data);
    return items.map((item) =>
      mapProfessionalSummary(mapProfessionalProfileRecord(item.professional)),
    );
  },
};
