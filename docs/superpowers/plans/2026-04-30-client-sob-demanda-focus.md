# Client Sob Demanda Focus — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tornar Sob demanda o fluxo principal do app cliente, com uma tab e botão dedicados para Express.

**Architecture:** Quatro mudanças independentes — nova tab Express com hub + formulário movido, ajuste do CTA da Home, remoção da tela de escolha do fluxo de Buscar, e melhoria visual dos badges de modo no OrderCard. Nenhuma alteração em backend, tipos ou hooks.

**Tech Stack:** React Native, Expo Router (file-based routing), TypeScript, lucide-react-native

---

## Mapa de arquivos

| Arquivo | Ação |
|---------|------|
| `src/app/(client)/_layout.tsx` | Modificar — registrar tab `(express)` |
| `src/components/layout/ClientTabBar.tsx` | Modificar — adicionar entrada Express |
| `src/app/(client)/(express)/_layout.tsx` | Criar — Stack layout |
| `src/app/(client)/(express)/index.tsx` | Criar — hub de categorias para Express |
| `src/app/(client)/(express)/create.tsx` | Criar — cópia de `(orders)/express.tsx` |
| `src/app/(client)/(orders)/express.tsx` | Deletar |
| `src/app/(client)/(home)/index.tsx` | Modificar — substituir CTA card por dois botões |
| `src/app/(client)/(search)/index.tsx` | Modificar — `handleCategoryPress` vai direto para profissionais |
| `src/app/(client)/(search)/professionals/index.tsx` | Modificar — atualizar path do link Express no empty state |
| `src/app/(client)/(search)/category/[categoryId].tsx` | Deletar |
| `src/components/client/orders/OrderCard.tsx` | Modificar — substituir badges de modo por pílulas outline |

---

## Task 1: Infraestrutura da tab Express

**Arquivos:**
- Criar: `src/app/(client)/(express)/_layout.tsx`
- Criar: `src/app/(client)/(express)/create.tsx`
- Modificar: `src/app/(client)/_layout.tsx`
- Modificar: `src/components/layout/ClientTabBar.tsx`

- [ ] **Step 1: Criar `(express)/_layout.tsx`**

```tsx
import { Stack } from 'expo-router';

export default function ExpressLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
```

- [ ] **Step 2: Criar `(express)/create.tsx` — conteúdo idêntico a `(orders)/express.tsx`**

