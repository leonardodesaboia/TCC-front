import { Pressable, StyleSheet, View } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { Text } from '@/components/ui';
import { useGoBack } from '@/lib/navigation/back-history';
import { colors, spacing } from '@/theme';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  rightAction?: React.ReactNode;
  onBackPress?: () => void;
}

export function Header({ title, showBack = false, rightAction, onBackPress }: HeaderProps) {
  const defaultGoBack = useGoBack();
  const goBack = onBackPress ?? defaultGoBack;

  return (
    <View style={styles.container}>
      {showBack ? (
        <Pressable onPress={goBack} style={styles.backButton} hitSlop={8}>
          <ArrowLeft color={colors.neutral[900]} size={22} />
        </Pressable>
      ) : (
        <View style={styles.spacer} />
      )}
      <Text variant="titleMd" style={styles.title}>{title}</Text>
      {rightAction ?? <View style={styles.spacer} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
    gap: spacing[3],
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    textAlign: 'center',
  },
  spacer: { width: 40 },
});
