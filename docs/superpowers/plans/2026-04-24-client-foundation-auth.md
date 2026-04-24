# AllSet Mobile — Fundação + Auth (Cliente) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rewrite the AllSet mobile app from NativeWind + React Navigation to Expo Router + StyleSheet.create, implementing the foundation (theme, providers, API layer, stores) and auth screens (login, register, forgot-password).

**Architecture:** File-based routing with Expo Router. Zustand for auth state persisted via expo-secure-store. React Query for server state. Axios with auto-refresh interceptor. Zod + react-hook-form for validation.

**Tech Stack:** React Native (Expo SDK 54), TypeScript, Expo Router, Zustand, @tanstack/react-query, axios, expo-secure-store, react-hook-form, zod, lucide-react-native, react-native-toast-message.

---

## File Map

### Delete (entire old codebase)
- `App.tsx`
- `index.ts`
- `App/` (entire directory)
- `routes/`
- `contexts/`
- `global.css`
- `tailwind.config.js`
- `nativewind-env.d.ts`

### Create
- `src/theme/colors.ts` — color palette tokens
- `src/theme/typography.ts` — font family + text presets
- `src/theme/spacing.ts` — 4px scale + semantic layout tokens
- `src/theme/radius.ts` — border radius tokens
- `src/theme/shadows.ts` — platform-specific shadow tokens
- `src/theme/index.ts` — barrel export
- `src/types/user.ts` — User, UserRole, AuthTokens types
- `src/types/api.ts` — ApiResponse, ApiError types
- `src/lib/constants/config.ts` — API_URL, timeouts
- `src/lib/constants/query-keys.ts` — centralized query keys
- `src/lib/utils/errors.ts` — getApiErrorMessage()
- `src/lib/utils/masks.ts` — CPF, phone, date masks
- `src/lib/utils/toast.ts` — toast wrapper
- `src/lib/validations/auth.ts` — login, register step1/step2 schemas
- `src/lib/api/client.ts` — axios instance + interceptors
- `src/lib/api/auth.ts` — authApi (login, register, logout, forgot, reset)
- `src/lib/stores/auth-store.ts` — Zustand + SecureStore persist
- `src/lib/hooks/useAuth.ts` — useLogin, useLogout mutations
- `src/providers/QueryProvider.tsx` — React Query client + AppState
- `src/providers/AuthProvider.tsx` — auth context + initialize
- `src/providers/AppProvider.tsx` — composed provider tree
- `src/components/ui/Text.tsx` — typed text with variant
- `src/components/ui/Button.tsx` — multi-variant button
- `src/components/ui/Input.tsx` — styled text input
- `src/components/ui/Divider.tsx` — horizontal divider
- `src/components/ui/index.ts` — barrel export
- `src/components/forms/FormField.tsx` — label + children + error
- `src/components/forms/FormInput.tsx` — react-hook-form integrated input
- `src/components/layout/Screen.tsx` — SafeArea + ScrollView wrapper
- `src/components/feedback/LoadingScreen.tsx` — loading spinner
- `src/app/_layout.tsx` — root layout (providers, fonts, splash)
- `src/app/index.tsx` — entry redirect
- `src/app/(auth)/_layout.tsx` — auth stack
- `src/app/(auth)/login.tsx` — login screen
- `src/app/(auth)/register/index.tsx` — profile choice
- `src/app/(auth)/register/client.tsx` — 2-step registration
- `src/app/(auth)/forgot-password.tsx` — forgot + reset password
- `src/app/(client)/_layout.tsx` — auth guard placeholder

### Modify
- `package.json` — dependencies + entry point
- `app.json` — expo-router plugin
- `tsconfig.json` — path aliases
- `babel.config.js` — remove nativewind, add reanimated
- `metro.config.js` — remove nativewind wrapper

---

### Task 1: Remove old code and update dependencies

**Files:**
- Delete: `App.tsx`, `index.ts`, `App/`, `routes/`, `contexts/`, `global.css`, `tailwind.config.js`, `nativewind-env.d.ts`
- Modify: `package.json`

- [x] **Step 1: Delete old source files**

```bash
rm -rf App/ routes/ contexts/ App.tsx index.ts global.css tailwind.config.js nativewind-env.d.ts
```

- [x] **Step 2: Uninstall old dependencies**

```bash
npx expo install --fix -- --legacy-peer-deps
npm uninstall nativewind tailwindcss prettier-plugin-tailwindcss @react-navigation/bottom-tabs @react-navigation/native @react-navigation/native-stack @expo/vector-icons react-native-web react-dom
```

- [x] **Step 3: Install new dependencies**

```bash
npx expo install expo-router expo-secure-store expo-image expo-font expo-splash-screen react-native-svg lucide-react-native react-native-toast-message @expo-google-fonts/inter @expo-google-fonts/raleway -- --legacy-peer-deps
npm install zustand @tanstack/react-query axios react-hook-form @hookform/resolvers zod --legacy-peer-deps
```

- [x] **Step 4: Update package.json entry point**

Change `"main"` in `package.json` from `"index.ts"` to `"expo-router/entry"`.

- [x] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: remove old codebase and update dependencies for migration"
```

---

### Task 2: Configure build tools

**Files:**
- Modify: `babel.config.js`, `metro.config.js`, `tsconfig.json`, `app.json`

- [x] **Step 1: Update babel.config.js**

Remove NativeWind presets. Keep reanimated plugin.

```javascript
module.exports = function (api) {
  api.cache(true);

  return {
    presets: ['babel-preset-expo'],
    plugins: ['react-native-reanimated/plugin'],
  };
};
```

- [x] **Step 2: Update metro.config.js**

Remove NativeWind wrapper. Plain Expo metro config.

```javascript
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

module.exports = config;
```

- [x] **Step 3: Update tsconfig.json**

Add path aliases and strict mode. Remove NativeWind types.

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["**/*.ts", "**/*.tsx"]
}
```

- [x] **Step 4: Update app.json**

Add expo-router plugin with `src/app` root.

