# AllSet Mobile — Fundação + Auth (Cliente)

Spec de migração do app mobile AllSet: rewrite completo da stack atual (React Navigation, NativeWind, fetch direto) para a arquitetura definida em `DESIGN_PATTERNS.md` e `CLIENT_PATTERNS.md`.

**Escopo:** Fundação (theme, providers, API layer, stores, componentes base) + fluxo de autenticação (login, registro de cliente em 2 etapas, forgot-password).

**Abordagem:** Rewrite in-place — apagar código atual e reconstruir na mesma pasta.

---

## 1. Estrutura de Arquivos

```
src/
├── app/
│   ├── _layout.tsx              # Root layout (providers, fonts, splash)
│   ├── index.tsx                # Entry redirect (auth check)
│   ├── (auth)/
│   │   ├── _layout.tsx          # Stack simples, sem tabs
│   │   ├── login.tsx
│   │   ├── register/
│   │   │   ├── index.tsx        # Escolha: cliente ou profissional
│   │   │   └── client.tsx       # Registro de cliente (2 etapas)
│   │   └── forgot-password.tsx
│   └── (client)/
│       └── _layout.tsx          # Auth guard (placeholder — redireciona para login se não logado)
│
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Text.tsx
│   │   ├── Input.tsx
│   │   ├── Divider.tsx
│   │   └── index.ts
│   ├── feedback/
│   │   └── LoadingScreen.tsx
│   ├── forms/
│   │   ├── FormField.tsx
│   │   └── FormInput.tsx
│   └── layout/
│       └── Screen.tsx
│
├── lib/
│   ├── api/
│   │   ├── client.ts            # Axios instance + interceptors (refresh token)
│   │   └── auth.ts              # authApi
│   ├── hooks/
│   │   └── useAuth.ts           # useLogin, useLogout mutations
│   ├── stores/
│   │   └── auth-store.ts        # Zustand + SecureStore
│   ├── validations/
│   │   └── auth.ts              # Zod schemas
│   ├── utils/
│   │   ├── errors.ts            # getApiErrorMessage()
│   │   └── masks.ts             # CPF, telefone, data
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
│   └── api.ts
│
└── assets/
    ├── images/
    └── fonts/
        ├── Inter-Regular.ttf
        ├── Inter-Medium.ttf
        ├── Inter-SemiBold.ttf
        ├── Inter-Bold.ttf
        └── Raleway-Bold.ttf
```

---

## 2. Dependências

### Adicionar

- `expo-router` — navegação file-based
- `zustand` — estado global
- `@tanstack/react-query` — estado do servidor
- `axios` — HTTP client
- `expo-secure-store` — armazenamento seguro de tokens
- `react-hook-form` + `@hookform/resolvers` + `zod` — formulários e validação
- `lucide-react-native` + `react-native-svg` — ícones
- `react-native-toast-message` — toasts
- `expo-image` — imagens otimizadas

### Remover

- `nativewind` + `tailwindcss` + `prettier-plugin-tailwindcss` + `babel-preset` do NativeWind
- `@react-navigation/bottom-tabs` + `@react-navigation/native` + `@react-navigation/native-stack`
- `@expo/vector-icons`
- `react-native-web` + `react-dom` (foco mobile, sem web)

### Arquivos de config removidos

- `tailwind.config.js`
- `global.css`
- `nativewind-env.d.ts`

---

## 3. Theme System

Objetos TypeScript com `StyleSheet.create`. Tokens conforme DESIGN_PATTERNS.md:

### colors.ts

```typescript
export const colors = {
  primary: { light: '#E4A87B', default: '#E98936', dark: '#D77219', darker: '#B85600' },
  secondary: { default: '#5C2F12', light: '#AF5D1F' },
  neutral: {
    50: '#FFFFFF', 100: '#FAFAFA', 200: '#EAEAEA', 300: '#CACACA',
    400: '#CFC4B7', 500: '#A69A84', 800: '#5C2F12', 900: '#1A1A1A',
  },
  success: '#008632', warning: '#B45309', error: '#DC2626', info: '#E98936',
  background: '#FFFFFF', surface: '#FAFAFA', overlay: 'rgba(0, 0, 0, 0.5)', transparent: 'transparent',
} as const;
```

