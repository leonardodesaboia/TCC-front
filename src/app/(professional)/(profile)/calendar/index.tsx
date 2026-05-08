import { Pressable, SectionList, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Calendar, Trash2 } from 'lucide-react-native';
import { Screen } from '@/components/layout/Screen';
import { Header } from '@/components/layout/Header';
import { Button, Text } from '@/components/ui';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingScreen } from '@/components/feedback/LoadingScreen';
import { useMyProfessionalProfile } from '@/lib/hooks/useProfessionalArea';
import {
  useProfessionalCalendarBlocks,
  useDeleteProfessionalCalendarBlock,
} from '@/lib/hooks/useProfessionalManagement';
import type { BlockedPeriod } from '@/types/professional-management';
import { colors, radius, spacing } from '@/theme';

const WEEKDAY_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

function formatTime(time?: string) {
  if (!time) return 'Dia inteiro';
  return time.slice(0, 5);
}

function blockSummary(block: BlockedPeriod): string {
  if (block.blockType === 'recurring') {
    const day = block.weekday != null ? WEEKDAY_LABELS[block.weekday] : '?';
    return `${day} • ${formatTime(block.startsAt)} – ${formatTime(block.endsAt)}`;
  }
  if (block.blockType === 'specific_date') {
    return `${block.specificDate} • ${formatTime(block.startsAt)} – ${formatTime(block.endsAt)}`;
  }
  if (block.orderStartsAt) {
    return new Date(block.orderStartsAt).toLocaleString('pt-BR', {
      day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
    });
  }
  return '—';
}

export default function CalendarBlocksScreen() {
  const router = useRouter();
  const profileQuery = useMyProfessionalProfile();
  const profile = profileQuery.data;
  const blocksQuery = useProfessionalCalendarBlocks(profile?.id ?? '');
  const deleteBlock = useDeleteProfessionalCalendarBlock(profile?.id ?? '');

  if (profileQuery.isLoading || blocksQuery.isLoading) {
    return <LoadingScreen message="Carregando agenda..." />;
  }
  if (profileQuery.isError || blocksQuery.isError || !profile) {
    return <ErrorState message="Não foi possível carregar os bloqueios." />;
  }

  const blocks = blocksQuery.data ?? [];
  const recurring = blocks.filter((b) => b.blockType === 'recurring');
  const specificDate = blocks.filter((b) => b.blockType === 'specific_date');
  const order = blocks.filter((b) => b.blockType === 'order');

  const sections = [
    { title: 'Recorrentes', data: recurring },
    { title: 'Datas específicas', data: specificDate },
    { title: 'Por pedido', data: order },
  ].filter((s) => s.data.length > 0);

  function renderItem({ item }: { item: BlockedPeriod }) {
    const isManual = item.blockType !== 'order';
    return (
      <Pressable
        style={({ pressed }) => [styles.item, pressed && isManual && styles.itemPressed]}
        onPress={() => {
          if (isManual) {
            router.push(`/(professional)/(profile)/calendar/${item.id}` as any);
          }
        }}
      >
        <View style={styles.itemIcon}>
          <Calendar size={16} color={colors.primary.default} />
        </View>
        <View style={styles.itemContent}>
          <Text variant="bodySm" color={colors.neutral[800]}>{blockSummary(item)}</Text>
          {item.reason ? (
            <Text variant="labelSm" color={colors.neutral[500]}>{item.reason}</Text>
          ) : null}
        </View>
        {isManual ? (
          <Pressable
            hitSlop={8}
            onPress={() => deleteBlock.mutate(item.id)}
            style={styles.deleteBtn}
          >
            <Trash2 size={16} color={colors.error} />
          </Pressable>
        ) : null}
      </Pressable>
    );
  }

  return (
    <Screen edges={['top']} scroll={false} style={styles.screen}>
      <Header title="Agenda" showBack />

      {sections.length === 0 ? (
        <View style={styles.empty}>
          <Text variant="bodySm" color={colors.neutral[500]}>
            Nenhum bloqueio cadastrado.
          </Text>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          renderSectionHeader={({ section }) => (
            <Text variant="labelLg" color={colors.neutral[500]} style={styles.sectionHeader}>
              {section.title.toUpperCase()}
            </Text>
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      <View style={styles.bottomBar}>
        <Button
          variant="primary"
          size="lg"
          onPress={() => router.push('/(professional)/(profile)/calendar/new' as any)}
        >
          Novo bloqueio
        </Button>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { gap: 0 },
  listContent: { paddingVertical: spacing[2], paddingBottom: spacing[4] },
  sectionHeader: {
    paddingHorizontal: spacing[4],
    paddingTop: spacing[4],
    paddingBottom: spacing[2],
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    backgroundColor: colors.neutral[50],
  },
  itemPressed: { backgroundColor: colors.neutral[100] },
  itemIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemContent: { flex: 1, gap: spacing[1] },
  deleteBtn: { padding: spacing[2] },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing[6],
  },
  bottomBar: {
    paddingTop: spacing[3],
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
  },
});
