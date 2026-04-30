import type { ReactElement } from 'react';
import { ScrollView, View, StyleSheet, ViewProps, RefreshControlProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { layout, colors } from '@/theme';

interface ScreenProps extends ViewProps {
  scroll?: boolean;
  padded?: boolean;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
  refreshControl?: ReactElement<RefreshControlProps>;
}

export function Screen({
  scroll = true,
  padded = true,
  edges = ['top'],
  refreshControl,
  children,
  style,
  ...props
}: ScreenProps) {
  const Container = scroll ? ScrollView : View;
  const containerProps = scroll
    ? {
        contentContainerStyle: [padded && styles.padded, { flexGrow: 1 }, style],
        showsVerticalScrollIndicator: false,
        keyboardShouldPersistTaps: 'handled' as const,
        refreshControl,
      }
    : { style: [styles.flex, padded && styles.padded, style] };

  return (
    <SafeAreaView edges={edges} style={styles.safe} {...props}>
      <Container {...containerProps}>{children}</Container>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  padded: {
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingTop: 16,
    paddingBottom: 32,
  },
});
