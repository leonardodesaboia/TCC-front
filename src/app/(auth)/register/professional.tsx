import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Check, Eye, EyeOff } from 'lucide-react-native';
import { type Control, useForm, useWatch } from 'react-hook-form';
import { Screen } from '@/components/layout/Screen';
import { FormInput } from '@/components/forms/FormInput';
import { Button, Text } from '@/components/ui';
import { useRegisterProfessional } from '@/lib/hooks/useAuth';
import { maskCPF, maskPhone, unmask } from '@/lib/utils/masks';
import {
  proRegisterStep1Schema,
  proRegisterStep2Schema,
  proRegisterStep3Schema,
  type ProRegisterStep1Data,
  type ProRegisterStep2Data,
  type ProRegisterStep3Data,
} from '@/lib/validations/auth';
import type { RegisterProfessionalRequest } from '@/types/user';
import { colors, radius, spacing } from '@/theme';

function StepDots({ current, total }: { current: number; total: number }) {
  return (
    <View style={styles.stepDots}>
      {Array.from({ length: total }, (_, i) => (
        <View
          key={i}
          style={[styles.dot, i + 1 <= current && styles.dotActive]}
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

function PasswordRules({ control }: { control: Control<ProRegisterStep3Data> }) {
  const password = useWatch({
    control,
    name: 'password',
    defaultValue: '',
  });

  const rules = [
    { label: 'Mínimo 8 caracteres', met: password.length >= 8 },
    { label: '1 letra maiúscula', met: /[A-Z]/.test(password) },
    { label: '1 letra minúscula', met: /[a-z]/.test(password) },
    { label: '1 número', met: /[0-9]/.test(password) },
    { label: '1 caractere especial', met: /[^A-Za-z0-9]/.test(password) },
  ];

  return (
    <View style={styles.rulesBox}>
      {rules.map((rule) => <PasswordRule key={rule.label} {...rule} />)}
    </View>
  );
}

function formatMoneyInput(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (!digits) return '';

  const integer = digits.slice(0, -2) || '0';
  const decimal = digits.slice(-2).padStart(2, '0');
  const normalizedInteger = String(Number(integer));
  return `${normalizedInteger},${decimal}`;
}

function parseMoneyInput(value: string): number {
  const normalized = value.replace(/\./g, '').replace(',', '.');
  return Number.parseFloat(normalized);
}

function ProfessionalPasswordStep({
  loading,
  onBack,
  onSubmit,
}: {
  loading: boolean;
  onBack: () => void;
  onSubmit: (values: ProRegisterStep3Data) => void;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { control, handleSubmit } = useForm<ProRegisterStep3Data>({
    resolver: zodResolver(proRegisterStep3Schema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  return (
    <View style={styles.form}>
      <FormInput
        control={control}
        name="password"
        label="Senha"
        placeholder="Crie uma senha"
        secureTextEntry={!showPassword}
        autoCapitalize="none"
        autoComplete="password"
        rightIcon={(
          <Pressable hitSlop={10} onPress={() => setShowPassword((value) => !value)}>
            {showPassword ? <EyeOff color={colors.neutral[400]} size={20} /> : <Eye color={colors.neutral[400]} size={20} />}
          </Pressable>
        )}
      />

      <PasswordRules control={control} />

      <FormInput
        control={control}
        name="confirmPassword"
        label="Confirmar senha"
        placeholder="Repita a senha"
        secureTextEntry={!showConfirmPassword}
        autoCapitalize="none"
        autoComplete="password"
        rightIcon={(
          <Pressable hitSlop={10} onPress={() => setShowConfirmPassword((value) => !value)}>
            {showConfirmPassword ? <EyeOff color={colors.neutral[400]} size={20} /> : <Eye color={colors.neutral[400]} size={20} />}
          </Pressable>
        )}
      />

      <View style={styles.buttonRow}>
        <Button variant="secondary" onPress={onBack}>Voltar</Button>
        <Button loading={loading} onPress={handleSubmit(onSubmit)}>Criar conta</Button>
      </View>
    </View>
  );
}

export default function RegisterProfessionalScreen() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [step1Saved, setStep1Saved] = useState<ProRegisterStep1Data>({
    cpf: '',
    name: '',
    email: '',
    phone: '',
  });
  const [step2Saved, setStep2Saved] = useState<ProRegisterStep2Data>({
    bio: '',
    yearsOfExperience: '',
    baseHourlyRate: '',
  });
  const register = useRegisterProfessional();

  const step1 = useForm<ProRegisterStep1Data>({
    resolver: zodResolver(proRegisterStep1Schema),
    defaultValues: step1Saved,
  });

  const step2 = useForm<ProRegisterStep2Data>({
    resolver: zodResolver(proRegisterStep2Schema),
    defaultValues: step2Saved,
  });

  const goToStep2 = step1.handleSubmit((values) => {
    setStep1Saved(values);
    setStep(2);
  });

  const goToStep3 = step2.handleSubmit((values) => {
    setStep2Saved(values);
    setStep(3);
  });

  const goBack = () => {
    if (step === 3) {
      setStep(2);
      return;
    }

    if (step === 2) {
      setStep(1);
      return;
    }

    router.replace('/(auth)/register/');
  };

  const submit = (values: ProRegisterStep3Data) => {
    const payload: RegisterProfessionalRequest = {
      cpf: unmask(step1Saved.cpf),
      name: step1Saved.name.trim(),
      email: step1Saved.email.trim(),
      phone: `+55${unmask(step1Saved.phone)}`,
      password: values.password,
      bio: step2Saved.bio.trim(),
      yearsOfExperience: Number.parseInt(step2Saved.yearsOfExperience, 10),
      baseHourlyRate: parseMoneyInput(step2Saved.baseHourlyRate),
    };

    register.mutate(payload);
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
        <Text variant="displayMd">
          {step === 1 ? 'Seus dados' : step === 2 ? 'Seu perfil' : 'Crie uma senha'}
        </Text>
        <Text variant="bodySm" color={colors.neutral[500]}>
          {step === 1
            ? 'Cadastre sua conta para começar a oferecer serviços.'
            : step === 2
              ? 'Conte sua experiência e defina sua base de preço.'
              : 'Defina uma senha segura para acessar sua área profissional.'}
        </Text>
      </View>

      {step === 1 ? (
        <View style={styles.form}>
          <FormInput
            control={step1.control}
            name="cpf"
            label="CPF"
            placeholder="000.000.000-00"
            keyboardType="numeric"
            mask={maskCPF}
            maxLength={14}
          />
          <FormInput
            control={step1.control}
            name="name"
            label="Nome completo"
            placeholder="Seu nome"
            autoCapitalize="words"
          />
          <FormInput
            control={step1.control}
            name="email"
            label="E-mail"
            placeholder="seu@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
          <FormInput
            control={step1.control}
            name="phone"
            label="Telefone"
            placeholder="(00) 00000-0000"
            keyboardType="phone-pad"
            mask={maskPhone}
            maxLength={15}
          />
          <Button onPress={goToStep2}>Continuar</Button>
        </View>
      ) : null}

      {step === 2 ? (
        <View style={styles.form}>
          <FormInput
            control={step2.control}
            name="bio"
            label="Bio profissional"
            placeholder="Ex.: Eletricista residencial com foco em atendimentos rápidos."
            autoCapitalize="sentences"
          />
          <FormInput
            control={step2.control}
            name="yearsOfExperience"
            label="Anos de experiência"
            placeholder="Ex.: 5"
            keyboardType="numeric"
            maxLength={2}
          />
          <FormInput
            control={step2.control}
            name="baseHourlyRate"
            label="Valor/hora base"
            placeholder="0,00"
            keyboardType="numeric"
            mask={formatMoneyInput}
          />
          <View style={styles.buttonRow}>
            <Button variant="secondary" onPress={goBack}>Voltar</Button>
            <Button onPress={goToStep3}>Continuar</Button>
          </View>
        </View>
      ) : null}

      {step === 3 ? (
        <ProfessionalPasswordStep
          loading={register.isPending}
          onBack={goBack}
          onSubmit={submit}
        />
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
  buttonRow: {
    flexDirection: 'row',
    gap: spacing[3],
  },
});
