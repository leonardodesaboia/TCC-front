# AllSet Mobile - Arquitetura e Padrões React Native

Guia completo de arquitetura, padrões e design system para a aplicação mobile React Native, baseado no design system do site AllSet.

---

## 1. Stack Tecnológica

| Tecnologia                  | Finalidade                        |
|-----------------------------|-----------------------------------|
| React Native (Expo)         | Framework mobile                  |
| TypeScript                  | Tipagem estática                  |
| Expo Router                 | Navegação file-based              |
| Zustand                     | Estado global (auth, UI)          |
| @tanstack/react-query       | Estado do servidor / cache        |
| react-hook-form + zod       | Formulários e validação           |
| axios                       | Cliente HTTP                      |
| react-native-reanimated     | Animações performáticas           |
| expo-secure-store           | Armazenamento seguro de tokens    |
| lucide-react-native         | Sistema de ícones                 |
| react-native-safe-area-context | Safe area handling             |
| react-native-gesture-handler   | Gestos nativos                 |
| expo-image                  | Imagens otimizadas                |
| react-native-toast-message  | Notificações toast                |
| react-native-svg            | Suporte a SVGs                    |

---

## 2. Estrutura de Pastas

```
src/
├── app/                          # Expo Router (file-based routing)
│   ├── _layout.tsx               # Root layout (providers, fonts, splash)
│   ├── index.tsx                 # Entry redirect
│   │
│   ├── (auth)/                   # Grupo: rotas públicas de autenticação
│   │   ├── _layout.tsx           # Auth layout (sem bottom tabs)
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   ├── forgot-password.tsx
│   │   └── register-professional.tsx
│   │
│   ├── (app)/                    # Grupo: rotas protegidas (autenticado)
│   │   ├── _layout.tsx           # Tab layout + auth guard
│   │   │
│   │   ├── (home)/               # Tab: Home
│   │   │   ├── _layout.tsx       # Stack navigator da tab
│   │   │   ├── index.tsx         # Tela principal
│   │   │   └── notifications.tsx
│   │   │
│   │   ├── (search)/             # Tab: Busca
│   │   │   ├── _layout.tsx
│   │   │   ├── index.tsx
│   │   │   └── [professionId].tsx
│   │   │
│   │   ├── (orders)/             # Tab: Pedidos
│   │   │   ├── _layout.tsx
│   │   │   ├── index.tsx
│   │   │   └── [orderId].tsx
│   │   │
│   │   └── (profile)/            # Tab: Perfil
│   │       ├── _layout.tsx
│   │       ├── index.tsx
│   │       ├── edit.tsx
│   │       ├── addresses.tsx
│   │       └── settings.tsx
│   │
│   └── (public)/                 # Grupo: rotas públicas (sem auth)
│       ├── _layout.tsx
│       └── professionals/
│           └── [id].tsx
│
├── components/
│   ├── ui/                       # Componentes primitivos (design system)
│   │   ├── Button.tsx
│   │   ├── Text.tsx              # Wrapper tipográfico
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Avatar.tsx
│   │   ├── Badge.tsx
│   │   ├── Divider.tsx
│   │   ├── Icon.tsx              # Wrapper de ícones
│   │   ├── Skeleton.tsx
│   │   └── index.ts              # Barrel export
│   │
│   ├── feedback/                 # Componentes de feedback
│   │   ├── Toast.tsx
│   │   ├── EmptyState.tsx
│   │   ├── ErrorState.tsx
│   │   └── LoadingScreen.tsx
│   │
│   ├── forms/                    # Componentes de formulário
│   │   ├── FormField.tsx         # Wrapper: label + input + erro
│   │   ├── FormInput.tsx         # Input controlado por RHF
│   │   ├── FormSelect.tsx
│   │   ├── FormDatePicker.tsx
│   │   ├── FormImagePicker.tsx
│   │   └── AddressForm.tsx
│   │
│   ├── layout/                   # Componentes estruturais
│   │   ├── Screen.tsx            # SafeArea + ScrollView + padding
│   │   ├── Header.tsx            # Header customizado
│   │   ├── TabBar.tsx            # Bottom tab bar customizado
│   │   ├── KeyboardAvoidingWrapper.tsx
│   │   └── BottomSheet.tsx
│   │
│   └── domain/                   # Componentes de domínio (negócio)
│       ├── auth/
│       │   └── SocialLoginButtons.tsx
│       ├── professionals/
│       │   ├── ProfessionalCard.tsx
│       │   └── ProfessionalList.tsx
│       ├── orders/
│       │   ├── OrderCard.tsx
│       │   ├── OrderStatusBadge.tsx
│       │   └── OrderTimeline.tsx
│       └── onboarding/
│           └── OnboardingSlide.tsx
│
├── lib/
│   ├── api/
│   │   ├── client.ts             # Axios instance + interceptors
│   │   ├── auth.ts               # authApi (login, register, refresh)
│   │   ├── orders.ts             # ordersApi
│   │   ├── professionals.ts      # professionalsApi
│   │   ├── addresses.ts          # addressesApi
│   │   └── uploads.ts            # uploadsApi
│   │
│   ├── hooks/
│   │   ├── useAuth.ts            # Login, logout, register mutations
│   │   ├── useOrders.ts          # Order queries + mutations
│   │   ├── useProfessionals.ts   # Professional queries
│   │   ├── useAddresses.ts       # Address queries + mutations
│   │   └── useAppState.ts        # AppState listener (background/foreground)
│   │
│   ├── stores/
│   │   ├── auth-store.ts         # User, tokens, isAuthenticated
│   │   └── ui-store.ts           # Global loading, modals
│   │
│   ├── validations/
│   │   ├── auth.ts               # Login, register, CPF
│   │   ├── address.ts            # Endereço
│   │   ├── order.ts              # Pedido
│   │   └── profile.ts            # Perfil
│   │
│   ├── utils/
│   │   ├── format.ts             # Formatação (moeda, data, telefone)
│   │   ├── masks.ts              # Máscaras de input (CPF, CEP, tel)
│   │   ├── errors.ts             # getApiErrorMessage()
│   │   └── platform.ts           # Helpers de plataforma (iOS/Android)
│   │
│   └── constants/
│       ├── query-keys.ts         # Chaves centralizadas do React Query
│       └── config.ts             # API_URL, timeouts, etc.
│
├── theme/
│   ├── colors.ts                 # Paleta de cores
│   ├── typography.ts             # Escala tipográfica + presets
│   ├── spacing.ts                # Sistema de espaçamento
│   ├── radius.ts                 # Border radius tokens
│   ├── shadows.ts                # Sombras (iOS + Android)
│   └── index.ts                  # Export unificado do theme
│
├── providers/
│   ├── AppProvider.tsx           # Composição de todos os providers
│   ├── AuthProvider.tsx          # Auth context + guard
│   └── QueryProvider.tsx         # React Query client
│
├── types/
│   ├── user.ts
│   ├── order.ts
│   ├── professional.ts
│   ├── address.ts
│   ├── api.ts                    # ApiResponse<T>, PaginatedResponse<T>
│   └── navigation.ts            # Tipagem de rotas (Expo Router)
│
└── assets/
    ├── images/
    │   ├── logo.svg
    │   └── logo-complete.svg
    └── fonts/
        ├── Inter-Regular.ttf
        ├── Inter-Medium.ttf
        ├── Inter-SemiBold.ttf
        ├── Inter-Bold.ttf
        └── Raleway-Bold.ttf
```