```json
{
  "expo": {
    "name": "AllSet",
    "slug": "allset-mobile",
    "scheme": "allset",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "automatic",
    "newArchEnabled": true,
    "plugins": [
      ["expo-router", { "root": "src/app" }]
    ],
    "splash": {
      "image": "./assets/splash-icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.allset.mobile"
    },
    "android": {
      "package": "com.allset.mobile",
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "edgeToEdgeEnabled": true,
      "predictiveBackGestureEnabled": false
    },
    "web": {
      "bundler": "metro",
      "favicon": "./assets/favicon.png"
    }
  }
}
```

- [x] **Step 5: Commit**

```bash
git add babel.config.js metro.config.js tsconfig.json app.json
git commit -m "chore: configure expo-router, path aliases, and clean build tools"
```

---

### Task 3: Theme system

**Files:**
- Create: `src/theme/colors.ts`, `src/theme/typography.ts`, `src/theme/spacing.ts`, `src/theme/radius.ts`, `src/theme/shadows.ts`, `src/theme/index.ts`

- [x] **Step 1: Create colors.ts**

```typescript
// src/theme/colors.ts
export const colors = {
  primary: {
    light: '#E4A87B',
    default: '#E98936',
    dark: '#D77219',
    darker: '#B85600',
  },

  secondary: {
    default: '#5C2F12',
    light: '#AF5D1F',
  },

  neutral: {
    50: '#FFFFFF',
    100: '#FAFAFA',
    200: '#EAEAEA',
    300: '#CACACA',
    400: '#CFC4B7',
    500: '#A69A84',
    800: '#5C2F12',
    900: '#1A1A1A',
  },

  success: '#008632',
  warning: '#B45309',
  error: '#DC2626',
  info: '#E98936',

  background: '#FFFFFF',
  surface: '#FAFAFA',
  overlay: 'rgba(0, 0, 0, 0.5)',
  transparent: 'transparent',
} as const;
```

- [x] **Step 2: Create typography.ts**

```typescript
// src/theme/typography.ts
import { TextStyle } from 'react-native';

export const fonts = {
  inter: {
    regular: 'Inter-Regular',
    medium: 'Inter-Medium',
    semiBold: 'Inter-SemiBold',
    bold: 'Inter-Bold',
  },
  raleway: {
    bold: 'Raleway-Bold',
  },
} as const;

export const typography: Record<string, TextStyle> = {
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

export type TextVariant = keyof typeof typography;
```

- [x] **Step 3: Create spacing.ts**

```typescript
// src/theme/spacing.ts
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

export const layout = {
  screenPaddingHorizontal: spacing[4],
  screenPaddingVertical: spacing[4],
  cardPadding: spacing[4],
  sectionGap: spacing[6],
  formGap: spacing[4],
  itemGap: spacing[3],
  bottomTabHeight: 64,
  bottomTabSafeOffset: 80,
  headerHeight: 56,
} as const;
```

- [x] **Step 4: Create radius.ts**

```typescript
// src/theme/radius.ts
export const radius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;
```

- [x] **Step 5: Create shadows.ts**

```typescript
// src/theme/shadows.ts
import { Platform, ViewStyle } from 'react-native';

export const shadows: Record<string, ViewStyle> = {
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
  }) as ViewStyle,
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
  }) as ViewStyle,
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
  }) as ViewStyle,
};
```

- [x] **Step 6: Create index.ts barrel export**

```typescript
// src/theme/index.ts
export { colors } from './colors';
export { typography, fonts, type TextVariant } from './typography';
export { spacing, layout } from './spacing';
export { radius } from './radius';
export { shadows } from './shadows';
```

- [x] **Step 7: Commit**

```bash
git add src/theme/
git commit -m "feat: add theme system (colors, typography, spacing, radius, shadows)"
```

---

### Task 4: Types

**Files:**
- Create: `src/types/user.ts`, `src/types/api.ts`

- [x] **Step 1: Create user.ts**

```typescript
// src/types/user.ts
export enum UserRole {
  CLIENT = 'client',
  PROFESSIONAL = 'professional',
  ADMIN = 'admin',
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  profileImage?: string;
  birthDate?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterClientRequest {
  cpf: string;
  name: string;
  email: string;
  phone: string;
  birthDate: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  code: string;
  newPassword: string;
}
```

- [x] **Step 2: Create api.ts**

```typescript
// src/types/api.ts
export interface ApiErrorResponse {
  message: string | string[];
  statusCode: number;
  error?: string;
  fields?: Record<string, string>;
}
```

- [x] **Step 3: Commit**

```bash
git add src/types/
git commit -m "feat: add user and API types"
```

---

### Task 5: Constants

**Files:**
- Create: `src/lib/constants/config.ts`, `src/lib/constants/query-keys.ts`

- [x] **Step 1: Create config.ts**

```typescript
// src/lib/constants/config.ts
export const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080';
export const API_TIMEOUT = 15000;
```

- [x] **Step 2: Create query-keys.ts**

```typescript
// src/lib/constants/query-keys.ts
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

- [x] **Step 3: Commit**

```bash
git add src/lib/constants/
git commit -m "feat: add config and query keys constants"
```

---

### Task 6: UI Components

**Files:**
- Create: `src/components/ui/Text.tsx`, `src/components/ui/Button.tsx`, `src/components/ui/Input.tsx`, `src/components/ui/Divider.tsx`, `src/components/ui/index.ts`

- [x] **Step 1: Create Text.tsx**

```typescript
// src/components/ui/Text.tsx
import { Text as RNText, TextProps as RNTextProps } from 'react-native';
import { typography, type TextVariant, colors } from '@/theme';

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

- [x] **Step 2: Create Button.tsx**