### typography.ts

Fontes Inter (Regular/Medium/SemiBold/Bold) + Raleway Bold. Presets: `displayLg` (32), `displayMd` (28), `displaySm` (24), `titleLg` (24), `titleSm` (18), `bodyLg` (16), `bodySm` (14), `labelLg` (12), `labelSm` (10).

### spacing.ts

Escala de 4px (0→0, 1→4, 2→8 ... 20→80). Tokens semânticos: `screenPaddingHorizontal: 16`, `cardPadding: 16`, `sectionGap: 24`, `formGap: 16`, `itemGap: 12`, `bottomTabHeight: 64`, `headerHeight: 56`.

### radius.ts

`xs: 4`, `sm: 8`, `md: 12`, `lg: 16`, `xl: 24`, `full: 9999`.

### shadows.ts

`sm`, `md`, `lg` com `Platform.select` para iOS (shadowColor/Offset/Opacity/Radius) e Android (elevation).

---

## 4. Navegação (Expo Router)

### Configuração

- `package.json` → `"main": "expo-router/entry"`
- `app.json` → mantém `"scheme": "allset"`
- `tsconfig.json` → adiciona `"baseUrl": ".", "paths": { "@/*": ["src/*"] }`
- `babel.config.js` → adiciona `expo-router/babel`

### Rotas

- `app/_layout.tsx` — carrega fontes, SplashScreen, envolve com AppProvider, renderiza `<Slot />`
- `app/index.tsx` — checa `isAuthenticated`, redireciona para `/(auth)/login` ou `/(client)/`
- `app/(auth)/_layout.tsx` — Stack simples (`headerShown: false`)
- `app/(client)/_layout.tsx` — auth guard: se não autenticado, `<Redirect href="/(auth)/login" />`

### Arquivos removidos

- `App.tsx`, `index.ts`, `routes/Routes.tsx`, `App/navigation/BottomTabNavigation.tsx`, `contexts/ui/ThemeContext.tsx`

---

## 5. Estado e Providers

### auth-store.ts (Zustand + SecureStore)

```
Estado: user | null, isAuthenticated, isLoading, isInitialized
Actions: setUser, initialize, logout, refreshUser
Persist: adapter SecureStore → Zustand, partialize (user, isAuthenticated)
Selectors: selectUser, selectIsClient, selectIsProfessional
```

- `initialize()`: lê `access_token` do SecureStore → se existe, busca profile via API → seta user
- `logout()`: chama `authApi.logout()` → limpa tokens do SecureStore → reseta estado

### AuthProvider.tsx

- Context fino que chama `initialize()` no mount
- Expõe `isAuthenticated`, `isLoading`, `isInitialized`, `user`

### QueryProvider.tsx

- `QueryClient`: `staleTime: 60s`, `gcTime: 5min`, `retry: 1`, `mutations.retry: 0`
- AppState listener para `focusManager`

### AppProvider.tsx

```
GestureHandlerRootView → SafeAreaProvider → QueryProvider → AuthProvider → {children} + <Toast />
```

---

## 6. API Layer

### client.ts (Axios)

- `baseURL`: `EXPO_PUBLIC_API_URL` (fallback `http://localhost:8080`)
- Request interceptor: injeta `Bearer` token do SecureStore
- Response interceptor: auto-refresh em 401 com fila de requests pendentes
- Timeout: 15s

### auth.ts

- `login(data)` → POST `/api/auth/login` → salva tokens → retorna tokens
- `register(data)` → POST `/api/auth/register` → salva tokens → retorna tokens
- `getProfile()` → GET `/api/users/:id` (extrai `sub` do JWT para obter o ID, mantendo compatibilidade com o backend atual)
- `logout()` → POST `/api/auth/logout`
- `forgotPassword(email)` → POST `/api/auth/forgot-password`
- `resetPassword(email, code, newPassword)` → POST `/api/auth/reset-password`