### Convenções de Nomenclatura
| Tipo               | Convenção      | Exemplo                     |
|--------------------|----------------|-----------------------------|
| Componentes        | PascalCase     | `Button.tsx`, `OrderCard.tsx` |
| Hooks              | camelCase      | `useAuth.ts`, `useOrders.ts`  |
| Stores             | kebab-case     | `auth-store.ts`               |
| Validações         | kebab-case     | `auth.ts`, `address.ts`       |
| Tipos              | kebab-case     | `user.ts`, `order.ts`         |
| Utilitários        | kebab-case     | `format.ts`, `masks.ts`       |
| Telas (app/)       | kebab-case     | `forgot-password.tsx`         |
| Idioma do código   | Inglês         | variáveis, funções, tipos     |
| Idioma da UI       | Português BR   | labels, mensagens, toasts     |

---

## 3. Design System / Theme

### 3.1 Cores (`theme/colors.ts`)

```typescript
export const colors = {
  // Primária (Laranja)
  primary: {
    light: '#E4A87B',
    default: '#E98936',
    dark: '#D77219',
    darker: '#B85600',
  },

  // Secundária (Marrom)
  secondary: {
    default: '#5C2F12',
    light: '#AF5D1F',
  },

  // Neutras
  neutral: {
    50: '#FFFFFF',
    100: '#FAFAFA',
    200: '#EAEAEA',  // gray4 - backgrounds
    300: '#CACACA',  // gray3 - bordas claras
    400: '#CFC4B7',  // gray2 - bordas, separadores
    500: '#A69A84',  // gray1 - placeholders
    800: '#5C2F12',  // brown1 - texto principal
    900: '#1A1A1A',  // texto escuro
  },

  // Semânticas
  success: '#008632',
  warning: '#B45309',
  error: '#DC2626',
  info: '#E98936',

  // Utilitárias
  background: '#FFFFFF',
  surface: '#FAFAFA',
  overlay: 'rgba(0, 0, 0, 0.5)',
  transparent: 'transparent',
} as const;
```