```typescript
// src/components/ui/Button.tsx
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

  const textColor = variant === 'primary' || variant === 'danger'
    ? '#FFFFFF'
    : colors.primary.default;

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
        <ActivityIndicator color={textColor} />
      ) : (
        <>
          {leftIcon}
          <Text
            variant={size === 'sm' ? 'labelLg' : 'bodySm'}
            color={textColor}
            style={styles.label}
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
  label: { fontWeight: '600' },
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

- [x] **Step 3: Create Input.tsx**

```typescript
// src/components/ui/Input.tsx
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
        onFocus={(e) => {
          setFocused(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          props.onBlur?.(e);
        }}
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

- [x] **Step 4: Create Divider.tsx**

```typescript
// src/components/ui/Divider.tsx
import { View, StyleSheet } from 'react-native';
import { colors, spacing } from '@/theme';

interface DividerProps {
  vertical?: number;
}

export function Divider({ vertical = spacing[3] }: DividerProps) {
  return <View style={[styles.line, { marginVertical: vertical }]} />;
}

const styles = StyleSheet.create({
  line: {
    height: 1,
    backgroundColor: colors.neutral[300],
  },
});
```

- [x] **Step 5: Create index.ts barrel export**

```typescript
// src/components/ui/index.ts
export { Text } from './Text';
export { Button } from './Button';
export { Input } from './Input';
export { Divider } from './Divider';
```

- [x] **Step 6: Commit**

```bash
git add src/components/ui/
git commit -m "feat: add UI components (Text, Button, Input, Divider)"
```

---

### Task 7: Layout and Feedback Components

**Files:**
- Create: `src/components/layout/Screen.tsx`, `src/components/feedback/LoadingScreen.tsx`

- [x] **Step 1: Create Screen.tsx**

```typescript
// src/components/layout/Screen.tsx
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

- [x] **Step 2: Create LoadingScreen.tsx**

```typescript
// src/components/feedback/LoadingScreen.tsx
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Text } from '@/components/ui';
import { colors, spacing } from '@/theme';

interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message = 'Carregando...' }: LoadingScreenProps) {
  return (
    <View style={styles.container}>
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
    gap: spacing[6],
    backgroundColor: colors.background,
  },
});
```

- [x] **Step 3: Commit**

```bash
git add src/components/layout/ src/components/feedback/
git commit -m "feat: add Screen layout and LoadingScreen feedback components"
```

---

### Task 8: Form Components

**Files:**
- Create: `src/components/forms/FormField.tsx`, `src/components/forms/FormInput.tsx`

- [x] **Step 1: Create FormField.tsx**

```typescript
// src/components/forms/FormField.tsx
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

- [x] **Step 2: Create FormInput.tsx**

```typescript
// src/components/forms/FormInput.tsx
import { Controller, Control, FieldValues, Path } from 'react-hook-form';
import { TextInputProps } from 'react-native';
import { Input } from '@/components/ui';
import { FormField } from './FormField';

interface FormInputProps<T extends FieldValues> extends Omit<TextInputProps, 'value' | 'onChangeText' | 'onBlur'> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  mask?: (value: string) => string;
}

export function FormInput<T extends FieldValues>({
  control,
  name,
  label,
  leftIcon,
  rightIcon,
  mask,
  ...inputProps
}: FormInputProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
        <FormField label={label} error={error?.message}>
          <Input
            value={value}
            onChangeText={(text) => {
              onChange(mask ? mask(text) : text);
            }}
            onBlur={onBlur}
            error={!!error}
            leftIcon={leftIcon}
            rightIcon={rightIcon}
            {...inputProps}
          />
        </FormField>
      )}
    />
  );
}
```

- [x] **Step 3: Commit**

```bash
git add src/components/forms/
git commit -m "feat: add FormField and FormInput components"
```

---

### Task 9: Utilities

**Files:**
- Create: `src/lib/utils/errors.ts`, `src/lib/utils/masks.ts`, `src/lib/utils/toast.ts`

- [x] **Step 1: Create errors.ts**

```typescript
// src/lib/utils/errors.ts
import { AxiosError } from 'axios';
import type { ApiErrorResponse } from '@/types/api';

export function getApiErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data as ApiErrorResponse | undefined;

    if (data?.fields) {
      const firstKey = Object.keys(data.fields)[0];
      if (firstKey && data.fields[firstKey]) {
        return data.fields[firstKey];
      }
    }

    if (data?.message) {
      return Array.isArray(data.message) ? data.message[0] : data.message;
    }

    if (error.response?.status === 401) return 'E-mail ou senha inválidos.';
    if (error.response?.status === 403) return 'Sua conta não pode acessar o AllSet no momento.';
    if (error.response?.status === 423) return 'Sua conta está em processo de exclusão temporária.';
  }

  if (error instanceof Error) return error.message;

  return 'Erro inesperado. Tente novamente.';
}
```

- [x] **Step 2: Create masks.ts**

```typescript
// src/lib/utils/masks.ts

export function maskCPF(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

export function maskPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits.replace(/(\d{0,2})/, '($1');
  if (digits.length <= 7) return digits.replace(/(\d{2})(\d{0,5})/, '($1) $2');
  return digits.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
}

export function maskDate(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return digits.replace(/(\d{2})(\d{0,2})/, '$1/$2');
  return digits.replace(/(\d{2})(\d{2})(\d{0,4})/, '$1/$2/$3');
}

export function unmask(value: string): string {
  return value.replace(/\D/g, '');
}

export function validateCPF(cpf: string): boolean {
  const digits = cpf.replace(/\D/g, '');
  if (digits.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(digits)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += Number(digits[i]) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10) remainder = 0;
  if (remainder !== Number(digits[9])) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += Number(digits[i]) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10) remainder = 0;
  if (remainder !== Number(digits[10])) return false;

  return true;
}
```

- [x] **Step 3: Create toast.ts**

```typescript
// src/lib/utils/toast.ts
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

- [x] **Step 4: Commit**

```bash
git add src/lib/utils/
git commit -m "feat: add error handling, input masks, and toast utilities"
```

---

### Task 10: Validation Schemas

**Files:**
- Create: `src/lib/validations/auth.ts`

- [ ] **Step 1: Create auth.ts with all schemas**

```typescript
// src/lib/validations/auth.ts
import { z } from 'zod';
import { validateCPF } from '@/lib/utils/masks';

