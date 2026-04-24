import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  Mail,
} from 'lucide-react-native';
import { useForm } from 'react-hook-form';
import { Screen } from '@/components/layout/Screen';
import { FormInput } from '@/components/forms/FormInput';
import { Button, Text } from '@/components/ui';
import { authApi } from '@/lib/api/auth';
import { getApiErrorMessage } from '@/lib/utils/errors';
import { toast } from '@/lib/utils/toast';
import {
  forgotPasswordSchema,
  newPasswordSchema,
  resetCodeSchema,
  type ForgotPasswordFormData,
  type NewPasswordFormData,
  type ResetCodeFormData,
} from '@/lib/validations/auth';
import { colors, layout, radius, shadows, spacing } from '@/theme';

type ForgotStep = 1 | 2 | 3;

function PasswordRequirement({ label, isMet }: { label: string; isMet: boolean }) {
  return (
    <View style={styles.requirementRow}>
      <CheckCircle2
        color={isMet ? colors.success : colors.neutral[400]}
        fill={isMet ? colors.success : colors.transparent}
        size={16}
      />
      <Text color={isMet ? colors.secondary.default : colors.neutral[500]}>{label}</Text>
    </View>
  );
}

export default function ForgotPasswordScreen() {
  const [step, setStep] = useState<ForgotStep>(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const forgotForm = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });
  const codeForm = useForm<ResetCodeFormData>({
    resolver: zodResolver(resetCodeSchema),
    defaultValues: { code: '' },
  });
  const passwordForm = useForm<NewPasswordFormData>({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: { newPassword: '' },
  });

  const forgotPassword = useMutation({
    mutationFn: authApi.forgotPassword,
    onSuccess: (_, values) => {
      setEmail(values.email);
      toast.success('Código enviado', 'Confira seu e-mail para continuar');
      setStep(2);
    },
    onError: (error: unknown) => {
      toast.error('Erro ao enviar código', getApiErrorMessage(error));
    },
  });

  const resetPassword = useMutation({
    mutationFn: authApi.resetPassword,
    onSuccess: () => {
      toast.success('Senha redefinida', 'Faça login com sua nova senha');
      router.replace('/(auth)/login');
    },
    onError: (error: unknown) => {
      toast.error('Erro ao redefinir senha', getApiErrorMessage(error));
    },
  });

  const password = passwordForm.watch('newPassword') ?? '';
  const passwordChecks = useMemo(
    () => [
      { label: 'Mínimo de 8 caracteres', isMet: password.length >= 8 },
      { label: 'Pelo menos 1 letra maiúscula', isMet: /[A-Z]/.test(password) },
      { label: 'Pelo menos 1 letra minúscula', isMet: /[a-z]/.test(password) },
      { label: 'Pelo menos 1 número', isMet: /[0-9]/.test(password) },
    ],
    [password],
  );

  const backAction = () => {
    if (step === 1) {
      router.replace('/(auth)/login');
      return;
    }

    setStep((current) => (current === 3 ? 2 : 1));
  };

  return (
    <Screen edges={['top', 'bottom']}>
      <View style={styles.shell}>
        <Pressable onPress={backAction} style={styles.backAction}>
          <ArrowLeft color={colors.primary.default} size={18} />
          <Text variant="labelLg" color={colors.primary.default}>
            {step === 1 ? 'Voltar para login' : 'Voltar'}
          </Text>
        </Pressable>

        <View style={styles.hero}>
          <Text variant="labelLg" color={colors.primary.default}>
            RECUPERAÇÃO DE SENHA
          </Text>
          <Text variant="displayMd" style={styles.title}>
            {step === 1 && 'Comece informando seu e-mail.'}
            {step === 2 && 'Digite o código recebido.'}
            {step === 3 && 'Cadastre a nova senha.'}
          </Text>
          <Text variant="bodyLg" color={colors.neutral[500]}>
            {step === 1 &&
              'Enviaremos um código de 4 dígitos para o endereço vinculado à sua conta.'}
            {step === 2 &&
              `Use o código enviado para ${email || 'seu e-mail'} e avance para a redefinição.`}
            {step === 3 && 'A nova senha precisa obedecer aos requisitos do fluxo de autenticação.'}
          </Text>
        </View>

        <View style={styles.stepIndicator}>
          {[1, 2, 3].map((indicator) => {
            const isActive = indicator === step;
            const isComplete = indicator < step;

            return (
              <View
                key={indicator}
                style={[
                  styles.stepDot,
                  (isActive || isComplete) && styles.stepDotActive,
                ]}
              />
            );
          })}
        </View>

        {step === 1 ? (
          <View style={styles.card}>
            <FormInput
              autoCapitalize="none"
              autoComplete="email"
              control={forgotForm.control}
              keyboardType="email-address"
              label="E-mail"
              leftIcon={<Mail color={colors.neutral[500]} size={18} />}
              name="email"
              placeholder="voce@exemplo.com"
            />
            <Button
              loading={forgotPassword.isPending}
              onPress={forgotForm.handleSubmit((values) => forgotPassword.mutate(values))}
            >
              Enviar código
            </Button>
          </View>
        ) : null}

        {step === 2 ? (
          <View style={styles.card}>
            <FormInput
              control={codeForm.control}
              keyboardType="numeric"
              label="Código"
              leftIcon={<KeyRound color={colors.neutral[500]} size={18} />}
              maxLength={4}
              name="code"
              placeholder="0000"
            />
            <Button
              onPress={codeForm.handleSubmit((values) => {
                setCode(values.code);
                setStep(3);
              })}
            >
              Continuar
            </Button>
            <Pressable
              onPress={() => forgotPassword.mutate({ email })}
              style={styles.centeredAction}
            >
              <Text variant="labelLg" color={colors.primary.default}>
                Reenviar código
              </Text>
            </Pressable>
          </View>
        ) : null}

        {step === 3 ? (
          <View style={styles.card}>
            <FormInput
              autoCapitalize="none"
              autoComplete="new-password"
              control={passwordForm.control}
              label="Nova senha"
              leftIcon={<Lock color={colors.neutral[500]} size={18} />}
              name="newPassword"
              placeholder="Digite sua nova senha"
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
            <View style={styles.requirementsCard}>
              {passwordChecks.map((rule) => (
                <PasswordRequirement key={rule.label} {...rule} />
              ))}
            </View>
            <Button
              loading={resetPassword.isPending}
              onPress={passwordForm.handleSubmit((values) =>
                resetPassword.mutate({
                  email,
                  code,
                  newPassword: values.newPassword,
                })
              )}
            >
              Redefinir senha
            </Button>
          </View>
        ) : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  shell: {
    gap: layout.sectionGap,
  },
  backAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  hero: {
    gap: spacing[3],
  },
  title: {
    color: colors.secondary.default,
  },
  stepIndicator: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  stepDot: {
    flex: 1,
    height: 6,
    borderRadius: radius.full,
    backgroundColor: colors.neutral[300],
  },
  stepDotActive: {
    backgroundColor: colors.primary.default,
  },
  card: {
    gap: layout.formGap,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    padding: layout.cardPadding,
    ...shadows.md,
  },
  centeredAction: {
    alignSelf: 'center',
  },
  requirementsCard: {
    gap: spacing[2],
    borderRadius: radius.lg,
    backgroundColor: colors.neutral[100],
    padding: spacing[4],
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
});
