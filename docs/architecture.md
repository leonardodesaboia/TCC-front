# All Set - Estrutura de Pastas do Front Mobile

> Arquitetura Expo + React Native + NativeWind.
> O objetivo desta base e manter o projeto organizado por responsabilidade, sem perder velocidade de entrega no MVP.

---

## Visao Geral

```text
TCC-front/
|
|-- App.tsx                         # Entrada principal da aplicacao
|-- index.ts                        # Registro do app para Expo Go e builds nativas
|-- app.json                        # Configuracao do Expo (slug, scheme, assets, plataformas)
|-- babel.config.js                 # Babel para Expo, NativeWind e Reanimated
|-- metro.config.js                 # Metro configurado com NativeWind
|-- tailwind.config.js              # Tokens de design e classes utilitarias
|-- global.css                      # Diretivas base do Tailwind
|-- docs/                           # Documentacao tecnica do front
|
|-- contexts/
|   `-- ui/
|       `-- ThemeContext.tsx        # Tema da aplicacao e integracao com o NavigationContainer
|
|-- routes/
|   `-- Routes.tsx                  # Stack principal da aplicacao
|
`-- App/
    |-- navigation/
    |   `-- BottomTabNavigation.tsx # Navegacao por abas da area principal
    |
    |-- theme/
    |   |-- colors.ts               # Paleta do produto, reaproveitando o MVP web
    |   `-- theme.ts                # Tema de UI e tema do React Navigation
    |
    |-- constants/
    |   `-- home.ts                 # Conteudo estatico da home inicial
    |
    |-- components/
    |   |-- button/
    |   |   `-- Button.tsx          # Botao reutilizavel com variacoes visuais
    |   |-- cards/
    |   |   |-- FeatureCard.tsx
    |   |   |-- ProfessionalHighlightCard.tsx
    |   |   |-- ServiceCategoryCard.tsx
    |   |   `-- StepCard.tsx
    |   `-- layout/
    |       |-- BrandMark.tsx
    |       `-- SectionHeader.tsx
    |
    `-- screens/
        |-- Home/HomeScreen.tsx     # Pagina inicial mobile do MVP
        |-- Explore/ExploreScreen.tsx
        `-- Profile/ProfileScreen.tsx
```

---


### 1. Principios da Organizacao
O projeto tem a ideia central de separar navegacao, contexto global, telas, componentes e tema. Isso reduz acoplamento e evita que o `App.tsx` vire um ponto unico de responsabilidade.

### 2. Responsabilidade clara por camada

| Pasta | Responsabilidade |
|---|---|
| `contexts/` | Estado global de UI e providers compartilhados |
| `routes/` | Fluxos de navegacao do app |
| `App/screens/` | Composicao de cada tela |
| `App/components/` | Blocos reutilizaveis de interface |
| `App/constants/` | Dados estaticos usados no MVP |
| `App/theme/` | Tokens de design, paleta e tema de navegacao |
| `docs/` | Registro tecnico da arquitetura e das dependencias |

### 3. Mobile first

A home foi pensada primeiro para smartphone, com:

- hero curto e forte
- blocos empilhados
- CTA claro
- cards com densidade de informacao controlada
- navegacao inferior simples

Essa decisao segue o objetivo do produto: validar rapido a experiencia principal no celular.

---

## Fluxo da Aplicacao

```text
index.ts
  -> App.tsx
      -> ThemeProvider
      -> Routes
          -> NavigationContainer
              -> Stack principal
                  -> BottomTabNavigation
                      -> Home / Explore / Profile
