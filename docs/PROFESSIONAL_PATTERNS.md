# AllSet Mobile - Arquitetura React Native (Profissional)

Guia de arquitetura e padrões para o lado do **profissional** (quem oferece serviços) na aplicação mobile.

---

## 1. Stack Tecnológica

| Tecnologia                     | Finalidade                     |
|--------------------------------|--------------------------------|
| React Native (Expo)            | Framework mobile               |
| TypeScript                     | Tipagem estática               |
| Expo Router                    | Navegação file-based           |
| Zustand                        | Estado global (auth, UI)       |
| @tanstack/react-query          | Estado do servidor / cache     |
| react-hook-form + zod          | Formulários e validação        |
| axios                          | Cliente HTTP                   |
| react-native-reanimated        | Animações performáticas        |
| expo-secure-store              | Armazenamento seguro de tokens |
| lucide-react-native            | Sistema de ícones              |
| react-native-safe-area-context | Safe area handling             |
| react-native-gesture-handler   | Gestos nativos                 |
| expo-image                     | Imagens otimizadas             |
| react-native-toast-message     | Notificações toast             |
| react-native-svg               | Suporte a SVGs                 |
| @shopify/flash-list            | Listas performáticas           |
| expo-document-picker           | Upload de documentos           |

---

## 2. Estrutura de Pastas

```
src/
├── app/                              # Expo Router (file-based routing)
│   ├── _layout.tsx                   # Root layout (providers, fonts, splash)
│   ├── index.tsx                     # Entry redirect (role-based)
│   │
│   ├── (auth)/                       # Grupo: rotas públicas de autenticação
│   │   ├── _layout.tsx               # Layout sem tabs (Stack simples)
│   │   ├── login.tsx
│   │   ├── register/
│   │   │   ├── index.tsx             # Tela de escolha: cliente ou profissional
│   │   │   └── professional.tsx      # Registro de profissional (6 etapas)
│   │   └── forgot-password.tsx
│   │
│   ├── (professional)/               # Grupo: rotas protegidas do PROFISSIONAL
│   │   ├── _layout.tsx               # Tab navigator + auth guard + role guard
│   │   │
│   │   ├── (dashboard)/              # Tab: Dashboard
│   │   │   ├── _layout.tsx           # Stack navigator
│   │   │   ├── index.tsx             # Dashboard (stats, próximos agendamentos)
│   │   │   └── profile/
│   │   │       ├── index.tsx         # Perfil do profissional
│   │   │       └── edit.tsx          # Editar perfil
│   │   │
│   │   ├── (services)/               # Tab: Meus Serviços
│   │   │   ├── _layout.tsx           # Stack navigator
│   │   │   ├── index.tsx             # Lista de serviços oferecidos
│   │   │   ├── new.tsx               # Criar novo serviço
│   │   │   └── [serviceId]/
│   │   │       └── edit.tsx          # Editar serviço
│   │   │
│   │   ├── (history)/                # Tab: Histórico
│   │   │   ├── _layout.tsx           # Stack navigator
│   │   │   ├── index.tsx             # Histórico de pedidos recebidos
│   │   │   └── [orderId].tsx         # Detalhe do pedido
│   │   │
│   │   ├── (earnings)/               # Tab: Ganhos
│   │   │   ├── _layout.tsx           # Stack navigator
│   │   │   └── index.tsx             # Dashboard de ganhos
│   │   │
│   │   └── (profile)/                # Tab: Perfil (se usar 5 tabs)
│   │       ├── _layout.tsx
│   │       ├── index.tsx
│   │       └── edit.tsx
│   │
│   └── (public)/                     # Grupo: rotas públicas (sem auth)
│       ├── _layout.tsx
│       ├── terms.tsx
│       └── privacy.tsx
│
├── components/
│   ├── ui/                           # Primitivos do design system (compartilhado)
│   │   ├── Button.tsx
│   │   ├── Text.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Avatar.tsx
│   │   ├── Badge.tsx
│   │   ├── Divider.tsx
│   │   ├── Skeleton.tsx
│   │   └── index.ts
│   │
│   ├── feedback/                     # Componentes de feedback (compartilhado)
│   │   ├── Toast.tsx
│   │   ├── EmptyState.tsx
│   │   ├── ErrorState.tsx
│   │   └── LoadingScreen.tsx
│   │
│   ├── forms/                        # Componentes de formulário (compartilhado)
│   │   ├── FormField.tsx
│   │   ├── FormInput.tsx
│   │   ├── FormSelect.tsx
│   │   ├── FormDatePicker.tsx
│   │   ├── FormImagePicker.tsx
│   │   └── FormDocumentPicker.tsx    # Upload de documentos (RG, CNH)
│   │
│   ├── layout/                       # Componentes estruturais
│   │   ├── Screen.tsx
│   │   ├── Header.tsx
│   │   ├── ProfessionalTabBar.tsx    # Bottom tab bar do profissional
│   │   ├── KeyboardAvoidingWrapper.tsx
│   │   └── BottomSheet.tsx
│   │
│   └── professional/                 # Componentes de domínio do PROFISSIONAL
│       ├── dashboard/
│       │   ├── StatCard.tsx           # Card de estatística (serviços, ganhos, pendentes)
│       │   ├── StatsRow.tsx           # Linha de cards de stats
│       │   ├── UpcomingAppointments.tsx
│       │   └── PendingOrdersBanner.tsx
│       ├── services/
│       │   ├── ServiceCard.tsx        # Card de serviço oferecido
│       │   ├── ServiceForm.tsx        # Form: criar/editar serviço
│       │   └── ServiceList.tsx
│       ├── history/
│       │   ├── ReceivedOrderCard.tsx   # Card de pedido recebido
│       │   ├── OrderStatusFilter.tsx   # Filtro por status
│       │   └── OrderActionButtons.tsx  # Aceitar, recusar, concluir
│       ├── earnings/
│       │   ├── EarningsSummary.tsx     # Resumo mensal/período
│       │   ├── EarningsChart.tsx       # Gráfico de ganhos
│       │   └── WithdrawalHistory.tsx   # Histórico de saques
│       ├── profile/
│       │   ├── ProfessionsList.tsx     # Lista de profissões cadastradas
│       │   ├── DocumentStatus.tsx      # Status dos documentos enviados
│       │   └── BankAccountCard.tsx     # Dados bancários / PIX
│       ├── onboarding/
│       │   └── ProfessionalOnboarding.tsx
│       └── register/
│           ├── StepIndicator.tsx       # Barra de progresso (6 steps)
│           ├── ProfessionPicker.tsx    # Área → Profissão → Experiência
│           └── DocumentUploader.tsx    # Upload frente/verso do documento
```