```tsx
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Check, DollarSign, MapPin, Shield } from 'lucide-react-native';
import { Screen } from '@/components/layout/Screen';
import { Header } from '@/components/layout/Header';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingScreen } from '@/components/feedback/LoadingScreen';
import { Badge, Button, Divider, Text } from '@/components/ui';
import { useAddresses } from '@/lib/hooks/useAddresses';
import { useCreateOrder } from '@/lib/hooks/useOrders';
import { colors, radius, spacing } from '@/theme';

export default function ExpressCreateScreen() {
  const { areaId, categoryId, areaName, categoryName } = useLocalSearchParams<{
    areaId: string;
    categoryId: string;
    areaName: string;
    categoryName: string;
  }>();
  const router = useRouter();

  const addressesQuery = useAddresses();
  const createOrder = useCreateOrder();

  const [description, setDescription] = useState('');
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [addUrgency, setAddUrgency] = useState(false);

  const addresses = addressesQuery.data ?? [];

  useEffect(() => {
    if (!selectedAddressId && addresses.length > 0) {
      setSelectedAddressId(addresses.find((item) => item.isDefault)?.id ?? addresses[0]?.id ?? null);
    }
  }, [addresses, selectedAddressId]);

  const selectedAddress = useMemo(
    () => addresses.find((item) => item.id === selectedAddressId) ?? null,
    [addresses, selectedAddressId],
  );

  const canSubmit =
    description.trim().length >= 10 &&
    !!selectedAddress &&
    !!areaId &&
    !!categoryId &&
    Number.isFinite(selectedAddress.lat) &&
    Number.isFinite(selectedAddress.lng);

  async function handleSubmit() {
    if (!canSubmit || !selectedAddressId || !areaId || !categoryId) return;

    try {
      await createOrder.mutateAsync({
        areaId,
        categoryId,
        description: description.trim(),
        addressId: selectedAddressId,
        urgencyFee: addUrgency ? 15 : undefined,
      });
    } catch {
      // mutation já exibe o erro via toast
    }
  }

  if (addressesQuery.isLoading) {
    return <LoadingScreen message="Carregando endereços..." />;
  }

  if (addressesQuery.isError) {
    return <ErrorState message="Não foi possível carregar seus endereços." onRetry={() => addressesQuery.refetch()} />;
  }

  return (
    <Screen edges={['top']} scroll={false} style={styles.screen}>
      <Header title="Novo pedido Express" showBack />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.categoryCard}>
          <View style={styles.categoryInfo}>
            <Text variant="labelLg" color={colors.neutral[500]}>{areaName}</Text>
            <Text variant="titleLg">{categoryName}</Text>
          </View>
          <Badge label="Express" variant="warning" />
        </View>

        <View style={styles.section}>
          <Text variant="titleSm">Descreva o que você precisa</Text>
          <Text variant="labelLg" color={colors.neutral[500]}>
            Quanto mais detalhes, melhores propostas você receberá
          </Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Ex: Preciso trocar duas tomadas na sala e uma na cozinha. A fiação já está pronta."
            placeholderTextColor={colors.neutral[400]}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
            style={styles.textArea}
          />
          <Text variant="labelSm" color={description.trim().length < 10 ? colors.neutral[400] : colors.success}>
            {description.trim().length}/10 caracteres mínimos
          </Text>
        </View>

        <Divider />

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MapPin color={colors.neutral[700]} size={18} />
            <Text variant="titleSm">Endereço do serviço</Text>
          </View>

          {addresses.length > 0 ? (
            addresses.map((address) => (
              <Pressable
                key={address.id}
                onPress={() => setSelectedAddressId(address.id)}
                style={[styles.addressCard, selectedAddressId === address.id && styles.addressCardSelected]}
              >
                <View style={styles.addressInfo}>
                  <Text variant="titleSm">{address.label}</Text>
                  <Text variant="labelLg" color={colors.neutral[500]} numberOfLines={2}>
                    {address.street}, {address.number}
                    {address.complement ? `, ${address.complement}` : ''} - {address.district}, {address.city}
                  </Text>
                  {!Number.isFinite(address.lat) || !Number.isFinite(address.lng) ? (
                    <Text variant="labelSm" color={colors.error}>
                      Este endereço não possui coordenadas e não serve para Express.
                    </Text>
                  ) : null}
                </View>
                {selectedAddressId === address.id ? (
                  <View style={styles.checkCircle}>
                    <Check color="#FFFFFF" size={14} />
                  </View>
                ) : (
                  <View style={styles.emptyCircle} />
                )}
              </Pressable>
            ))
          ) : (
            <EmptyState
              icon={MapPin}
              title="Nenhum endereço disponível"
              description="Cadastre um endereço com latitude e longitude antes de abrir um pedido Express."
              actionLabel="Cadastrar endereço"
              onAction={() => router.push('/(client)/(profile)/addresses/new')}
            />
          )}
        </View>

        <Divider />

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <DollarSign color={colors.neutral[700]} size={18} />
            <Text variant="titleSm">Taxa de urgência</Text>
          </View>
          <Pressable
            onPress={() => setAddUrgency((v) => !v)}
            style={[styles.urgencyCard, addUrgency && styles.urgencyCardSelected]}
          >
            <View style={styles.addressInfo}>
              <Text variant="titleSm">Adicionar urgência</Text>
              <Text variant="labelLg" color={colors.neutral[500]}>
                Seu pedido terá prioridade na fila. Profissionais serão notificados primeiro.
              </Text>
            </View>
            {addUrgency ? (
              <View style={styles.checkCircle}>
                <Check color="#FFFFFF" size={14} />
              </View>
            ) : (
              <View style={styles.emptyCircle} />
            )}
          </Pressable>
          {addUrgency ? (
            <Text variant="labelLg" color={colors.warning}>
              + R$ 15,00 de taxa de urgência
            </Text>
          ) : null}
        </View>

        <View style={styles.howItWorks}>
          <Text variant="titleSm">Como funciona?</Text>
          <View style={styles.step}>
            <View style={styles.stepNumber}><Text variant="labelLg" color="#FFFFFF">1</Text></View>
            <Text variant="bodySm" color={colors.neutral[600]}>Você descreve o que precisa</Text>
          </View>
          <View style={styles.step}>
            <View style={styles.stepNumber}><Text variant="labelLg" color="#FFFFFF">2</Text></View>
            <Text variant="bodySm" color={colors.neutral[600]}>Profissionais próximos enviam propostas</Text>
          </View>
          <View style={styles.step}>
            <View style={styles.stepNumber}><Text variant="labelLg" color="#FFFFFF">3</Text></View>
            <Text variant="bodySm" color={colors.neutral[600]}>Você escolhe a melhor proposta</Text>
          </View>
          <View style={styles.step}>
            <View style={styles.stepNumber}><Text variant="labelLg" color="#FFFFFF">4</Text></View>
            <Text variant="bodySm" color={colors.neutral[600]}>O chat abre e o serviço é realizado</Text>
          </View>
        </View>

        <View style={styles.guaranteeCard}>
          <Shield color={colors.primary.default} size={20} />
          <Text variant="labelLg" color={colors.neutral[600]} style={styles.guaranteeFlex}>
            Pagamento protegido. O valor só é liberado após a confirmação do serviço.
          </Text>
        </View>

        <View style={{ height: spacing[4] }} />
      </ScrollView>

      <View style={styles.bottomBar}>
        <Button
          variant="primary"
          size="lg"
          disabled={!canSubmit}
          loading={createOrder.isPending}
          onPress={handleSubmit}
        >
          Enviar pedido
        </Button>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { gap: 0 },
  scrollContent: { gap: spacing[5], paddingBottom: spacing[4] },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primary.light,
    borderRadius: radius.lg,
    padding: spacing[4],
  },
  categoryInfo: { gap: spacing[1] },
  section: { gap: spacing[3] },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
  textArea: {
    borderWidth: 1,
    borderColor: colors.neutral[300],
    borderRadius: radius.md,
    padding: spacing[3],
    minHeight: 120,
    fontSize: 14,
    color: colors.neutral[900],
    backgroundColor: colors.neutral[50],
  },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    backgroundColor: colors.neutral[50],
    padding: spacing[4],
  },
  addressCardSelected: { borderColor: colors.primary.default, backgroundColor: colors.primary.light },
  addressInfo: { flex: 1, gap: spacing[1] },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary.default,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.neutral[300],
  },
  urgencyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    backgroundColor: colors.neutral[50],
    padding: spacing[4],
  },
  urgencyCardSelected: { borderColor: colors.warning, backgroundColor: '#FEF3C7' },
  howItWorks: {
    gap: spacing[3],
    backgroundColor: colors.neutral[50],
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    padding: spacing[4],
  },
  step: { flexDirection: 'row', alignItems: 'center', gap: spacing[3] },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary.default,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guaranteeCard: {
    flexDirection: 'row',
    gap: spacing[3],
    backgroundColor: colors.primary.light,
    borderRadius: radius.lg,
    padding: spacing[4],
    alignItems: 'center',
  },
  guaranteeFlex: { flex: 1 },
  bottomBar: {
    paddingTop: spacing[3],
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
  },
});
```

