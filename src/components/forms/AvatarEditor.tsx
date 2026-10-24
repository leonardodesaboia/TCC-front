import { useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { confirmAction } from '@/lib/utils/confirm';
import { Camera } from 'lucide-react-native';
import { pickImage } from '@/lib/utils/image-picker';
import { Avatar, Text } from '@/components/ui';
import { useDeleteAvatar } from '@/lib/hooks/useUsers';
import { usersApi } from '@/lib/api/users';
import { useAuthStore } from '@/lib/stores/auth-store';
import { getApiErrorMessage } from '@/lib/utils/errors';
import { toast } from '@/lib/utils/toast';
import { useAuth } from '@/providers/AuthProvider';
import { colors, spacing } from '@/theme';

/** Foto de perfil com as ações de trocar e remover. Usada no perfil do cliente e do profissional. */
export function AvatarEditor({ name }: { name: string }) {
  const { user } = useAuth();
  const deleteAvatar = useDeleteAvatar();
  const refreshUser = useAuthStore((state) => state.refreshUser);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  async function handlePickAvatar() {
    const asset = await pickImage({ allowsEditing: true, aspect: [1, 1] });
    if (!asset) return;

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
    } catch (error) {
      toast.error('Erro ao enviar avatar', getApiErrorMessage(error));
    } finally {
      setUploadingAvatar(false);
    }
  }

  function handleRemoveAvatar() {
    confirmAction({
      title: 'Remover foto',
      message: 'Tem certeza que deseja remover sua foto?',
      confirmText: 'Remover',
      destructive: true,
      onConfirm: () => deleteAvatar.mutate(),
    });
  }

  return (
    <View style={styles.avatarSection}>
      <View style={styles.avatarWrapper}>
        <Avatar uri={user?.profileImage} name={name} size="xl" />
        <Pressable style={styles.cameraBtn} onPress={handlePickAvatar} disabled={uploadingAvatar} accessibilityRole="button" accessibilityLabel="Alterar foto de perfil">
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
});
