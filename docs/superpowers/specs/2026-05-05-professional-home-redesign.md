# Professional Home Redesign

**Data:** 2026-05-05  
**Arquivo alvo:** `src/app/(professional)/(dashboard)/index.tsx`  
**Objetivo:** Alinhar visualmente a home do profissional com a home do cliente, substituindo o hero laranja por um padrão de saudação em texto, métricas compactas e cards de alerta consistentes.

---

## Contexto

A home do profissional usa um bloco hero laranja sólido no topo que não combina com o visual da home do cliente. O cliente tem saudação em texto simples, sino neutro, cards de alerta com borda colorida e seções bem espaçadas. O profissional deve seguir o mesmo language visual.

---

## Seção 1 — Cabeçalho

**Substituir** o bloco `hero` (fundo `colors.primary.default`, `borderRadius: radius.xl`) por uma estrutura de saudação em texto, igual ao `greeting` da home do cliente:

- **Esquerda:** `View` com `gap: spacing[1]`
  - `Text variant="bodySm" color={colors.neutral[500]}`: `"{greeting}, {firstName}"`
  - `Text variant="displaySm"`: `"Seu painel"` (título fixo, contextualiza a tela)
  - Se `profile.reviewCount > 0`: linha inline com `Star` (cor `colors.warning`, tamanho 14) + nota + contagem em `bodySm neutral[500]`
  - Se `profile.reviewCount === 0`: omitir (sem texto "sem avaliações ainda")

- **Direita:** botão sino em círculo `neutral[100]`, tamanho 44×44 (igual ao `bellBtn` do cliente)
  - Badge de notificações: círculo vermelho (`colors.error`) com contagem em branco — igual ao `badgeDot` do cliente

**Remover** completamente os estilos `hero`, `heroContent`, `heroRating`, `heroBell`, `heroBadge`.

---

## Seção 2 — Métricas

**Substituir** os 3 `StatCard` em linha por uma linha de 3 chips compactos:

```
[🔄 N  Ativos]   [⏳ N  Pendentes]   [$ R$ X  Receita]
```

- Estrutura: `View flexDirection="row" gap={spacing[2]}`
- Cada chip: `View flex=1`, `flexDirection="row"`, `alignItems="center"`, `gap={spacing[1.5]}`, `borderRadius={radius.full}`, `borderWidth=1`, `borderColor={colors.neutral[200]}`, `backgroundColor={colors.neutral[100]}`, `paddingHorizontal={spacing[3]}`, `paddingVertical={spacing[2]}`
- Conteúdo de cada chip: ícone pequeno (tamanho 14) + `Text variant="titleSm"` com o valor + `Text variant="labelSm" color={colors.neutral[500]}` com o label
- Dados:
  - Chip 1: `Clock` (cor `colors.primary.default`) + `activeOrders.length` + `"Ativos"`
  - Chip 2: `Clock` (cor `colors.warning`) + `pendingOrders.length` + `"Pendentes"`
  - Chip 3: `DollarSign` (cor `colors.success`) + `formatMoney(totalEarnings)` + `"Receita"`

**Remover** completamente `StatCard`, seus estilos e o ícone `CheckCircle` que não será mais usado.

---

## Seção 3 — Express Availability Card

Manter `<ExpressAvailabilityCard variant="compact" />` mas envolvê-lo em um `View` com estilo dinâmico baseado no status da disponibilidade Express. Como o status está encapsulado dentro do componente, a solução mais simples é adicionar ao `compactCard` do `ExpressAvailabilityCard` o suporte a variação de borda/fundo via prop `status`.

**Alternativa mais simples (preferida):** Modificar o `ExpressAvailabilityCard` para que o `compactCard` aplique estilos de borda/fundo conforme `status`:

| Status | `borderColor` | `backgroundColor` |
|--------|---------------|-------------------|
| `active` | `#A7F3D0` | `#ECFDF5` |
| `permission-denied` / `unavailable` | `#FECACA` | `#FEF2F2` |
| demais | `colors.neutral[200]` | `colors.neutral[50]` |

Não requer mudança na API do componente — apenas ajuste interno no `StyleSheet` ou inline style.

---

## Seção 4 — Cards de pedidos

**Convites Express e pedidos pendentes:**

Adicionar `ChevronRight` (cor `colors.neutral[400]`, tamanho 18) como último elemento do `orderTop` em cada card de pedido. Isso indica navegação, alinhando com o padrão do cliente.

Layout do `orderTop` depois da mudança:
```
[ícone categoria]  [texto (flex:1)]  [Badge]  [ChevronRight]
```

**CTA de pedidos ativos:**

Substituir o bloco `ctaCard` (fundo laranja sólido) por um card no estilo `expressBanner` do cliente:
- `borderWidth: 1`, `borderColor: '#FCD34D'`, `backgroundColor: '#FFFBEB'`
- Texto: `Text variant="titleSm"` em `colors.neutral[800]` (não branco)
- Subtexto: `Text variant="labelLg" color={colors.neutral[500]}`
- Substituir `ArrowRight color="#FFFFFF"` por `ChevronRight color={colors.neutral[400]}`

---

## O que não muda

- Lógica de dados (queries, filtros de status de pedidos)
- `EmptyState` de nenhum pedido pendente
- `ErrorState` e `LoadingScreen`
- Estrutura de seções (`sectionHeader`, `sectionTitleRow`)
- `RefreshControl`
- Navegação (`router.push`)

---

## Imports a ajustar em `index.tsx`

**Adicionar:** `ChevronRight`  
**Remover:** `ArrowRight`, `CheckCircle` (ficam sem uso após as mudanças)  
**Manter:** `Bell`, `ClipboardList`, `Clock`, `DollarSign`, `MapPin`, `Star`, `Zap`

Para os chips de métricas, usar ícones já importados:
- Chip 1 (Ativos): `Zap` cor `colors.primary.default`
- Chip 2 (Pendentes): `Clock` cor `colors.warning`
- Chip 3 (Receita): `DollarSign` cor `colors.success`

---

## Arquivos afetados

1. `src/app/(professional)/(dashboard)/index.tsx` — mudanças principais
2. `src/components/availability/ExpressAvailabilityCard.tsx` — ajuste de estilo no `compactCard`
