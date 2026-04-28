import type { StorageRef } from './api';

export type MessageType = 'text' | 'image' | 'system';

export interface ConversationSummary {
  id: string;
  orderId: string;
  otherParticipantId: string;
  lastMessage?: string;
  unreadCount: number;
}

export interface ConversationSummaryDto {
  id: string;
  orderId: string;
  otherParticipantId: string;
  lastMessage?: string | null;
  unreadCount?: number | string | null;
}

export interface Conversation {
  id: string;
  orderId: string;
  clientId: string;
  professionalUserId: string;
  createdAt: string;
}

export interface ConversationDto {
  id: string;
  orderId: string;
  clientId: string;
  professionalUserId: string;
  createdAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  msgType: MessageType;
  content?: string;
  attachment?: StorageRef | null;
  attachmentSizeBytes?: number;
  attachmentMimeType?: string;
  sentAt: string;
  deliveredAt?: string;
  readAt?: string;
}

export interface MessageDto {
  id: string;
  conversationId: string;
  senderId: string;
  msgType: MessageType;
  content?: string | null;
  attachment?: StorageRef | null;
  attachmentSizeBytes?: number | string | null;
  attachmentMimeType?: string | null;
  sentAt: string;
  deliveredAt?: string | null;
  readAt?: string | null;
}

export interface SendMessageRequest {
  content: string;
}

export interface ReadReceiptEvent {
  eventType: string;
  conversationId: string;
  readerUserId: string;
  readAt: string;
  affectedCount: number;
}
