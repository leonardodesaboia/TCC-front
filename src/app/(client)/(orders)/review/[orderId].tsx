import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Star } from 'lucide-react-native';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingScreen } from '@/components/feedback/LoadingScreen';
import { Header } from '@/components/layout/Header';
import { Screen } from '@/components/layout/Screen';
import { Button, Text } from '@/components/ui';
import { useOrderReviews, useCreateOrderReview } from '@/lib/hooks/useReviews';
import { colors, radius, spacing } from '@/theme';

export default function OrderReviewScreen() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const router = useRouter();
  const reviewsQuery = useOrderReviews(orderId);
  const createReview = useCreateOrderReview(orderId);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const alreadyHasCommentReview = useMemo(
    () => (reviewsQuery.data ?? []).some((review) => !!review.comment),
    [reviewsQuery.data],
  );

  if (reviewsQuery.isLoading) {
    return <LoadingScreen message="Carregando avaliações..." />;
  }

  if (reviewsQuery.isError) {
    return <ErrorState message="Não foi possível carregar avaliações do pedido." onRetry={() => reviewsQuery.refetch()} />;
  }

  if (alreadyHasCommentReview) {
    return (
      <Screen edges={['top']}>
        <Header title="Avaliação" showBack />
        <EmptyState
          icon={Star}
          title="Avaliação já enviada"
          description="Este pedido já possui uma avaliação registrada."
        />
      </Screen>
    );
  }

  return (
    <Screen edges={['top']}>
      <Header title="Avaliar pedido" showBack />

      <View style={styles.section}>
        <Text variant="titleSm">Nota</Text>
        <View style={styles.starRow}>
          {[1, 2, 3, 4, 5].map((value) => (
            <Pressable key={value} onPress={() => setRating(value)}>
              <Star
                size={28}
                color={colors.warning}
                fill={value <= rating ? colors.warning : 'transparent'}
              />
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text variant="titleSm">Comentário</Text>
        <TextInput
          value={comment}
          onChangeText={setComment}
          placeholder="Conte como foi sua experiência..."
          placeholderTextColor={colors.neutral[400]}
          multiline
          textAlignVertical="top"
          style={styles.textArea}
        />
      </View>

      <View style={styles.footer}>
        <Button
          onPress={async () => {
            await createReview.mutateAsync({ rating, comment: comment.trim() });
            router.back();
          }}
          loading={createReview.isPending}
          disabled={comment.trim().length === 0}
        >
          Enviar avaliação
        </Button>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: { gap: spacing[3] },
  starRow: { flexDirection: 'row', gap: spacing[2] },
  textArea: {
    borderWidth: 1,
    borderColor: colors.neutral[300],
    borderRadius: radius.md,
    backgroundColor: colors.neutral[50],
    minHeight: 140,
    padding: spacing[4],
    color: colors.neutral[900],
  },
  footer: { paddingTop: spacing[6] },
});
