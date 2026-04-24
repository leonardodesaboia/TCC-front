import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Circle,
  Eye,
  EyeOff,
  IdCard,
  Lock,
  Mail,
  Phone,
  UserRound,
} from 'lucide-react-native';
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
import { colors, layout, radius, shadows, spacing } from '@/theme';

function StepIndicator({ currentStep }: { currentStep: 1 | 2 }) {
  return (
    <View style={styles.stepIndicator}>
      {[1, 2].map((step) => {
        const isActive = currentStep === step;
        const isComplete = currentStep > step;

        return (
          <View key={step} style={styles.stepItem}>
            {isComplete ? (
              <CheckCircle2 color={colors.primary.default} size={18} />
            ) : (
              <Circle
                color={isActive ? colors.primary.default : colors.neutral[400]}
                fill={isActive ? colors.primary.default : colors.transparent}
                size={18}
              />
            )}
            <Text
              variant="labelLg"
              color={isActive || isComplete ? colors.secondary.default : colors.neutral[500]}
            >
              Etapa {step}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

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

export default function RegisterClientScreen() {
  const [step, setStep] = useState<1 | 2>(1);
  const [step1Values, setStep1Values] = useState<ClientRegisterStep1Data>({
    cpf: '',
    name: '',
    email: '',
    phone: '',
    birthDate: '',
  });
  const [step2Values, setStep2Values] = useState<ClientRegisterStep2Data>({
    password: '',
    confirmPassword: '',
  });
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const register = useRegister();

  const step1Form = useForm<ClientRegisterStep1Data>({
    resolver: zodResolver(clientRegisterStep1Schema),
    defaultValues: step1Values,
  });
  const step2Form = useForm<ClientRegisterStep2Data>({
    resolver: zodResolver(clientRegisterStep2Schema),
    defaultValues: step2Values,
  });

  const password = step2Form.watch('password') ?? '';
  const passwordChecks = useMemo(
    () => [
      { label: 'Mínimo de 8 caracteres', isMet: password.length >= 8 },
      { label: 'Pelo menos 1 letra maiúscula', isMet: /[A-Z]/.test(password) },
      { label: 'Pelo menos 1 letra minúscula', isMet: /[a-z]/.test(password) },
      { label: 'Pelo menos 1 número', isMet: /[0-9]/.test(password) },
    ],
    [password],
  );

  const submitStep1 = step1Form.handleSubmit((values) => {
    setStep1Values(values);
    setStep(2);
  });

  const submitStep2 = step2Form.handleSubmit((values) => {
    setStep2Values(values);
    const payload: RegisterClientRequest = {
      cpf: unmask(step1Values.cpf),
      name: step1Values.name.trim(),
      email: step1Values.email.trim(),
      phone: unmask(step1Values.phone),
      birthDate: step1Values.birthDate,
      password: values.password,
    };

    register.mutate(payload);
  });

  const goBackFromStep2 = () => {
    setStep2Values(step2Form.getValues());
    setStep(1);
  };

  return (
    <Screen edges={['top', 'bottom']}>
      <View style={styles.shell}>
        <Pressable
          onPress={() => (step === 1 ? router.replace('/(auth)/register/') : goBackFromStep2())}
          style={styles.backAction}
        >
          <ArrowLeft color={colors.primary.default} size={18} />
          <Text variant="labelLg" color={colors.primary.default}>
            {step === 1 ? 'Voltar para perfis' : 'Voltar para dados pessoais'}
          </Text>
        </Pressable>

        <View style={styles.hero}>
          <Text variant="labelLg" color={colors.primary.default}>
            CADASTRO DE CLIENTE
          </Text>
          <Text variant="displayMd" style={styles.title}>
            {step === 1 ? 'Conte quem você é.' : 'Agora defina a segurança da conta.'}
          </Text>
          <Text variant="bodyLg" color={colors.neutral[500]}>
            {step === 1
              ? 'Precisamos dos seus dados principais para personalizar a experiência desde o primeiro acesso.'
              : 'A senha segue os critérios definidos na fundação do cliente e valida em tempo real.'}
          </Text>
        </View>

        <StepIndicator currentStep={step} />

        {step === 1 ? (
          <View style={styles.card}>
            <FormInput
              control={step1Form.control}
              keyboardType="numeric"
              label="CPF"
              leftIcon={<IdCard color={colors.neutral[500]} size={18} />}
              mask={maskCPF}
              maxLength={14}
              name="cpf"
              placeholder="000.000.000-00"
            />
            <FormInput
              autoCapitalize="words"
              control={step1Form.control}
              label="Nome completo"
              leftIcon={<UserRound color={colors.neutral[500]} size={18} />}
              name="name"
              placeholder="Seu nome completo"
            />
            <FormInput
              autoCapitalize="none"
              autoComplete="email"
              control={step1Form.control}
              keyboardType="email-address"
              label="E-mail"
              leftIcon={<Mail color={colors.neutral[500]} size={18} />}
              name="email"
              placeholder="voce@exemplo.com"
            />
            <FormInput
              control={step1Form.control}
              keyboardType="phone-pad"
              label="Telefone"
              leftIcon={<Phone color={colors.neutral[500]} size={18} />}
              mask={maskPhone}
              maxLength={15}
              name="phone"
              placeholder="(00) 00000-0000"
            />
            <FormInput
              control={step1Form.control}
              keyboardType="numeric"
              label="Data de nascimento"
              leftIcon={<CalendarDays color={colors.neutral[500]} size={18} />}
              mask={maskDate}
              maxLength={10}
              name="birthDate"
              placeholder="dd/mm/aaaa"
            />

            <Button onPress={submitStep1}>Próximo</Button>
          </View>
        ) : (
          <View style={styles.card}>
            <FormInput
              autoCapitalize="none"
              autoComplete="new-password"
              control={step2Form.control}
              label="Senha"
              leftIcon={<Lock color={colors.neutral[500]} size={18} />}
              name="password"
              placeholder="Crie uma senha forte"
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
            <FormInput
              autoCapitalize="none"
              autoComplete="new-password"
              control={step2Form.control}
              label="Confirmar senha"
              leftIcon={<Lock color={colors.neutral[500]} size={18} />}
              name="confirmPassword"
              placeholder="Repita sua senha"
              rightIcon={
                <Pressable
                  hitSlop={10}
                  onPress={() => setIsConfirmPasswordVisible((current) => !current)}
                >
                  {isConfirmPasswordVisible ? (
                    <EyeOff color={colors.neutral[500]} size={18} />
                  ) : (
                    <Eye color={colors.neutral[500]} size={18} />
                  )}
                </Pressable>
              }
              secureTextEntry={!isConfirmPasswordVisible}
            />

            <View style={styles.buttonRow}>
              <View style={styles.buttonHalf}>
                <Button variant="secondary" onPress={goBackFromStep2}>
                  Voltar
                </Button>
              </View>
              <View style={styles.buttonHalf}>
                <Button loading={register.isPending} onPress={submitStep2}>
                  Criar conta
                </Button>
              </View>
            </View>
          </View>
        )}
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
    gap: spacing[4],
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  card: {
    gap: layout.formGap,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    padding: layout.cardPadding,
    ...shadows.md,
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
  buttonRow: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  buttonHalf: {
    flex: 1,
  },
});
