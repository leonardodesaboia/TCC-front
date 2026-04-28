import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import {
  Bell,
  ChevronRight,
  FileText,
  HelpCircle,
  LogOut,
  MapPin,
  Settings,
  Star,
  Wrench,
} from 'lucide-react-native';
import { Screen } from '@/components/layout/Screen';
import { Avatar, Divider, Text } from '@/components/ui';
import { useAuth } from '@/providers/AuthProvider';
import { useLogout } from '@/lib/hooks/useAuth';
import { useMyProfessionalProfile } from '@/lib/hooks/useProfessionalArea';
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

export default function ProfessionalProfileScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const logout = useLogout();
  const profileQuery = useMyProfessionalProfile();

  const name = user?.name ?? 'Profissional AllSet';
  const email = user?.email ?? 'email@exemplo.com';
  const profile = profileQuery.data;

  return (
    <Screen edges={['top']} style={styles.screen}>
      {/* Profile card */}
      <Pressable style={styles.profileCard} onPress={() => router.push('/(professional)/(profile)/edit' as any)}>
        <Avatar uri={user?.profileImage} name={name} size="xl" />
        <View style={styles.profileInfo}>
          <Text variant="titleLg">{name}</Text>
          <Text variant="bodySm" color={colors.neutral[500]}>{email}</Text>
          {profile ? (
            <View style={styles.ratingRow}>
              <Star color={colors.warning} fill={colors.warning} size={14} />
              <Text variant="labelLg" color={colors.neutral[500]}>
                {profile.averageRating.toFixed(1)} ({profile.reviewCount} avaliacoes)
              </Text>
            </View>
          ) : null}
        </View>
      </Pressable>

      {/* Professional section */}
      <View style={styles.menuSection}>
        <Text variant="labelLg" color={colors.neutral[500]} style={styles.menuSectionTitle}>
          PROFISSIONAL
        </Text>
        <MenuItem
          icon={<Wrench color={colors.neutral[600]} size={20} />}
          label="Meus servicos"
          onPress={() => router.push('/(professional)/(profile)/services' as any)}
        />
        <Divider />
        <MenuItem
          icon={<FileText color={colors.neutral[600]} size={20} />}
          label="Documentos"
          onPress={() => {}}
        />
      </View>

      {/* Account section */}
      <View style={styles.menuSection}>
        <Text variant="labelLg" color={colors.neutral[500]} style={styles.menuSectionTitle}>
          CONTA
        </Text>
        <MenuItem
          icon={<MapPin color={colors.neutral[600]} size={20} />}
          label="Meus enderecos"
          onPress={() => {}}
        />
        <Divider />
        <MenuItem
          icon={<Bell color={colors.neutral[600]} size={20} />}
          label="Notificacoes"
          onPress={() => {}}
        />
      </View>

      {/* General section */}
      <View style={styles.menuSection}>
        <Text variant="labelLg" color={colors.neutral[500]} style={styles.menuSectionTitle}>
          GERAL
        </Text>
        <MenuItem
          icon={<Settings color={colors.neutral[600]} size={20} />}
          label="Configuracoes"
          onPress={() => {}}
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
  screen: { gap: spacing[6] },
  profileCard: {
    alignItems: 'center',
    gap: spacing[4],
    paddingVertical: spacing[4],
  },
  profileInfo: {
    alignItems: 'center',
    gap: spacing[1],
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    marginTop: spacing[1],
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
  menuItemPressed: { opacity: 0.6 },
  menuLabel: { flex: 1 },
  version: { textAlign: 'center' },
});
