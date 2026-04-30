# Design: Foco Sob Demanda no App Cliente

**Data:** 2026-04-30
**Status:** Aprovado

## Contexto

O app cliente atualmente trata Express e Sob demanda como fluxos equivalentes, com uma tela de escolha intermediária após selecionar uma categoria. O objetivo é tornar Sob demanda o fluxo principal, com Express acessível de forma destacada mas separada.

## Escopo

Quatro mudanças independentes:

1. Adicionar tab Express na tab bar
2. Ajustar Home para refletir foco sob demanda
3. Simplificar fluxo de Buscar (remover tela de escolha)
4. Melhorar badges de modo no OrderCard

---

## 1. Navegação — Tab Bar

**Tab bar passa de 4 para 5 abas:**

```
Início  |  Buscar  |  Express ⚡  |  Pedidos  |  Perfil
```

### Arquivos afetados

| Arquivo | Ação |
|---------|------|
| `src/app/(client)/_layout.tsx` | Registrar tab `(express)` |
| `src/components/layout/ClientTabBar.tsx` | Adicionar entrada Express com ícone `Zap` |
| `src/app/(client)/(express)/_layout.tsx` | Criar — Stack com `headerShown: false` |
| `src/app/(client)/(express)/index.tsx` | Criar — hub de categorias para Express |
| `src/app/(client)/(express)/create.tsx` | Mover de `(orders)/express.tsx` sem alteração de conteúdo |
| `src/app/(client)/(search)/category/[categoryId].tsx` | Remover |

### Hub Express (`(express)/index.tsx`)

- Exibe as mesmas áreas e categorias que a tela de Buscar
- Ao tocar em uma categoria navega para `(express)/create.tsx` com params: `areaId`, `categoryId`, `areaName`, `categoryName`
- Reutiliza os mesmos dados de `useServiceAreas` e `useServiceCategories`

---

## 2. Home

**Arquivo:** `src/app/(client)/(home)/index.tsx`

O CTA card atual ("Crie um pedido Express...") é substituído por dois botões lado a lado:

- **Botão primário:** "Agendar serviço" → navega para tab Buscar (`/(client)/(search)`)
- **Botão secundário (outline):** "Express ⚡" → navega para tab Express (`/(client)/(express)`)

O restante da tela permanece inalterado: saudação, barra de busca rápida, categorias, pedidos ativos.

---

## 3. Fluxo de Buscar

**Arquivo removido:** `src/app/(client)/(search)/category/[categoryId].tsx`

Ao selecionar uma categoria em `(search)/index.tsx`, a navegação vai diretamente para:

```
/(client)/(search)/professionals
  params: { areaId, categoryId, areaName, categoryName }
```

O empty state da tela de profissionais quando não há resultados já possui um botão "Abrir Express" — esse comportamento é mantido, mas agora aponta para `/(client)/(express)/create` em vez de `/(client)/(orders)/express`.

---

## 4. Badges no OrderCard

**Arquivo:** `src/components/client/orders/OrderCard.tsx`

### Problema

Modo (`Express` / `Sob demanda`) e status (`Buscando`, `Aceito`, etc.) usam o mesmo componente `Badge`, tornando difícil distinguir as duas informações.

### Solução

- **Status** — mantém `OrderStatusBadge` (badge sólido com cor de fundo)
- **Modo** — substitui `Badge` genérico por pílula outline com ícone:
  - Express: borda âmbar (`#F59E0B`) + ícone `Zap` (14px) + texto "Express"
  - Sob demanda: borda azul (`colors.info`) + ícone `Calendar` (14px) + texto "Sob demanda"

A pílula de modo usa apenas borda colorida (sem fundo preenchido), criando hierarquia visual clara:
- Badge sólido = status atual (informação primária)
- Pílula outline = tipo de pedido (informação contextual)

---

## O que não muda

- Tela de detalhes do pedido (`[orderId].tsx`) — nenhuma alteração
- Checkout sob demanda (`checkout/[serviceId].tsx`) — nenhuma alteração
- Perfil, endereços, conversas — nenhuma alteração
- Fluxo de profissionais e serviços — nenhuma alteração