- [ ] **Step 3: Registrar tab `(express)` em `src/app/(client)/_layout.tsx`**

Substituir o bloco de `<Tabs>` atual por:

```tsx
<Tabs
  screenOptions={{ headerShown: false }}
  tabBar={(props) => <ClientTabBar {...props} />}
>
  <Tabs.Screen name="index" options={{ href: null }} />
  <Tabs.Screen name="(home)" options={{ title: 'Início' }} />
  <Tabs.Screen name="(search)" options={{ title: 'Buscar' }} />
  <Tabs.Screen name="(express)" options={{ title: 'Express' }} />
  <Tabs.Screen name="(orders)" options={{ title: 'Pedidos' }} />
  <Tabs.Screen name="(profile)" options={{ title: 'Perfil' }} />
  <Tabs.Screen name="conversations" options={{ href: null }} />
</Tabs>
```

- [ ] **Step 4: Adicionar tab Express em `src/components/layout/ClientTabBar.tsx`**

Substituir o import e o array `CLIENT_TABS`:

```tsx
import { ClipboardList, Home, Search, UserRound, Zap } from 'lucide-react-native';

const CLIENT_TABS: Array<{ name: string; label: string; icon: TabIcon }> = [
  { name: '(home)', label: 'Início', icon: Home },
  { name: '(search)', label: 'Buscar', icon: Search },
  { name: '(express)', label: 'Express', icon: Zap },
  { name: '(orders)', label: 'Pedidos', icon: ClipboardList },
  { name: '(profile)', label: 'Perfil', icon: UserRound },
];
```

