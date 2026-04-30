import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { ArrowLeft, Check, Eye, EyeOff } from 'lucide-react-native';
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
import { colors, radius, spacing } from '@/theme';

type Step = 1 | 2 | 3;

function StepDots({ current, total }: { current: number; total: number }) {
  return (
    <View style={styles.stepDots}>
      {Array.from({ length: total }, (_, i) => (
        <View key={i} style={[styles.dot, i + 1 <= current && styles.dotActive]} />
      ))}
    </View>
  );
}

function PasswordRule({ label, met }: { label: string; met: boolean }) {
  return (
    <View style={styles.ruleRow}>
      <View style={[styles.ruleIcon, met && styles.ruleIconMet]}>
        <Check color={met ? '#FFFFFF' : colors.neutral[400]} size={10} />
      </View>
      <Text variant="labelLg" color={met ? colors.neutral[800] : colors.neutral[400]}>
        {label}
      </Text>
    </View>
  );
}

const STEP_TITLES: Record<Step, string> = {
  1: 'Recuperar senha',
  2: 'Código de verificação',
  3: 'Nova senha',
};

const STEP_DESCRIPTIONS: Record<Step, string> = {
  1: 'Informe seu e-mail para receber o código.',
  2: 'Digite o código de 4 dígitos enviado.',
  3: 'Defina sua nova senha.',
};

export default function ForgotPasswordScreen() {
  const [step, setStep] = useState<Step>(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [showPw, setShowPw] = useState(false);

  const forgotForm = useForm<ForgotPasswordFormData>({ resolver: zodResolver(forgotPasswordSchema), defaultValues: { email: '' } });
  const codeForm = useForm<ResetCodeFormData>({ resolver: zodResolver(resetCodeSchema), defaultValues: { code: '' } });
  const pwForm = useForm<NewPasswordFormData>({ resolver: zodResolver(newPasswordSchema), defaultValues: { newPassword: '' } });

  const sendCode = useMutation({
    mutationFn: authApi.forgotPassword,
    onSuccess: (_, v) => { setEmail(v.email); toast.success('Código enviado'); setStep(2); },
    onError: (e: unknown) => toast.error('Erro', getApiErrorMessage(e)),
  });

  const resetPw = useMutation({
    mutationFn: authApi.resetPassword,
    onSuccess: () => { toast.success('Senha redefinida'); router.replace('/(auth)/login'); },
    onError: (e: unknown) => toast.error('Erro', getApiErrorMessage(e)),
  });

  const pw = pwForm.watch('newPassword') ?? '';
  const rules = useMemo(() => [
    { label: 'Mínimo 8 caracteres', met: pw.length >= 8 },
    { label: '1 maiúscula', met: /[A-Z]/.test(pw) },
    { label: '1 minúscula', met: /[a-z]/.test(pw) },
    { label: '1 número', met: /[0-9]/.test(pw) },
  ], [pw]);

  const goBack = () => {
    if (step === 1) { router.back(); return; }
    setStep((s) => (s - 1) as Step);
  };

  return (
    <Screen edges={['top', 'bottom']}>
      <View style={styles.topRow}>
        <Pressable onPress={goBack} hitSlop={8} style={styles.backBtn}>
          <ArrowLeft color={colors.neutral[900]} size={22} />
        </Pressable>
        <StepDots current={step} total={3} />
        <View style={styles.backBtn} />
      </View>

      <View style={styles.header}>
        <Text variant="displayMd">{STEP_TITLES[step]}</Text>
        <Text variant="bodySm" color={colors.neutral[500]}>
          {step === 2 ? `Código enviado para ${email}` : STEP_DESCRIPTIONS[step]}
        </Text>
      </View>

      {step === 1 ? (
        <View style={styles.form}>
          <FormInput control={forgotForm.control} name="email" label="E-mail" placeholder="seu@email.com" keyboardType="email-address" autoCapitalize="none" autoComplete="email" />
          <Button loading={sendCode.isPending} onPress={forgotForm.handleSubmit((v) => sendCode.mutate(v))}>
            Enviar código
          </Button>
        </View>
      ) : null}

      {step === 2 ? (
        <View style={styles.form}>
          <FormInput control={codeForm.control} name="code" label="Código" placeholder="0000" keyboardType="numeric" maxLength={4} />
          <Button onPress={codeForm.handleSubmit((v) => { setCode(v.code); setStep(3); })}>
            Verificar
          </Button>
          <Pressable onPress={() => sendCode.mutate({ email })} style={styles.resendLink}>
            <Text variant="labelLg" color={colors.primary.default}>Reenviar código</Text>
          </Pressable>
        </View>
      ) : null}

      {step === 3 ? (
        <View style={styles.form}>
          <FormInput
            control={pwForm.control}
            name="newPassword"
            label="Nova senha"
            placeholder="Digite a nova senha"
            secureTextEntry={!showPw}
            autoCapitalize="none"
            autoComplete="new-password"
            rightIcon={
              <Pressable hitSlop={10} onPress={() => setShowPw((v) => !v)}>
                {showPw ? <EyeOff color={colors.neutral[400]} size={20} /> : <Eye color={colors.neutral[400]} size={20} />}
              </Pressable>
            }
          />
          <View style={styles.rulesBox}>
            {rules.map((r) => <PasswordRule key={r.label} {...r} />)}
          </View>
          <Button loading={resetPw.isPending} onPress={pwForm.handleSubmit((v) => resetPw.mutate({ email, code, newPassword: v.newPassword }))}>
            Redefinir senha
          </Button>
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[6],
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDots: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing[2],
  },
  dot: {
    width: 24,
    height: 4,
    borderRadius: radius.full,
    backgroundColor: colors.neutral[200],
  },
  dotActive: {
    backgroundColor: colors.primary.default,
  },
  header: {
    gap: spacing[2],
    marginBottom: spacing[6],
  },
  form: {
    gap: spacing[4],
  },
  rulesBox: {
    gap: spacing[2],
    backgroundColor: colors.neutral[100],
    borderRadius: radius.md,
    padding: spacing[4],
  },
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  ruleIcon: {
    width: 18,
    height: 18,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.neutral[300],
  },
  ruleIconMet: {
    backgroundColor: colors.success,
  },
  resendLink: {
    alignSelf: 'center',
  },
});
