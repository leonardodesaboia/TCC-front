import type { ComponentType } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { ClipboardList, Home, UserRound } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '@/components/ui';
import { colors, radius, spacing } from '@/theme';

type TabIcon = ComponentType<{ color?: string; size?: number; strokeWidth?: number }>;

const PROFESSIONAL_TABS: Array<{ name: string; label: string; icon: TabIcon }> = [
  { name: '(dashboard)', label: 'Inicio', icon: Home },
  { name: '(orders)', label: 'Pedidos', icon: ClipboardList },
  { name: '(profile)', label: 'Perfil', icon: UserRound },
];

export function ProfessionalTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      <View style={styles.divider} />
      <View style={styles.tabs}>
        {PROFESSIONAL_TABS.map((tab) => {
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
              style={styles.tab}
            >
              <View style={[styles.iconContainer, isFocused && styles.iconContainerActive]}>
                <Icon
                  color={isFocused ? colors.primary.default : colors.neutral[400]}
                  size={22}
                  strokeWidth={isFocused ? 2.5 : 1.8}
                />
              </View>
              <Text
                variant="labelSm"
                color={isFocused ? colors.primary.default : colors.neutral[400]}
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
  container: {
    backgroundColor: colors.background,
    paddingTop: spacing[2],
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.neutral[200],
  },
  tabs: {
    flexDirection: 'row',
    paddingTop: spacing[2],
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[1],
    minHeight: 44,
  },
  iconContainer: {
    width: 44,
    height: 30,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainerActive: {
    backgroundColor: colors.primary.light,
  },
});