- [ ] **Step 5: Verificar manualmente**

Abrir o app e confirmar:
- Tab bar exibe 5 abas na ordem: Início · Buscar · Express · Pedidos · Perfil
- Tocar em Express navega para uma tela (ainda vazia, hub será criado na Task 2)
- As outras abas continuam funcionando normalmente

---

## Task 2: Hub Express (`(express)/index.tsx`)

**Arquivos:**
- Criar: `src/app/(client)/(express)/index.tsx`

- [ ] **Step 1: Criar `src/app/(client)/(express)/index.tsx`**

```tsx
import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Brush, Droplets, HardHat, Heart, Search, Sparkles, Wrench, Zap } from 'lucide-react-native';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingScreen } from '@/components/feedback/LoadingScreen';
import { Screen } from '@/components/layout/Screen';
import { Text } from '@/components/ui';
import { useServiceAreas, useServiceCategories } from '@/lib/hooks/useCatalog';
import type { ServiceArea } from '@/types/catalog';
import { colors, radius, spacing } from '@/theme';

const AREA_STYLES: Record<string, { color: string; bgColor: string; icon: React.ReactNode }> = {
  elétrica: { color: '#F59E0B', bgColor: '#FEF3C7', icon: <Zap size={24} color="#F59E0B" /> },
  limpeza: { color: '#3B82F6', bgColor: '#DBEAFE', icon: <Sparkles size={24} color="#3B82F6" /> },
  hidráulica: { color: '#06B6D4', bgColor: '#CFFAFE', icon: <Droplets size={24} color="#06B6D4" /> },
  pintura: { color: '#8B5CF6', bgColor: '#EDE9FE', icon: <Brush size={24} color="#8B5CF6" /> },
  manutenção: { color: '#EF4444', bgColor: '#FEE2E2', icon: <Wrench size={24} color="#EF4444" /> },
  reforma: { color: '#E98936', bgColor: '#FFF1E5', icon: <HardHat size={24} color="#E98936" /> },
  cuidados: { color: '#EC4899', bgColor: '#FCE7F3', icon: <Heart size={24} color="#EC4899" /> },
};

function getAreaVisual(area: ServiceArea) {
  return (
    AREA_STYLES[area.name.toLowerCase()] ?? {
      color: colors.primary.default,
      bgColor: colors.primary.light,
      icon: <Search size={24} color={colors.primary.default} />,
    }
  );
}

export default function ExpressHubScreen() {
  const router = useRouter();
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);

  const areasQuery = useServiceAreas();
  const categoriesQuery = useServiceCategories();

  if (areasQuery.isLoading || categoriesQuery.isLoading) {
    return <LoadingScreen message="Carregando serviços..." />;
  }

  if (areasQuery.isError || categoriesQuery.isError) {
    return (
      <ErrorState
        message="Não foi possível carregar os serviços."
        onRetry={() => {
          void areasQuery.refetch();
          void categoriesQuery.refetch();
        }}
      />
    );
  }

  const areas = areasQuery.data ?? [];
  const categories = categoriesQuery.data ?? [];
  const currentArea = selectedAreaId ? (areas.find((a) => a.id === selectedAreaId) ?? null) : null;
  const currentCategories = currentArea ? categories.filter((c) => c.areaId === currentArea.id) : [];

  function handleCategoryPress(areaId: string, categoryId: string) {
    const area = areas.find((a) => a.id === areaId);
    const category = categories.find((c) => c.id === categoryId);
    if (!area || !category) return;

    router.push({
      pathname: '/(client)/(express)/create',
      params: { areaId, categoryId, areaName: area.name, categoryName: category.name },
    } as never);
  }

  return (
    <Screen edges={['top']} style={styles.screen}>
      <Text variant="displaySm">Pedido Express</Text>
      <Text variant="bodySm" color={colors.neutral[500]}>
        Descreva o que precisa e receba propostas de profissionais próximos.
      </Text>

      {currentArea ? (
        <>
          <Pressable onPress={() => setSelectedAreaId(null)}>
            <Text variant="labelLg" color={colors.primary.default}>
              ← Voltar para áreas
            </Text>
          </Pressable>

          <Text variant="titleMd">{currentArea.name}</Text>

          <View style={styles.categoryList}>
            {currentCategories.map((category) => {
              const visual = getAreaVisual(currentArea);
              return (
                <Pressable
                  key={category.id}
                  onPress={() => handleCategoryPress(currentArea.id, category.id)}
                  style={({ pressed }) => [styles.categoryItem, pressed && styles.pressed]}
                >
                  <View style={[styles.categoryDot, { backgroundColor: visual.color }]} />
                  <Text variant="bodySm" style={styles.categoryName}>
                    {category.name}
                  </Text>
                  <Text variant="labelLg" color={colors.primary.default}>
                    Criar pedido
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </>
      ) : (
        <>
          <Text variant="titleMd">Selecione a área</Text>
          <View style={styles.grid}>
            {areas.map((area) => {
              const visual = getAreaVisual(area);
              return (
                <Pressable
                  key={area.id}
                  onPress={() => setSelectedAreaId(area.id)}
                  style={({ pressed }) => [styles.areaCard, pressed && styles.pressed]}
                >
                  <View style={[styles.areaIcon, { backgroundColor: visual.bgColor }]}>
                    {visual.icon}
                  </View>
                  <Text variant="titleSm">{area.name}</Text>
                  <Text variant="labelSm" color={colors.neutral[500]}>
                    {categories.filter((c) => c.areaId === area.id).length} serviços
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { gap: spacing[4] },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[3] },
  areaCard: {
    width: '47%',
    alignItems: 'center',
    gap: spacing[2],
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    backgroundColor: colors.neutral[50],
    paddingVertical: spacing[5],
    paddingHorizontal: spacing[3],
  },
  areaIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.7 },
  categoryList: { gap: spacing[1] },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[4],
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    backgroundColor: colors.neutral[50],
  },
  categoryDot: { width: 8, height: 8, borderRadius: 4 },
  categoryName: { flex: 1 },
});
```