---

## 3. Telas do Profissional

| Tela                        | Rota                                         | Funcionalidade                                    |
|-----------------------------|----------------------------------------------|---------------------------------------------------|
| **Dashboard**               | `/(professional)/(dashboard)/`               | Stats (serviços, ganhos, pendentes), próximos agendamentos |
| **Perfil Profissional**     | `/(professional)/(dashboard)/profile/`       | Dados, foto, documentos, profissões               |
| **Editar Perfil**           | `/(professional)/(dashboard)/profile/edit`   | Formulário de edição                              |
| **Meus Serviços**           | `/(professional)/(services)/`                | Lista de serviços oferecidos                      |
| **Criar Serviço**           | `/(professional)/(services)/new`             | Formulário: nome, descrição, preço                |
| **Editar Serviço**          | `/(professional)/(services)/[serviceId]/edit`| Editar detalhes do serviço                        |
| **Histórico**               | `/(professional)/(history)/`                 | Pedidos recebidos (aceitos, pendentes, disputados) |
| **Detalhe Pedido**          | `/(professional)/(history)/[orderId]`        | Timeline, dados do cliente, ações (aceitar/recusar/concluir) |
| **Ganhos**                  | `/(professional)/(earnings)/`                | Resumo mensal, gráfico, histórico de saques       |

---

## 4. Bottom Tab Bar do Profissional

```
┌─────────────────────────────────────────────────────────────┐
│   🏠 Home    🔧 Serviços    📋 Histórico    💰 Ganhos    👤 Perfil  │
└─────────────────────────────────────────────────────────────┘
```

