import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Check, Eye, EyeOff } from 'lucide-react-native';
import { useForm } from 'react-hook-form';
import { Screen } from '@/components/layout/Screen';
import { FormInput } from '@/components/forms/FormInput';
import { Button, Text } from '@/components/ui';
import { useRegister } from '@/lib/hooks/useAuth';
import { maskCPF, maskDate, maskPhone, unmask } from '@/lib/utils/masks';
import {
  clientRegisterStep1Schema,
  clientRegisterStep2Schema,
  type ClientRegisterStep1Data,
  type ClientRegisterStep2Data,
} from '@/lib/validations/auth';
import type { RegisterClientRequest } from '@/types/user';
import { colors, radius, spacing } from '@/theme';

function StepDots({ current, total }: { current: number; total: number }) {
  return (
    <View style={styles.stepDots}>
      {Array.from({ length: total }, (_, i) => (
        <View
          key={i}
          style={[
            styles.dot,
            i + 1 <= current && styles.dotActive,
          ]}
        />
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

export default function RegisterClientScreen() {
  const [step, setStep] = useState<1 | 2>(1);
  const [step1Saved, setStep1Saved] = useState<ClientRegisterStep1Data>({ cpf: '', name: '', email: '', phone: '', birthDate: '' });
  const [showPw, setShowPw] = useState(false);
  const [showCpw, setShowCpw] = useState(false);
  const register = useRegister();

  const step1 = useForm<ClientRegisterStep1Data>({
    resolver: zodResolver(clientRegisterStep1Schema),
    defaultValues: step1Saved,
  });

  const step2 = useForm<ClientRegisterStep2Data>({
    resolver: zodResolver(clientRegisterStep2Schema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const pw = step2.watch('password') ?? '';
  const rules = useMemo(() => [
    { label: 'Mínimo 8 caracteres', met: pw.length >= 8 },
    { label: '1 letra maiúscula', met: /[A-Z]/.test(pw) },
    { label: '1 letra minúscula', met: /[a-z]/.test(pw) },
    { label: '1 número', met: /[0-9]/.test(pw) },
  ], [pw]);

  const goNext = step1.handleSubmit((v) => { setStep1Saved(v); setStep(2); });
  const goBack = () => { setStep(1); };

  const submit = step2.handleSubmit((v) => {
    const payload: RegisterClientRequest = {
      cpf: unmask(step1Saved.cpf),
      name: step1Saved.name.trim(),
      email: step1Saved.email.trim(),
      phone: unmask(step1Saved.phone),
      birthDate: step1Saved.birthDate,
      password: v.password,
    };
    register.mutate(payload);
  });

  return (
    <Screen edges={['top', 'bottom']}>
      <View style={styles.topRow}>
        <Pressable
          onPress={() => (step === 1 ? router.replace('/(auth)/register/') : goBack())}
          hitSlop={8}
          style={styles.backBtn}
        >
          <ArrowLeft color={colors.neutral[900]} size={22} />
        </Pressable>
        <StepDots current={step} total={2} />
        <View style={styles.backBtn} />
      </View>

      <View style={styles.header}>
        <Text variant="displayMd">
          {step === 1 ? 'Seus dados' : 'Crie uma senha'}
        </Text>
        <Text variant="bodySm" color={colors.neutral[500]}>
          {step === 1
            ? 'Informe seus dados pessoais para começar.'
            : 'Defina uma senha segura para sua conta.'}
        </Text>
      </View>

      {step === 1 ? (
        <View style={styles.form}>
          <FormInput control={step1.control} name="cpf" label="CPF" placeholder="000.000.000-00" keyboardType="numeric" mask={maskCPF} maxLength={14} />
          <FormInput control={step1.control} name="name" label="Nome completo" placeholder="Seu nome" autoCapitalize="words" />
          <FormInput control={step1.control} name="email" label="E-mail" placeholder="seu@email.com" keyboardType="email-address" autoCapitalize="none" autoComplete="email" />
          <FormInput control={step1.control} name="phone" label="Telefone" placeholder="(00) 00000-0000" keyboardType="phone-pad" mask={maskPhone} maxLength={15} />
          <FormInput control={step1.control} name="birthDate" label="Data de nascimento" placeholder="dd/mm/aaaa" keyboardType="numeric" mask={maskDate} maxLength={10} />
          <Button onPress={goNext}>Continuar</Button>
        </View>
      ) : (
        <View style={styles.form}>
          <FormInput
            control={step2.control}
            name="password"
            label="Senha"
            placeholder="Crie uma senha"
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

          <FormInput
            control={step2.control}
            name="confirmPassword"
            label="Confirmar senha"
            placeholder="Repita a senha"
            secureTextEntry={!showCpw}
            autoCapitalize="none"
            autoComplete="new-password"
            rightIcon={
              <Pressable hitSlop={10} onPress={() => setShowCpw((v) => !v)}>
                {showCpw ? <EyeOff color={colors.neutral[400]} size={20} /> : <Eye color={colors.neutral[400]} size={20} />}
              </Pressable>
            }
          />

          <View style={styles.buttonRow}>
            <Button variant="secondary" onPress={goBack}>Voltar</Button>
            <Button loading={register.isPending} onPress={submit}>Criar conta</Button>
          </View>
        </View>
      )}
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
    width: 32,
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
  buttonRow: {
    flexDirection: 'row',
    gap: spacing[3],
  },
});