### Utilitários

- `errors.ts` — `getApiErrorMessage()`: extrai mensagem de `AxiosError.response.data`
- `masks.ts` — funções de máscara para CPF (`000.000.000-00`), telefone (`(00) 00000-0000`), data (`dd/mm/aaaa`)
- `config.ts` — `API_URL`, constantes de timeout
- `query-keys.ts` — `queryKeys.user: ['user']`

---

## 7. Componentes

### UI

- **Text** — `variant` (keyof typography), `color`. Default: `bodySm`, `secondary.default`
- **Button** — variantes: `primary`, `secondary`, `danger`, `ghost`. Tamanhos: `sm` (36), `md` (48), `lg` (56). Props: `loading`, `disabled`, `leftIcon`, `rightIcon`, `children: string`
- **Input** — borda `neutral[400]`, focus → `primary.default`, error → `error`. Slots: `leftIcon`, `rightIcon`
- **Divider** — linha `neutral[300]`, `height: 1`

### Forms

- **FormField** — label (Text `labelLg`) + children + erro (Text `labelLg` vermelho)
- **FormInput** — integra `Controller` do react-hook-form com Input. Props: `control`, `name`, + InputProps

### Layout

- **Screen** — `SafeAreaView` + `ScrollView` (opcional). Props: `scroll`, `padded`, `edges`

### Feedback

- **LoadingScreen** — logo + `ActivityIndicator` + "Carregando..."

---

## 8. Telas de Auth

### login.tsx

- `react-hook-form` + `zodResolver(loginSchema)`
- Campos: email (keyboardType email), senha (secureTextEntry + toggle Eye/EyeOff)
- Botão "Entrar" com `loading` do `useLogin()` mutation
- Link "Esqueci minha senha" → `/(auth)/forgot-password`
- Link "Criar conta" → `/(auth)/register/`
- Toast de erro/sucesso
- On success: `router.replace('/(client)/')`

### register/index.tsx

- Dois cards: Cliente (ativo) e Profissional (desabilitado, "Em breve")
- Card Cliente → `/(auth)/register/client`

### register/client.tsx

- 2 etapas via estado local `step`
- **Step 1**: CPF (máscara), nome, email, telefone (máscara), data de nascimento (máscara). Validação: `clientRegisterStep1Schema`
- **Step 2**: senha (indicadores de requisitos em tempo real: min 8, maiúscula, minúscula, número), confirmação. Validação: `clientRegisterStep2Schema`
- Navegação: "Próximo" (step 1→2), "Voltar" (step 2→1 preservando dados), "Criar conta" (step 2)
- On success: login automático → `router.replace('/(client)/')`

### forgot-password.tsx

- 3 estados sequenciais: (1) digitar email, (2) digitar código 4 dígitos, (3) nova senha
- On success: toast + `router.replace('/(auth)/login')`

### Validações (auth.ts)

- `loginSchema`: email (obrigatório, formato válido) + senha (obrigatório, min 6)
- `clientRegisterStep1Schema`: CPF (custom refine `validateCPF`), nome (min 3), email, telefone, birthDate
- `clientRegisterStep2Schema`: senha (min 8, regex maiúscula/minúscula/número) + confirmação (refine match)

---

## 9. Código / Arquivos Removidos

Tudo que pertence à stack antiga:

- `App.tsx`, `index.ts`
- `App/` (inteiro: components, screens, navigation, theme, services, constants)
- `routes/Routes.tsx`
- `contexts/ui/ThemeContext.tsx`
- `tailwind.config.js`, `global.css`, `nativewind-env.d.ts`

---

## 10. Fora de Escopo

- Telas protegidas do cliente (Home, Busca, Pedidos, Perfil) — próxima entrega
- Registro de profissional
- Bottom tab bar funcional
- Upload de foto de perfil no registro
- Integração com push notifications
- Testes automatizados