```typescript
// app/(professional)/_layout.tsx
import { Redirect, Tabs } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';
import { UserRole } from '@/types';
import { LoadingScreen } from '@/components/feedback';
import { ProfessionalTabBar } from '@/components/layout';

export default function ProfessionalLayout() {
  const { isAuthenticated, isLoading, isInitialized, user } = useAuth();

  if (!isInitialized || isLoading) return <LoadingScreen />;
  if (!isAuthenticated) return <Redirect href="/(auth)/login" />;

  // Guard: clientes não acessam área de profissional
  if (user?.role === UserRole.CLIENT) {
    return <Redirect href="/(client)/(home)" />;
  }

  return (
    <Tabs tabBar={(props) => <ProfessionalTabBar {...props} />}>
      <Tabs.Screen name="(dashboard)" options={{ headerShown: false, title: 'Home' }} />
      <Tabs.Screen name="(services)" options={{ headerShown: false, title: 'Serviços' }} />
      <Tabs.Screen name="(history)" options={{ headerShown: false, title: 'Histórico' }} />
      <Tabs.Screen name="(earnings)" options={{ headerShown: false, title: 'Ganhos' }} />
      <Tabs.Screen name="(profile)" options={{ headerShown: false, title: 'Perfil' }} />
    </Tabs>
  );
}
```

### Componente ProfessionalTabBar

```typescript
// components/layout/ProfessionalTabBar.tsx
import { View, Pressable, StyleSheet } from 'react-native';
import { Home, Wrench, ClipboardList, DollarSign, User } from 'lucide-react-native';
import { Text } from '@/components/ui';
import { colors, spacing, layout } from '@/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePendingOrdersCount } from '@/lib/hooks/useNotifications';

const PROFESSIONAL_TABS = [
  { name: '(dashboard)', label: 'Home', icon: Home },
  { name: '(services)', label: 'Serviços', icon: Wrench },
  { name: '(history)', label: 'Histórico', icon: ClipboardList },
  { name: '(earnings)', label: 'Ganhos', icon: DollarSign },
  { name: '(profile)', label: 'Perfil', icon: User },
];

export function ProfessionalTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const pendingCount = usePendingOrdersCount();

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom || spacing[2] }]}>
      {PROFESSIONAL_TABS.map((tab, index) => {
        const isActive = state.index === index;
        const Icon = tab.icon;
        const showBadge = tab.name === '(history)' && pendingCount > 0;

        return (
          <Pressable
            key={tab.name}
            onPress={() => navigation.navigate(tab.name)}
            style={styles.tab}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={tab.label}
          >
            <View>
              <Icon
                size={22}
                color={isActive ? colors.primary.default : colors.neutral[500]}
              />
              {showBadge && (
                <View style={styles.badge}>
                  <Text variant="labelSm" color="#FFF" style={{ fontSize: 8 }}>
                    {pendingCount > 9 ? '9+' : pendingCount}
                  </Text>
                </View>
              )}
            </View>
            <Text
              variant="labelSm"
              color={isActive ? colors.primary.default : colors.neutral[500]}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: layout.bottomTabHeight,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    minHeight: 44,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
});
```

---

## 5. Registro do Profissional (6 Etapas)

### Fluxo

```
Escolha de perfil → Step 1 → Step 2 → Step 3 → Step 4 → Step 5 → Step 6 → Dashboard
```

Com **persistência de rascunho** em `MMKV`/`AsyncStorage` para não perder progresso.

### Campos por Etapa

**Step 1 - Dados Pessoais:**
- Nome completo
- E-mail
- Telefone (máscara)

**Step 2 - Identificação:**
- CPF (máscara + validação)
- Data de nascimento
- Nome completo da mãe

**Step 3 - Documentos:**
- Tipo de documento (RG, CNH, Passaporte)
- Foto frente do documento (upload imagem/pdf)
- Foto verso do documento (upload imagem/pdf)

**Step 4 - Perfil Profissional:**
- Foto de perfil (upload imagem)
- Descrição (textarea, opcional)
- Profissões (dinâmico, mínimo 1):
  - Área de atuação (dropdown da API)
  - Profissão (dropdown dependente da área)
  - Anos de experiência (< 1 ano, 1-3, 3-5, 5-10, > 10 anos)
  - Botão "+" para adicionar mais profissões
  - Botão lixeira para remover