export const loginSchema = z.object({
  email: z.string().min(1, 'E-mail é obrigatório').email('E-mail inválido'),
  password: z.string().min(1, 'Senha é obrigatória').min(6, 'Mínimo 6 caracteres'),
});

export const clientRegisterStep1Schema = z.object({
  cpf: z.string().min(1, 'CPF é obrigatório').refine(
    (val) => validateCPF(val),
    'CPF inválido',
  ),
  name: z.string().min(1, 'Nome é obrigatório').min(3, 'Mínimo 3 caracteres'),
  email: z.string().min(1, 'E-mail é obrigatório').email('E-mail inválido'),
  phone: z.string().min(1, 'Telefone é obrigatório'),
  birthDate: z.string().min(1, 'Data de nascimento é obrigatória'),
});

export const clientRegisterStep2Schema = z.object({
  password: z.string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Deve conter pelo menos 1 letra maiúscula')
    .regex(/[a-z]/, 'Deve conter pelo menos 1 letra minúscula')
    .regex(/[0-9]/, 'Deve conter pelo menos 1 número'),
  confirmPassword: z.string().min(1, 'Confirmação é obrigatória'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Senhas não conferem',
  path: ['confirmPassword'],
});

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'E-mail é obrigatório').email('E-mail inválido'),
});

export const resetCodeSchema = z.object({
  code: z.string().min(4, 'Código deve ter 4 dígitos').max(4, 'Código deve ter 4 dígitos'),
});

export const newPasswordSchema = z.object({
  newPassword: z.string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Deve conter pelo menos 1 letra maiúscula')
    .regex(/[a-z]/, 'Deve conter pelo menos 1 letra minúscula')
    .regex(/[0-9]/, 'Deve conter pelo menos 1 número'),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type ClientRegisterStep1Data = z.infer<typeof clientRegisterStep1Schema>;
export type ClientRegisterStep2Data = z.infer<typeof clientRegisterStep2Schema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetCodeFormData = z.infer<typeof resetCodeSchema>;
export type NewPasswordFormData = z.infer<typeof newPasswordSchema>;
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/validations/
git commit -m "feat: add Zod validation schemas for auth forms"
```

---

### Task 11: API Layer

**Files:**
- Create: `src/lib/api/client.ts`, `src/lib/api/auth.ts`

- [ ] **Step 1: Create client.ts**

```typescript
// src/lib/api/client.ts
import axios, { InternalAxiosRequestConfig, AxiosError } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_URL, API_TIMEOUT } from '@/lib/constants/config';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: API_TIMEOUT,
});

apiClient.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = await SecureStore.getItemAsync('access_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

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
      if (!refreshToken) {
        return Promise.reject(error);
      }

      const { data } = await axios.post(`${API_URL}/api/auth/refresh`, { refreshToken });

      await SecureStore.setItemAsync('access_token', data.accessToken);
      await SecureStore.setItemAsync('refresh_token', data.refreshToken);

      processQueue(null, data.accessToken);
      originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      await SecureStore.deleteItemAsync('access_token');
      await SecureStore.deleteItemAsync('refresh_token');
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);
```

- [ ] **Step 2: Create auth.ts**

```typescript
// src/lib/api/auth.ts
import { apiClient } from './client';
import * as SecureStore from 'expo-secure-store';
import type {
  User,
  AuthTokens,
  LoginRequest,
  RegisterClientRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
} from '@/types/user';

const BASE64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

function decodeBase64(text: string): string {
  let result = '';
  for (let i = 0; i < text.length; i += 4) {
    const piece = text.slice(i, i + 4);
    let num = 0;
    let padding = 0;
    for (let p = 0; p < 4; p++) {
      num <<= 6;
      const ch = piece[p];
      if (!ch || ch === '=') {
        padding++;
      } else {
        num += BASE64_CHARS.indexOf(ch);
      }
    }
    result += String.fromCharCode((num >> 16) & 255);
    if (padding < 2) result += String.fromCharCode((num >> 8) & 255);
    if (padding < 1) result += String.fromCharCode(num & 255);
  }
  return result;
}

function readTokenPayload(token: string): { sub: string; role: string; email?: string } {
  const parts = token.split('.');
  if (parts.length < 2) throw new Error('Token inválido');
  const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.length % 4 === 0 ? base64 : base64 + '='.repeat(4 - (base64.length % 4));
  return JSON.parse(decodeBase64(padded));
}

export const authApi = {
  async login(data: LoginRequest): Promise<AuthTokens> {
    const response = await apiClient.post('/api/auth/login', data);
    const tokens: AuthTokens = response.data;
    await SecureStore.setItemAsync('access_token', tokens.accessToken);
    await SecureStore.setItemAsync('refresh_token', tokens.refreshToken);
    return tokens;
  },

  async register(data: RegisterClientRequest): Promise<AuthTokens> {
    const response = await apiClient.post('/api/auth/register', {
      ...data,
      role: 'client',
    });
    const tokens: AuthTokens = response.data;
    await SecureStore.setItemAsync('access_token', tokens.accessToken);
    await SecureStore.setItemAsync('refresh_token', tokens.refreshToken);
    return tokens;
  },

  async getProfile(): Promise<User> {
    const token = await SecureStore.getItemAsync('access_token');
    if (!token) throw new Error('Sem token de acesso');
    const payload = readTokenPayload(token);
    const response = await apiClient.get(`/api/users/${payload.sub}`);
    return response.data;
  },

  async logout(): Promise<void> {
    const refreshToken = await SecureStore.getItemAsync('refresh_token');
    if (refreshToken) {
      await apiClient.post('/api/auth/logout', { refreshToken });
    }
  },

  async forgotPassword(data: ForgotPasswordRequest): Promise<void> {
    await apiClient.post('/api/auth/forgot-password', data);
  },

  async resetPassword(data: ResetPasswordRequest): Promise<void> {
    await apiClient.post('/api/auth/reset-password', data);
  },
};
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/api/
git commit -m "feat: add axios client with auto-refresh and auth API layer"
```

---

### Task 12: Auth Store

**Files:**
- Create: `src/lib/stores/auth-store.ts`

- [ ] **Step 1: Create auth-store.ts**

```typescript
// src/lib/stores/auth-store.ts
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';
import type { User } from '@/types/user';
import { UserRole } from '@/types/user';
import { authApi } from '@/lib/api/auth';

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
    (set) => ({
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
          await SecureStore.deleteItemAsync('access_token');
          await SecureStore.deleteItemAsync('refresh_token');
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
    },
  ),
);