### 3.2 Tipografia (`theme/typography.ts`)

```typescript
export const fonts = {
  inter: {
    regular: 'Inter-Regular',    // 400
    medium: 'Inter-Medium',      // 500
    semiBold: 'Inter-SemiBold',  // 600
    bold: 'Inter-Bold',          // 700
  },
  raleway: {
    bold: 'Raleway-Bold',        // 700 - títulos display
  },
} as const;

export const typography = {
  displayLg: {
    fontFamily: fonts.raleway.bold,
    fontSize: 32,
    lineHeight: 40,
  },
  displayMd: {
    fontFamily: fonts.raleway.bold,
    fontSize: 28,
    lineHeight: 36,
  },
  displaySm: {
    fontFamily: fonts.raleway.bold,
    fontSize: 24,
    lineHeight: 28,
  },
  titleLg: {
    fontFamily: fonts.inter.bold,
    fontSize: 24,
    lineHeight: 28,
  },
  titleSm: {
    fontFamily: fonts.inter.semiBold,
    fontSize: 18,
    lineHeight: 22,
  },
  bodyLg: {
    fontFamily: fonts.inter.regular,
    fontSize: 16,
    lineHeight: 20,
  },
  bodySm: {
    fontFamily: fonts.inter.regular,
    fontSize: 14,
    lineHeight: 20,
  },
  labelLg: {
    fontFamily: fonts.inter.semiBold,
    fontSize: 12,
    lineHeight: 16,
  },
  labelSm: {
    fontFamily: fonts.inter.medium,
    fontSize: 10,
    lineHeight: 14,
  },
} as const;
```

### 3.3 Espaçamento (`theme/spacing.ts`)

```typescript
// Escala de 4px (múltiplos de 4)
export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
} as const;

// Tokens semânticos
export const layout = {
  screenPaddingHorizontal: spacing[4],  // 16
  screenPaddingVertical: spacing[4],    // 16
  cardPadding: spacing[4],             // 16
  sectionGap: spacing[6],             // 24
  formGap: spacing[4],                // 16
  itemGap: spacing[3],                // 12
  bottomTabHeight: 64,
  bottomTabSafeOffset: 80,
  headerHeight: 56,
} as const;
```

### 3.4 Border Radius (`theme/radius.ts`)

```typescript
export const radius = {
  xs: 4,
  sm: 8,       // botões
  md: 12,      // inputs
  lg: 16,      // cards
  xl: 24,      // containers grandes
  full: 9999,  // badges, avatares, pills
} as const;
```

### 3.5 Sombras (`theme/shadows.ts`)

```typescript
import { Platform } from 'react-native';

export const shadows = {
  sm: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
    },
    android: {
      elevation: 2,
    },
  }),
  md: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
    },
    android: {
      elevation: 4,
    },
  }),
  lg: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 16,
    },
    android: {
      elevation: 8,
    },
  }),
} as const;
```

---

## 4. Padrões de Componentes

### 4.1 Componente Text Tipado

```typescript
// components/ui/Text.tsx
import { Text as RNText, TextProps as RNTextProps, StyleSheet } from 'react-native';
import { typography } from '@/theme';
import { colors } from '@/theme';

type TextVariant = keyof typeof typography;

interface TextProps extends RNTextProps {
  variant?: TextVariant;
  color?: string;
}

export function Text({
  variant = 'bodySm',
  color = colors.secondary.default,
  style,
  ...props
}: TextProps) {
  return (
    <RNText
      style={[typography[variant], { color }, style]}
      {...props}
    />
  );
}
```

### 4.2 Componente Button com Variantes

```typescript
// components/ui/Button.tsx
import { Pressable, ActivityIndicator, StyleSheet, ViewStyle } from 'react-native';
import { Text } from './Text';
import { colors, radius, spacing } from '@/theme';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onPress?: () => void;
  children: string;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  onPress,
  children,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        variantStyles[variant],
        sizeStyles[size],
        pressed && styles.pressed,
        isDisabled && styles.disabled,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#FFF' : colors.primary.default} />
      ) : (
        <>
          {leftIcon}
          <Text
            variant={size === 'sm' ? 'labelLg' : 'bodySm'}
            color={variant === 'primary' ? '#FFF' : colors.primary.default}
          >
            {children}
          </Text>
          {rightIcon}
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
    gap: spacing[2],
  },
  pressed: { opacity: 0.8 },
  disabled: { opacity: 0.5 },
});

const variantStyles: Record<ButtonVariant, ViewStyle> = {
  primary: { backgroundColor: colors.primary.default },
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.primary.default,
  },
  danger: { backgroundColor: colors.error },
  ghost: { backgroundColor: 'transparent' },
};

const sizeStyles: Record<ButtonSize, ViewStyle> = {
  sm: { height: 36, paddingHorizontal: spacing[3] },
  md: { height: 48, paddingHorizontal: spacing[4] },
  lg: { height: 56, paddingHorizontal: spacing[6] },
};
```

