import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { conversationsApi } from '@/lib/api/conversations';
import { getApiErrorMessage } from '@/lib/utils/errors';
import { toast } from '@/lib/utils/toast';

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: conversationKeys.messages(conversationId) });
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: conversationKeys.messages(conversationId) });
      queryClient.invalidateQueries({ queryKey: conversationKeys.all });
    },
  });
}
