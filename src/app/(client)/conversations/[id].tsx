import { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Send } from 'lucide-react-native';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingScreen } from '@/components/feedback/LoadingScreen';
import { Header } from '@/components/layout/Header';
import { Screen } from '@/components/layout/Screen';
import { Button, Text } from '@/components/ui';
import { ConversationOrderInfo } from '@/components/conversations/ConversationOrderInfo';
import { useOrder } from '@/lib/hooks/useOrders';
import { useConversation, useConversationMessages, useMarkConversationRead, useSendMessage } from '@/lib/hooks/useConversations';
import { useAuth } from '@/providers/AuthProvider';
import { formatDateShort } from '@/lib/utils/formatters';
import { getApiErrorMessage } from '@/lib/utils/errors';
import { toast } from '@/lib/utils/toast';
import { colors, radius, spacing } from '@/theme';

export default function ConversationDetailScreen() {
  const router = useRouter();
  const { id, from } = useLocalSearchParams<{ id: string; from?: string }>();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const conversationQuery = useConversation(id);
  const orderQuery = useOrder(conversationQuery.data?.orderId ?? '');
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
      const timeoutId = setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
      return () => clearTimeout(timeoutId);
    }
  }, [messageCount]);

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

  if (!conversation) {
    return <ErrorState message="Conversa não encontrada." />;
  }

  const isClosed = conversation.orderStatus === 'completed'
    || conversation.orderStatus === 'cancelled'
    || conversation.orderStatus === 'disputed';

  const handleBack = () => {
    if (from === 'order') {
      router.replace(`/(client)/(orders)/${conversation.orderId}` as never);
    }
  };

  function handleSend() {
    const trimmed = content.trim();
    if (!trimmed || sendMessage.isPending) return;
    // Limpa na hora para a conversa fluir; se o envio falhar o texto volta, em vez de sumir.
    setContent('');
    sendMessage.mutate(trimmed, {
      onError: (error) => {
        setContent((current) => current || trimmed);
        toast.error('Mensagem não enviada', getApiErrorMessage(error));
      },
    });
  }

  return (
    <Screen edges={['top']} scroll={false} avoidKeyboard={false} style={styles.screen}>
      <Header
        title={conversation.otherParticipantName ? `Conversa com ${conversation.otherParticipantName}` : 'Conversa do pedido'}
        showBack
        onBackPress={from === 'order' ? handleBack : () => router.replace('/(client)/conversations' as never)}
        backLabel={from === 'order' ? 'Voltar para o pedido' : 'Voltar para conversas'}
      />
      <View style={styles.orderContext}>
        <ConversationOrderInfo orderId={conversation.orderId} order={orderQuery.data} />
        <Button variant="secondary" size="sm" onPress={() => router.push(`/(client)/(orders)/${conversation.orderId}` as never)}>Ver pedido</Button>
      </View>

      {/* Com edge-to-edge o Android não encolhe a tela quando o teclado abre. O keyboardDidShow
          informa a posição do teclado na janela, mas o KeyboardAvoidingView se mede a partir do
          pai, que começa abaixo da barra de status: o offset compensa essa diferença. */}
      <KeyboardAvoidingView behavior="padding" keyboardVerticalOffset={insets.top} style={styles.chatArea}>
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
                      <Text variant="bodySm" color={isMine ? colors.neutral[50] : colors.neutral[900]}>
                        {message.content ?? '[mensagem sem texto]'}
                      </Text>
                      <Text variant="labelSm" color={isMine ? 'rgba(255,255,255,0.75)' : colors.neutral[400]}>
                        {formatDateShort(message.sentAt)}
                      </Text>
                    </>
                  )}
                </View>
              </View>
            );
          })}
        </ScrollView>

        {isClosed ? (
          <View style={styles.closedBanner}>
            <Text variant="bodySm" color={colors.neutral[500]}>
              Esta conversa foi encerrada.
            </Text>
          </View>
        ) : (
          <View style={styles.composer}>
            <TextInput
              accessibilityLabel="Mensagem para o profissional"
              value={content}
              onChangeText={setContent}
              placeholder="Digite uma mensagem..."
              placeholderTextColor={colors.neutral[400]}
              style={styles.input}
              returnKeyType="send"
              onSubmitEditing={handleSend}
            />
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ disabled: !content.trim() || sendMessage.isPending, busy: sendMessage.isPending }}
              style={[styles.sendBtn, (!content.trim() || sendMessage.isPending) && styles.sendBtnDisabled]}
              onPress={handleSend}
              disabled={!content.trim() || sendMessage.isPending}
              accessibilityLabel="Enviar mensagem"
            >
              <Send color="#FFFFFF" size={18} />
            </Pressable>
          </View>
        )}
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { gap: 0 },
  orderContext: { gap: spacing[2], paddingVertical: spacing[3], borderBottomWidth: 1, borderBottomColor: colors.neutral[200] },
  chatArea: { flex: 1 },
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
    borderBottomRightRadius: radius.xs,
  },
  otherBubble: {
    backgroundColor: colors.neutral[100],
    borderBottomLeftRadius: radius.xs,
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
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary.default,
  },
  sendBtnDisabled: {
    opacity: 0.5,
  },
  closedBanner: {
    paddingVertical: spacing[4],
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
    alignItems: 'center',
    backgroundColor: colors.neutral[50],
  },
});