### 4.3 Componente Screen (Layout Base)

```typescript
// components/layout/Screen.tsx
import { ScrollView, View, StyleSheet, ViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { layout, colors } from '@/theme';

interface ScreenProps extends ViewProps {
  scroll?: boolean;
  padded?: boolean;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
}

export function Screen({
  scroll = true,
  padded = true,
  edges = ['top'],
  children,
  style,
  ...props
}: ScreenProps) {
  const Container = scroll ? ScrollView : View;
  const containerProps = scroll
    ? {
        contentContainerStyle: [
          padded && styles.padded,
          { flexGrow: 1 },
          style,
        ],
        showsVerticalScrollIndicator: false,
        keyboardShouldPersistTaps: 'handled' as const,
      }
    : {
        style: [styles.flex, padded && styles.padded, style],
      };

  return (
    <SafeAreaView edges={edges} style={styles.safe} {...props}>
      <Container {...containerProps}>{children}</Container>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: { flex: 1 },
  padded: {
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingVertical: layout.screenPaddingVertical,
  },
});
```

### 4.4 Componente FormField

```typescript
// components/forms/FormField.tsx
import { View, StyleSheet } from 'react-native';
import { Text } from '@/components/ui';
import { colors, spacing } from '@/theme';

interface FormFieldProps {
  label: string;
  error?: string;
  children: React.ReactNode;
}

export function FormField({ label, error, children }: FormFieldProps) {
  return (
    <View style={styles.container}>
      <Text variant="labelLg" color={colors.secondary.default}>
        {label}
      </Text>
      {children}
      {error && (
        <Text variant="labelLg" color={colors.error}>
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing[1] },
});
```

### 4.5 Componente Input

```typescript
// components/ui/Input.tsx
import { TextInput, TextInputProps, StyleSheet, View } from 'react-native';
import { useState } from 'react';
import { colors, radius, spacing, typography } from '@/theme';

interface InputProps extends TextInputProps {
  error?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function Input({ error, leftIcon, rightIcon, style, ...props }: InputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View
      style={[
        styles.container,
        focused && styles.focused,
        error && styles.error,
      ]}
    >
      {leftIcon}
      <TextInput
        style={[styles.input, style]}
        placeholderTextColor={colors.neutral[500]}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        {...props}
      />
      {rightIcon}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.neutral[400],
    borderRadius: radius.md,
    paddingHorizontal: spacing[4],
    height: 52,
    backgroundColor: colors.neutral[50],
    gap: spacing[2],
  },
  focused: {
    borderColor: colors.primary.default,
  },
  error: {
    borderColor: colors.error,
  },
  input: {
    flex: 1,
    ...typography.bodySm,
    color: colors.secondary.default,
  },
});
```

---

## 5. Navegação (Expo Router)

### 5.1 Root Layout

```typescript
// app/_layout.tsx
import { Slot, SplashScreen } from 'expo-router';
import { useFonts } from 'expo-font';
import { useEffect } from 'react';
import { AppProvider } from '@/providers/AppProvider';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'Inter-Regular': require('@/assets/fonts/Inter-Regular.ttf'),
    'Inter-Medium': require('@/assets/fonts/Inter-Medium.ttf'),
    'Inter-SemiBold': require('@/assets/fonts/Inter-SemiBold.ttf'),
    'Inter-Bold': require('@/assets/fonts/Inter-Bold.ttf'),
    'Raleway-Bold': require('@/assets/fonts/Raleway-Bold.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <AppProvider>
      <Slot />
    </AppProvider>
  );
}
```

### 5.2 Auth Guard no Layout de (app)

```typescript
// app/(app)/_layout.tsx
import { Redirect, Tabs } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';
import { LoadingScreen } from '@/components/feedback';
import { TabBar } from '@/components/layout';

export default function AppLayout() {
  const { isAuthenticated, isLoading, isInitialized } = useAuth();

  if (!isInitialized || isLoading) return <LoadingScreen />;
  if (!isAuthenticated) return <Redirect href="/(auth)/login" />;

  return (
    <Tabs tabBar={(props) => <TabBar {...props} />}>
      <Tabs.Screen name="(home)" options={{ headerShown: false, title: 'Início' }} />
      <Tabs.Screen name="(search)" options={{ headerShown: false, title: 'Buscar' }} />
      <Tabs.Screen name="(orders)" options={{ headerShown: false, title: 'Pedidos' }} />
      <Tabs.Screen name="(profile)" options={{ headerShown: false, title: 'Perfil' }} />
    </Tabs>
  );
}
```

