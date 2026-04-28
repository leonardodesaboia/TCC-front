import { useState } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Check, Eye, EyeOff } from 'lucide-react-native';
import { type Control, useForm, useWatch } from 'react-hook-form';
import { Screen } from '@/components/layout/Screen';
import { FormInput } from '@/components/forms/FormInput';
import { Button, Input, Text } from '@/components/ui';
import { useRegisterProfessional } from '@/lib/hooks/useAuth';
import { useServiceAreas, useServiceCategories } from '@/lib/hooks/useCatalog';
import { toast } from '@/lib/utils/toast';
import { maskCPF, maskDate, maskPhone, unmask } from '@/lib/utils/masks';
import {
  proRegisterStep1Schema,
  proRegisterStep2Schema,
  proRegisterStep3Schema,
  type ProRegisterStep1Data,
  type ProRegisterStep2Data,
  type ProRegisterStep3Data,
} from '@/lib/validations/auth';
import type { ServiceCategory } from '@/types/catalog';
import type { DocType } from '@/types/professional-management';
import type { RegisterProfessionalRequest } from '@/types/user';
import { colors, radius, spacing } from '@/theme';

const MAX_SPECIALTIES = 3;

interface SelectedSpecialty {
  categoryId: string;
  yearsOfExperience: string;
  hourlyRate: string;
}

interface SelectedDocument {
  uri: string;
  mimeType?: string;
  fileName?: string;
}

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

function PasswordRules({ control }: { control: Control<ProRegisterStep3Data> }) {
  const password = useWatch({ control, name: 'password', defaultValue: '' });

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

function parseMoneyInput(value: string): number | undefined {
  const normalized = value.replace(/\./g, '').replace(',', '.');
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

function getCategoryName(categoryId: string, categories: ServiceCategory[]) {
  return categories.find((category) => category.id === categoryId)?.name ?? 'Profissão';
}

function getAreaName(categoryId: string, categories: ServiceCategory[], areas: Array<{ id: string; name: string }>) {
  const category = categories.find((item) => item.id === categoryId);
  return areas.find((area) => area.id === category?.areaId)?.name ?? 'Área';
}

function DocumentCard({
  title,
  description,
  document,
  onPress,
}: {
  title: string;
  description: string;
  document: SelectedDocument | null;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.uploadCard, pressed && styles.pressed]}>
      <View style={styles.uploadText}>
        <Text variant="titleSm">{title}</Text>
        <Text variant="bodySm" color={colors.neutral[500]}>
          {description}
        </Text>
      </View>
      {document ? (
        <Image source={{ uri: document.uri }} style={styles.documentPreview} />
      ) : (
        <View style={styles.uploadPlaceholder}>
          <Text variant="labelLg" color={colors.primary.default}>
            Selecionar
          </Text>
        </View>
      )}
    </Pressable>
  );
}

