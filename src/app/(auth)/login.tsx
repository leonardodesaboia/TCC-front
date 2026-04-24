import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react-native';
import { useForm } from 'react-hook-form';
import { Screen } from '@/components/layout/Screen';
import { FormInput } from '@/components/forms/FormInput';
import { Button, Text } from '@/components/ui';
import { AUTH_BYPASS_ENABLED } from '@/lib/constants/config';
import { useLogin } from '@/lib/hooks/useAuth';
import { loginSchema, type LoginFormData } from '@/lib/validations/auth';
import { colors, layout, radius, shadows, spacing } from '@/theme';

export default function LoginScreen() {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const login = useLogin();
  const isBypassMode = AUTH_BYPASS_ENABLED;
  const { control, handleSubmit } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  return (
    <Screen edges={['top', 'bottom']}>
      <View style={styles.shell}>
        <View style={styles.hero}>
          <Text variant="labelLg" color={colors.primary.default}>
            ALLSET
          </Text>
          <Text variant="displayLg" style={styles.title}>
            Entre para contratar profissionais com rapidez.
          </Text>
          <Text variant="bodyLg" color={colors.neutral[500]}>
            Acesse sua conta para acompanhar pedidos, pagamentos e agendamentos.
          </Text>
        </View>

        <View style={styles.card}>
          {isBypassMode ? (
            <View style={styles.devBanner}>
              <Text variant="labelLg" color={colors.primary.default}>
                MODO DEV ATIVO
              </Text>
              <Text color={colors.neutral[500]}>
                Por enquanto, basta tocar em Entrar para acessar a Home.
              </Text>
            </View>
          ) : null}

          <FormInput
            autoCapitalize="none"
            autoComplete="email"
            control={control}
            keyboardType="email-address"
            label="E-mail"
            leftIcon={<Mail color={colors.neutral[500]} size={18} />}
            name="email"
            placeholder="voce@exemplo.com"
          />
          <FormInput
            autoCapitalize="none"
            autoComplete="password"
            control={control}
            label="Senha"
            leftIcon={<Lock color={colors.neutral[500]} size={18} />}
            name="password"
            placeholder="Sua senha"
            rightIcon={
              <Pressable hitSlop={10} onPress={() => setIsPasswordVisible((current) => !current)}>
                {isPasswordVisible ? (
                  <EyeOff color={colors.neutral[500]} size={18} />
                ) : (
                  <Eye color={colors.neutral[500]} size={18} />
                )}
              </Pressable>
            }
            secureTextEntry={!isPasswordVisible}
          />

          <Pressable onPress={() => router.push('/(auth)/forgot-password')} style={styles.inlineLink}>
            <Text variant="labelLg" color={colors.primary.default}>
              Esqueci minha senha
            </Text>
          </Pressable>

          <Button
            loading={login.isPending}
            onPress={
              isBypassMode
                ? () => login.mutate({ email: '', password: '' })
                : handleSubmit((values) => login.mutate(values))
            }
          >
            Entrar
          </Button>
        </View>

        <View style={styles.footer}>
          <Text color={colors.neutral[500]}>Ainda não tem conta?</Text>
          <Pressable onPress={() => router.push('/(auth)/register/')}>
            <Text variant="labelLg" color={colors.primary.default}>
              Criar conta
            </Text>
          </Pressable>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    justifyContent: 'center',
    gap: layout.sectionGap,
  },
  hero: {
    gap: spacing[3],
  },
  title: {
    color: colors.secondary.default,
  },
  card: {
    gap: layout.formGap,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    padding: layout.cardPadding,
    ...shadows.md,
  },
  devBanner: {
    gap: spacing[1],
    borderRadius: radius.lg,
    backgroundColor: '#FFF8F2',
    borderWidth: 1,
    borderColor: '#F6D8BF',
    padding: spacing[3],
  },
  inlineLink: {
    alignSelf: 'flex-end',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing[2],
  },
});
