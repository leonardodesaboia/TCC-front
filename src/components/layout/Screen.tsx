import type { ReactElement } from 'react';
import { KeyboardAvoidingView, ScrollView, View, StyleSheet, ViewProps, RefreshControlProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { layout, colors } from '@/theme';

interface ScreenProps extends ViewProps {
  scroll?: boolean;
  padded?: boolean;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
  refreshControl?: ReactElement<RefreshControlProps>;
  /** Empurra o conteúdo para cima do teclado. Telas que tratam o teclado sozinhas (chat) desligam. */
  avoidKeyboard?: boolean;
}

export function Screen({
  scroll = true,
  padded = true,
  edges = ['top'],
  refreshControl,
  avoidKeyboard = true,
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

  const content = <Container {...containerProps}>{children}</Container>;

  return (
    <SafeAreaView edges={edges} style={styles.safe} {...props}>
      {avoidKeyboard ? (
        // Com edge-to-edge o Android não encolhe a tela quando o teclado abre; sem isto o
        // teclado cobre os campos do fim dos formulários.
        <KeyboardAvoidingView behavior="padding" style={styles.flex}>
          {content}
        </KeyboardAvoidingView>
      ) : (
        content
      )}
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