export const selectUser = (s: AuthState) => s.user;
export const selectIsClient = (s: AuthState) => s.user?.role === UserRole.CLIENT;
export const selectIsProfessional = (s: AuthState) => s.user?.role === UserRole.PROFESSIONAL;
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/stores/
git commit -m "feat: add Zustand auth store with SecureStore persistence"
```

---

### Task 13: Auth Hook

**Files:**
- Create: `src/lib/hooks/useAuth.ts`

- [ ] **Step 1: Create useAuth.ts**

```typescript
// src/lib/hooks/useAuth.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { authApi } from '@/lib/api/auth';
import { useAuthStore } from '@/lib/stores/auth-store';
import { toast } from '@/lib/utils/toast';
import { getApiErrorMessage } from '@/lib/utils/errors';
import { queryKeys } from '@/lib/constants/query-keys';

export function useLogin() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: async () => {
      const user = await authApi.getProfile();
      setUser(user);
      queryClient.invalidateQueries({ queryKey: queryKeys.user });
      toast.success('Bem-vindo!', `Olá, ${user.name ?? ''}`);
      router.replace('/(client)/');
    },
    onError: (error: unknown) => {
      toast.error('Erro ao fazer login', getApiErrorMessage(error));
    },
  });
}

export function useRegister() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.register,
    onSuccess: async () => {
      const user = await authApi.getProfile();
      setUser(user);
      queryClient.invalidateQueries({ queryKey: queryKeys.user });
      toast.success('Conta criada!', `Bem-vindo, ${user.name ?? ''}`);
      router.replace('/(client)/');
    },
    onError: (error: unknown) => {
      toast.error('Erro ao criar conta', getApiErrorMessage(error));
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

- [ ] **Step 2: Commit**

```bash
git add src/lib/hooks/
git commit -m "feat: add useLogin, useRegister, and useLogout hooks"
```

---

### Task 14: Providers

**Files:**
- Create: `src/providers/QueryProvider.tsx`, `src/providers/AuthProvider.tsx`, `src/providers/AppProvider.tsx`

- [ ] **Step 1: Create QueryProvider.tsx**

```typescript
// src/providers/QueryProvider.tsx
import { QueryClient, QueryClientProvider, focusManager } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { AppState, AppStateStatus } from 'react-native';

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
            refetchOnWindowFocus: false,
          },
          mutations: {
            retry: 0,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

- [ ] **Step 2: Create AuthProvider.tsx**

```typescript
// src/providers/AuthProvider.tsx
import { createContext, useContext, useEffect } from 'react';
import { useAuthStore } from '@/lib/stores/auth-store';
import type { User } from '@/types/user';

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading, isInitialized, initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, isInitialized }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

- [ ] **Step 3: Create AppProvider.tsx**

```typescript
// src/providers/AppProvider.tsx
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

- [ ] **Step 4: Commit**

```bash
git add src/providers/
git commit -m "feat: add QueryProvider, AuthProvider, and AppProvider"
```

---

### Task 15: App Entry and Layouts

**Files:**
- Create: `src/app/_layout.tsx`, `src/app/index.tsx`, `src/app/(auth)/_layout.tsx`, `src/app/(client)/_layout.tsx`

- [ ] **Step 1: Create root _layout.tsx**

```typescript
// src/app/_layout.tsx
import { Slot, SplashScreen } from 'expo-router';
import { useFonts } from 'expo-font';
import { useEffect } from 'react';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { Raleway_700Bold } from '@expo-google-fonts/raleway';
import { AppProvider } from '@/providers/AppProvider';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
    'Raleway-Bold': Raleway_700Bold,
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

- [ ] **Step 2: Create index.tsx entry redirect**

```typescript
// src/app/index.tsx
import { Redirect } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';
import { LoadingScreen } from '@/components/feedback/LoadingScreen';

export default function Index() {
  const { isAuthenticated, isInitialized } = useAuth();

  if (!isInitialized) return <LoadingScreen />;
  if (!isAuthenticated) return <Redirect href="/(auth)/login" />;

  return <Redirect href="/(client)/" />;
}
```

- [ ] **Step 3: Create (auth)/_layout.tsx**

```typescript
// src/app/(auth)/_layout.tsx
import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register/index" />
      <Stack.Screen name="register/client" />
      <Stack.Screen name="forgot-password" />
    </Stack>
  );
}
```

- [ ] **Step 4: Create (client)/_layout.tsx placeholder**

```typescript
// src/app/(client)/_layout.tsx
import { Redirect } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';
import { LoadingScreen } from '@/components/feedback/LoadingScreen';
import { View, StyleSheet } from 'react-native';
import { Text } from '@/components/ui';
import { colors, spacing } from '@/theme';

export default function ClientLayout() {
  const { isAuthenticated, isLoading, isInitialized } = useAuth();

  if (!isInitialized || isLoading) return <LoadingScreen />;
  if (!isAuthenticated) return <Redirect href="/(auth)/login" />;

  return (
    <View style={styles.container}>
      <Text variant="titleLg" color={colors.secondary.default}>
        AllSet
      </Text>
      <Text variant="bodySm" color={colors.neutral[500]}>
        Área do cliente em construção
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing[3],
    backgroundColor: colors.background,
  },
});
```

- [ ] **Step 5: Verify typecheck**