**Step 5 - Dados Financeiros:**
- CEP (opcional, máscara)
- Tipo de chave PIX (CPF, CNPJ, E-mail, Telefone, Aleatória)
- Chave PIX

**Step 6 - Segurança:**
- Senha (mesmos requisitos do cliente)
- Confirmação de senha

### StepIndicator Component

```typescript
// components/professional/register/StepIndicator.tsx
interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  return (
    <View style={styles.container}>
      <View style={styles.bar}>
        <Animated.View
          style={[
            styles.progress,
            { width: `${(currentStep / totalSteps) * 100}%` },
          ]}
        />
      </View>
      <Text variant="labelLg" color={colors.neutral[500]}>
        Etapa {currentStep} de {totalSteps}
      </Text>
    </View>
  );
}
```

### Schema de Validação (por etapa)

```typescript
// lib/validations/auth.ts

export const proStep1Schema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().min(1).email('E-mail inválido'),
  phone: z.string().min(1, 'Telefone é obrigatório'),
});

export const proStep2Schema = z.object({
  cpf: z.string().min(1).refine(validateCPF, 'CPF inválido'),
  birthDate: z.string().min(1, 'Data é obrigatória'),
  motherName: z.string().min(1, 'Nome da mãe é obrigatório'),
});

export const proStep3Schema = z.object({
  documentType: z.enum(['RG', 'CNH', 'PASSPORT']),
  documentFront: z.string().min(1, 'Frente do documento é obrigatória'), // URI
  documentBack: z.string().min(1, 'Verso do documento é obrigatório'),   // URI
});

export const proStep4Schema = z.object({
  profilePhoto: z.string().min(1, 'Foto de perfil é obrigatória'),  // URI
  description: z.string().optional(),
  professions: z.array(z.object({
    areaId: z.string().min(1, 'Área é obrigatória'),
    professionId: z.string().min(1, 'Profissão é obrigatória'),
    yearsOfExperience: z.string().min(1, 'Experiência é obrigatória'),
  })).min(1, 'Adicione pelo menos uma profissão'),
});

export const proStep5Schema = z.object({
  zipCode: z.string().optional(),
  pixKeyType: z.enum(['CPF', 'CNPJ', 'EMAIL', 'PHONE', 'EVP']),
  pixKey: z.string().min(1, 'Chave PIX é obrigatória'),
});

export const proStep6Schema = z.object({
  password: z.string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Deve ter 1 maiúscula')
    .regex(/[a-z]/, 'Deve ter 1 minúscula')
    .regex(/[0-9]/, 'Deve ter 1 número'),
  confirmPassword: z.string().min(1),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Senhas não conferem',
  path: ['confirmPassword'],
});
```

### Persistência de Rascunho

```typescript
// lib/hooks/useProfessionalDraft.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

const DRAFT_KEY = 'professional-register-draft';

export function useProfessionalDraft() {
  const saveDraft = useCallback(async (step: number, data: Partial<ProfessionalFormData>) => {
    const existing = await AsyncStorage.getItem(DRAFT_KEY);
    const draft = existing ? JSON.parse(existing) : {};
    draft[`step${step}`] = data;
    draft.lastStep = step;
    await AsyncStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  }, []);

  const loadDraft = useCallback(async () => {
    const raw = await AsyncStorage.getItem(DRAFT_KEY);
    return raw ? JSON.parse(raw) : null;
  }, []);

  const clearDraft = useCallback(async () => {
    await AsyncStorage.removeItem(DRAFT_KEY);
  }, []);

  return { saveDraft, loadDraft, clearDraft };
}
```

---

## 6. Notificações do Profissional

O badge de notificação do profissional conta **apenas pedidos pendentes de aceitação**:

```typescript
// lib/hooks/useNotifications.ts
export function usePendingOrdersCount() {
  const { data: orders } = useReceivedOrders({ status: 'PENDING_ACCEPTANCE' });
  return orders?.length ?? 0;
}
```

---

## 7. Hooks Específicos do Profissional

