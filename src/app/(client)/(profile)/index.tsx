import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import {
  Bell,
  ChevronRight,
  HelpCircle,
  LogOut,
  MapPin,
  Settings,
  Shield,
} from 'lucide-react-native';
import { Screen } from '@/components/layout/Screen';
import { Avatar, Divider, Text } from '@/components/ui';
import { useAuth } from '@/providers/AuthProvider';
import { useLogout } from '@/lib/hooks/useAuth';
import { colors, radius, spacing } from '@/theme';

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  danger?: boolean;
}

function MenuItem({ icon, label, onPress, danger }: MenuItemProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}
    >
      {icon}
      <Text
        variant="bodySm"
        color={danger ? colors.error : colors.neutral[900]}
        style={styles.menuLabel}
      >
        {label}
      </Text>
      <ChevronRight color={colors.neutral[300]} size={18} />
    </Pressable>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const logout = useLogout();

  const name = user?.name ?? 'Cliente AllSet';
  const email = user?.email ?? 'email@exemplo.com';

  return (
    <Screen edges={['top']} style={styles.screen}>
      {/* Profile card */}
      <Pressable
        style={({ pressed }) => [styles.profileCard, pressed && styles.profileCardPressed]}
        onPress={() => router.push('/(client)/(profile)/edit')}
      >
        <Avatar uri={user?.profileImage} name={name} size="xl" />
        <View style={styles.profileInfo}>
          <Text variant="titleLg">{name}</Text>
          <Text variant="bodySm" color={colors.neutral[500]}>{email}</Text>
        </View>
        <View style={styles.profileHintRow}>
          <Text variant="labelLg" color={colors.primary.default}>
            Toque para editar seu perfil
          </Text>
          <ChevronRight color={colors.primary.default} size={16} />
        </View>
      </Pressable>

      {/* Menu sections */}
      <View style={styles.menuSection}>
        <Text variant="labelLg" color={colors.neutral[500]} style={styles.menuSectionTitle}>
          CONTA
        </Text>
        <MenuItem
          icon={<MapPin color={colors.neutral[600]} size={20} />}
          label="Meus endereços"
          onPress={() => router.push('/(client)/(profile)/addresses')}
        />
        <Divider />
        <MenuItem
          icon={<Bell color={colors.neutral[600]} size={20} />}
          label="Notificações"
          onPress={() => router.push('/(client)/(home)/notifications')}
        />
        <Divider />
        <MenuItem
          icon={<Shield color={colors.neutral[600]} size={20} />}
          label="Segurança"
          onPress={() => {}}
        />
      </View>

      <View style={styles.menuSection}>
        <Text variant="labelLg" color={colors.neutral[500]} style={styles.menuSectionTitle}>
          GERAL
        </Text>
        <MenuItem
          icon={<Settings color={colors.neutral[600]} size={20} />}
          label="Configurações"
          onPress={() => router.push('/(client)/(profile)/settings')}
        />
        <Divider />
        <MenuItem
          icon={<HelpCircle color={colors.neutral[600]} size={20} />}
          label="Ajuda"
          onPress={() => {}}
        />
      </View>

      <View style={styles.menuSection}>
        <MenuItem
          icon={<LogOut color={colors.error} size={20} />}
          label="Sair"
          onPress={() => logout.mutate()}
          danger
        />
      </View>

      <Text variant="labelSm" color={colors.neutral[400]} style={styles.version}>
        AllSet v1.0.0
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    gap: spacing[6],
  },
  profileCard: {
    alignItems: 'center',
    gap: spacing[4],
    paddingVertical: spacing[5],
    paddingHorizontal: spacing[4],
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    backgroundColor: colors.neutral[50],
  },
  profileCardPressed: {
    opacity: 0.75,
  },
  profileInfo: {
    alignItems: 'center',
    gap: spacing[1],
  },
  profileHintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: radius.full,
    backgroundColor: colors.primary.light,
  },
  menuSection: {
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    backgroundColor: colors.neutral[50],
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
  },
  menuSectionTitle: {
    paddingVertical: spacing[2],
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    paddingVertical: spacing[3],
  },
  menuItemPressed: {
    opacity: 0.6,
  },
  menuLabel: {
    flex: 1,
  },
  version: {
    textAlign: 'center',
  },
});
