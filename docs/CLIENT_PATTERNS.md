# AllSet Mobile - Arquitetura React Native (Cliente)

Guia de arquitetura e padrões para o lado do **cliente** (quem contrata serviços) na aplicação mobile.

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
│   │   │   └── client.tsx            # Registro de cliente (2 etapas)
│   │   └── forgot-password.tsx
│   │
│   ├── (client)/                     # Grupo: rotas protegidas do CLIENTE
│   │   ├── _layout.tsx               # Tab navigator + auth guard + role guard
│   │   │
│   │   ├── (home)/                   # Tab: Início
│   │   │   ├── _layout.tsx           # Stack navigator
│   │   │   ├── index.tsx             # Home do cliente (agenda, próximos serviços)
│   │   │   └── notifications.tsx     # Notificações
│   │   │
│   │   ├── (search)/                 # Tab: Buscar
│   │   │   ├── _layout.tsx           # Stack navigator
│   │   │   ├── index.tsx             # Busca de profissionais/serviços
│   │   │   ├── professionals/
│   │   │   │   └── [id].tsx          # Perfil do profissional
│   │   │   ├── services/
│   │   │   │   └── [id].tsx          # Detalhe do serviço
│   │   │   ├── professions/
│   │   │   │   └── [id].tsx          # Serviços por profissão
│   │   │   └── areas/
│   │   │       └── [id].tsx          # Serviços por área
│   │   │
│   │   ├── (orders)/                 # Tab: Pedidos
│   │   │   ├── _layout.tsx           # Stack navigator
│   │   │   ├── index.tsx             # Lista de pedidos do cliente
│   │   │   ├── [orderId].tsx         # Detalhe do pedido
│   │   │   ├── checkout/
│   │   │   │   └── [serviceId].tsx   # Checkout (data, hora, endereço)
│   │   │   └── payment/
│   │   │       └── [orderId].tsx     # Pagamento PIX
│   │   │
│   │   └── (profile)/                # Tab: Perfil
│   │       ├── _layout.tsx           # Stack navigator
│   │       ├── index.tsx             # Dados do perfil
│   │       ├── edit.tsx              # Editar perfil
│   │       ├── addresses/
│   │       │   ├── index.tsx         # Lista de endereços
│   │       │   └── new.tsx           # Adicionar endereço
│   │       └── settings.tsx          # Configurações
│   │
│   └── (public)/                     # Grupo: rotas públicas (sem auth)
│       ├── _layout.tsx
│       ├── professionals/
│       │   └── [id].tsx              # Perfil público do profissional
│       ├── terms.tsx                 # Termos de uso
│       └── privacy.tsx              # Política de privacidade
│
├── components/
│   ├── ui/                           # Primitivos do design system
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
│   ├── feedback/                     # Componentes de feedback
│   │   ├── Toast.tsx
│   │   ├── EmptyState.tsx
│   │   ├── ErrorState.tsx
│   │   └── LoadingScreen.tsx
│   │
│   ├── forms/                        # Componentes de formulário
│   │   ├── FormField.tsx
│   │   ├── FormInput.tsx
│   │   ├── FormSelect.tsx
│   │   ├── FormDatePicker.tsx
│   │   ├── FormImagePicker.tsx
│   │   └── AddressForm.tsx
│   │
│   ├── layout/                       # Componentes estruturais
│   │   ├── Screen.tsx
│   │   ├── Header.tsx
│   │   ├── ClientTabBar.tsx          # Bottom tab bar do cliente
│   │   ├── KeyboardAvoidingWrapper.tsx
│   │   └── BottomSheet.tsx
│   │
│   └── client/                       # Componentes de domínio do CLIENTE
│       ├── home/
│       │   ├── AppointmentsCalendar.tsx
│       │   ├── UpcomingBookings.tsx
│       │   └── FeaturedProfessionals.tsx
│       ├── search/
│       │   ├── SearchBar.tsx
│       │   ├── FilterSheet.tsx
│       │   ├── ProfessionalCard.tsx
│       │   └── ProfessionalList.tsx
│       ├── orders/
│       │   ├── OrderCard.tsx
│       │   ├── OrderStatusBadge.tsx
│       │   ├── OrderTimeline.tsx
│       │   ├── CheckoutSummary.tsx
│       │   └── PixPayment.tsx
│       ├── profile/
│       │   └── AddressCard.tsx
│       └── onboarding/
│           └── ClientOnboarding.tsx
│
├── lib/
│   ├── api/
│   │   ├── client.ts                 # Axios instance + interceptors
│   │   ├── auth.ts                   # authApi
│   │   ├── orders.ts                 # ordersApi (criar pedido, meus pedidos)
│   │   ├── professionals.ts          # professionalsApi (buscar, detalhe)
│   │   ├── services.ts              # servicesApi (listar, detalhe)
│   │   ├── addresses.ts              # addressesApi
│   │   └── uploads.ts                # uploadsApi
│   │
│   ├── hooks/
│   │   ├── useAuth.ts                # Login, logout, register
│   │   ├── useOrders.ts              # useMyOrders, useOrder, useCreateOrder
│   │   ├── useProfessionals.ts       # useSearchProfessionals, useProfessional
│   │   ├── useServices.ts           # useServices, useService
│   │   ├── useAddresses.ts           # useAddresses, useCreateAddress
│   │   ├── useNotifications.ts       # Contagem: ACCEPTED, PENDING_COMPLETION, DISPUTED
│   │   └── useAppState.ts
│   │
│   ├── stores/
│   │   ├── auth-store.ts
│   │   └── ui-store.ts
│   │
│   ├── validations/
│   │   ├── auth.ts                   # Login, register cliente (2 steps)
│   │   ├── address.ts
│   │   ├── order.ts                  # Checkout
│   │   └── profile.ts
│   │
│   ├── utils/
│   │   ├── format.ts                 # Moeda, data, telefone
│   │   ├── masks.ts                  # CPF, CEP, telefone
│   │   ├── errors.ts
│   │   ├── toast.ts
│   │   └── platform.ts
│   │
│   └── constants/
│       ├── query-keys.ts
│       └── config.ts
│
├── theme/
│   ├── colors.ts
│   ├── typography.ts
│   ├── spacing.ts
│   ├── radius.ts
│   ├── shadows.ts
│   └── index.ts
│
├── providers/
│   ├── AppProvider.tsx
│   ├── AuthProvider.tsx
│   └── QueryProvider.tsx
│
├── types/
│   ├── user.ts
│   ├── order.ts
│   ├── professional.ts
│   ├── service.ts
│   ├── address.ts
│   └── api.ts
│
└── assets/
    ├── images/
    └── fonts/