### 5.3 Stack dentro de cada Tab

```typescript
// app/(app)/(orders)/_layout.tsx
import { Stack } from 'expo-router';

export default function OrdersLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen
        name="[orderId]"
        options={{ presentation: 'card', animation: 'slide_from_right' }}
      />
    </Stack>
  );
}
```

### 5.4 Padrão de Deep Link / Redirect por Role

```typescript
// app/index.tsx
import { Redirect } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';
import { UserRole } from '@/types';
import { LoadingScreen } from '@/components/feedback';

export default function Index() {
  const { isAuthenticated, isInitialized, user } = useAuth();

  if (!isInitialized) return <LoadingScreen />;
  if (!isAuthenticated) return <Redirect href="/(auth)/login" />;

  // Role-based redirect
  if (user?.role === UserRole.PROFESSIONAL) {
    return <Redirect href="/(app)/(home)" />;
  }

  return <Redirect href="/(app)/(home)" />;
}
```

---

## 6. Gerenciamento de Estado

### 6.1 Auth Store (Zustand + SecureStore)

```typescript
// lib/stores/auth-store.ts
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';
import { User } from '@/types';
import { authApi } from '@/lib/api';

// Adapter SecureStore → Zustand persist
const secureStorage = {
  getItem: async (key: string) => await SecureStore.getItemAsync(key),
  setItem: async (key: string, value: string) => await SecureStore.setItemAsync(key, value),
  removeItem: async (key: string) => await SecureStore.deleteItemAsync(key),
};

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;

  setUser: (user: User | null) => void;
  initialize: () => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      isInitialized: false,

      setUser: (user) => set({
        user,
        isAuthenticated: !!user,
      }),

      initialize: async () => {
        try {
          const token = await SecureStore.getItemAsync('access_token');
          if (!token) {
            set({ user: null, isAuthenticated: false, isLoading: false, isInitialized: true });
            return;
          }
          const user = await authApi.getProfile();
          set({ user, isAuthenticated: true, isLoading: false, isInitialized: true });
        } catch {
          set({ user: null, isAuthenticated: false, isLoading: false, isInitialized: true });
        }
      },

      logout: async () => {
        try {
          await authApi.logout();
        } finally {
          await SecureStore.deleteItemAsync('access_token');
          await SecureStore.deleteItemAsync('refresh_token');
          set({ user: null, isAuthenticated: false });
        }
      },

      refreshUser: async () => {
        const user = await authApi.getProfile();
        set({ user, isAuthenticated: true });
      },
    }),
    {
      name: 'allset-auth',
      storage: createJSONStorage(() => secureStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Selectors
export const selectUser = (s: AuthState) => s.user;
export const selectIsClient = (s: AuthState) => s.user?.role === 'CLIENT';
export const selectIsProfessional = (s: AuthState) => s.user?.role === 'PROFESSIONAL';
```

### 6.2 React Query Provider

```typescript
// providers/QueryProvider.tsx
import { QueryClient, QueryClientProvider, focusManager } from '@tanstack/react-query';
import { useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useEffect } from 'react';

// Refetch on app focus (equivalente ao refetchOnWindowFocus)
function useAppStateFocus() {
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (status: AppStateStatus) => {
      focusManager.setFocused(status === 'active');
    });
    return () => subscription.remove();
  }, []);
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  useAppStateFocus();

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            gcTime: 5 * 60 * 1000,
            retry: 1,
            refetchOnWindowFocus: false, // controlado manualmente via AppState
          },
          mutations: {
            retry: 0,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

### 6.3 Hierarquia de Estado

| Tipo de Estado     | Ferramenta          | Exemplo                           |
|--------------------|---------------------|-----------------------------------|
| Global (cliente)   | Zustand             | Auth, UI (toasts, loading)        |
| Servidor           | React Query         | Pedidos, profissionais, endereços |
| Contexto           | React Context       | AuthProvider (isAuthenticated)    |
| Local              | useState/useReducer | Campos de formulário, toggles     |
| Seguro             | expo-secure-store   | Tokens de autenticação            |
| Persistente        | MMKV/AsyncStorage   | Preferências do usuário, cache    |

---

## 7. Camada de API

### 7.1 Cliente Axios

```typescript
// lib/api/client.ts
import axios, { InternalAxiosRequestConfig, AxiosError } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_URL } from '@/lib/constants/config';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Request interceptor: injeta token
apiClient.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = await SecureStore.getItemAsync('access_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: auto-refresh token
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    error ? reject(error) : resolve(token!);
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return apiClient(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const refreshToken = await SecureStore.getItemAsync('refresh_token');
      const { data } = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });

      await SecureStore.setItemAsync('access_token', data.accessToken);
      await SecureStore.setItemAsync('refresh_token', data.refreshToken);

      processQueue(null, data.accessToken);
      originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      await SecureStore.deleteItemAsync('access_token');
      await SecureStore.deleteItemAsync('refresh_token');
      // Auth store limpa o estado → Expo Router redireciona para login
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);
```

### 7.2 Camada de API por Domínio

```typescript
// lib/api/auth.ts
import { apiClient } from './client';
import * as SecureStore from 'expo-secure-store';
import { User, AuthTokens, LoginRequest, RegisterRequest } from '@/types';

