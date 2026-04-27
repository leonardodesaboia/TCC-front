import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Camera } from 'lucide-react-native';
import { Screen } from '@/components/layout/Screen';
import { Header } from '@/components/layout/Header';
import { Avatar, Button, Text } from '@/components/ui';
import { FormField } from '@/components/forms/FormField';
import { Input } from '@/components/ui';
import { useAuth } from '@/providers/AuthProvider';
import { colors, radius, spacing } from '@/theme';

export default function EditProfileScreen() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name ?? 'Cliente AllSet');
  const [email, setEmail] = useState(user?.email ?? 'email@exemplo.com');
  const [phone, setPhone] = useState('(85) 99999-0000');
  const [birthDate, setBirthDate] = useState('01/01/1990');

  return (
    <Screen edges={['top']}>
      <Header title="Editar perfil" showBack />

      {/* Avatar */}
      <View style={styles.avatarSection}>
        <View style={styles.avatarWrapper}>
          <Avatar uri={user?.profileImage} name={name} size="xl" />
          <Pressable style={styles.cameraBtn} onPress={() => {}}>
            <Camera color="#FFFFFF" size={16} />
          </Pressable>
        </View>
        <Text variant="labelLg" color={colors.primary.default}>Alterar foto</Text>
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

        <FormField label="Data de nascimento">
          <Input
            value={birthDate}
            onChangeText={setBirthDate}
            placeholder="DD/MM/AAAA"
            keyboardType="numeric"
          />
        </FormField>
      </View>

      <View style={styles.footer}>
        <Button variant="primary" size="lg" onPress={() => {}}>
          Salvar alterações
        </Button>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  avatarSection: {
    alignItems: 'center',
    gap: spacing[2],
    paddingVertical: spacing[4],
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
