import type { ComponentType } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { ClipboardList, Home, Search, UserRound } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '@/components/ui';
import { colors, layout, radius, shadows, spacing } from '@/theme';

type TabIcon = ComponentType<{ color?: string; size?: number }>;

const CLIENT_TABS: Array<{ name: string; label: string; icon: TabIcon }> = [
  { name: '(home)', label: 'Início', icon: Home },
  { name: '(search)', label: 'Buscar', icon: Search },
  { name: '(orders)', label: 'Pedidos', icon: ClipboardList },
  { name: '(profile)', label: 'Perfil', icon: UserRound },
];

export function ClientTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.outer, { paddingBottom: Math.max(insets.bottom, spacing[2]) }]}>
      <View style={styles.inner}>
        {CLIENT_TABS.map((tab) => {
          const routeIndex = state.routes.findIndex((route) => route.name === tab.name);
          if (routeIndex === -1) return null;

          const route = state.routes[routeIndex];
          const descriptor = descriptors[route.key];
          const isFocused = state.index === routeIndex;
          const Icon = tab.icon;

          return (
            <Pressable
              key={tab.name}
              accessibilityRole="tab"
              accessibilityState={{ selected: isFocused }}
              accessibilityLabel={descriptor.options.tabBarAccessibilityLabel ?? tab.label}
              onPress={() => navigation.navigate(route.name, route.params)}
              style={[styles.tab, isFocused && styles.tabActive]}
            >
              <Icon color={isFocused ? colors.primary.default : colors.neutral[500]} size={22} />
              <Text
                variant="labelSm"
                color={isFocused ? colors.primary.default : colors.neutral[500]}
                style={styles.label}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing[4],
    paddingTop: spacing[2],
  },
  inner: {
    minHeight: layout.bottomTabHeight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[2],
    ...shadows.md,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[1],
    borderRadius: radius.lg,
    paddingVertical: spacing[2],
  },
  tabActive: {
    backgroundColor: '#FFF1E5',
  },
  label: {
    textAlign: 'center',
  },
});
