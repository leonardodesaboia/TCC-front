import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Send } from 'lucide-react-native';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingScreen } from '@/components/feedback/LoadingScreen';
import { Header } from '@/components/layout/Header';
import { Screen } from '@/components/layout/Screen';
import { Text } from '@/components/ui';
import { useConversation, useConversationMessages, useMarkConversationRead, useSendMessage } from '@/lib/hooks/useConversations';
import { useAuth } from '@/providers/AuthProvider';
import { colors, radius, spacing } from '@/theme';

function formatDate(value: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

export default function ProfessionalConversationDetailScreen() {
  const router = useRouter();
  const { id, from } = useLocalSearchParams<{ id: string; from?: string }>();
  const { user } = useAuth();
  const conversationQuery = useConversation(id);
  const messagesQuery = useConversationMessages(id);
  const markRead = useMarkConversationRead(id);
  const sendMessage = useSendMessage(id);
  const [content, setContent] = useState('');
  const scrollRef = useRef<ScrollView>(null);
  const lastMarkedMessageIdRef = useRef<string | null>(null);

  const messages = messagesQuery.data ?? [];
  const messageCount = messages.length;
  const lastUnreadIncomingMessageId = [...messages]
    .reverse()
    .find((message) => message.senderId !== user?.id && !message.readAt)?.id;

  useEffect(() => {
    if (!lastUnreadIncomingMessageId) {
      lastMarkedMessageIdRef.current = null;
      return;
    }

    if (lastMarkedMessageIdRef.current === lastUnreadIncomingMessageId || markRead.isPending) {
      return;
    }

    lastMarkedMessageIdRef.current = lastUnreadIncomingMessageId;
    markRead.mutate(undefined, {
      onError: () => {
        lastMarkedMessageIdRef.current = null;
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastUnreadIncomingMessageId, markRead.isPending]);

  useEffect(() => {
    if (messageCount > 0) {
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messageCount]);

  if (conversationQuery.isLoading || messagesQuery.isLoading) {
    return <LoadingScreen message="Carregando conversa..." />;
  }

  if (conversationQuery.isError || messagesQuery.isError) {
    return <ErrorState message="Nao foi possivel carregar a conversa." onRetry={() => {
      void conversationQuery.refetch();
      void messagesQuery.refetch();
    }} />;
  }

  const conversation = conversationQuery.data;
  if (!conversation) return <ErrorState message="Conversa nao encontrada." />;

  const handleBack = () => {
    if (from === 'order') {
      router.replace(`/(professional)/(orders)/${conversation.orderId}` as never);
    }
  };

  return (
    <Screen edges={['top']} scroll={false} style={styles.screen}>
      <Header
        title={`Conversa ${conversation.orderId.slice(0, 8)}`}
        showBack
        onBackPress={from === 'order' ? handleBack : undefined}
      />

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.messages}
        showsVerticalScrollIndicator={false}
      >
        {messages.length === 0 ? (
          <View style={styles.emptyChat}>
            <Text variant="bodySm" color={colors.neutral[400]}>
              Nenhuma mensagem ainda. Comece a conversa!
            </Text>
          </View>
        ) : null}
        {messages.map((message) => {
          const isMine = message.senderId === user?.id;
          return (
            <View key={message.id} style={[styles.messageWrap, isMine ? styles.mineWrap : styles.otherWrap]}>
              <View style={[styles.messageBubble, isMine ? styles.mineBubble : styles.otherBubble]}>
                {message.msgType === 'system' ? (
                  <Text variant="labelSm" color={colors.neutral[500]} style={styles.systemText}>
                    {message.content ?? '[sistema]'}
                  </Text>
                ) : (
                  <>
                    <Text variant="bodySm" color={isMine ? '#FFFFFF' : colors.neutral[900]}>
                      {message.content ?? '[mensagem sem texto]'}
                    </Text>
                    <Text variant="labelSm" color={isMine ? 'rgba(255,255,255,0.75)' : colors.neutral[400]}>
                      {formatDate(message.sentAt)}
                    </Text>
                  </>
                )}
              </View>
            </View>
          );
        })}
      </ScrollView>

      <View style={styles.composer}>
        <TextInput
          value={content}
          onChangeText={setContent}
          placeholder="Digite uma mensagem..."
          placeholderTextColor={colors.neutral[400]}
          style={styles.input}
          returnKeyType="send"
          onSubmitEditing={() => {
            const trimmed = content.trim();
            if (!trimmed) return;
            sendMessage.mutate(trimmed);
            setContent('');
          }}
        />
        <Pressable
          style={[styles.sendBtn, !content.trim() && styles.sendBtnDisabled]}
          onPress={() => {
            const trimmed = content.trim();
            if (!trimmed) return;
            sendMessage.mutate(trimmed);
            setContent('');
          }}
          disabled={!content.trim()}
        >
          <Send color="#FFFFFF" size={18} />
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { gap: 0 },
  messages: { gap: spacing[3], paddingBottom: spacing[4], flexGrow: 1 },
  emptyChat: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: spacing[10] },
  messageWrap: { flexDirection: 'row' },
  mineWrap: { justifyContent: 'flex-end' },
  otherWrap: { justifyContent: 'flex-start' },
  messageBubble: {
    maxWidth: '80%',
    borderRadius: radius.lg,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    gap: spacing[1],
  },
  mineBubble: {
    backgroundColor: colors.primary.default,
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: colors.neutral[100],
    borderBottomLeftRadius: 4,
  },
  systemText: { textAlign: 'center' },
  composer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    paddingTop: spacing[3],
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.neutral[300],
    borderRadius: radius.md,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    backgroundColor: colors.neutral[50],
    color: colors.neutral[900],
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary.default,
  },
  sendBtnDisabled: { opacity: 0.5 },
});
