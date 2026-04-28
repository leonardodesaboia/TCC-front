import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Send } from 'lucide-react-native';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingScreen } from '@/components/feedback/LoadingScreen';
import { Header } from '@/components/layout/Header';
import { Screen } from '@/components/layout/Screen';
import { Button, Text } from '@/components/ui';
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

export default function ConversationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const conversationQuery = useConversation(id);
  const messagesQuery = useConversationMessages(id);
  const markRead = useMarkConversationRead(id);
  const sendMessage = useSendMessage(id);
  const [content, setContent] = useState('');

  useEffect(() => {
    if (messagesQuery.data?.length) {
      markRead.mutate();
    }
  }, [markRead, messagesQuery.data?.length]);

  if (conversationQuery.isLoading || messagesQuery.isLoading) {
    return <LoadingScreen message="Carregando conversa..." />;
  }

  if (conversationQuery.isError || messagesQuery.isError) {
    return <ErrorState message="Não foi possível carregar a conversa." onRetry={() => {
      void conversationQuery.refetch();
      void messagesQuery.refetch();
    }} />;
  }

  const conversation = conversationQuery.data;
  const messages = messagesQuery.data ?? [];

  if (!conversation) {
    return <ErrorState message="Conversa não encontrada." />;
  }

  return (
    <Screen edges={['top']} scroll={false} style={styles.screen}>
      <Header title={`Conversa ${conversation.orderId.slice(0, 8)}`} showBack />

      <ScrollView contentContainerStyle={styles.messages} showsVerticalScrollIndicator={false}>
        {messages.map((message) => {
          const isMine = message.senderId === user?.id;
          return (
            <View key={message.id} style={[styles.messageWrap, isMine ? styles.mineWrap : styles.otherWrap]}>
              <View style={[styles.messageBubble, isMine ? styles.mineBubble : styles.otherBubble]}>
                <Text variant="bodySm" color={isMine ? '#FFFFFF' : colors.neutral[900]}>
                  {message.content ?? '[mensagem sem texto]'}
                </Text>
                <Text variant="labelSm" color={isMine ? 'rgba(255,255,255,0.75)' : colors.neutral[400]}>
                  {formatDate(message.sentAt)}
                </Text>
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
        />
        <Pressable
          style={styles.sendBtn}
          onPress={() => {
            const trimmed = content.trim();
            if (!trimmed) return;
            sendMessage.mutate(trimmed);
            setContent('');
          }}
        >
          <Send color="#FFFFFF" size={18} />
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { gap: 0 },
  messages: { gap: spacing[3], paddingBottom: spacing[4] },
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
  },
  otherBubble: {
    backgroundColor: colors.neutral[100],
  },
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
});
