import { apiClient } from './client';
import { unwrapItem, unwrapList, toNumber } from './utils';
import type { ApiResponse, SpringPage } from '@/types/api';
import { USE_MOCKS_ENABLED } from '@/lib/constants/config';
import { mockConversationsApi } from '@/lib/mocks/runtime';
import type {
  Conversation,
  ConversationDto,
  ConversationSummary,
  ConversationSummaryDto,
  Message,
  MessageDto,
  ReadReceiptEvent,
  SendMessageRequest,
} from '@/types/conversation';

function mapConversationSummary(dto: ConversationSummaryDto): ConversationSummary {
  const lastMessageContent = dto.lastMessage?.content?.trim();
  const lastMessagePreview = dto.lastMessage
    ? lastMessageContent || (dto.lastMessage.msgType === 'image' ? 'Imagem enviada' : 'Mensagem do sistema')
    : undefined;

  return {
    id: dto.id,
    orderId: dto.orderId,
    otherParticipantId: dto.otherParticipantId,
    lastMessage: lastMessagePreview,
    unreadCount: toNumber(dto.unreadCount),
  };
}

function mapConversation(dto: ConversationDto): Conversation {
  return {
    id: dto.id,
    orderId: dto.orderId,
    clientId: dto.clientId,
    professionalUserId: dto.professionalUserId,
    createdAt: dto.createdAt,
  };
}

function mapMessage(dto: MessageDto): Message {
  return {
    id: dto.id,
    conversationId: dto.conversationId,
    senderId: dto.senderId,
    msgType: dto.msgType,
    content: dto.content ?? undefined,
    attachment: dto.attachment ?? null,
    attachmentSizeBytes: dto.attachmentSizeBytes != null ? toNumber(dto.attachmentSizeBytes) : undefined,
    attachmentMimeType: dto.attachmentMimeType ?? undefined,
    sentAt: dto.sentAt,
    deliveredAt: dto.deliveredAt ?? undefined,
    readAt: dto.readAt ?? undefined,
  };
}

export const conversationsApi = {
  async getAll(): Promise<ConversationSummary[]> {
    if (USE_MOCKS_ENABLED) {
      return mockConversationsApi.getAll();
    }

    const response = await apiClient.get<SpringPage<ConversationSummaryDto> | ApiResponse<ConversationSummaryDto[]> | ConversationSummaryDto[]>(
      '/api/v1/conversations',
      { params: { size: 50 } },
    );
    return unwrapList<ConversationSummaryDto>(response.data).map(mapConversationSummary);
  },

  async getById(id: string): Promise<Conversation> {
    if (USE_MOCKS_ENABLED) {
      return mockConversationsApi.getById(id);
    }

    const response = await apiClient.get<ApiResponse<ConversationDto> | ConversationDto>(
      `/api/v1/conversations/${id}`,
    );
    return mapConversation(unwrapItem(response.data));
  },

  async getMessages(id: string): Promise<Message[]> {
    if (USE_MOCKS_ENABLED) {
      return mockConversationsApi.getMessages(id);
    }

    const response = await apiClient.get<SpringPage<MessageDto> | ApiResponse<MessageDto[]> | MessageDto[]>(
      `/api/v1/conversations/${id}/messages`,
      { params: { size: 100 } },
    );
    return unwrapList<MessageDto>(response.data).map(mapMessage).sort((a, b) =>
      new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime()
    );
  },

  async sendMessage(id: string, payload: SendMessageRequest): Promise<Message> {
    if (USE_MOCKS_ENABLED) {
      return mockConversationsApi.sendMessage(id, payload);
    }

    const response = await apiClient.post<ApiResponse<MessageDto> | MessageDto>(
      `/api/v1/conversations/${id}/messages`,
      payload,
    );
    return mapMessage(unwrapItem(response.data));
  },

  async markRead(id: string): Promise<ReadReceiptEvent> {
    if (USE_MOCKS_ENABLED) {
      return mockConversationsApi.markRead(id);
    }

    const response = await apiClient.patch<ApiResponse<ReadReceiptEvent> | ReadReceiptEvent>(
      `/api/v1/conversations/${id}/read`,
    );
    return unwrapItem(response.data);
  },
};
