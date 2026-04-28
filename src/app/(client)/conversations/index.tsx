import { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MessageCircle } from 'lucide-react-native';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingScreen } from '@/components/feedback/LoadingScreen';
import { Screen } from '@/components/layout/Screen';
import { Header } from '@/components/layout/Header';
import { Badge, Text } from '@/components/ui';
import { useConversations } from '@/lib/hooks/useConversations';
import { colors, radius, spacing } from '@/theme';

function formatDate(value?: string) {
  if (!value) return '';
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

export default function ConversationsScreen() {
  const router = useRouter();
  const { orderId } = useLocalSearchParams<{ orderId?: string }>();
  const conversationsQuery = useConversations();

  useEffect(() => {
    if (!orderId || !conversationsQuery.data?.length) return;
    const match = conversationsQuery.data.find((item) => item.orderId === orderId);
    if (match) {
      router.replace(`/(client)/conversations/${match.id}` as never);
    }
  }, [conversationsQuery.data, orderId, router]);

  if (conversationsQuery.isLoading) {
    return <LoadingScreen message="Carregando conversas..." />;
  }

  if (conversationsQuery.isError) {
    return <ErrorState message="Não foi possível carregar conversas." onRetry={() => conversationsQuery.refetch()} />;
  }

  const conversations = conversationsQuery.data ?? [];

  return (
    <Screen edges={['top']}>
      <Header title="Conversas" showBack />

      {conversations.length > 0 ? (
        <View style={styles.list}>
          {conversations.map((conversation) => (
            <Pressable
              key={conversation.id}
              onPress={() => router.push(`/(client)/conversations/${conversation.id}` as never)}
              style={({ pressed }) => [styles.card, pressed && styles.pressed]}
            >
              <View style={styles.iconWrap}>
                <MessageCircle color={colors.primary.default} size={18} />
              </View>
              <View style={styles.textWrap}>
                <View style={styles.titleRow}>
                  <Text variant="titleSm">Pedido {conversation.orderId.slice(0, 8)}</Text>
                  {conversation.unreadCount > 0 ? <Badge label={String(conversation.unreadCount)} /> : null}
                </View>
                <Text variant="bodySm" color={colors.neutral[500]}>
                  {conversation.lastMessage ?? 'Conversa iniciada.'}
                </Text>
                <Text variant="labelSm" color={colors.neutral[400]}>
                  Participante: {conversation.otherParticipantId}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>
      ) : (
        <EmptyState
          icon={MessageCircle}
          title="Nenhuma conversa"
          description="As conversas aparecem quando um pedido é aceito."
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { gap: spacing[3] },
  card: {
    flexDirection: 'row',
    gap: spacing[3],
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    backgroundColor: colors.neutral[50],
    padding: spacing[4],
  },
  pressed: { opacity: 0.7 },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary.light,
  },
  textWrap: { flex: 1, gap: spacing[1] },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing[2],
  },
});
