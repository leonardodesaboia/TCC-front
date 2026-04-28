import { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MessageCircle } from 'lucide-react-native';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingScreen } from '@/components/feedback/LoadingScreen';
import { Screen } from '@/components/layout/Screen';
import { Header } from '@/components/layout/Header';
import { Avatar, Badge, Text } from '@/components/ui';
import { useConversations } from '@/lib/hooks/useConversations';
import type { ConversationSummary } from '@/types/conversation';
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

function ConversationCard({ conversation, onPress }: { conversation: ConversationSummary; onPress: () => void }) {
  const displayName = `Pedido ${conversation.orderId.slice(0, 8)}`;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <Avatar
        name={displayName}
        size="md"
        backgroundColor={colors.primary.default}
      />
      <View style={styles.textWrap}>
        <View style={styles.titleRow}>
          <Text variant="titleSm" numberOfLines={1} style={styles.titleFlex}>{displayName}</Text>
          {conversation.unreadCount > 0 ? <Badge label={String(conversation.unreadCount)} /> : null}
        </View>
        <Text variant="bodySm" color={colors.neutral[500]} numberOfLines={1}>
          {conversation.lastMessage ?? 'Conversa iniciada.'}
        </Text>
      </View>
    </Pressable>
  );
}

export default function ProfessionalConversationsScreen() {
  const router = useRouter();
  const { orderId } = useLocalSearchParams<{ orderId?: string }>();
  const conversationsQuery = useConversations();

  useEffect(() => {
    if (!orderId || !conversationsQuery.data?.length) return;
    const match = conversationsQuery.data.find((item) => item.orderId === orderId);
    if (match) {
      router.replace(`/(professional)/conversations/${match.id}` as never);
    }
  }, [conversationsQuery.data, orderId, router]);

  if (conversationsQuery.isLoading) {
    return <LoadingScreen message="Carregando conversas..." />;
  }

  if (conversationsQuery.isError) {
    return <ErrorState message="Nao foi possivel carregar conversas." onRetry={() => conversationsQuery.refetch()} />;
  }

  const conversations = conversationsQuery.data ?? [];

  return (
    <Screen edges={['top']}>
      <Header title="Conversas" />

      {conversations.length > 0 ? (
        <View style={styles.list}>
          {conversations.map((conversation) => (
            <ConversationCard
              key={conversation.id}
              conversation={conversation}
              onPress={() => router.push(`/(professional)/conversations/${conversation.id}` as never)}
            />
          ))}
        </View>
      ) : (
        <EmptyState
          icon={MessageCircle}
          title="Nenhuma conversa"
          description="As conversas aparecem quando um pedido e aceito."
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
    alignItems: 'center',
  },
  pressed: { opacity: 0.7 },
  textWrap: { flex: 1, gap: spacing[1] },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing[2],
  },
  titleFlex: { flex: 1 },
});