- [ ] **Step 2: Verificar manualmente**

Abrir o app, tocar na tab Express e confirmar:
- Exibe título "Pedido Express" e grade de áreas
- Tocar em uma área exibe a lista de categorias daquela área
- "← Voltar para áreas" retorna à grade
- Tocar em uma categoria abre a tela de criação com área e categoria pré-preenchidos

---

## Task 3: Home — substituir CTA card

**Arquivos:**
- Modificar: `src/app/(client)/(home)/index.tsx`

- [ ] **Step 1: Adicionar import de `Zap` e `Button`**

No topo do arquivo, adicionar `Zap` ao import de lucide e `Button` ao import de `@/components/ui`:

```tsx
import { ArrowRight, Bell, Brush, Droplets, Search, Sparkles, Wrench, Zap } from 'lucide-react-native';
import { Button, Text } from '@/components/ui';
```

- [ ] **Step 2: Substituir o bloco `{/* CTA */}` pelo novo par de botões**

Remover:
```tsx
{/* CTA */}
<Pressable
  onPress={() => router.push('/(client)/(search)')}
  style={styles.ctaCard}
>
  <View style={styles.ctaContent}>
    <Text variant="titleSm" color="#FFFFFF">Precisa de algo?</Text>
    <Text variant="labelLg" color="rgba(255,255,255,0.8)">
      Crie um pedido Express e receba propostas de profissionais próximos
    </Text>
  </View>
  <ArrowRight color="#FFFFFF" size={20} />
</Pressable>
```

