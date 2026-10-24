import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useGoBack } from '@/lib/navigation/back-history';
import { Star } from 'lucide-react-native';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingScreen } from '@/components/feedback/LoadingScreen';
import { Header } from '@/components/layout/Header';
import { Screen } from '@/components/layout/Screen';
import { Button, Input, Text } from '@/components/ui';
import { useOrderReviews, useCreateOrderReview } from '@/lib/hooks/useReviews';
import { useAuth } from '@/providers/AuthProvider';
import { colors, radius, spacing } from '@/theme';

export default function OrderReviewScreen() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const goBack = useGoBack();
  const reviewsQuery = useOrderReviews(orderId);
  const createReview = useCreateOrderReview(orderId);
  // Começa sem nota: a pessoa precisa escolher, em vez de enviar 5 estrelas sem perceber.
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const { user } = useAuth();
  // O comentário é opcional: o que conta é já existir avaliação enviada por este cliente.
  const alreadyReviewed = useMemo(
    () => (reviewsQuery.data ?? []).some((review) => review.reviewerId === user?.id),
    [reviewsQuery.data, user?.id],
  );

  if (reviewsQuery.isLoading) {
    return <LoadingScreen message="Carregando avaliações..." />;
  }

  if (reviewsQuery.isError) {
    return <ErrorState message="Não foi possível carregar avaliações do pedido." onRetry={() => reviewsQuery.refetch()} />;
  }

  if (alreadyReviewed) {
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
        <Text variant="titleSm">Nota (obrigatória)</Text>
        <View style={styles.starRow}>
          {[1, 2, 3, 4, 5].map((value) => (
            <Pressable
              key={value}
              onPress={() => setRating(value)}
              hitSlop={6}
              accessibilityRole="button"
              accessibilityLabel={`${value} ${value === 1 ? 'estrela' : 'estrelas'}`}
            >
              <Star
                size={28}
                color={colors.warning}
                fill={value <= rating ? colors.warning : 'transparent'}
              />
            </Pressable>
          ))}
        </View>
        <Text variant="labelLg" color={colors.neutral[500]}>
          {rating > 0 ? `Você escolheu ${rating} de 5.` : 'Toque nas estrelas para dar sua nota.'}
        </Text>
      </View>

      <View style={styles.section}>
        <Text variant="titleSm">Comentário (opcional)</Text>
        <Input
          value={comment}
          onChangeText={setComment}
          placeholder="Conte como foi sua experiência..."
          multiline
          textAlignVertical="top"
          style={styles.textArea}
        />
      </View>

      <View style={styles.footer}>
        {rating === 0 ? (
          <Text variant="labelLg" color={colors.neutral[500]} style={styles.missing}>
            Falta escolher a nota.
          </Text>
        ) : null}
        <Button
          onPress={async () => {
            try {
              await createReview.mutateAsync({ rating, comment: comment.trim() || undefined });
              goBack();
            } catch {
              // O aviso de erro já é mostrado pelo hook; a tela fica aberta para tentar de novo.
            }
          }}
          loading={createReview.isPending}
          disabled={rating === 0}
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
  missing: { textAlign: 'center', marginBottom: spacing[2] },
  textArea: {
    minHeight: 140,
  },
  footer: { paddingTop: spacing[6] },
});