```

---

## 3. Telas do Cliente

| Tela                       | Rota                                  | Funcionalidade                                    |
|----------------------------|---------------------------------------|---------------------------------------------------|
| **Home**                   | `/(client)/(home)/`                   | Agenda, próximos agendamentos, profissionais em destaque |
| **Notificações**           | `/(client)/(home)/notifications`      | Lista de notificações                             |
| **Buscar**                 | `/(client)/(search)/`                 | Busca por profissionais/serviços com filtros       |
| **Perfil Profissional**    | `/(client)/(search)/professionals/[id]` | Detalhes, serviços, avaliações do profissional  |
| **Detalhe Serviço**        | `/(client)/(search)/services/[id]`    | Descrição, preço, profissional                    |
| **Por Profissão**          | `/(client)/(search)/professions/[id]` | Serviços agrupados por profissão                  |
| **Por Área**               | `/(client)/(search)/areas/[id]`       | Serviços disponíveis numa área                    |
| **Meus Pedidos**           | `/(client)/(orders)/`                 | Lista de pedidos com filtro de status              |
| **Detalhe Pedido**         | `/(client)/(orders)/[orderId]`        | Timeline, status, ações do pedido                 |
| **Checkout**               | `/(client)/(orders)/checkout/[serviceId]` | Selecionar data, hora, endereço              |
| **Pagamento**              | `/(client)/(orders)/payment/[orderId]` | UI de pagamento PIX, confirmação                 |
| **Perfil**                 | `/(client)/(profile)/`                | Dados pessoais (nome, email, telefone, foto)       |
| **Editar Perfil**          | `/(client)/(profile)/edit`            | Formulário de edição                              |
| **Endereços**              | `/(client)/(profile)/addresses/`      | Lista de endereços                                |
| **Novo Endereço**          | `/(client)/(profile)/addresses/new`   | Formulário de endereço                            |
| **Configurações**          | `/(client)/(profile)/settings`        | Preferências, logout                              |

---

## 4. Bottom Tab Bar do Cliente

```
┌──────────────────────────────────────────────┐
│   🏠 Início    🔍 Buscar    📋 Pedidos    👤 Perfil  │
└──────────────────────────────────────────────┘
```

```typescript
// app/(client)/_layout.tsx
import { Redirect, Tabs } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';
import { UserRole } from '@/types';
import { LoadingScreen } from '@/components/feedback';
import { ClientTabBar } from '@/components/layout';

