import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { conversationsApi } from '@/lib/api/conversations';
import { getApiErrorMessage } from '@/lib/utils/errors';
import { toast } from '@/lib/utils/toast';
import type { Message } from '@/types/conversation';

const conversationKeys = {
  all: ['conversations'] as const,
  detail: (id: string) => ['conversations', id] as const,
  messages: (id: string) => ['conversations', id, 'messages'] as const,
};

const CONVERSATION_LIST_POLL_MS = 15000;
const CONVERSATION_MESSAGES_POLL_MS = 4000;

export function useConversations() {
  return useQuery({
    queryKey: conversationKeys.all,
    queryFn: () => conversationsApi.getAll(),
    refetchInterval: CONVERSATION_LIST_POLL_MS,
  });
}

export function useConversation(id: string) {
  return useQuery({
    queryKey: conversationKeys.detail(id),
    queryFn: () => conversationsApi.getById(id),
    enabled: !!id,
  });
}

export function useConversationMessages(id: string) {
  return useQuery({
    queryKey: conversationKeys.messages(id),
    queryFn: () => conversationsApi.getMessages(id),
    enabled: !!id,
    refetchInterval: CONVERSATION_MESSAGES_POLL_MS,
  });
}

export function useSendMessage(conversationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (content: string) => conversationsApi.sendMessage(conversationId, { content }),
    onSuccess: (newMessage) => {
      queryClient.setQueryData(
        conversationKeys.messages(conversationId),
        (old: Message[] | undefined) =>
          [...(old ?? []), newMessage].sort(
            (a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime(),
          ),
      );
      queryClient.invalidateQueries({ queryKey: conversationKeys.all });
    },
    onError: (error: unknown) => {
      toast.error('Erro ao enviar mensagem', getApiErrorMessage(error));
    },
  });
}

export function useMarkConversationRead(conversationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => conversationsApi.markRead(conversationId),
    onSuccess: (event) => {
      queryClient.setQueryData(
        conversationKeys.messages(conversationId),
        (old: Message[] | undefined) =>
          (old ?? []).map((message) =>
            message.senderId !== event.readerUserId && !message.readAt
              ? { ...message, readAt: event.readAt }
              : message,
          ),
      );
      queryClient.setQueryData(
        conversationKeys.all,
        (old: { id: string; unreadCount: number }[] | undefined) =>
          (old ?? []).map((conversation) =>
            conversation.id === conversationId
              ? { ...conversation, unreadCount: 0 }
              : conversation,
          ),
      );
    },
  });
}