Run: `npx tsc --noEmit`
Expected: No errors (or only warnings from node_modules)

- [ ] **Step 6: Commit**

```bash
git add src/app/
git commit -m "feat: add root layout, entry redirect, auth and client layouts"
```

---

### Task 16: Login Screen

**Files:**
- Create: `src/app/(auth)/login.tsx`

- [ ] **Step 1: Create login.tsx**

```typescript
// src/app/(auth)/login.tsx
import { View, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react-native';
import { loginSchema, type LoginFormData } from '@/lib/validations/auth';
import { useLogin } from '@/lib/hooks/useAuth';
import { FormInput } from '@/components/forms/FormInput';
import { Text, Button } from '@/components/ui';
import { Screen } from '@/components/layout/Screen';
import { colors, spacing, typography } from '@/theme';

export default function LoginScreen() {
  const router = useRouter();
  const { mutate: login, isPending } = useLogin();
  const [showPassword, setShowPassword] = useState(false);

  const { control, handleSubmit } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  function onSubmit(data: LoginFormData) {
    login({ email: data.email.trim(), password: data.password });
  }

  return (
    <Screen edges={['top', 'bottom']}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text variant="displayMd" color={colors.secondary.default}>
            Entrar
          </Text>
          <Text variant="bodyLg" color={colors.neutral[500]}>
            Acesse sua conta AllSet
          </Text>
        </View>

        <View style={styles.form}>
          <FormInput
            control={control}
            name="email"
            label="E-mail"
            placeholder="seu@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            textContentType="emailAddress"
            leftIcon={<Mail size={20} color={colors.neutral[500]} />}
          />

          <FormInput
            control={control}
            name="password"
            label="Senha"
            placeholder="Sua senha"
            secureTextEntry={!showPassword}
            textContentType="password"
            leftIcon={<Lock size={20} color={colors.neutral[500]} />}
            rightIcon={
              <Pressable onPress={() => setShowPassword(!showPassword)}>
                {showPassword
                  ? <EyeOff size={20} color={colors.neutral[500]} />
                  : <Eye size={20} color={colors.neutral[500]} />
                }
              </Pressable>
            }
          />

          <Button loading={isPending} onPress={handleSubmit(onSubmit)} size="lg">
            Entrar
          </Button>

          <Pressable onPress={() => router.push('/(auth)/forgot-password')}>
            <Text
              variant="bodySm"
              color={colors.primary.default}
              style={styles.link}
            >
              Esqueci minha senha
            </Text>
          </Pressable>
        </View>

        <View style={styles.footer}>
          <Text variant="bodySm" color={colors.neutral[500]}>
            Não tem uma conta?
          </Text>
          <Pressable onPress={() => router.push('/(auth)/register/')}>
            <Text variant="bodySm" color={colors.primary.default} style={styles.linkBold}>
              Criar conta
            </Text>
          </Pressable>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing[8],
  },
  header: {
    gap: spacing[2],
  },
  form: {
    gap: spacing[4],
  },
  link: {
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing[1],
  },
  linkBold: {
    fontFamily: 'Inter-SemiBold',
  },
});
```

- [ ] **Step 2: Commit**

```bash
git add src/app/\(auth\)/login.tsx
git commit -m "feat: add login screen with form validation"
```

---

### Task 17: Register Screens

**Files:**
- Create: `src/app/(auth)/register/index.tsx`, `src/app/(auth)/register/client.tsx`

- [ ] **Step 1: Create register/index.tsx (profile choice)**

```typescript
// src/app/(auth)/register/index.tsx
import { View, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { User, Briefcase } from 'lucide-react-native';
import { Text } from '@/components/ui';
import { Screen } from '@/components/layout/Screen';
import { colors, spacing, radius, shadows } from '@/theme';

export default function RegisterChoiceScreen() {
  const router = useRouter();

  return (
    <Screen edges={['top', 'bottom']}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text variant="displayMd" color={colors.secondary.default}>
            Criar conta
          </Text>
          <Text variant="bodyLg" color={colors.neutral[500]}>
            Escolha seu perfil para começar
          </Text>
        </View>

        <View style={styles.cards}>
          <Pressable
            style={[styles.card, shadows.sm]}
            onPress={() => router.push('/(auth)/register/client')}
          >
            <View style={[styles.iconContainer, { backgroundColor: colors.primary.default + '15' }]}>
              <User size={28} color={colors.primary.default} />
            </View>
            <Text variant="titleSm" color={colors.secondary.default}>
              Cliente
            </Text>
            <Text variant="bodySm" color={colors.neutral[500]}>
              Busque profissionais, contrate serviços e acompanhe seus pedidos.
            </Text>
          </Pressable>

          <View style={[styles.card, styles.cardDisabled]}>
            <View style={[styles.iconContainer, { backgroundColor: colors.neutral[200] }]}>
              <Briefcase size={28} color={colors.neutral[500]} />
            </View>
            <View style={styles.cardHeader}>
              <Text variant="titleSm" color={colors.neutral[500]}>
                Profissional
              </Text>
              <View style={styles.badge}>
                <Text variant="labelSm" color={colors.neutral[50]}>
                  Em breve
                </Text>
              </View>
            </View>
            <Text variant="bodySm" color={colors.neutral[500]}>
              Ofereça seus serviços, receba pedidos e gerencie sua agenda.
            </Text>
          </View>
        </View>

        <Pressable onPress={() => router.back()} style={styles.backLink}>
          <Text variant="bodySm" color={colors.primary.default}>
            Já tenho uma conta
          </Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing[8],
  },
  header: {
    gap: spacing[2],
  },
  cards: {
    gap: spacing[4],
  },
  card: {
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    padding: spacing[5],
    gap: spacing[2],
    borderWidth: 1,
    borderColor: colors.neutral[300],
  },
  cardDisabled: {
    opacity: 0.5,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[1],
  },
  badge: {
    backgroundColor: colors.neutral[500],
    borderRadius: radius.full,
    paddingHorizontal: spacing[2],
    paddingVertical: 2,
  },
  backLink: {
    alignItems: 'center',
  },
});
```

