import { Pressable, StyleSheet, Switch, View } from 'react-native';
import { useEffect, useState } from 'react';
import * as Location from 'expo-location';
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
import { useUpdateProfessionalGeo } from '@/lib/hooks/useProfessionalManagement';
import { toast } from '@/lib/utils/toast';
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
  const updateGeo = useUpdateProfessionalGeo(profileQuery.data?.id ?? '');
  const [geoActive, setGeoActive] = useState(false);
  const [isCapturingLocation, setIsCapturingLocation] = useState(false);

  const name = user?.name ?? 'Profissional AllSet';
  const email = user?.email ?? 'email@exemplo.com';
  const profile = profileQuery.data;

  useEffect(() => {
    setGeoActive(profile?.geoActive ?? false);
  }, [profile?.geoActive]);

  async function handleToggleExpress(value: boolean) {
    const previous = profile?.geoActive ?? false;
    setGeoActive(value);

    if (!profile?.id) {
      setGeoActive(previous);
      return;
    }

    if (!value) {
      updateGeo.mutate(
        { geoActive: false },
        { onError: () => setGeoActive(previous) },
      );
      return;
    }

    setIsCapturingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setGeoActive(previous);
        toast.error('Permissão negada', 'Habilite a localização para entrar na fila Express.');
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      updateGeo.mutate(
        {
          geoActive: true,
          geoLat: position.coords.latitude,
          geoLng: position.coords.longitude,
        },
        { onError: () => setGeoActive(previous) },
      );
    } catch {
      setGeoActive(previous);
      toast.error('Erro de localização', 'Não foi possível obter sua localização atual.');
    } finally {
      setIsCapturingLocation(false);
    }
  }

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

      {profile ? (
        <View style={styles.statusCard}>
          <View style={styles.statusText}>
            <Text variant="titleSm">Express</Text>
            <Text variant="labelLg" color={colors.neutral[500]}>
              {geoActive
                ? 'Seu perfil está marcado como disponível para pedidos Express.'
                : 'Seu perfil ainda não está disponível para pedidos Express.'}
            </Text>
            <Text variant="labelSm" color={colors.neutral[500]}>
              {isCapturingLocation
                ? 'Obtendo localização atual do dispositivo...'
                : 'Ative para entrar na fila de pedidos próximos usando sua localização atual.'}
            </Text>
          </View>
          <View style={styles.statusControls}>
            <View style={[styles.statusPill, geoActive ? styles.statusPillActive : styles.statusPillInactive]}>
              <Text variant="labelSm" color={geoActive ? colors.success : colors.neutral[600]}>
                {geoActive ? 'Ativo' : 'Inativo'}
              </Text>
            </View>
            <Switch
              value={geoActive}
              onValueChange={handleToggleExpress}
              disabled={updateGeo.isPending || isCapturingLocation}
              trackColor={{ false: colors.neutral[300], true: colors.primary.default }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>
      ) : null}

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
          onPress={() => router.push('/(professional)/notifications' as any)}
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
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    backgroundColor: colors.neutral[50],
    padding: spacing[4],
  },
  statusText: {
    flex: 1,
    gap: spacing[1],
  },
  statusControls: {
    alignItems: 'center',
    gap: spacing[2],
  },
  statusPill: {
    borderRadius: radius.full,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
  },
  statusPillActive: {
    backgroundColor: colors.success + '15',
  },
  statusPillInactive: {
    backgroundColor: colors.neutral[200],
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
