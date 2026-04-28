import { AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import { UserRole, type UpdateUserRequest, type User } from '@/types/user';
import type {
  MarkAllNotificationsReadResponse,
  NotificationItem,
  NotificationPreference,
  PushToken,
  RegisterPushTokenRequest,
  UpdateNotificationPreferenceRequest,
} from '@/types/notification';
import type {
  Conversation,
  ConversationSummary,
  Message,
  ReadReceiptEvent,
  SendMessageRequest,
} from '@/types/conversation';
import type { CreateReviewRequest, ReviewSummary } from '@/types/review';
import type { AddTextEvidenceRequest, Dispute, DisputeEvidence, OpenDisputeRequest } from '@/types/dispute';

const MOCK_USER_ID = 'dev-client';

let mockUser: User = {
  id: MOCK_USER_ID,
  name: 'Cliente Demo',
  email: 'cliente.demo@allset.local',
  phone: '85999999999',
  role: UserRole.CLIENT,
  active: true,
  isActive: true,
  notificationsEnabled: true,
  createdAt: '2026-04-24T00:00:00.000Z',
  updatedAt: '2026-04-24T00:00:00.000Z',
};

let mockNotifications: NotificationItem[] = [
  {
    id: 'notif-1',
    type: 'request_accepted',
    title: 'Pedido aceito',
    body: 'Carlos Mendes aceitou seu pedido de elétrica.',
    sentAt: '2026-04-27T10:40:00.000Z',
    createdAt: '2026-04-27T10:40:00.000Z',
  },
  {
    id: 'notif-2',
    type: 'new_message',
    title: 'Nova mensagem',
    body: 'Você recebeu uma nova mensagem sobre o pedido ord-1.',
    sentAt: '2026-04-27T10:50:00.000Z',
    createdAt: '2026-04-27T10:50:00.000Z',
  },
];

let mockPushTokens: PushToken[] = [];

let mockConversations: Conversation[] = [
  {
    id: 'conv-1',
    orderId: 'ord-1',
    clientId: MOCK_USER_ID,
    professionalUserId: 'pro-1',
    createdAt: '2026-04-27T10:35:00.000Z',
  },
];

let mockMessagesByConversationId: Record<string, Message[]> = {
  'conv-1': [
    {
      id: 'msg-1',
      conversationId: 'conv-1',
      senderId: 'pro-1',
      msgType: 'text',
      content: 'Olá! Posso chegar em 20 minutos.',
      sentAt: '2026-04-27T10:36:00.000Z',
    },
    {
      id: 'msg-2',
      conversationId: 'conv-1',
      senderId: MOCK_USER_ID,
      msgType: 'text',
      content: 'Perfeito, pode vir.',
      sentAt: '2026-04-27T10:38:00.000Z',
      readAt: '2026-04-27T10:39:00.000Z',
    },
  ],
};

let mockReviews: ReviewSummary[] = [
  {
    id: 'review-1',
    orderId: 'ord-1',
    reviewerId: MOCK_USER_ID,
    revieweeId: 'pro-1',
    rating: 5,
    comment: 'Atendimento rapido e caprichoso.',
    submittedAt: '2026-04-27T13:00:00.000Z',
    publishedAt: '2026-04-27T13:05:00.000Z',
  },
];

let mockDisputesByOrderId: Record<string, Dispute> = {};
let mockEvidencesByDisputeId: Record<string, DisputeEvidence[]> = {};

function now() {
  return new Date().toISOString();
}

function nextId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}

function createAxiosError(status: number, message: string) {
  const response = {
    status,
    statusText: message,
    data: { message },
    headers: {},
    config: { headers: {} } as InternalAxiosRequestConfig,
  } as AxiosResponse;

  return new AxiosError(message, String(status), response.config, undefined, response);
}

function buildConversationSummary(conversation: Conversation): ConversationSummary {
  const messages = mockMessagesByConversationId[conversation.id] ?? [];
  const lastMessage = messages[messages.length - 1];
  const unreadCount = messages.filter((message) => message.senderId !== MOCK_USER_ID && !message.readAt).length;

  return {
    id: conversation.id,
    orderId: conversation.orderId,
    otherParticipantId: conversation.professionalUserId,
    lastMessage: lastMessage?.content,
    unreadCount,
  };
}

export function getMockUser(): User {
  return { ...mockUser };
}

export function updateMockUser(payload: UpdateUserRequest): User {
  mockUser = {
    ...mockUser,
    ...payload,
    updatedAt: now(),
  };
  return getMockUser();
}

export function deleteMockUser(): User {
  mockUser = {
    ...mockUser,
    active: false,
    isActive: false,
    scheduledDeletionAt: now(),
    updatedAt: now(),
  };
  return getMockUser();
}

export function uploadMockAvatar(): User {
  mockUser = {
    ...mockUser,
    updatedAt: now(),
  };
  return getMockUser();
}

export function deleteMockAvatar(): User {
  mockUser = {
    ...mockUser,
    avatar: null,
    profileImage: undefined,
    updatedAt: now(),
  };
  return getMockUser();
}