- [ ] **Step 2: Create register/client.tsx (2-step registration)**

```typescript
// src/app/(auth)/register/client.tsx
import { View, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { ArrowLeft, Eye, EyeOff, Check, X } from 'lucide-react-native';
import {
  clientRegisterStep1Schema,
  clientRegisterStep2Schema,
  type ClientRegisterStep1Data,
  type ClientRegisterStep2Data,
} from '@/lib/validations/auth';
import { useRegister } from '@/lib/hooks/useAuth';
import { maskCPF, maskPhone, maskDate, unmask } from '@/lib/utils/masks';
import { FormInput } from '@/components/forms/FormInput';
import { Text, Button } from '@/components/ui';
import { Screen } from '@/components/layout/Screen';
import { colors, spacing } from '@/theme';
import type { RegisterClientRequest } from '@/types/user';

function PasswordRequirement({ met, label }: { met: boolean; label: string }) {
  return (
    <View style={styles.requirement}>
      {met
        ? <Check size={14} color={colors.success} />
        : <X size={14} color={colors.neutral[400]} />
      }
      <Text variant="labelLg" color={met ? colors.success : colors.neutral[500]}>
        {label}
      </Text>
    </View>
  );
}

export default function ClientRegisterScreen() {
  const router = useRouter();
  const { mutate: register, isPending } = useRegister();
  const [step, setStep] = useState<1 | 2>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [step1Data, setStep1Data] = useState<ClientRegisterStep1Data | null>(null);

  const step1Form = useForm<ClientRegisterStep1Data>({
    resolver: zodResolver(clientRegisterStep1Schema),
    defaultValues: { cpf: '', name: '', email: '', phone: '', birthDate: '' },
  });

  const step2Form = useForm<ClientRegisterStep2Data>({
    resolver: zodResolver(clientRegisterStep2Schema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const password = step2Form.watch('password');
  const requirements = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
  };

  function handleStep1(data: ClientRegisterStep1Data) {
    setStep1Data(data);
    setStep(2);
  }

  function handleStep2(data: ClientRegisterStep2Data) {
    if (!step1Data) return;

    const payload: RegisterClientRequest = {
      cpf: unmask(step1Data.cpf),
      name: step1Data.name.trim(),
      email: step1Data.email.trim(),
      phone: unmask(step1Data.phone),
      birthDate: step1Data.birthDate,
      password: data.password,
    };

    register(payload);
  }

  function handleBack() {
    if (step === 2) {
      setStep(1);
    } else {
      router.back();
    }
  }

  return (
    <Screen edges={['top', 'bottom']}>
      <Pressable onPress={handleBack} style={styles.backButton}>
        <ArrowLeft size={24} color={colors.secondary.default} />
      </Pressable>

      <View style={styles.header}>
        <Text variant="displayMd" color={colors.secondary.default}>
          {step === 1 ? 'Seus dados' : 'Criar senha'}
        </Text>
        <Text variant="bodyLg" color={colors.neutral[500]}>
          {step === 1
            ? 'Preencha seus dados pessoais'
            : 'Escolha uma senha segura para sua conta'
          }
        </Text>
        <Text variant="labelLg" color={colors.primary.default}>
          Etapa {step} de 2
        </Text>
      </View>

      {step === 1 ? (
        <View style={styles.form}>
          <FormInput
            control={step1Form.control}
            name="cpf"
            label="CPF"
            placeholder="000.000.000-00"
            keyboardType="number-pad"
            mask={maskCPF}
          />
          <FormInput
            control={step1Form.control}
            name="name"
            label="Nome completo"
            placeholder="Seu nome"
            autoCapitalize="words"
            textContentType="name"
          />
          <FormInput
            control={step1Form.control}
            name="email"
            label="E-mail"
            placeholder="seu@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            textContentType="emailAddress"
          />
          <FormInput
            control={step1Form.control}
            name="phone"
            label="Telefone"
            placeholder="(00) 00000-0000"
            keyboardType="phone-pad"
            textContentType="telephoneNumber"
            mask={maskPhone}
          />
          <FormInput
            control={step1Form.control}
            name="birthDate"
            label="Data de nascimento"
            placeholder="dd/mm/aaaa"
            keyboardType="number-pad"
            mask={maskDate}
          />

          <Button onPress={step1Form.handleSubmit(handleStep1)} size="lg">
            Próximo
          </Button>
        </View>
      ) : (
        <View style={styles.form}>
          <FormInput
            control={step2Form.control}
            name="password"
            label="Senha"
            placeholder="Crie uma senha"
            secureTextEntry={!showPassword}
            textContentType="newPassword"
            rightIcon={
              <Pressable onPress={() => setShowPassword(!showPassword)}>
                {showPassword
                  ? <EyeOff size={20} color={colors.neutral[500]} />
                  : <Eye size={20} color={colors.neutral[500]} />
                }
              </Pressable>
            }
          />

          <View style={styles.requirements}>
            <PasswordRequirement met={requirements.length} label="Mínimo 8 caracteres" />
            <PasswordRequirement met={requirements.upper} label="1 letra maiúscula" />
            <PasswordRequirement met={requirements.lower} label="1 letra minúscula" />
            <PasswordRequirement met={requirements.number} label="1 número" />
          </View>

          <FormInput
            control={step2Form.control}
            name="confirmPassword"
            label="Confirmar senha"
            placeholder="Repita a senha"
            secureTextEntry={!showPassword}
            textContentType="newPassword"
          />

          <Button loading={isPending} onPress={step2Form.handleSubmit(handleStep2)} size="lg">
            Criar conta
          </Button>
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  backButton: {
    marginBottom: spacing[4],
    width: 44,
    height: 44,
    justifyContent: 'center',
  },
  header: {
    gap: spacing[2],
    marginBottom: spacing[8],
  },
  form: {
    gap: spacing[4],
  },
  requirements: {
    gap: spacing[1],
    paddingLeft: spacing[1],
  },
  requirement: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
});
```