```typescript
// lib/hooks/useOrders.ts - Pedidos como VENDEDOR
export function useReceivedOrders(params?: OrderFilters) {
  return useQuery({
    queryKey: queryKeys.orders.received(params),
    queryFn: () => ordersApi.getReceivedOrders(params),  // GET /orders/received
    staleTime: TWO_MINUTES,
  });
}

export function useAcceptOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderId: string) => ordersApi.accept(orderId),  // PATCH /orders/:id/accept
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
      toast.success('Pedido aceito!');
    },
    onError: (error) => toast.error('Erro', getApiErrorMessage(error)),
  });
}

export function useRejectOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderId: string) => ordersApi.reject(orderId),  // PATCH /orders/:id/reject
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
      toast.info('Pedido recusado');
    },
  });
}

export function useCompleteOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderId: string) => ordersApi.complete(orderId),  // PATCH /orders/:id/complete
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
      toast.success('Serviço concluído!');
    },
  });
}

// lib/hooks/useServices.ts - Serviços oferecidos pelo profissional
export function useMyServices() {
  return useQuery({
    queryKey: queryKeys.services.mine,
    queryFn: () => servicesApi.getMyServices(),  // GET /services/my-services
  });
}

export function useCreateService() {
  const router = useRouter();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: servicesApi.create,  // POST /services
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.services.mine });
      toast.success('Serviço criado!');
      router.back();
    },
    onError: (error) => toast.error('Erro', getApiErrorMessage(error)),
  });
}

export function useUpdateService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateServiceData }) =>
      servicesApi.update(id, data),  // PUT /services/:id
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.services.mine });
      toast.success('Serviço atualizado!');
    },
  });
}

// lib/hooks/useEarnings.ts - Ganhos do profissional
export function useEarnings(period?: EarningsPeriod) {
  return useQuery({
    queryKey: queryKeys.earnings.summary(period),
    queryFn: () => earningsApi.getSummary(period),  // GET /earnings/summary
  });
}

export function useWithdrawalHistory() {
  return useQuery({
    queryKey: queryKeys.earnings.withdrawals,
    queryFn: () => earningsApi.getWithdrawals(),  // GET /earnings/withdrawals
  });
}
```

---

## 8. Componentes de Domínio do Profissional

### Dashboard - StatCard

```typescript
// components/professional/dashboard/StatCard.tsx
interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  color?: string;
}

export function StatCard({ icon: Icon, label, value, color = colors.primary.default }: StatCardProps) {
  return (
    <View style={[styles.card, shadows.sm]}>
      <View style={[styles.iconContainer, { backgroundColor: color + '15' }]}>
        <Icon size={20} color={color} />
      </View>
      <Text variant="displaySm" color={colors.secondary.default}>
        {value}
      </Text>
      <Text variant="labelLg" color={colors.neutral[500]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    padding: spacing[4],
    alignItems: 'center',
    gap: spacing[1],
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
```

### ReceivedOrderCard (com ações)

```typescript
// components/professional/history/ReceivedOrderCard.tsx
interface ReceivedOrderCardProps {
  order: Order;
  onPress: () => void;
}

export function ReceivedOrderCard({ order, onPress }: ReceivedOrderCardProps) {
  const { mutate: accept, isPending: isAccepting } = useAcceptOrder();
  const { mutate: reject, isPending: isRejecting } = useRejectOrder();
  const { mutate: complete, isPending: isCompleting } = useCompleteOrder();

  return (
    <Pressable onPress={onPress} style={[styles.card, shadows.sm]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.clientInfo}>
          <Avatar uri={order.client.avatarUrl} size={40} />
          <View>
            <Text variant="titleSm">{order.client.name}</Text>
            <Text variant="labelLg" color={colors.neutral[500]}>
              {order.service.name}
            </Text>
          </View>
        </View>
        <OrderStatusBadge status={order.status} />
      </View>

      {/* Detalhes */}
      <Divider />
      <View style={styles.details}>
        <DetailRow icon={Clock} text={formatDate(order.scheduledAt)} />
        <DetailRow icon={MapPin} text={order.address.street} />
        <Text variant="titleSm" color={colors.primary.default}>
          {formatCurrency(order.totalPrice)}
        </Text>
      </View>

      {/* Ações baseadas no status */}
      {order.status === 'PENDING_ACCEPTANCE' && (
        <View style={styles.actions}>
          <Button
            variant="ghost"
            size="sm"
            loading={isRejecting}
            onPress={() => reject(order.id)}
          >
            Recusar
          </Button>
          <Button
            variant="primary"
            size="sm"
            loading={isAccepting}
            onPress={() => accept(order.id)}
          >
            Aceitar
          </Button>
        </View>
      )}

      {order.status === 'ACCEPTED' && (
        <View style={styles.actions}>
          <Button
            variant="primary"
            size="sm"
            loading={isCompleting}
            onPress={() => complete(order.id)}
          >
            Marcar como concluído
          </Button>
        </View>
      )}
    </Pressable>
  );
}
```