export default function ClientLayout() {
  const { isAuthenticated, isLoading, isInitialized, user } = useAuth();

  if (!isInitialized || isLoading) return <LoadingScreen />;
  if (!isAuthenticated) return <Redirect href="/(auth)/login" />;

  // Guard: profissionais não acessam área de cliente
  if (user?.role === UserRole.PROFESSIONAL) {
    return <Redirect href="/(professional)/(dashboard)" />;
  }

  return (
    <Tabs tabBar={(props) => <ClientTabBar {...props} />}>
      <Tabs.Screen name="(home)" options={{ headerShown: false, title: 'Início' }} />
      <Tabs.Screen name="(search)" options={{ headerShown: false, title: 'Buscar' }} />
      <Tabs.Screen name="(orders)" options={{ headerShown: false, title: 'Pedidos' }} />
      <Tabs.Screen name="(profile)" options={{ headerShown: false, title: 'Perfil' }} />
    </Tabs>
  );
}
```

### Componente ClientTabBar

```typescript
// components/layout/ClientTabBar.tsx
import { View, Pressable, StyleSheet } from 'react-native';
import { Home, Search, ClipboardList, User } from 'lucide-react-native';
import { Text } from '@/components/ui';
import { colors, spacing, layout } from '@/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNotifications } from '@/lib/hooks/useNotifications';

const CLIENT_TABS = [
  { name: '(home)', label: 'Início', icon: Home },
  { name: '(search)', label: 'Buscar', icon: Search },
  { name: '(orders)', label: 'Pedidos', icon: ClipboardList },
  { name: '(profile)', label: 'Perfil', icon: User },
];

export function ClientTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { data: notificationCount } = useNotifications();

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom || spacing[2] }]}>
      {CLIENT_TABS.map((tab, index) => {
        const isActive = state.index === index;
        const Icon = tab.icon;
        const showBadge = tab.name === '(orders)' && notificationCount > 0;

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
                size={24}
                color={isActive ? colors.primary.default : colors.neutral[500]}
              />
              {showBadge && <View style={styles.badge} />}
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
    minHeight: 44, // acessibilidade
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.error,
  },
});
```

---

## 5. Registro do Cliente (2 Etapas)

### Fluxo

```
Escolha de perfil → Step 1: Dados Pessoais → Step 2: Senha → Home do cliente
```

### Campos por Etapa

**Step 1 - Dados Pessoais:**
- CPF (máscara: `000.000.000-00`, validação custom)
- Nome completo
- E-mail
- Telefone (máscara: `(00) 00000-0000`)
- Data de nascimento (máscara: `dd/mm/aaaa`)
- Foto de perfil (opcional, upload)

**Step 2 - Segurança:**
- Senha (requisitos mostrados em tempo real):
  - Mínimo 8 caracteres
  - 1 letra maiúscula
  - 1 letra minúscula
  - 1 número
- Confirmação de senha

### Schema de Validação

```typescript
// lib/validations/auth.ts
export const clientRegisterStep1Schema = z.object({
  cpf: z.string().min(1, 'CPF é obrigatório').refine(validateCPF, 'CPF inválido'),
  name: z.string().min(1, 'Nome é obrigatório').min(3, 'Mínimo 3 caracteres'),
  email: z.string().min(1, 'E-mail é obrigatório').email('E-mail inválido'),
  phone: z.string().min(1, 'Telefone é obrigatório'),
  birthDate: z.string().min(1, 'Data de nascimento é obrigatória'),
});

export const clientRegisterStep2Schema = z.object({
  password: z.string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Deve ter 1 maiúscula')
    .regex(/[a-z]/, 'Deve ter 1 minúscula')
    .regex(/[0-9]/, 'Deve ter 1 número'),
  confirmPassword: z.string().min(1, 'Confirmação obrigatória'),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Senhas não conferem',
  path: ['confirmPassword'],
});
```

---

## 6. Notificações do Cliente

O badge de notificação do cliente conta pedidos nos status:
- `ACCEPTED` - profissional aceitou
- `PENDING_COMPLETION` - aguardando conclusão
- `DISPUTED` - em disputa

```typescript
// lib/hooks/useNotifications.ts
const CLIENT_NOTIFICATION_STATUSES = new Set([
  'ACCEPTED',
  'PENDING_COMPLETION',
  'DISPUTED',
]);