const unwrapResponse = <T>(data: T | { data: T }): T => {
  if (data && typeof data === 'object' && 'data' in data) {
    return (data as { data: T }).data;
  }
  return data;
};

export const authApi = {
  async login(data: LoginRequest): Promise<AuthTokens> {
    const response = await apiClient.post('/auth/login', data);
    const tokens = unwrapResponse<AuthTokens>(response.data);
    await SecureStore.setItemAsync('access_token', tokens.accessToken);
    await SecureStore.setItemAsync('refresh_token', tokens.refreshToken);
    return tokens;
  },

  async getProfile(): Promise<User> {
    const response = await apiClient.get('/auth/me');
    return unwrapResponse<User>(response.data);
  },

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
  },
};
```

### 7.3 Query Keys Centralizadas

```typescript
// lib/constants/query-keys.ts
export const queryKeys = {
  user: ['user'] as const,
  orders: {
    all: ['orders'] as const,
    mine: (params?: object) => ['orders', 'my-orders', params] as const,
    detail: (id: string) => ['orders', id] as const,
  },
  professionals: {
    all: ['professionals'] as const,
    detail: (id: string) => ['professionals', id] as const,
    search: (params: object) => ['professionals', 'search', params] as const,
  },
  addresses: {
    all: ['addresses'] as const,
  },
} as const;
```

---

## 8. Hooks

### 8.1 Hook de Query

```typescript
// lib/hooks/useOrders.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { ordersApi } from '@/lib/api';
import { queryKeys } from '@/lib/constants/query-keys';
import { toast } from '@/lib/utils/toast';
import { getApiErrorMessage } from '@/lib/utils/errors';

const TWO_MINUTES = 2 * 60 * 1000;
const POLLING_INTERVAL = 10 * 1000;
const POLLING_STATUSES = new Set(['PENDING_ACCEPTANCE', 'PENDING_COMPLETION']);

export function useMyOrders(params?: OrderFilters) {
  return useQuery({
    queryKey: queryKeys.orders.mine(params),
    queryFn: () => ordersApi.getMyOrders(params),
    staleTime: TWO_MINUTES,
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: queryKeys.orders.detail(id),
    queryFn: () => ordersApi.getById(id),
    enabled: !!id,
    staleTime: TWO_MINUTES,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status && POLLING_STATUSES.has(status) ? POLLING_INTERVAL : false;
    },
  });
}

export function useCreateOrder() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ordersApi.create,
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
      toast.success('Pedido enviado!', 'O profissional será notificado');
      router.push(`/(app)/(orders)/${order.id}`);
    },
    onError: (error: unknown) => {
      toast.error('Erro ao criar pedido', getApiErrorMessage(error));
    },
  });
}
```

### 8.2 Hook de Auth

```typescript
// lib/hooks/useAuth.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/lib/stores/auth-store';
import { toast } from '@/lib/utils/toast';
import { getApiErrorMessage } from '@/lib/utils/errors';

export function useLogin() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: async () => {
      const user = await authApi.getProfile();
      setUser(user);
      queryClient.invalidateQueries({ queryKey: ['user'] });
      toast.success('Bem-vindo!', `Olá, ${user.name ?? ''}`);
      router.replace('/(app)/(home)');
    },
    onError: (error: unknown) => {
      toast.error('Erro ao fazer login', getApiErrorMessage(error));
    },
  });
}

export function useLogout() {
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authApi.logout().catch(() => {}),
    onSettled: () => {
      logout();
      queryClient.clear();
      router.replace('/(auth)/login');
      toast.info('Até logo!', 'Você saiu da sua conta');
    },
  });
}
```

---

## 9. Formulários e Validação

### 9.1 Schemas Zod (reutilizáveis do web)

```typescript
// lib/validations/auth.ts
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().min(1, 'E-mail é obrigatório').email('E-mail inválido'),
  password: z.string().min(1, 'Senha é obrigatória').min(6, 'Mínimo 6 caracteres'),
});