export const mockNotificationsApi = {
  getAll(): NotificationItem[] {
    return [...mockNotifications];
  },
  markRead(id: string): NotificationItem {
    const timestamp = now();
    mockNotifications = mockNotifications.map((item) =>
      item.id === id ? { ...item, readAt: item.readAt ?? timestamp } : item,
    );
    return mockNotifications.find((item) => item.id === id) ?? mockNotifications[0];
  },
  markAllRead(): MarkAllNotificationsReadResponse {
    const timestamp = now();
    const unread = mockNotifications.filter((item) => !item.readAt).length;
    mockNotifications = mockNotifications.map((item) => ({ ...item, readAt: item.readAt ?? timestamp }));
    return { markedCount: unread };
  },
  getPreferences(): NotificationPreference {
    return {
      userId: mockUser.id,
      notificationsEnabled: mockUser.notificationsEnabled ?? true,
    };
  },
  updatePreferences(payload: UpdateNotificationPreferenceRequest): NotificationPreference {
    mockUser = {
      ...mockUser,
      notificationsEnabled: payload.notificationsEnabled,
      updatedAt: now(),
    };
    return this.getPreferences();
  },
  getPushTokens(): PushToken[] {
    return [...mockPushTokens];
  },
  registerPushToken(payload: RegisterPushTokenRequest): PushToken {
    const token: PushToken = {
      id: nextId('push'),
      expoToken: payload.expoToken,
      platform: payload.platform,
      createdAt: now(),
    };
    mockPushTokens = [token, ...mockPushTokens];
    return token;
  },
  deletePushToken(id: string): void {
    mockPushTokens = mockPushTokens.filter((item) => item.id !== id);
  },
};

export const mockConversationsApi = {
  getAll(): ConversationSummary[] {
    return mockConversations.map(buildConversationSummary);
  },
  getById(id: string): Conversation {
    const conversation = mockConversations.find((item) => item.id === id);
    if (!conversation) {
      throw createAxiosError(404, 'Conversa não encontrada');
    }
    return conversation;
  },
  getMessages(id: string): Message[] {
    return [...(mockMessagesByConversationId[id] ?? [])];
  },
  sendMessage(id: string, payload: SendMessageRequest): Message {
    const message: Message = {
      id: nextId('msg'),
      conversationId: id,
      senderId: MOCK_USER_ID,
      msgType: 'text',
      content: payload.content,
      sentAt: now(),
    };
    mockMessagesByConversationId = {
      ...mockMessagesByConversationId,
      [id]: [...(mockMessagesByConversationId[id] ?? []), message],
    };
    return message;
  },
  markRead(id: string): ReadReceiptEvent {
    const timestamp = now();
    const existing = mockMessagesByConversationId[id] ?? [];
    let affectedCount = 0;

    mockMessagesByConversationId = {
      ...mockMessagesByConversationId,
      [id]: existing.map((message) => {
        if (message.senderId === MOCK_USER_ID || message.readAt) {
          return message;
        }
        affectedCount += 1;
        return { ...message, readAt: timestamp };
      }),
    };

    return {
      eventType: 'messages_read',
      conversationId: id,
      readerUserId: MOCK_USER_ID,
      readAt: timestamp,
      affectedCount,
    };
  },
};

export const mockReviewsApi = {
  getOrderReviews(orderId: string): ReviewSummary[] {
    return mockReviews.filter((review) => review.orderId === orderId);
  },
  getProfessionalReviews(professionalId: string): ReviewSummary[] {
    return mockReviews.filter((review) => review.revieweeId === professionalId);
  },
  createOrderReview(orderId: string, payload: CreateReviewRequest): ReviewSummary {
    const review: ReviewSummary = {
      id: nextId('review'),
      orderId,
      reviewerId: MOCK_USER_ID,
      revieweeId: orderId === 'ord-2' ? 'pro-2' : 'pro-1',
      rating: payload.rating,
      comment: payload.comment,
      submittedAt: now(),
      publishedAt: now(),
    };
    mockReviews = [review, ...mockReviews];
    return review;
  },
};

export const mockDisputesApi = {
  getByOrderId(orderId: string): Dispute {
    const dispute = mockDisputesByOrderId[orderId];
    if (!dispute) {
      throw createAxiosError(404, 'Disputa não encontrada');
    }
    return dispute;
  },
  open(orderId: string, payload: OpenDisputeRequest): Dispute {
    const dispute: Dispute = {
      id: nextId('disp'),
      orderId,
      openedBy: MOCK_USER_ID,
      reason: payload.reason,
      status: 'open',
      openedAt: now(),
    };
    mockDisputesByOrderId = {
      ...mockDisputesByOrderId,
      [orderId]: dispute,
    };
    mockEvidencesByDisputeId = {
      ...mockEvidencesByDisputeId,
      [dispute.id]: [],
    };
    return dispute;
  },
  getEvidences(disputeId: string): DisputeEvidence[] {
    return [...(mockEvidencesByDisputeId[disputeId] ?? [])];
  },
  addTextEvidence(disputeId: string, payload: AddTextEvidenceRequest): DisputeEvidence {
    const evidence: DisputeEvidence = {
      id: nextId('evidence'),
      disputeId,
      senderId: MOCK_USER_ID,
      evidenceType: 'text',
      content: payload.content,
      sentAt: now(),
    };
    mockEvidencesByDisputeId = {
      ...mockEvidencesByDisputeId,
      [disputeId]: [...(mockEvidencesByDisputeId[disputeId] ?? []), evidence],
    };
    return evidence;
  },
};