Substituir por:
```tsx
{/* CTA */}
<View style={styles.ctaRow}>
  <View style={styles.ctaBtn}>
    <Button
      variant="primary"
      size="lg"
      onPress={() => router.push('/(client)/(search)')}
    >
      Agendar serviço
    </Button>
  </View>
  <View style={styles.ctaBtn}>
    <Button
      variant="secondary"
      size="lg"
      rightIcon={<Zap color={colors.primary.default} size={16} />}
      onPress={() => router.push('/(client)/(express)')}
    >
      Express
    </Button>
  </View>
</View>
```

- [ ] **Step 3: Atualizar os estilos em `StyleSheet.create`**

Remover as entradas `ctaCard` e `ctaContent`. Adicionar no lugar:

```tsx
ctaRow: {
  flexDirection: 'row',
  gap: spacing[3],
},
ctaBtn: {
  flex: 1,
},
```

- [ ] **Step 4: Remover import de `ArrowRight` caso não seja mais usado**

Verificar se `ArrowRight` ainda é referenciado no arquivo. Se não for, removê-lo do import de lucide.

- [ ] **Step 5: Verificar manualmente**

Na Home:
- Dois botões lado a lado aparecem onde o CTA card estava
- "Agendar serviço" navega para a tab Buscar
- "Express ⚡" navega para a tab Express

---

## Task 4: Simplificar fluxo de Buscar

**Arquivos:**
- Modificar: `src/app/(client)/(search)/index.tsx`
- Modificar: `src/app/(client)/(search)/professionals/index.tsx`
- Deletar: `src/app/(client)/(search)/category/[categoryId].tsx`
- Deletar: `src/app/(client)/(orders)/express.tsx`

- [ ] **Step 1: Atualizar `handleCategoryPress` em `(search)/index.tsx`**

Substituir:
```tsx
function handleCategoryPress(areaId: string, categoryId: string) {
  const area = areas.find((item) => item.id === areaId);
  const category = categories.find((item) => item.id === categoryId);
  if (!area || !category) return;

  router.push({
    pathname: '/(client)/(search)/category/[categoryId]',
    params: { areaId, categoryId, areaName: area.name, categoryName: category.name },
  } as never);
}
```

Por:
```tsx
function handleCategoryPress(areaId: string, categoryId: string) {
  const area = areas.find((item) => item.id === areaId);
  const category = categories.find((item) => item.id === categoryId);
  if (!area || !category) return;

  router.push({
    pathname: '/(client)/(search)/professionals',
    params: { areaId, categoryId, areaName: area.name, categoryName: category.name },
  } as never);
}
```

- [ ] **Step 2: Atualizar link Express no empty state de `professionals/index.tsx`**

Localizar o `onAction` no `emptyState` sem query/filtro (o caso de nenhum profissional na categoria, por volta da linha 104):

```tsx
onAction: () => {
  if (!areaId || !categoryId) return;
  router.push({
    pathname: '/(client)/(orders)/express',
    params: {
      areaId,
      categoryId,
      areaName,
      categoryName,
    },
  });
},
```

Substituir por:
```tsx
onAction: () => {
  if (!areaId || !categoryId) return;
  router.push({
    pathname: '/(client)/(express)/create',
    params: {
      areaId,
      categoryId,
      areaName,
      categoryName,
    },
  });
},
```