export function useClientNotificationCount() {
  const { data: orders } = useMyOrders();

  const count = useMemo(() => {
    if (!orders) return 0;
    return orders.filter((o) => CLIENT_NOTIFICATION_STATUSES.has(o.status)).length;
  }, [orders]);

  return count;
}
```

---

## 7. Hooks Específicos do Cliente

```typescript
// lib/hooks/useOrders.ts - Pedidos como COMPRADOR
export function useMyOrders(params?: OrderFilters) {
  return useQuery({
    queryKey: queryKeys.orders.mine(params),
    queryFn: () => ordersApi.getMyOrders(params),  // GET /orders/my-orders
    staleTime: TWO_MINUTES,
  });
}

export function useCreateOrder() {
  const router = useRouter();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ordersApi.create,  // POST /orders
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
      toast.success('Pedido enviado!', 'O profissional será notificado');
      router.push(`/(client)/(orders)/${order.id}`);
    },
    onError: (error) => toast.error('Erro ao criar pedido', getApiErrorMessage(error)),
  });
}

// lib/hooks/useProfessionals.ts - Buscar profissionais
export function useSearchProfessionals(params: SearchParams) {
  return useQuery({
    queryKey: queryKeys.professionals.search(params),
    queryFn: () => professionalsApi.search(params),
    enabled: !!params.query || !!params.professionId || !!params.areaId,
  });
}

export function useProfessional(id: string) {
  return useQuery({
    queryKey: queryKeys.professionals.detail(id),
    queryFn: () => professionalsApi.getById(id),
    enabled: !!id,
  });
}

// lib/hooks/useAddresses.ts - Endereços do cliente
export function useAddresses() {
  return useQuery({
    queryKey: queryKeys.addresses.all,
    queryFn: () => addressesApi.getAll(),
  });
}

export function useCreateAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addressesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.addresses.all });
      toast.success('Endereço adicionado!');
    },
  });
}
```

---

## 8. Componentes de Domínio do Cliente

### ProfessionalCard

```typescript
// components/client/search/ProfessionalCard.tsx
interface ProfessionalCardProps {
  professional: Professional;
  onPress: () => void;
}