export const registerSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').min(3, 'Mínimo 3 caracteres'),
  email: z.string().min(1, 'E-mail é obrigatório').email('E-mail inválido'),
  cpf: z.string().min(1, 'CPF é obrigatório').refine(validateCPF, 'CPF inválido'),
  phone: z.string().min(1, 'Telefone é obrigatório'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
  confirmPassword: z.string().min(1, 'Confirmação obrigatória'),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Senhas não conferem',
  path: ['confirmPassword'],
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
```

### 9.2 Formulário com react-hook-form (React Native)

```typescript
// Exemplo: tela de login
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginFormData } from '@/lib/validations/auth';
import { FormField } from '@/components/forms';
import { Input, Button } from '@/components/ui';

export function LoginForm() {
  const { control, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const { mutate: login, isPending } = useLogin();

  return (
    <View style={{ gap: spacing[4] }}>
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, onBlur, value } }) => (
          <FormField label="E-mail" error={errors.email?.message}>
            <Input
              placeholder="seu@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={!!errors.email}
            />
          </FormField>
        )}
      />

      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, onBlur, value } }) => (
          <FormField label="Senha" error={errors.password?.message}>
            <Input
              placeholder="Sua senha"
              secureTextEntry
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={!!errors.password}
            />
          </FormField>
        )}
      />

      <Button loading={isPending} onPress={handleSubmit((data) => login(data))}>
        Entrar
      </Button>
    </View>
  );
}
```

> **Nota**: No React Native, usa-se `Controller` em vez de `register`, pois `TextInput` é um componente controlado.

---

## 10. Animações (Reanimated)

### 10.1 Fade In (equivalente ao CSS fade-in)

```typescript
import Animated, { FadeInDown, FadeOut } from 'react-native-reanimated';

// Uso
<Animated.View entering={FadeInDown.duration(500)} exiting={FadeOut.duration(300)}>
  <OrderCard />
</Animated.View>
```

### 10.2 Skeleton Loading

```typescript
// components/feedback/Skeleton.tsx
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useEffect } from 'react';
import { colors, radius } from '@/theme';

interface SkeletonProps {
  width: number | string;
  height: number;
  borderRadius?: number;
}

export function Skeleton({ width, height, borderRadius = radius.sm }: SkeletonProps) {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(withTiming(1, { duration: 800 }), -1, true);
  }, []);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[
        { width, height, borderRadius, backgroundColor: colors.neutral[200] },
        style,
      ]}
    />
  );
}
```

### 10.3 Spinner de Loading

```typescript
// components/feedback/LoadingScreen.tsx
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Text } from '@/components/ui';
import { colors } from '@/theme';
import { Image } from 'expo-image';

export function LoadingScreen({ message = 'Carregando...' }) {
  return (
    <View style={styles.container}>
      <Image
        source={require('@/assets/images/logo.svg')}
        style={{ width: 56, height: 56 }}
      />
      <ActivityIndicator size="large" color={colors.primary.default} />
      <Text variant="bodySm" color={colors.neutral[500]}>
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
    backgroundColor: colors.background,
  },
});
```

---

## 11. Listas Performáticas (FlashList)

```typescript
// Para listas grandes, usar @shopify/flash-list em vez de FlatList
import { FlashList } from '@shopify/flash-list';

export function ProfessionalList({ professionals }: Props) {
  return (
    <FlashList
      data={professionals}
      renderItem={({ item }) => <ProfessionalCard professional={item} />}
      estimatedItemSize={120} // altura estimada do item
      keyExtractor={(item) => item.id}
      ItemSeparatorComponent={() => <View style={{ height: spacing[3] }} />}
      contentContainerStyle={{ padding: spacing[4] }}
      showsVerticalScrollIndicator={false}
    />
  );
}
```

---

## 12. Tratamento de Erros

### Extração de Mensagem

```typescript
// lib/utils/errors.ts
import { AxiosError } from 'axios';

export function getApiErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data as { message?: string | string[] } | undefined;
    if (data?.message) {
      return Array.isArray(data.message) ? data.message[0] : data.message;
    }
  }
  if (error instanceof Error) return error.message;
  return 'Erro inesperado';
}
```

### Toast Wrapper

```typescript
// lib/utils/toast.ts
import Toast from 'react-native-toast-message';

export const toast = {
  success: (title: string, message?: string) =>
    Toast.show({ type: 'success', text1: title, text2: message }),
  error: (title: string, message?: string) =>
    Toast.show({ type: 'error', text1: title, text2: message }),
  warning: (title: string, message?: string) =>
    Toast.show({ type: 'warning', text1: title, text2: message }),
  info: (title: string, message?: string) =>
    Toast.show({ type: 'info', text1: title, text2: message }),
};
```

---

## 13. Sistema de Ícones

### Biblioteca: `lucide-react-native`

```typescript
import { Search, Bell, User, ArrowLeft, Star, MapPin } from 'lucide-react-native';

