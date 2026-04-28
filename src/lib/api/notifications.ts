import { apiClient } from './client';
import { unwrapItem, unwrapList, toNumber } from './utils';
import type { ApiResponse, SpringPage } from '@/types/api';
import type {
  MarkAllNotificationsReadResponse,
  NotificationItem,
  NotificationItemDto,
  NotificationPreference,
  NotificationPreferenceDto,
  PushToken,
  PushTokenDto,
  RegisterPushTokenRequest,
  UpdateNotificationPreferenceRequest,
} from '@/types/notification';

function mapNotification(dto: NotificationItemDto): NotificationItem {
  return {
    id: dto.id,
    type: dto.type,
    title: dto.title,
    body: dto.body,
    data: dto.data ?? undefined,
    sentAt: dto.sentAt ?? undefined,
    readAt: dto.readAt ?? undefined,
    createdAt: dto.createdAt,
  };
}

function mapPreference(dto: NotificationPreferenceDto): NotificationPreference {
  return {
    userId: dto.userId,
    notificationsEnabled: dto.notificationsEnabled,
  };
}

function mapPushToken(dto: PushTokenDto): PushToken {
  return {
    id: dto.id,
    expoToken: dto.expoToken,
    platform: dto.platform,
    createdAt: dto.createdAt,
    lastSeen: dto.lastSeen ?? undefined,
  };
}

export const notificationsApi = {
  async getAll(): Promise<NotificationItem[]> {
    const response = await apiClient.get<SpringPage<NotificationItemDto> | ApiResponse<NotificationItemDto[]> | NotificationItemDto[]>(
      '/api/v1/notifications',
      { params: { size: 50 } },
    );

    return unwrapList<NotificationItemDto>(response.data).map(mapNotification);
  },

  async markRead(id: string): Promise<NotificationItem> {
    const response = await apiClient.patch<ApiResponse<NotificationItemDto> | NotificationItemDto>(
      `/api/v1/notifications/${id}/read`,
    );
    return mapNotification(unwrapItem(response.data));
  },

  async markAllRead(): Promise<MarkAllNotificationsReadResponse> {
    const response = await apiClient.patch<ApiResponse<MarkAllNotificationsReadResponse> | MarkAllNotificationsReadResponse>(
      '/api/v1/notifications/read-all',
    );
    return unwrapItem(response.data);
  },

  async getPreferences(): Promise<NotificationPreference> {
    const response = await apiClient.get<ApiResponse<NotificationPreferenceDto> | NotificationPreferenceDto>(
      '/api/v1/notifications/preferences',
    );
    return mapPreference(unwrapItem(response.data));
  },

  async updatePreferences(payload: UpdateNotificationPreferenceRequest): Promise<NotificationPreference> {
    const response = await apiClient.patch<ApiResponse<NotificationPreferenceDto> | NotificationPreferenceDto>(
      '/api/v1/notifications/preferences',
      payload,
    );
    return mapPreference(unwrapItem(response.data));
  },

  async getPushTokens(): Promise<PushToken[]> {
    const response = await apiClient.get<ApiResponse<PushTokenDto[]> | PushTokenDto[]>(
      '/api/v1/push-tokens',
    );

    return unwrapList<PushTokenDto>(response.data).map(mapPushToken);
  },

  async registerPushToken(payload: RegisterPushTokenRequest): Promise<PushToken> {
    const response = await apiClient.post<ApiResponse<PushTokenDto> | PushTokenDto>(
      '/api/v1/push-tokens',
      payload,
    );

    return mapPushToken(unwrapItem(response.data));
  },

  async deletePushToken(id: string): Promise<void> {
    await apiClient.delete(`/api/v1/push-tokens/${id}`);
  },
};