export function ProfessionalCard({ professional, onPress }: ProfessionalCardProps) {
  return (
    <Pressable onPress={onPress} style={styles.card}>
      <Image
        source={{ uri: professional.avatarUrl }}
        style={styles.avatar}
        contentFit="cover"
      />
      <View style={styles.info}>
        <Text variant="titleSm">{professional.name}</Text>
        <Text variant="bodySm" color={colors.neutral[500]}>
          {professional.professions.map((p) => p.name).join(', ')}
        </Text>
        <View style={styles.rating}>
          <Star size={14} color={colors.warning} fill={colors.warning} />
          <Text variant="labelLg">{professional.rating.toFixed(1)}</Text>
          <Text variant="labelSm" color={colors.neutral[500]}>
            ({professional.reviewCount})
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
```

### OrderCard

```typescript
// components/client/orders/OrderCard.tsx
interface OrderCardProps {
  order: Order;
  onPress: () => void;
}

export function OrderCard({ order, onPress }: OrderCardProps) {
  return (
    <Pressable onPress={onPress} style={[styles.card, shadows.sm]}>
      <View style={styles.header}>
        <Text variant="titleSm">{order.service.name}</Text>
        <OrderStatusBadge status={order.status} />
      </View>
      <Divider />
      <View style={styles.details}>
        <View style={styles.row}>
          <User size={16} color={colors.neutral[500]} />
          <Text variant="bodySm">{order.professional.name}</Text>
        </View>
        <View style={styles.row}>
          <Clock size={16} color={colors.neutral[500]} />
          <Text variant="bodySm">{formatDate(order.scheduledAt)}</Text>
        </View>
        <View style={styles.row}>
          <MapPin size={16} color={colors.neutral[500]} />
          <Text variant="bodySm" numberOfLines={1}>{order.address.street}</Text>
        </View>
      </View>
      <Text variant="titleSm" color={colors.primary.default} style={styles.price}>
        {formatCurrency(order.totalPrice)}
      </Text>
    </Pressable>
  );
}
```

### OrderStatusBadge

```typescript
// components/client/orders/OrderStatusBadge.tsx
const STATUS_CONFIG: Record<OrderStatus, { label: string; bg: string; text: string }> = {
  PENDING_ACCEPTANCE: { label: 'Aguardando', bg: colors.warning + '20', text: colors.warning },
  ACCEPTED:           { label: 'Aceito', bg: colors.info + '20', text: colors.info },
  PENDING_COMPLETION: { label: 'Em andamento', bg: colors.primary.light + '40', text: colors.primary.dark },
  COMPLETED:          { label: 'Concluído', bg: colors.success + '20', text: colors.success },
  CANCELLED:          { label: 'Cancelado', bg: colors.neutral[200], text: colors.neutral[500] },
  DISPUTED:           { label: 'Em disputa', bg: colors.error + '20', text: colors.error },
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const config = STATUS_CONFIG[status];
  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <Text variant="labelSm" color={config.text}>{config.label}</Text>
    </View>
  );
}
```

---

## 9. Fluxo de Checkout e Pagamento

```
Buscar → Profissional → Serviço → Checkout → Pagamento PIX → Pedido criado
```

### Tela de Checkout
- Selecionar data e horário
- Selecionar endereço (ou adicionar novo)
- Resumo: serviço, profissional, preço, endereço
- Botão "Confirmar Pedido"

### Tela de Pagamento PIX
- Código PIX copiável
- QR Code
- Timer de expiração
- Polling do status do pagamento
- Confirmação automática ao detectar pagamento

---

## 10. Padrão de Tela do Cliente

```typescript
// Exemplo: Tela de pedidos do cliente
export default function ClientOrdersScreen() {
  const { data: orders, isLoading, error, refetch } = useMyOrders();

  if (isLoading) return <LoadingScreen />;
  if (error) return <ErrorState message="Erro ao carregar pedidos" onRetry={refetch} />;
  if (!orders?.length) {
    return (
      <EmptyState
        icon={ClipboardList}
        title="Nenhum pedido ainda"
        description="Busque profissionais e contrate serviços"
        actionLabel="Buscar profissionais"
        onAction={() => router.push('/(client)/(search)')}
      />
    );
  }

  return (
    <Screen>
      <Header title="Meus Pedidos" />
      <FlashList
        data={orders}
        renderItem={({ item }) => (
          <Animated.View entering={FadeInDown.delay(100)}>
            <OrderCard
              order={item}
              onPress={() => router.push(`/(client)/(orders)/${item.id}`)}
            />
          </Animated.View>
        )}
        estimatedItemSize={140}
        ItemSeparatorComponent={() => <View style={{ height: spacing[3] }} />}
        contentContainerStyle={{ padding: spacing[4] }}
      />
    </Screen>
  );
}
```

---

## 11. API Consumida pelo Cliente

| Endpoint                    | Método | Uso                              |
|-----------------------------|--------|----------------------------------|
| `POST /auth/login`          | POST   | Login                            |
| `POST /auth/register`       | POST   | Registro de cliente              |
| `GET /auth/me`              | GET    | Perfil do usuário logado         |
| `GET /professionals`        | GET    | Listar/buscar profissionais      |
| `GET /professionals/:id`    | GET    | Detalhe do profissional          |
| `GET /services`             | GET    | Listar serviços                  |
| `GET /services/:id`         | GET    | Detalhe do serviço               |
| `GET /professions`          | GET    | Listar profissões                |
| `GET /areas`                | GET    | Listar áreas de atuação          |
| `POST /orders`              | POST   | Criar pedido                     |
| `GET /orders/my-orders`     | GET    | Meus pedidos (como comprador)    |
| `GET /orders/:id`           | GET    | Detalhe do pedido                |
| `GET /addresses`            | GET    | Meus endereços                   |
| `POST /addresses`           | POST   | Criar endereço                   |
| `PUT /addresses/:id`        | PUT    | Editar endereço                  |
| `DELETE /addresses/:id`     | DELETE | Remover endereço                 |
| `POST /uploads/profile`     | POST   | Upload de foto de perfil         |

---

Para os padrões compartilhados (theme, componentes UI, API client, stores, providers, animações, tratamento de erros, boas práticas), consulte o documento `MOBILE_PATTERNS_SHARED.md`.