- [ ] **Step 3: Commit**

```bash
git add src/app/\(auth\)/register/
git commit -m "feat: add register screens (profile choice + 2-step client registration)"
```

---

### Task 18: Forgot Password Screen

**Files:**
- Create: `src/app/(auth)/forgot-password.tsx`

- [ ] **Step 1: Create forgot-password.tsx**

```typescript
// src/app/(auth)/forgot-password.tsx
import { View, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { ArrowLeft, Mail, Key, Lock } from 'lucide-react-native';
import {
  forgotPasswordSchema,
  resetCodeSchema,
  newPasswordSchema,
  type ForgotPasswordFormData,
  type ResetCodeFormData,
  type NewPasswordFormData,
} from '@/lib/validations/auth';
import { authApi } from '@/lib/api/auth';
import { toast } from '@/lib/utils/toast';
import { getApiErrorMessage } from '@/lib/utils/errors';
import { FormInput } from '@/components/forms/FormInput';
import { Text, Button } from '@/components/ui';
import { Screen } from '@/components/layout/Screen';
import { colors, spacing } from '@/theme';

type Step = 'email' | 'code' | 'password';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const emailForm = useForm<ForgotPasswordFormData>({
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

  async function handleSendCode(data: ForgotPasswordFormData) {
    setIsLoading(true);
    try {
      await authApi.forgotPassword({ email: data.email.trim() });
      setEmail(data.email.trim());
      setStep('code');
      toast.info('Código enviado', 'Verifique seu e-mail');
    } catch (error) {
      toast.error('Erro', getApiErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }

  function handleCodeSubmit(data: ResetCodeFormData) {
    setCode(data.code.trim());
    setStep('password');
  }

  async function handleResetPassword(data: NewPasswordFormData) {
    setIsLoading(true);
    try {
      await authApi.resetPassword({
        email,
        code,
        newPassword: data.newPassword,
      });
      toast.success('Senha atualizada!', 'Faça login com a nova senha');
      router.replace('/(auth)/login');
    } catch (error) {
      toast.error('Erro', getApiErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }

  function handleBack() {
    if (step === 'code') {
      setStep('email');
    } else if (step === 'password') {
      setStep('code');
    } else {
      router.back();
    }
  }

  const titles: Record<Step, { title: string; subtitle: string }> = {
    email: {
      title: 'Esqueci minha senha',
      subtitle: 'Informe seu e-mail para receber o código de recuperação',
    },
    code: {
      title: 'Código de verificação',
      subtitle: `Digite o código de 4 dígitos enviado para ${email}`,
    },
    password: {
      title: 'Nova senha',
      subtitle: 'Escolha uma nova senha segura para sua conta',
    },
  };

  return (
    <Screen edges={['top', 'bottom']}>
      <Pressable onPress={handleBack} style={styles.backButton}>
        <ArrowLeft size={24} color={colors.secondary.default} />
      </Pressable>

      <View style={styles.header}>
        <Text variant="displayMd" color={colors.secondary.default}>
          {titles[step].title}
        </Text>
        <Text variant="bodyLg" color={colors.neutral[500]}>
          {titles[step].subtitle}
        </Text>
      </View>

      {step === 'email' && (
        <View style={styles.form}>
          <FormInput
            control={emailForm.control}
            name="email"
            label="E-mail"
            placeholder="seu@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            textContentType="emailAddress"
            leftIcon={<Mail size={20} color={colors.neutral[500]} />}
          />
          <Button loading={isLoading} onPress={emailForm.handleSubmit(handleSendCode)} size="lg">
            Enviar código
          </Button>
        </View>
      )}

      {step === 'code' && (
        <View style={styles.form}>
          <FormInput
            control={codeForm.control}
            name="code"
            label="Código"
            placeholder="0000"
            keyboardType="number-pad"
            maxLength={4}
            leftIcon={<Key size={20} color={colors.neutral[500]} />}
          />
          <Button onPress={codeForm.handleSubmit(handleCodeSubmit)} size="lg">
            Confirmar código
          </Button>
          <Pressable onPress={() => handleSendCode({ email })}>
            <Text variant="bodySm" color={colors.primary.default} style={styles.resendLink}>
              Reenviar código
            </Text>
          </Pressable>
        </View>
      )}

      {step === 'password' && (
        <View style={styles.form}>
          <FormInput
            control={passwordForm.control}
            name="newPassword"
            label="Nova senha"
            placeholder="Mínimo 8 caracteres"
            secureTextEntry
            textContentType="newPassword"
            leftIcon={<Lock size={20} color={colors.neutral[500]} />}
          />
          <Button loading={isLoading} onPress={passwordForm.handleSubmit(handleResetPassword)} size="lg">
            Redefinir senha
          </Button>
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  backButton: {
    marginBottom: spacing[4],
    width: 44,
    height: 44,
    justifyContent: 'center',
  },
  header: {
    gap: spacing[2],
    marginBottom: spacing[8],
  },
  form: {
    gap: spacing[4],
  },
  resendLink: {
    textAlign: 'center',
  },
});
```

- [ ] **Step 2: Commit**

```bash
git add src/app/\(auth\)/forgot-password.tsx
git commit -m "feat: add forgot-password screen with 3-step recovery flow"
```

---

### Task 19: Final Verification

- [ ] **Step 1: Run typecheck**

```bash
npx tsc --noEmit
```

Expected: No type errors.

- [ ] **Step 2: Verify app starts**

```bash
npx expo start
```

Expected: Metro bundler starts. App loads on simulator/device showing the login screen (since no user is authenticated).

- [ ] **Step 3: Fix any issues found in steps 1-2**

Address typecheck errors or runtime issues. Common fixes:
- Missing type exports → add to barrel files
- Path alias resolution → verify tsconfig paths match actual structure
- Expo Router not finding routes → verify `app.json` plugin config has `"root": "src/app"`

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "feat: complete foundation + auth migration to Expo Router architecture"
```
