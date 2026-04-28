export type NotificationType =
  | 'new_request'
  | 'request_accepted'
  | 'request_rejected'
  | 'request_status_update'
  | 'new_message'
  | 'payment_released'
  | 'dispute_opened'
  | 'dispute_resolved'
  | 'verification_result';

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  sentAt?: string;
  readAt?: string;
  createdAt: string;
}

export interface NotificationItemDto {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, unknown> | null;
  sentAt?: string | null;
  readAt?: string | null;
  createdAt: string;
}

export interface NotificationPreference {
  userId: string;
  notificationsEnabled: boolean;
}

export interface NotificationPreferenceDto {
  userId: string;
  notificationsEnabled: boolean;
}

export interface UpdateNotificationPreferenceRequest {
  notificationsEnabled: boolean;
}

export interface MarkAllNotificationsReadResponse {
  markedCount: number;
}

export type PushPlatform = 'android' | 'ios';

export interface PushToken {
  id: string;
  expoToken: string;
  platform: PushPlatform;
  createdAt: string;
  lastSeen?: string;
}

export interface PushTokenDto {
  id: string;
  expoToken: string;
  platform: PushPlatform;
  createdAt: string;
  lastSeen?: string | null;
}

export interface RegisterPushTokenRequest {
  expoToken: string;
  platform: PushPlatform;
}