```

---

## App.tsx

O `App.tsx` ficou restrito ao bootstrap:

- importa `global.css`
- inicializa `GestureHandlerRootView`
- inicializa `SafeAreaProvider`
- sobe o `ThemeProvider`
- entrega o controle de fluxo para `Routes`

Esse arquivo nao deve carregar regra de tela, dados de modulo ou componentes de negocio.

---

## contexts/ui

### ThemeContext.tsx

Mantem o tema atual da aplicacao e expõe:

- `theme`
- `colors`
- `navigationTheme`
- `toggleTheme()`

Mesmo que o MVP esteja centrado no tema claro, esse contexto foi mantido para seguir a referencia do boilerplate e evitar retrabalho quando surgirem preferencia visual, acessibilidade ou ajuste de contraste.

---

## routes/

### Routes.tsx

Centraliza a navegacao de nivel superior com `NavigationContainer` e `Native Stack`.

Hoje o stack esta simples:

```text
MainTabs
```

Mas a estrutura ja suporta crescimento para:

```text
AuthStack
MainTabs
CheckoutStack
ProviderStack
AdminStack
```

---

## navigation/

### BottomTabNavigation.tsx

Implementa a navegacao inferior principal.

Abas atuais:

- `Home`
- `Explore`
- `Profile`

Essa escolha atende a sprint atual porque:

- `Home` valida a proposta visual do produto
- `Explore` abre caminho para busca e catalogo
- `Profile` prepara autenticacao e preferencias

---

## screens/

### Home/HomeScreen.tsx

Tela inicial do MVP mobile. Ela traduz a landing do web para um formato mais direto, reaproveitando a mesma paleta:

- laranjas `#E4A87B`, `#E98936`, `#D77219`, `#B85600`
- marrons `#5C2F12`, `#AF5D1F`
- cinzas quentes `#A69A84`, `#CFC4B7`, `#CACACA`, `#EAEAEA`
- preto `#212121`

Blocos atuais:

- hero
- CTA para contratar ou oferecer servico
- categorias principais
- beneficios da proposta
- fluxo "como funciona"
- preview de profissionais

### Explore/ExploreScreen.tsx

Tela placeholder para a proxima sprint, onde entram:

- busca por servico
- filtros
- cards de profissionais
- lista por area/categoria

### Profile/ProfileScreen.tsx

Tela placeholder para:

- login
- cadastro
- preferencias
- dados do perfil

---

## components/

Os componentes foram separados por tipo para manter leitura rapida:

| Pasta | Objetivo |
|---|---|
| `button/` | Controles primarios e secundarios |
| `cards/` | Blocos visuais reutilizaveis de conteudo |
| `layout/` | Elementos estruturais e identidade visual |

Essa granularidade e suficiente para o MVP sem cair em excesso de abstraicao.

---

## constants/

### home.ts

Concentra os dados estaticos usados pela tela inicial:

- categorias
- beneficios
- passos da jornada
- profissionais em destaque

Quando a API estiver pronta, esse conteudo pode sair daqui e migrar para camada de `services/` ou `hooks/`, sem mudar a composicao da tela.

---

## theme/

### colors.ts

Fonte unica da paleta do produto.

### theme.ts

Conecta os tokens visuais ao `React Navigation`, garantindo consistencia entre:

- fundo
- cards
- texto
- bordas
- cor primaria

---

## Evolucao Recomendada

Conforme o front crescer, a proxima modularizacao natural e:

```text
App/
|-- features/
|   |-- auth/
|   |-- home/
|   |-- professionals/
|   |-- orders/
|   |-- payments/
|   `-- profile/
|-- services/
|-- hooks/
|-- store/
`-- types/
```

Para a sprint atual, isso ainda seria exagero. A base entregue privilegia clareza e velocidade sem sacrificar escalabilidade.

---

## Execucao em celular

O fluxo previsto para desenvolvimento nesta fase e:

1. `npm run start:tunnel`
2. abrir o `Expo Go` no iPhone ou Android
3. ler o QR code
4. validar a interface no dispositivo real

Se no futuro o app passar a depender de bibliotecas nativas nao suportadas pelo `Expo Go`, o passo seguinte sera migrar de validacao simples para uma `development build`.