function CredentialsStep({
  loading,
  selectedDocType,
  setSelectedDocType,
  documentFront,
  documentBack,
  onPickFront,
  onPickBack,
  onBack,
  onSubmit,
}: {
  loading: boolean;
  selectedDocType: Extract<DocType, 'rg' | 'cnh'> | null;
  setSelectedDocType: (value: Extract<DocType, 'rg' | 'cnh'>) => void;
  documentFront: SelectedDocument | null;
  documentBack: SelectedDocument | null;
  onPickFront: () => void;
  onPickBack: () => void;
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
      <View style={styles.sectionBlock}>
        <Text variant="titleSm">Documento de identificação</Text>
        <Text variant="bodySm" color={colors.neutral[500]}>
          Escolha o tipo do documento e envie frente e verso.
        </Text>
      </View>

      <View style={styles.chipsWrap}>
        {[
          { value: 'rg' as const, label: 'RG' },
          { value: 'cnh' as const, label: 'CNH' },
        ].map((option) => (
          <Pressable
            key={option.value}
            onPress={() => setSelectedDocType(option.value)}
            style={[styles.chip, selectedDocType === option.value && styles.chipSelected]}
          >
            <Text
              variant="labelLg"
              color={selectedDocType === option.value ? '#FFFFFF' : colors.neutral[700]}
            >
              {option.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <DocumentCard
        title="Frente do documento"
        description="Imagem nítida da parte frontal."
        document={documentFront}
        onPress={onPickFront}
      />

      <DocumentCard
        title="Verso do documento"
        description="Imagem nítida da parte traseira."
        document={documentBack}
        onPress={onPickBack}
      />

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
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);
  const [selectedSpecialties, setSelectedSpecialties] = useState<SelectedSpecialty[]>([]);
  const [selectedDocType, setSelectedDocType] = useState<Extract<DocType, 'rg' | 'cnh'> | null>(null);
  const [documentFront, setDocumentFront] = useState<SelectedDocument | null>(null);
  const [documentBack, setDocumentBack] = useState<SelectedDocument | null>(null);
  const [step1Saved, setStep1Saved] = useState<ProRegisterStep1Data>({
    cpf: '',
    name: '',
    email: '',
    phone: '',
    birthDate: '',
  });
  const [step2Saved, setStep2Saved] = useState<ProRegisterStep2Data>({ bio: '' });

  const register = useRegisterProfessional();
  const areasQuery = useServiceAreas();
  const categoriesQuery = useServiceCategories();

  const step1 = useForm<ProRegisterStep1Data>({
    resolver: zodResolver(proRegisterStep1Schema),
    defaultValues: step1Saved,
  });

  const step2 = useForm<ProRegisterStep2Data>({
    resolver: zodResolver(proRegisterStep2Schema),
    defaultValues: step2Saved,
  });

  const areas = areasQuery.data ?? [];
  const categories = categoriesQuery.data ?? [];
  const visibleCategories = selectedAreaId
    ? categories.filter((category) => category.areaId === selectedAreaId)
    : [];

  const goToStep2 = step1.handleSubmit((values) => {
    setStep1Saved(values);
    setStep(2);
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

  function toggleCategory(categoryId: string) {
    setSelectedSpecialties((current) => {
      const exists = current.some((item) => item.categoryId === categoryId);
      if (exists) {
        return current.filter((item) => item.categoryId !== categoryId);
      }

      if (current.length >= MAX_SPECIALTIES) {
        toast.info('Limite atingido', `Você pode selecionar até ${MAX_SPECIALTIES} profissões.`);
        return current;
      }

      return [...current, { categoryId, yearsOfExperience: '', hourlyRate: '' }];
    });
  }

  function updateSpecialtyField(categoryId: string, field: 'yearsOfExperience' | 'hourlyRate', value: string) {
    const normalized = field === 'yearsOfExperience'
      ? value.replace(/\D/g, '').slice(0, 2)
      : formatMoneyInput(value);

    setSelectedSpecialties((current) =>
      current.map((item) =>
        item.categoryId === categoryId
          ? { ...item, [field]: normalized }
          : item,
      ));
  }

  function validateSpecialties() {
    if (selectedSpecialties.length === 0) {
      toast.error('Selecione sua atuação', 'Escolha pelo menos uma profissão para continuar.');
      return false;
    }

    const invalidSpecialty = selectedSpecialties.find((item) => {
      const years = Number.parseInt(item.yearsOfExperience, 10);
      return !Number.isFinite(years) || years < 0 || years > 99;
    });

    if (invalidSpecialty) {
      toast.error(
        'Experiência inválida',
        `Informe a experiência da profissão ${getCategoryName(invalidSpecialty.categoryId, categories)}.`,
      );
      return false;
    }

    return true;
  }

  const goToStep3 = step2.handleSubmit((values) => {
    if (!validateSpecialties()) {
      return;
    }

    setStep2Saved(values);
    setStep(3);
  });

  async function pickDocument(target: 'front' | 'back') {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      toast.error('Permissão necessária', 'Libere acesso à galeria para enviar o documento.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });

    if (result.canceled || !result.assets?.[0]) {
      return;
    }

    const asset = result.assets[0];
    const selectedDocument = {
      uri: asset.uri,
      mimeType: asset.mimeType ?? 'image/jpeg',
      fileName: asset.fileName ?? `${target}-document.jpg`,
    };

    if (target === 'front') {
      setDocumentFront(selectedDocument);
      return;
    }

    setDocumentBack(selectedDocument);
  }

  const submit = (values: ProRegisterStep3Data) => {
    if (!validateSpecialties()) {
      setStep(2);
      return;
    }

    if (!selectedDocType) {
      toast.error('Documento obrigatório', 'Selecione o tipo do documento de identificação.');
      return;
    }

    if (!documentFront || !documentBack) {
      toast.error('Documentos obrigatórios', 'Envie a frente e o verso do documento para concluir o cadastro.');
      return;
    }

    const specialtyYears = selectedSpecialties.map((item) => Number.parseInt(item.yearsOfExperience, 10));

    const payload: RegisterProfessionalRequest = {
      cpf: unmask(step1Saved.cpf),
      name: step1Saved.name.trim(),
      email: step1Saved.email.trim(),
      phone: `+55${unmask(step1Saved.phone)}`,
      birthDate: step1Saved.birthDate,
      password: values.password,
      bio: step2Saved.bio.trim() || undefined,
      specialties: selectedSpecialties.map((item) => ({
        categoryId: item.categoryId,
        categoryName: getCategoryName(item.categoryId, categories),
        areaId: categories.find((category) => category.id === item.categoryId)?.areaId,
        areaName: getAreaName(item.categoryId, categories, areas),
        yearsOfExperience: Number.parseInt(item.yearsOfExperience, 10),
        hourlyRate: parseMoneyInput(item.hourlyRate),
      })),
      documents: [
        {
          docType: selectedDocType,
          docSide: 'front',
          uri: documentFront.uri,
          mimeType: documentFront.mimeType,
          fileName: documentFront.fileName ?? `${selectedDocType}-front.jpg`,
        },
        {
          docType: selectedDocType,
          docSide: 'back',
          uri: documentBack.uri,
          mimeType: documentBack.mimeType,
          fileName: documentBack.fileName ?? `${selectedDocType}-back.jpg`,
        },
      ],
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
          {step === 1 ? 'Seus dados' : step === 2 ? 'Sua atuação' : 'Documentos e acesso'}
        </Text>
        <Text variant="bodySm" color={colors.neutral[500]}>
          {step === 1
            ? 'Cadastre sua conta para começar a oferecer serviços.'
            : step === 2
              ? 'Escolha até três profissões, informe a experiência em cada uma e, se quiser, defina o valor/hora.'
              : 'Escolha o tipo do documento, envie frente e verso e defina sua senha.'}
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
          <FormInput
            control={step1.control}
            name="birthDate"
            label="Data de nascimento"
            placeholder="dd/mm/aaaa"
            keyboardType="numeric"
            mask={maskDate}
            maxLength={10}
          />
          <Button onPress={goToStep2}>Continuar</Button>
        </View>
      ) : null}

      {step === 2 ? (
        <View style={styles.form}>
          <FormInput
            control={step2.control}
            name="bio"
            label="Descrição profissional"
            placeholder="Opcional. Conte um pouco sobre sua atuação."
            autoCapitalize="sentences"
          />

          <View style={styles.sectionBlock}>
            <Text variant="titleSm">Áreas de atuação</Text>
            <Text variant="bodySm" color={colors.neutral[500]}>
              Você pode selecionar profissões de áreas diferentes.
            </Text>
          </View>

          <View style={styles.chipsWrap}>
            {areas.map((area) => (
              <Pressable
                key={area.id}
                onPress={() => setSelectedAreaId(area.id)}
                style={[styles.chip, selectedAreaId === area.id && styles.chipSelected]}
              >
                <Text variant="labelLg" color={selectedAreaId === area.id ? '#FFFFFF' : colors.neutral[700]}>
                  {area.name}
                </Text>
              </Pressable>
            ))}
          </View>

          {selectedAreaId ? (
            <View style={styles.categoriesList}>
              {visibleCategories.map((category) => {
                const selected = selectedSpecialties.some((item) => item.categoryId === category.id);
                return (
                  <Pressable
                    key={category.id}
                    onPress={() => toggleCategory(category.id)}
                    style={[styles.categoryCard, selected && styles.categoryCardSelected]}
                  >
                    <Text variant="bodySm" color={selected ? colors.primary.default : colors.neutral[800]}>
                      {category.name}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          ) : (
            <View style={styles.emptyBox}>
              <Text variant="bodySm" color={colors.neutral[500]}>
                Selecione uma área para ver as profissões disponíveis.
              </Text>
            </View>
          )}

          {selectedSpecialties.length > 0 ? (
            <View style={styles.selectedList}>
              {selectedSpecialties.map((specialty) => (
                <View key={specialty.categoryId} style={styles.specialtyCard}>
                  <View style={styles.specialtyHeader}>
                    <View style={styles.specialtyText}>
                      <Text variant="titleSm">{getCategoryName(specialty.categoryId, categories)}</Text>
                      <Text variant="labelLg" color={colors.neutral[500]}>
                        {getAreaName(specialty.categoryId, categories, areas)}
                      </Text>
                    </View>
                    <Pressable onPress={() => toggleCategory(specialty.categoryId)}>
                      <Text variant="labelLg" color={colors.error}>Remover</Text>
                    </Pressable>
                  </View>

                  <Input
                    value={specialty.yearsOfExperience}
                    onChangeText={(value) => updateSpecialtyField(specialty.categoryId, 'yearsOfExperience', value)}
                    placeholder="Anos de experiência nessa profissão"
                    keyboardType="numeric"
                  />

                  <Input
                    value={specialty.hourlyRate}
                    onChangeText={(value) => updateSpecialtyField(specialty.categoryId, 'hourlyRate', value)}
                    placeholder="Valor/hora da profissão (opcional)"
                    keyboardType="numeric"
                  />
                </View>
              ))}
            </View>
          ) : null}

          <View style={styles.buttonRow}>
            <Button variant="secondary" onPress={goBack}>Voltar</Button>
            <Button onPress={goToStep3}>Continuar</Button>
          </View>
        </View>
      ) : null}

      {step === 3 ? (
        <CredentialsStep
          loading={register.isPending}
          selectedDocType={selectedDocType}
          setSelectedDocType={setSelectedDocType}
          documentFront={documentFront}
          documentBack={documentBack}
          onPickFront={() => { void pickDocument('front'); }}
          onPickBack={() => { void pickDocument('back'); }}
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
  sectionBlock: {
    gap: spacing[1],
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  chip: {
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.neutral[300],
    backgroundColor: colors.neutral[50],
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
  },
  chipSelected: {
    borderColor: colors.primary.default,
    backgroundColor: colors.primary.default,
  },
  categoriesList: {
    gap: spacing[2],
  },
  categoryCard: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    backgroundColor: colors.neutral[50],
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
  },
  categoryCardSelected: {
    borderColor: colors.primary.default,
    backgroundColor: colors.primary.light,
  },
  emptyBox: {
    borderRadius: radius.md,
    backgroundColor: colors.neutral[100],
    padding: spacing[4],
  },
  selectedList: {
    gap: spacing[3],
  },
  specialtyCard: {
    gap: spacing[3],
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    backgroundColor: colors.neutral[50],
    padding: spacing[4],
  },
  specialtyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing[3],
  },
  specialtyText: {
    flex: 1,
    gap: spacing[1],
  },
  uploadCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing[4],
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    backgroundColor: colors.neutral[50],
    padding: spacing[4],
  },
  uploadText: {
    flex: 1,
    gap: spacing[1],
  },
  uploadPlaceholder: {
    minWidth: 92,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.primary.default,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    backgroundColor: colors.primary.light,
  },
  documentPreview: {
    width: 72,
    height: 72,
    borderRadius: radius.md,
    backgroundColor: colors.neutral[200],
  },
  pressed: {
    opacity: 0.8,
  },
});
