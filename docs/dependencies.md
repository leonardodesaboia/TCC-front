# All Set - Decisoes Tecnicas de Stack e Dependencias do Front Mobile

> Documento de referencia para a equipe de front.
> Contexto: aplicativo mobile do All Set, construido para Android e iPhone com foco inicial em validacao rapida do MVP.

---

## Configuracao Base

### Expo SDK 54

Expo foi escolhido como base do front mobile porque acelera o ciclo de desenvolvimento, simplifica o setup multiplataforma e permite validacao rapida em dispositivo fisico via QR code.

Para esta sprint, essa escolha entrega tres ganhos objetivos:

- mesma base para Android e iOS
- onboarding mais simples para a equipe
- feedback rapido no celular com `Expo Go`

O nome correto do app usado para testes por QR code e `Expo Go`.

### React Native 0.81.5

React Native e a base de renderizacao nativa da aplicacao. Ele permite que a UI tenha comportamento mobile real sem depender de WebView e sem duplicar interface entre plataformas.

### TypeScript

TypeScript foi mantido desde o inicio porque:

- reduz erros de integracao entre telas, navegacao e contexto
- facilita a evolucao dos contratos com a API
- melhora manutencao em um projeto que vai crescer por modulo

### React Navigation

A navegacao foi implementada com `React Navigation`.

Motivos da escolha:

- ecossistema maduro
- controle explicito de stacks e tabs
- melhor aderencia ao padrao da referencia escolhida
- flexibilidade para separar fluxos de contratante, profissional e admin no futuro

### NativeWind + Tailwind CSS

O projeto usa `NativeWind` para levar a ergonomia do Tailwind ao React Native.

Motivos da escolha:

- velocidade de composicao visual
- consistencia de tokens
- reaproveitamento mais facil da linguagem visual do MVP web
- menor friccao para evoluir design system

---

## Dependencias Principais

### expo

**Categoria:** Runtime / Tooling

Base operacional do app. Gerencia bundling, assets, configuracao de plataforma e integracao com o ecossistema Expo.

No contexto do All Set, o Expo reduz drasticamente o custo inicial de setup para uma equipe academica que precisa validar produto com velocidade.

---

### react-native

**Categoria:** UI nativa

Motor de renderizacao do app. Toda a experiencia do usuario roda sobre componentes nativos como `View`, `Text`, `ScrollView`, `Pressable` e `SafeAreaView`.

---

### react

**Categoria:** UI / estado

Camada declarativa usada para compor telas, contexto e componentes.

No MVP, React entrega:

- composicao previsivel
- separacao clara por componentes
- evolucao simples de prototipo para produto

---

### @react-navigation/native

**Categoria:** Navegacao

Nucleo da navegacao do app. Controla o `NavigationContainer` e a integracao do estado de navegacao com o restante da aplicacao.

---

### @react-navigation/native-stack

**Categoria:** Navegacao

Usado para stacks de alto nivel. No estado atual, controla a entrada nas abas principais. Depois pode separar:

- autenticacao
- fluxo principal do contratante
- fluxo do profissional
- checkout
- telas administrativas

---

### @react-navigation/bottom-tabs

**Categoria:** Navegacao

Entrega a barra inferior do app, que e o modelo mais natural para o MVP mobile atual.

Abas configuradas:

- Inicio
- Explorar
- Perfil

---

### nativewind

**Categoria:** UI / estilo

Adaptador que leva classes utilitarias do Tailwind para React Native.

Foi escolhido porque o projeto ja tem um MVP web em Tailwind e a equipe ganha:

- consistencia visual entre web e mobile
- curva de aprendizado menor
- prototipacao mais rapida

---

### tailwindcss

**Categoria:** Design tokens / build

Responsavel pelos tokens e pelas utilidades consumidas pelo NativeWind.

Neste projeto, o `tailwind.config.js` concentra a paleta do AllSet, derivada do MVP web:

- `orange1` `#E4A87B`
- `orange2` `#E98936`
- `orange3` `#D77219`
- `orange4` `#B85600`
- `brown1` `#5C2F12`
- `brown2` `#AF5D1F`
- `gray1` `#A69A84`
- `gray2` `#CFC4B7`
- `gray3` `#CACACA`
- `gray4` `#EAEAEA`
- `black1` `#212121`

---

### react-native-safe-area-context

**Categoria:** Layout

Garante que a interface respeite areas seguras de iPhone e Android, evitando colisao com notch, barra superior e gestos do sistema.

Isso e obrigatorio para um app mobile real.

---

### react-native-screens

**Categoria:** Navegacao / performance

Melhora a integracao da navegacao com telas nativas e reduz custo de renderizacao em stacks maiores.

---

### react-native-gesture-handler

**Categoria:** Interacao

Base para gestos e interacoes mais fluidas dentro da navegacao e de componentes que venham a exigir swipe, toque ou transicoes mais refinadas.

---

### react-native-reanimated

**Categoria:** Animacao / performance

Biblioteca de animacao mais robusta do ecossistema React Native atual.

Mesmo que a primeira sprint use animacao leve, a dependencia ja deixa o projeto preparado para:

- transicoes de navegacao
- microinteracoes
- motion mais refinado sem jank

---

### expo-status-bar

**Categoria:** UI do sistema

Controla a barra de status de forma consistente entre plataformas.

---

## Ferramenta de Teste no Celular

### Expo Go

`Expo Go` e o aplicativo usado para abrir o projeto no celular via QR code sem precisar entrar agora em Android Studio ou Xcode como fluxo principal de validacao.

Esse caminho atende diretamente ao que o projeto precisa nesta fase:

- testar visual no iPhone e no Android
- validar navegacao e layout rapido
- reduzir atrito de setup

### start:tunnel

O script `npm run start:tunnel` foi adicionado para facilitar testes quando computador e celular nao estiverem na mesma rede local.

---

## Dependencias de Build

### babel-preset-expo

Preset do Babel alinhado ao SDK do Expo. Necessario para manter compatibilidade do pipeline de build com Expo 54 e com a configuracao do NativeWind.

### prettier-plugin-tailwindcss

Organiza classes utilitarias de forma consistente. Nao afeta runtime, mas reduz ruido visual no codigo.

---

## Trade-offs Assumidos

| Decisao | Escolha | Alternativa descartada | Motivo |
|---|---|---|---|
| Stack mobile | Expo + React Native | React Native CLI puro | Menor atrito de setup e validacao via QR code |
| Navegacao | React Navigation | Expo Router | Maior aderencia ao boilerplate usado como referencia |
| Estilizacao | NativeWind + Tailwind | StyleSheet puro | Velocidade e consistencia visual com o MVP web |
| Validacao em device | Expo Go | Android Studio como fluxo principal | Agilidade para sprint curta e teste em iPhone/Android |

---

## Proximas Dependencias Provaveis

Conforme o app evoluir, as adicoes mais provaveis sao:

| Dependencia | Finalidade |
|---|---|
| `axios` | Cliente HTTP para API |
| `@tanstack/react-query` | Cache, fetch e invalidacao de dados |
| `zustand` | Estado global leve |
| `react-hook-form` + `zod` | Formularios e validacao |
| `expo-image-picker` | Upload de foto e documentos |
| `expo-location` | Geolocalizacao para modo Express |
| `expo-notifications` | Push notifications |

---

## Resumo das Escolhas

| Decisao | Escolha | Motivo principal |
|---|---|---|
| Runtime | Expo SDK 54 | Melhor ciclo de validacao mobile para a sprint atual |
| Renderizacao | React Native | UI nativa para Android e iPhone |
| Linguagem | TypeScript | Seguranca e evolucao mais previsivel |
| Navegacao | React Navigation | Aderencia ao boilerplate de referencia |
| Estilo | NativeWind + Tailwind | Reaproveitar a linguagem do MVP web |
| Teste em device | Expo Go | QR code e validacao rapida em aparelho real |

---

*Documento preparado para o front mobile do All Set em 13 de marco de 2026.*