### ServiceCard

```typescript
// components/professional/services/ServiceCard.tsx
interface ServiceCardProps {
  service: Service;
  onEdit: () => void;
}

export function ServiceCard({ service, onEdit }: ServiceCardProps) {
  return (
    <View style={[styles.card, shadows.sm]}>
      <View style={styles.header}>
        <Text variant="titleSm">{service.name}</Text>
        <Pressable onPress={onEdit} hitSlop={8}>
          <Pencil size={18} color={colors.primary.default} />
        </Pressable>
      </View>
      {service.description && (
        <Text variant="bodySm" color={colors.neutral[500]} numberOfLines={2}>
          {service.description}
        </Text>
      )}
      <View style={styles.footer}>
        <Text variant="titleSm" color={colors.primary.default}>
          {formatCurrency(service.price)}
        </Text>
        <Badge variant={service.active ? 'success' : 'neutral'}>
          {service.active ? 'Ativo' : 'Inativo'}
        </Badge>
      </View>
    </View>
  );
}
```

### EarningsSummary

```typescript
// components/professional/earnings/EarningsSummary.tsx
interface EarningsSummaryProps {
  earnings: EarningsData;
}

export function EarningsSummary({ earnings }: EarningsSummaryProps) {
  return (
    <View style={[styles.container, shadows.md]}>
      <Text variant="labelLg" color={colors.neutral[500]}>
        Total do período
      </Text>
      <Text variant="displayLg" color={colors.success}>
        {formatCurrency(earnings.totalAmount)}
      </Text>
      <Divider />
      <View style={styles.breakdown}>
        <BreakdownRow label="Serviços concluídos" value={earnings.completedOrders} />
        <BreakdownRow label="Ticket médio" value={formatCurrency(earnings.averageTicket)} />
        <BreakdownRow label="Disponível para saque" value={formatCurrency(earnings.availableBalance)} />
      </View>
    </View>
  );
}
```

---

## 9. Dashboard do Profissional

```typescript
// app/(professional)/(dashboard)/index.tsx
export default function ProfessionalDashboard() {
  const { user } = useAuth();
  const { data: stats, isLoading } = useDashboardStats();
  const { data: upcoming } = useUpcomingAppointments();
  const pendingCount = usePendingOrdersCount();

  if (isLoading) return <LoadingScreen />;

  return (
    <Screen>
      <Header
        title={`Olá, ${user?.name?.split(' ')[0]}`}
        rightIcon={
          <NotificationBell count={pendingCount} onPress={() => router.push('/(professional)/(history)?status=pending_acceptance')} />
        }
      />

      {/* Banner de pedidos pendentes */}
      {pendingCount > 0 && (
        <PendingOrdersBanner
          count={pendingCount}
          onPress={() => router.push('/(professional)/(history)?status=pending_acceptance')}
        />
      )}

      {/* Stats */}
      <View style={styles.statsRow}>
        <StatCard icon={Wrench} label="Serviços" value={stats.totalServices} />
        <StatCard icon={DollarSign} label="Ganhos" value={formatCurrency(stats.monthlyEarnings)} color={colors.success} />
        <StatCard icon={Clock} label="Pendentes" value={stats.pendingOrders} color={colors.warning} />
      </View>

      {/* Próximos agendamentos */}
      <View style={styles.section}>
        <Text variant="titleSm">Próximos Agendamentos</Text>
        {upcoming?.length ? (
          upcoming.map((order) => (
            <ReceivedOrderCard key={order.id} order={order} onPress={() => router.push(`/(professional)/(history)/${order.id}`)} />
          ))
        ) : (
          <EmptyState
            icon={Calendar}
            title="Nenhum agendamento"
            description="Novos pedidos aparecerão aqui"
          />
        )}
      </View>
    </Screen>
  );
}
```