// Tamanhos padrão
const ICON_SIZES = {
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
};

// Uso
<Search size={20} color={colors.secondary.default} />
<Bell size={24} color={colors.primary.default} />
```

| Ícone            | Uso                    |
|------------------|------------------------|
| `Bell`           | Notificações           |
| `User`           | Perfil                 |
| `ArrowLeft`      | Voltar                 |
| `Search`         | Busca                  |
| `X`              | Fechar                 |
| `Eye` / `EyeOff` | Mostrar/ocultar senha |
| `MapPin`         | Endereço               |
| `Star`           | Avaliações             |
| `Clock`          | Horário                |
| `LogOut`         | Sair                   |
| `CheckCircle2`   | Sucesso               |
| `XCircle`        | Erro                   |
| `AlertTriangle`  | Aviso                  |

---

## 14. Imagens

### expo-image (melhor performance que Image nativa)

```typescript
import { Image } from 'expo-image';

// Avatar com placeholder
<Image
  source={{ uri: user.avatarUrl }}
  placeholder={require('@/assets/images/avatar-placeholder.png')}
  style={{ width: 48, height: 48, borderRadius: radius.full }}
  contentFit="cover"
  transition={200}
/>

// Logo
<Image
  source={require('@/assets/images/logo.svg')}
  style={{ width: 40, height: 40 }}
  contentFit="contain"
/>
```

### Upload de Imagens

```typescript
import * as ImagePicker from 'expo-image-picker';

async function pickImage() {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 0.8,
    allowsEditing: true,
    aspect: [1, 1],
  });

  if (!result.canceled) {
    const asset = result.assets[0];
    // Validação: max 5MB, jpeg/png
    const formData = new FormData();
    formData.append('file', {
      uri: asset.uri,
      type: asset.mimeType ?? 'image/jpeg',
      name: asset.fileName ?? 'photo.jpg',
    } as any);
    return formData;
  }
}
```

---

## 15. Providers (Composição)

```typescript
// providers/AppProvider.tsx
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { QueryProvider } from './QueryProvider';
import { AuthProvider } from './AuthProvider';

export function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryProvider>
          <AuthProvider>
            {children}
            <Toast />
          </AuthProvider>
        </QueryProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
```

---

## 16. Boas Práticas React Native

### Performance
- Usar `FlashList` em vez de `FlatList` para listas grandes
- Usar `expo-image` em vez de `Image` nativa (cache automático, blurhash)
- Usar `React.memo()` em itens de lista que recebem callbacks
- Usar `useCallback` para handlers passados a listas
- Evitar inline styles em itens de lista (usar `StyleSheet.create`)
- Usar `reanimated` para animações (roda na UI thread)

### Segurança
- Tokens em `expo-secure-store` (nunca AsyncStorage)
- Validação de input com Zod antes de enviar à API
- Certificate pinning para produção

### Acessibilidade
- Props `accessible`, `accessibilityLabel`, `accessibilityRole` em componentes interativos
- `accessibilityState={{ disabled }}` em botões
- Tamanho mínimo de toque: 44x44 pontos
- Suporte a Dynamic Type (iOS) via `allowFontScaling`

### Estrutura de Tela

```typescript
// Padrão de uma tela típica
export default function OrdersScreen() {
  const { data: orders, isLoading, error, refetch } = useMyOrders();

  if (isLoading) return <LoadingScreen />;
  if (error) return <ErrorState onRetry={refetch} />;
  if (!orders?.length) return <EmptyState message="Nenhum pedido encontrado" />;

  return (
    <Screen>
      <Header title="Meus Pedidos" />
      <FlashList
        data={orders}
        renderItem={({ item }) => <OrderCard order={item} />}
        estimatedItemSize={100}
      />
    </Screen>
  );
}
```

---

## 17. Resumo: O que Reutilizar do Web

| Camada              | Reutilizar?    | Adaptação Necessária               |
|---------------------|----------------|-------------------------------------|
| `types/`            | 100%           | Nenhuma                             |
| `lib/validations/`  | 100%           | Nenhuma                             |
| `lib/utils/`        | ~90%           | Remover referências a DOM/window    |
| `lib/api/` (lógica) | ~90%          | `SecureStore` em vez de localStorage |
| `lib/hooks/`        | ~80%           | `useRouter` do Expo Router          |
| `lib/stores/`       | ~80%           | Adapter de storage para SecureStore |
| `components/`       | 0%             | Reescrever com componentes nativos  |
| `theme/`            | Tokens (cores) | Converter de CSS vars para objetos  |
