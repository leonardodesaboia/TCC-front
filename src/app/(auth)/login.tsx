import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff } from 'lucide-react-native';
import { useForm } from 'react-hook-form';
import { Screen } from '@/components/layout/Screen';
import { FormInput } from '@/components/forms/FormInput';
import { Button, Text } from '@/components/ui';
import { AUTH_BYPASS_ENABLED } from '@/lib/constants/config';
import { useLogin } from '@/lib/hooks/useAuth';
import { loginSchema, type LoginFormData } from '@/lib/validations/auth';
import { colors, spacing } from '@/theme';

export default function LoginScreen() {
  const [showPassword, setShowPassword] = useState(false);
  const login = useLogin();
  const bypass = AUTH_BYPASS_ENABLED;

  const { control, handleSubmit } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  return (
    <Screen edges={['top', 'bottom']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text variant="displayLg">Entrar</Text>
          <Text variant="bodyLg" color={colors.neutral[500]}>
            Acesse sua conta para gerenciar seus serviços.
          </Text>
        </View>

        <View style={styles.form}>
          {bypass ? (
            <View style={styles.devBanner}>
              <Text variant="labelLg" color={colors.primary.dark}>
                Modo desenvolvimento ativo
              </Text>
              <Text variant="labelSm" color={colors.neutral[500]}>
                Toque em Entrar para acessar sem credenciais.
              </Text>
            </View>
          ) : null}

          <FormInput
            control={control}
            name="email"
            label="E-mail"
            placeholder="seu@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />

          <FormInput
            control={control}
            name="password"
            label="Senha"
            placeholder="Sua senha"
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoComplete="password"
            rightIcon={
              <Pressable hitSlop={10} onPress={() => setShowPassword((v) => !v)}>
                {showPassword ? (
                  <EyeOff color={colors.neutral[400]} size={20} />
                ) : (
                  <Eye color={colors.neutral[400]} size={20} />
                )}
              </Pressable>
            }
          />

          <Pressable
            onPress={() => router.push('/(auth)/forgot-password')}
            style={styles.forgotLink}
          >
            <Text variant="labelLg" color={colors.primary.default}>
              Esqueceu a senha?
            </Text>
          </Pressable>

          <Button
            loading={login.isPending}
            onPress={
              bypass
                ? () => login.mutate({ email: '', password: '' })
                : handleSubmit((v) => login.mutate(v))
            }
          >
            Entrar
          </Button>
        </View>

        <View style={styles.footer}>
          <Text variant="bodySm" color={colors.neutral[500]}>
            Não tem conta?
          </Text>
          <Pressable onPress={() => router.push('/(auth)/register/')}>
            <Text variant="titleSm" color={colors.primary.default}>
              Criar conta
            </Text>
          </Pressable>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing[8],
  },
  header: {
    gap: spacing[2],
  },
  form: {
    gap: spacing[4],
  },
  devBanner: {
    gap: spacing[1],
    borderRadius: 12,
    backgroundColor: colors.primary.light,
    padding: spacing[4],
  },
  forgotLink: {
    alignSelf: 'flex-end',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing[2],
  },
});