- [ ] **Step 3: Deletar `src/app/(client)/(search)/category/[categoryId].tsx`**

```bash
rm src/app/(client)/(search)/category/[categoryId].tsx
```

- [ ] **Step 4: Deletar `src/app/(client)/(orders)/express.tsx`**

```bash
rm src/app/(client)/(orders)/express.tsx
```

- [ ] **Step 5: Verificar manualmente**

No fluxo de Buscar:
- Selecionar uma área → selecionar uma categoria → deve ir diretamente para a lista de profissionais (sem tela de escolha)
- Na lista de profissionais, se não houver nenhum, o botão "Abrir Express" do empty state deve navegar para a tela de criação Express corretamente

---

## Task 5: Badges de modo no OrderCard

**Arquivos:**
- Modificar: `src/components/client/orders/OrderCard.tsx`

- [ ] **Step 1: Adicionar imports de `Calendar` e `Zap`**

No topo do arquivo, atualizar o import de lucide:

```tsx
import { Calendar, Clock, MapPin, Zap } from 'lucide-react-native';
```

- [ ] **Step 2: Substituir as badges de modo pelo novo componente inline**

Localizar e substituir:
```tsx
{order.mode === OrderMode.ON_DEMAND ? (
  <Badge label="Sob demanda" variant="info" />
) : order.mode === OrderMode.EXPRESS ? (
  <Badge label="Express" variant="warning" />
) : null}
```

Por:
```tsx
{order.mode === OrderMode.ON_DEMAND ? (
  <View style={[styles.modePill, styles.modePillSobDemanda]}>
    <Calendar color={colors.info} size={12} />
    <Text variant="labelSm" color={colors.info}>Sob demanda</Text>
  </View>
) : order.mode === OrderMode.EXPRESS ? (
  <View style={[styles.modePill, styles.modePillExpress]}>
    <Zap color={colors.warning} size={12} />
    <Text variant="labelSm" color={colors.warning}>Express</Text>
  </View>
) : null}
```

- [ ] **Step 3: Adicionar estilos das pílulas em `StyleSheet.create`**

Adicionar ao final do objeto de estilos:

```tsx
modePill: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 3,
  borderWidth: 1,
  borderRadius: radius.full,
  paddingHorizontal: spacing[2],
  paddingVertical: 2,
},
modePillExpress: {
  borderColor: colors.warning,
},
modePillSobDemanda: {
  borderColor: colors.info,
},
```

- [ ] **Step 4: Remover import de `Badge` caso não seja mais utilizado**

Verificar se `Badge` ainda é usado em outro lugar neste arquivo. Se não for, remover do import:

```tsx
import { Avatar, Text } from '@/components/ui';
```

- [ ] **Step 5: Verificar manualmente**

Na aba Pedidos:
- Pedidos Express exibem pílula outline âmbar com ícone ⚡ e texto "Express"
- Pedidos Sob demanda exibem pílula outline azul com ícone 📅 e texto "Sob demanda"
- O badge de status (OrderStatusBadge) permanece visualmente distinto das pílulas de modo

---

## Task 6: Commit único

- [ ] **Step 1: Confirmar que não há erros de TypeScript**

```bash
cd /home/leonardodesaboia/Documents/TCC/TCC-front && npx tsc --noEmit
```

Esperado: nenhum erro.

- [ ] **Step 2: Commit**

```bash
git add src/app/(client)/_layout.tsx \
        src/app/(client)/(express)/ \
        src/app/(client)/(home)/index.tsx \
        src/app/(client)/(search)/index.tsx \
        src/app/(client)/(search)/professionals/index.tsx \
        src/components/layout/ClientTabBar.tsx \
        src/components/client/orders/OrderCard.tsx \
        docs/superpowers/

git add -u src/app/(client)/(orders)/express.tsx \
           src/app/(client)/(search)/category/

git commit -m "feat(client): foco sob demanda — tab Express, hub, badges de modo"
```