---

## 10. Padrão de Tela do Profissional

```typescript
// Exemplo: Tela de histórico de pedidos
export default function ProfessionalHistoryScreen() {
  const [statusFilter, setStatusFilter] = useState<OrderStatus | undefined>();
  const { data: orders, isLoading, error, refetch } = useReceivedOrders({ status: statusFilter });

  if (isLoading) return <LoadingScreen />;
  if (error) return <ErrorState message="Erro ao carregar histórico" onRetry={refetch} />;

  return (
    <Screen>
      <Header title="Histórico" />

      <OrderStatusFilter
        selected={statusFilter}
        onSelect={setStatusFilter}
        options={[
          { value: undefined, label: 'Todos' },
          { value: 'PENDING_ACCEPTANCE', label: 'Pendentes' },
          { value: 'ACCEPTED', label: 'Aceitos' },
          { value: 'COMPLETED', label: 'Concluídos' },
          { value: 'DISPUTED', label: 'Disputas' },
        ]}
      />

      {!orders?.length ? (
        <EmptyState
          icon={ClipboardList}
          title="Nenhum pedido encontrado"
          description={statusFilter ? 'Tente outro filtro' : 'Seus pedidos aparecerão aqui'}
        />
      ) : (
        <FlashList
          data={orders}
          renderItem={({ item }) => (
            <Animated.View entering={FadeInDown}>
              <ReceivedOrderCard
                order={item}
                onPress={() => router.push(`/(professional)/(history)/${item.id}`)}
              />
            </Animated.View>
          )}
          estimatedItemSize={180}
          ItemSeparatorComponent={() => <View style={{ height: spacing[3] }} />}
          contentContainerStyle={{ padding: spacing[4] }}
        />
      )}
    </Screen>
  );
}
```

---

## 11. API Consumida pelo Profissional

| Endpoint                       | Método | Uso                                |
|--------------------------------|--------|------------------------------------|
| `POST /auth/login`             | POST   | Login                              |
| `POST /auth/register`          | POST   | Registro de profissional           |
| `GET /auth/me`                 | GET    | Perfil do usuário logado           |
| `GET /orders/received`         | GET    | Pedidos recebidos (como vendedor)  |
| `GET /orders/:id`              | GET    | Detalhe do pedido                  |
| `PATCH /orders/:id/accept`     | PATCH  | Aceitar pedido                     |
| `PATCH /orders/:id/reject`     | PATCH  | Recusar pedido                     |
| `PATCH /orders/:id/complete`   | PATCH  | Marcar como concluído              |
| `GET /services/my-services`    | GET    | Meus serviços oferecidos           |
| `POST /services`               | POST   | Criar serviço                      |
| `PUT /services/:id`            | PUT    | Editar serviço                     |
| `DELETE /services/:id`         | DELETE | Remover serviço                    |
| `GET /professions`             | GET    | Listar profissões (para registro)  |
| `GET /areas`                   | GET    | Listar áreas (para registro)       |
| `GET /earnings/summary`        | GET    | Resumo de ganhos                   |
| `GET /earnings/withdrawals`    | GET    | Histórico de saques                |
| `POST /uploads/profile`        | POST   | Upload de foto de perfil           |
| `POST /uploads/document`       | POST   | Upload de documento (frente/verso) |

---

## 12. Query Keys do Profissional

```typescript
// lib/constants/query-keys.ts (extensão para profissional)
export const queryKeys = {
  // ... shared keys
  orders: {
    all: ['orders'] as const,
    received: (params?: object) => ['orders', 'received', params] as const,
    detail: (id: string) => ['orders', id] as const,
  },
  services: {
    mine: ['services', 'my-services'] as const,
    detail: (id: string) => ['services', id] as const,
  },
  earnings: {
    summary: (period?: string) => ['earnings', 'summary', period] as const,
    withdrawals: ['earnings', 'withdrawals'] as const,
  },
  dashboard: {
    stats: ['dashboard', 'stats'] as const,
    upcoming: ['dashboard', 'upcoming'] as const,
  },
} as const;
```

---

Para os padrões compartilhados (theme, componentes UI, API client, stores, providers, animações, tratamento de erros, boas práticas), consulte o documento `MOBILE_PATTERNS_SHARED.md`.
