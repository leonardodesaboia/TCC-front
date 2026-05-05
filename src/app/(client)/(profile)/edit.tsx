import { useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, View } from 'react-native';
import { Camera } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/layout/Screen';
import { Header } from '@/components/layout/Header';
import { Avatar, Button, Text } from '@/components/ui';
import { FormField } from '@/components/forms/FormField';
import { Input } from '@/components/ui';
import { useUpdateProfile, useDeleteAvatar } from '@/lib/hooks/useUsers';
import { usersApi } from '@/lib/api/users';
import { useAuthStore } from '@/lib/stores/auth-store';
import { toast } from '@/lib/utils/toast';
import { useAuth } from '@/providers/AuthProvider';
import { colors, radius, spacing } from '@/theme';

export default function EditProfileScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const updateProfile = useUpdateProfile();
  const deleteAvatar = useDeleteAvatar();
  const refreshUser = useAuthStore((state) => state.refreshUser);
  const [name, setName] = useState(user?.name ?? 'Cliente AllSet');
  const [email, setEmail] = useState(user?.email ?? 'email@exemplo.com');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  async function handlePickAvatar() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Precisamos de acesso à galeria para alterar o avatar.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled || !result.assets[0]) return;

    const asset = result.assets[0];
    const uri = asset.uri;
    const filename = uri.split('/').pop() ?? 'avatar.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    const formData = new FormData();
    const webFile = (asset as typeof asset & { file?: File }).file;

    if (Platform.OS !== 'web') {
      formData.append('file', { uri, name: filename, type } as any);
    } else if (webFile instanceof File) {
      formData.append('file', webFile, webFile.name);
    } else {
      const response = await fetch(uri);
      const blob = await response.blob();
      formData.append('file', blob, filename);
    }

    setUploadingAvatar(true);
    try {
      await usersApi.uploadAvatar(formData);
      await refreshUser();
      toast.success('Avatar atualizado.');
    } catch {
      toast.error('Erro ao enviar avatar');
    } finally {
      setUploadingAvatar(false);
    }
  }

  function handleRemoveAvatar() {
    Alert.alert('Remover avatar', 'Tem certeza que deseja remover sua foto?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Remover', style: 'destructive', onPress: () => deleteAvatar.mutate() },
    ]);
  }

  async function handleSave() {
    await updateProfile.mutateAsync({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
    });
    router.back();
  }

  return (
    <Screen edges={['top']}>
      <Header title="Editar perfil" showBack />

      {/* Avatar */}
      <View style={styles.avatarSection}>
        <View style={styles.avatarWrapper}>
          <Avatar uri={user?.profileImage} name={name} size="xl" />
          <Pressable style={styles.cameraBtn} onPress={handlePickAvatar} disabled={uploadingAvatar}>
            <Camera color="#FFFFFF" size={16} />
          </Pressable>
        </View>
        <View style={styles.avatarActions}>
          <Pressable onPress={handlePickAvatar} disabled={uploadingAvatar}>
            <Text variant="labelLg" color={colors.primary.default}>
              {uploadingAvatar ? 'Enviando...' : 'Alterar foto'}
            </Text>
          </Pressable>
          {user?.profileImage ? (
            <Pressable onPress={handleRemoveAvatar} disabled={deleteAvatar.isPending}>
              <Text variant="labelLg" color={colors.error}>Remover</Text>
            </Pressable>
          ) : null}
        </View>
      </View>

      {/* Form */}
      <View style={styles.form}>
        <FormField label="Nome completo">
          <Input
            value={name}
            onChangeText={setName}
            placeholder="Seu nome completo"
          />
        </FormField>

        <FormField label="E-mail">
          <Input
            value={email}
            onChangeText={setEmail}
            placeholder="seu@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </FormField>

        <FormField label="Telefone">
          <Input
            value={phone}
            onChangeText={setPhone}
            placeholder="(00) 00000-0000"
            keyboardType="phone-pad"
          />
        </FormField>

      </View>

      <View style={styles.footer}>
        <Button variant="primary" size="lg" onPress={handleSave} loading={updateProfile.isPending}>
          Salvar alterações
        </Button>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  avatarSection: {
    alignItems: 'center',
    gap: spacing[3],
    paddingVertical: spacing[4],
  },
  avatarActions: {
    flexDirection: 'row',
    gap: spacing[4],
  },
  avatarWrapper: { position: 'relative' },
  cameraBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary.default,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  form: { gap: spacing[4] },
  footer: { paddingTop: spacing[6] },
});
